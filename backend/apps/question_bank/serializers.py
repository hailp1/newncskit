from rest_framework import serializers
from .models import TheoreticalModel, ResearchVariable, QuestionTemplate, QuestionBank, QuestionUsageLog


class TheoreticalModelSerializer(serializers.ModelSerializer):
    """Serializer for theoretical models"""
    
    variable_count = serializers.SerializerMethodField()
    question_bank_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TheoreticalModel
        fields = [
            'id', 'name', 'description', 'category', 'created_at', 'updated_at',
            'variable_count', 'question_bank_count'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_variable_count(self, obj):
        return obj.variables.count()
    
    def get_question_bank_count(self, obj):
        return obj.question_banks.count()
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class ResearchVariableSerializer(serializers.ModelSerializer):
    """Serializer for research variables"""
    
    theoretical_model_names = serializers.SerializerMethodField()
    question_template_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ResearchVariable
        fields = [
            'id', 'name', 'description', 'variable_type', 'measurement_scale',
            'theoretical_models', 'theoretical_model_names', 'question_template_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_theoretical_model_names(self, obj):
        return [model.name for model in obj.theoretical_models.all()]
    
    def get_question_template_count(self, obj):
        return obj.question_templates.count()


class QuestionTemplateSerializer(serializers.ModelSerializer):
    """Serializer for question templates"""
    
    research_variable_name = serializers.CharField(source='research_variable.name', read_only=True)
    theoretical_models = serializers.SerializerMethodField()
    
    class Meta:
        model = QuestionTemplate
        fields = [
            'id', 'text', 'question_type', 'configuration', 'research_variable',
            'research_variable_name', 'theoretical_models', 'is_required',
            'validation_rules', 'usage_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['usage_count', 'created_at', 'updated_at']
    
    def get_theoretical_models(self, obj):
        return [
            {'id': model.id, 'name': model.name, 'category': model.category}
            for model in obj.research_variable.theoretical_models.all()
        ]
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class QuestionTemplateCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating question templates"""
    
    class Meta:
        model = QuestionTemplate
        fields = [
            'text', 'question_type', 'configuration', 'research_variable',
            'is_required', 'validation_rules'
        ]
    
    def validate_configuration(self, value):
        """Validate configuration based on question type"""
        question_type = self.initial_data.get('question_type')
        
        if question_type in ['choice', 'multiple_choice']:
            if 'options' not in value or not isinstance(value['options'], list):
                raise serializers.ValidationError(
                    "Choice questions must have 'options' as a list in configuration"
                )
        
        elif question_type == 'likert':
            if 'scale_min' not in value or 'scale_max' not in value:
                raise serializers.ValidationError(
                    "Likert questions must have 'scale_min' and 'scale_max' in configuration"
                )
        
        elif question_type == 'rating':
            if 'max_rating' not in value:
                raise serializers.ValidationError(
                    "Rating questions must have 'max_rating' in configuration"
                )
        
        return value


class QuestionBankSerializer(serializers.ModelSerializer):
    """Serializer for question banks"""
    
    theoretical_model_name = serializers.CharField(source='theoretical_model.name', read_only=True)
    question_count = serializers.ReadOnlyField()
    questions = QuestionTemplateSerializer(many=True, read_only=True)
    
    class Meta:
        model = QuestionBank
        fields = [
            'id', 'name', 'description', 'theoretical_model', 'theoretical_model_name',
            'questions', 'question_count', 'is_public', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class QuestionBankCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating question banks"""
    
    question_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = QuestionBank
        fields = [
            'name', 'description', 'theoretical_model', 'is_public', 'question_ids'
        ]
    
    def create(self, validated_data):
        question_ids = validated_data.pop('question_ids', [])
        validated_data['created_by'] = self.context['request'].user
        
        question_bank = super().create(validated_data)
        
        if question_ids:
            questions = QuestionTemplate.objects.filter(id__in=question_ids)
            question_bank.questions.set(questions)
        
        return question_bank


class QuestionUsageLogSerializer(serializers.ModelSerializer):
    """Serializer for question usage logs"""
    
    question_text = serializers.CharField(source='question_template.text', read_only=True)
    user_email = serializers.CharField(source='used_by.email', read_only=True)
    
    class Meta:
        model = QuestionUsageLog
        fields = [
            'id', 'question_template', 'question_text', 'used_by', 'user_email',
            'project_id', 'survey_id', 'used_at', 'modifications'
        ]
        read_only_fields = ['used_at']
    
    def create(self, validated_data):
        validated_data['used_by'] = self.context['request'].user
        return super().create(validated_data)


class QuestionSearchSerializer(serializers.Serializer):
    """Serializer for question search parameters"""
    
    query = serializers.CharField(required=False, allow_blank=True)
    theoretical_model = serializers.UUIDField(required=False)
    variable_type = serializers.ChoiceField(
        choices=ResearchVariable.VARIABLE_TYPES,
        required=False
    )
    question_type = serializers.ChoiceField(
        choices=QuestionTemplate.QUESTION_TYPES,
        required=False
    )
    measurement_scale = serializers.ChoiceField(
        choices=ResearchVariable.MEASUREMENT_SCALES,
        required=False
    )
    category = serializers.CharField(required=False)


class QuestionRecommendationSerializer(serializers.Serializer):
    """Serializer for question recommendations based on research design"""
    
    theoretical_models = serializers.ListField(
        child=serializers.UUIDField(),
        required=True
    )
    research_variables = serializers.ListField(
        child=serializers.UUIDField(),
        required=False
    )
    exclude_questions = serializers.ListField(
        child=serializers.UUIDField(),
        required=False
    )
    max_questions = serializers.IntegerField(default=20, min_value=1, max_value=100)