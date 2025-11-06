from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count, Avg
from django.db import transaction
from .models import TheoreticalModel, ResearchVariable, QuestionTemplate, QuestionBank, QuestionUsageLog
from .serializers import (
    TheoreticalModelSerializer, ResearchVariableSerializer,
    QuestionTemplateSerializer, QuestionTemplateCreateSerializer,
    QuestionBankSerializer, QuestionBankCreateSerializer,
    QuestionUsageLogSerializer, QuestionSearchSerializer,
    QuestionRecommendationSerializer
)


class TheoreticalModelViewSet(viewsets.ModelViewSet):
    """ViewSet for managing theoretical models"""
    
    queryset = TheoreticalModel.objects.all()
    serializer_class = TheoreticalModelSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = TheoreticalModel.objects.all()
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__icontains=category)
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        
        return queryset.prefetch_related('variables', 'question_banks')
    
    @action(detail=True, methods=['get'])
    def variables(self, request, pk=None):
        """Get variables associated with this theoretical model"""
        model = self.get_object()
        variables = model.variables.all()
        serializer = ResearchVariableSerializer(variables, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def question_banks(self, request, pk=None):
        """Get question banks for this theoretical model"""
        model = self.get_object()
        question_banks = model.question_banks.filter(is_public=True)
        
        # Filter by user's own banks if not public
        if not request.user.is_staff:
            user_banks = model.question_banks.filter(created_by=request.user)
            question_banks = question_banks.union(user_banks)
        
        serializer = QuestionBankSerializer(question_banks, many=True)
        return Response(serializer.data)


class ResearchVariableViewSet(viewsets.ModelViewSet):
    """ViewSet for managing research variables"""
    
    queryset = ResearchVariable.objects.all()
    serializer_class = ResearchVariableSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = ResearchVariable.objects.all()
        
        # Filter by theoretical model
        theoretical_model = self.request.query_params.get('theoretical_model')
        if theoretical_model:
            queryset = queryset.filter(theoretical_models=theoretical_model)
        
        # Filter by variable type
        variable_type = self.request.query_params.get('variable_type')
        if variable_type:
            queryset = queryset.filter(variable_type=variable_type)
        
        # Filter by measurement scale
        measurement_scale = self.request.query_params.get('measurement_scale')
        if measurement_scale:
            queryset = queryset.filter(measurement_scale=measurement_scale)
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        
        return queryset.prefetch_related('theoretical_models', 'question_templates')
    
    @action(detail=True, methods=['get'])
    def question_templates(self, request, pk=None):
        """Get question templates for this variable"""
        variable = self.get_object()
        templates = variable.question_templates.all().order_by('-usage_count')
        serializer = QuestionTemplateSerializer(templates, many=True)
        return Response(serializer.data)


class QuestionTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for managing question templates"""
    
    queryset = QuestionTemplate.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return QuestionTemplateCreateSerializer
        return QuestionTemplateSerializer
    
    def get_queryset(self):
        queryset = QuestionTemplate.objects.all()
        
        # Filter by research variable
        research_variable = self.request.query_params.get('research_variable')
        if research_variable:
            queryset = queryset.filter(research_variable=research_variable)
        
        # Filter by question type
        question_type = self.request.query_params.get('question_type')
        if question_type:
            queryset = queryset.filter(question_type=question_type)
        
        # Filter by theoretical model (through research variable)
        theoretical_model = self.request.query_params.get('theoretical_model')
        if theoretical_model:
            queryset = queryset.filter(
                research_variable__theoretical_models=theoretical_model
            )
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(text__icontains=search) | 
                Q(research_variable__name__icontains=search)
            )
        
        return queryset.select_related('research_variable').prefetch_related(
            'research_variable__theoretical_models'
        ).order_by('-usage_count', 'text')
    
    @action(detail=False, methods=['post'])
    def search(self, request):
        """Advanced search for question templates"""
        serializer = QuestionSearchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        queryset = self.get_queryset()
        
        # Apply search filters
        data = serializer.validated_data
        
        if data.get('query'):
            queryset = queryset.filter(
                Q(text__icontains=data['query']) |
                Q(research_variable__name__icontains=data['query'])
            )
        
        if data.get('theoretical_model'):
            queryset = queryset.filter(
                research_variable__theoretical_models=data['theoretical_model']
            )
        
        if data.get('variable_type'):
            queryset = queryset.filter(
                research_variable__variable_type=data['variable_type']
            )
        
        if data.get('question_type'):
            queryset = queryset.filter(question_type=data['question_type'])
        
        if data.get('measurement_scale'):
            queryset = queryset.filter(
                research_variable__measurement_scale=data['measurement_scale']
            )
        
        if data.get('category'):
            queryset = queryset.filter(
                research_variable__theoretical_models__category__icontains=data['category']
            )
        
        # Paginate results
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = QuestionTemplateSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = QuestionTemplateSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def recommend(self, request):
        """Get question recommendations based on research design"""
        serializer = QuestionRecommendationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        theoretical_models = data['theoretical_models']
        research_variables = data.get('research_variables', [])
        exclude_questions = data.get('exclude_questions', [])
        max_questions = data.get('max_questions', 20)
        
        # Build query
        queryset = QuestionTemplate.objects.filter(
            research_variable__theoretical_models__in=theoretical_models
        )
        
        if research_variables:
            queryset = queryset.filter(research_variable__in=research_variables)
        
        if exclude_questions:
            queryset = queryset.exclude(id__in=exclude_questions)
        
        # Order by usage count and limit results
        queryset = queryset.distinct().order_by('-usage_count')[:max_questions]
        
        serializer = QuestionTemplateSerializer(queryset, many=True)
        return Response({
            'recommendations': serializer.data,
            'total_count': queryset.count()
        })
    
    @action(detail=True, methods=['post'])
    def use(self, request, pk=None):
        """Log usage of a question template"""
        template = self.get_object()
        
        # Create usage log
        usage_data = {
            'question_template': template.id,
            'project_id': request.data.get('project_id'),
            'survey_id': request.data.get('survey_id'),
            'modifications': request.data.get('modifications', {})
        }
        
        log_serializer = QuestionUsageLogSerializer(
            data=usage_data,
            context={'request': request}
        )
        log_serializer.is_valid(raise_exception=True)
        log_serializer.save()
        
        # Increment usage count
        template.increment_usage()
        
        return Response({'message': 'Usage logged successfully'})


class QuestionBankViewSet(viewsets.ModelViewSet):
    """ViewSet for managing question banks"""
    
    queryset = QuestionBank.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return QuestionBankCreateSerializer
        return QuestionBankSerializer
    
    def get_queryset(self):
        queryset = QuestionBank.objects.all()
        
        # Filter by public banks and user's own banks
        if not self.request.user.is_staff:
            queryset = queryset.filter(
                Q(is_public=True) | Q(created_by=self.request.user)
            )
        
        # Filter by theoretical model
        theoretical_model = self.request.query_params.get('theoretical_model')
        if theoretical_model:
            queryset = queryset.filter(theoretical_model=theoretical_model)
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        
        return queryset.select_related('theoretical_model').prefetch_related('questions')
    
    @action(detail=True, methods=['post'])
    def add_questions(self, request, pk=None):
        """Add questions to a question bank"""
        question_bank = self.get_object()
        
        # Check permissions
        if question_bank.created_by != request.user and not request.user.is_staff:
            return Response(
                {'error': 'You can only modify your own question banks'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        question_ids = request.data.get('question_ids', [])
        if not question_ids:
            return Response(
                {'error': 'question_ids is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        questions = QuestionTemplate.objects.filter(id__in=question_ids)
        question_bank.questions.add(*questions)
        
        return Response({
            'message': f'Added {questions.count()} questions to bank',
            'total_questions': question_bank.question_count
        })
    
    @action(detail=True, methods=['post'])
    def remove_questions(self, request, pk=None):
        """Remove questions from a question bank"""
        question_bank = self.get_object()
        
        # Check permissions
        if question_bank.created_by != request.user and not request.user.is_staff:
            return Response(
                {'error': 'You can only modify your own question banks'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        question_ids = request.data.get('question_ids', [])
        if not question_ids:
            return Response(
                {'error': 'question_ids is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        questions = QuestionTemplate.objects.filter(id__in=question_ids)
        question_bank.questions.remove(*questions)
        
        return Response({
            'message': f'Removed {questions.count()} questions from bank',
            'total_questions': question_bank.question_count
        })


class QuestionUsageLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing question usage logs"""
    
    queryset = QuestionUsageLog.objects.all()
    serializer_class = QuestionUsageLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = QuestionUsageLog.objects.all()
        
        # Filter by user if not admin
        if not self.request.user.is_staff:
            queryset = queryset.filter(used_by=self.request.user)
        
        # Filter by question template
        question_template = self.request.query_params.get('question_template')
        if question_template:
            queryset = queryset.filter(question_template=question_template)
        
        # Filter by project
        project_id = self.request.query_params.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        return queryset.select_related('question_template', 'used_by')
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get usage analytics"""
        queryset = self.get_queryset()
        
        # Most used questions
        most_used = QuestionTemplate.objects.filter(
            usage_logs__in=queryset
        ).annotate(
            usage_count_filtered=Count('usage_logs')
        ).order_by('-usage_count_filtered')[:10]
        
        # Usage by question type
        usage_by_type = queryset.values(
            'question_template__question_type'
        ).annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Usage by theoretical model
        usage_by_model = queryset.values(
            'question_template__research_variable__theoretical_models__name'
        ).annotate(
            count=Count('id')
        ).order_by('-count')
        
        return Response({
            'most_used_questions': QuestionTemplateSerializer(most_used, many=True).data,
            'usage_by_question_type': list(usage_by_type),
            'usage_by_theoretical_model': list(usage_by_model),
            'total_usage_count': queryset.count()
        })