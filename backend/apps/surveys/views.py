from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Sum, Avg, Count
from django.utils import timezone
from decimal import Decimal
from .models import SurveyCampaign, CampaignParticipant, CampaignReward, AdminFeeConfiguration
from .serializers import (
    SurveyCampaignSerializer, SurveyCampaignCreateSerializer,
    CampaignParticipantSerializer, CampaignParticipantCreateSerializer,
    SurveyResponseSerializer, CampaignRewardSerializer,
    AdminFeeConfigurationSerializer, CampaignStatsSerializer,
    RevenueCalculationSerializer
)


class SurveyCampaignViewSet(viewsets.ModelViewSet):
    """ViewSet for managing survey campaigns"""
    
    queryset = SurveyCampaign.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SurveyCampaignCreateSerializer
        return SurveyCampaignSerializer
    
    def get_queryset(self):
        queryset = SurveyCampaign.objects.all()
        
        # Filter by creator if not admin
        if not self.request.user.is_staff:
            queryset = queryset.filter(creator=self.request.user)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        
        return queryset.select_related('creator')
    
    @action(detail=True, methods=['post'])
    def launch(self, request, pk=None):
        """Launch a campaign"""
        campaign = self.get_object()
        
        if campaign.status != 'draft':
            return Response(
                {'error': 'Only draft campaigns can be launched'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        campaign.status = 'active'
        campaign.launched_at = timezone.now()
        campaign.save()
        
        # TODO: Send notifications to eligible participants
        
        return Response({'message': 'Campaign launched successfully'})
    
    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        """Pause an active campaign"""
        campaign = self.get_object()
        
        if campaign.status != 'active':
            return Response(
                {'error': 'Only active campaigns can be paused'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        campaign.status = 'paused'
        campaign.save()
        
        return Response({'message': 'Campaign paused successfully'})
    
    @action(detail=True, methods=['post'])
    def resume(self, request, pk=None):
        """Resume a paused campaign"""
        campaign = self.get_object()
        
        if campaign.status != 'paused':
            return Response(
                {'error': 'Only paused campaigns can be resumed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        campaign.status = 'active'
        campaign.save()
        
        return Response({'message': 'Campaign resumed successfully'})
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete a campaign and process rewards"""
        campaign = self.get_object()
        
        if campaign.status not in ['active', 'paused']:
            return Response(
                {'error': 'Only active or paused campaigns can be completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        campaign.status = 'completed'
        campaign.completed_at = timezone.now()
        campaign.save()
        
        # Process rewards for completed participants
        self._process_campaign_rewards(campaign)
        
        return Response({'message': 'Campaign completed successfully'})
    
    @action(detail=True, methods=['get'])
    def participants(self, request, pk=None):
        """Get campaign participants"""
        campaign = self.get_object()
        participants = campaign.participants.all().select_related('participant')
        
        serializer = CampaignParticipantSerializer(participants, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get campaign statistics"""
        campaign = self.get_object()
        
        stats = {
            'total_participants': campaign.participant_count,
            'completed_responses': campaign.completed_responses,
            'completion_rate': campaign.completion_rate,
            'total_rewards_distributed': campaign.total_tokens_awarded,
            'admin_fees_collected': campaign.admin_fee_collected,
            'status': campaign.status,
            'days_active': (timezone.now() - campaign.launched_at).days if campaign.launched_at else 0
        }
        
        return Response(stats)
    
    def _process_campaign_rewards(self, campaign):
        """Process rewards for completed campaign participants"""
        completed_participants = campaign.participants.filter(status='completed')
        fee_percentage = AdminFeeConfiguration.get_current_fee_percentage()
        
        for participant in completed_participants:
            # Check if reward already exists
            if CampaignReward.objects.filter(campaign=campaign, participant=participant.participant).exists():
                continue
            
            # Calculate fees
            reward_amount = campaign.reward_per_participant
            admin_fee = reward_amount * (fee_percentage / 100)
            net_amount = reward_amount - admin_fee
            
            # Create reward record
            CampaignReward.objects.create(
                campaign=campaign,
                participant=participant.participant,
                reward_amount=reward_amount,
                admin_fee=admin_fee,
                net_amount=net_amount,
                status='pending'
            )
        
        # Update campaign totals
        campaign.total_tokens_awarded = completed_participants.count() * campaign.reward_per_participant
        campaign.admin_fee_collected = campaign.total_tokens_awarded * (fee_percentage / 100)
        campaign.save()


class CampaignParticipantViewSet(viewsets.ModelViewSet):
    """ViewSet for managing campaign participation"""
    
    queryset = CampaignParticipant.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CampaignParticipantCreateSerializer
        return CampaignParticipantSerializer
    
    def get_queryset(self):
        queryset = CampaignParticipant.objects.all()
        
        # Filter by participant if not admin
        if not self.request.user.is_staff:
            queryset = queryset.filter(participant=self.request.user)
        
        # Filter by campaign
        campaign_id = self.request.query_params.get('campaign')
        if campaign_id:
            queryset = queryset.filter(campaign_id=campaign_id)
        
        return queryset.select_related('campaign', 'participant')
    
    def create(self, request, *args, **kwargs):
        """Join a campaign"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        campaign = serializer.validated_data['campaign']
        
        # Check if campaign is active
        if not campaign.is_active:
            return Response(
                {'error': 'Campaign is not active'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already joined
        if CampaignParticipant.objects.filter(
            campaign=campaign, 
            participant=request.user
        ).exists():
            return Response(
                {'error': 'You have already joined this campaign'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create participation record
        participant = serializer.save()
        
        # Update campaign participant count
        campaign.participant_count += 1
        campaign.save()
        
        return Response(
            CampaignParticipantSerializer(participant).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'])
    def start_survey(self, request, pk=None):
        """Mark survey as started"""
        participant = self.get_object()
        
        if participant.status != 'invited':
            return Response(
                {'error': 'Survey already started or completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        participant.status = 'started'
        participant.started_at = timezone.now()
        participant.save()
        
        return Response({'message': 'Survey started successfully'})
    
    @action(detail=True, methods=['post'])
    def submit_responses(self, request, pk=None):
        """Submit survey responses"""
        participant = self.get_object()
        
        if participant.status not in ['invited', 'started']:
            return Response(
                {'error': 'Survey already completed or abandoned'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = SurveyResponseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Save responses
        participant.survey_responses = serializer.validated_data['responses']
        participant.status = 'completed'
        participant.completed_at = timezone.now()
        participant.save()
        
        # Update campaign completed responses count
        campaign = participant.campaign
        campaign.completed_responses += 1
        campaign.save()
        
        return Response({'message': 'Survey responses submitted successfully'})


class CampaignRewardViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing campaign rewards"""
    
    queryset = CampaignReward.objects.all()
    serializer_class = CampaignRewardSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = CampaignReward.objects.all()
        
        # Filter by participant if not admin
        if not self.request.user.is_staff:
            queryset = queryset.filter(participant=self.request.user)
        
        # Filter by campaign
        campaign_id = self.request.query_params.get('campaign')
        if campaign_id:
            queryset = queryset.filter(campaign_id=campaign_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.select_related('campaign', 'participant')
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def process_reward(self, request, pk=None):
        """Process a pending reward (admin only)"""
        reward = self.get_object()
        
        if reward.status != 'pending':
            return Response(
                {'error': 'Only pending rewards can be processed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # TODO: Integrate with actual token system
            # For now, just mark as completed
            reward.status = 'completed'
            reward.processed_at = timezone.now()
            reward.transaction_id = f"TXN_{reward.id}_{timezone.now().timestamp()}"
            reward.save()
            
            return Response({'message': 'Reward processed successfully'})
            
        except Exception as e:
            reward.status = 'failed'
            reward.error_message = str(e)
            reward.save()
            
            return Response(
                {'error': f'Failed to process reward: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AdminFeeConfigurationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing admin fee configuration"""
    
    queryset = AdminFeeConfiguration.objects.all()
    serializer_class = AdminFeeConfigurationSerializer
    permission_classes = [permissions.IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current active fee configuration"""
        config = AdminFeeConfiguration.objects.filter(is_active=True).first()
        if config:
            serializer = self.get_serializer(config)
            return Response(serializer.data)
        else:
            return Response({
                'fee_percentage': '10.0',
                'is_active': True,
                'message': 'Using default fee percentage'
            })
    
    @action(detail=False, methods=['post'])
    def calculate_fee(self, request):
        """Calculate admin fee for given reward amount"""
        reward_amount = request.data.get('reward_amount')
        if not reward_amount:
            return Response(
                {'error': 'reward_amount is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            reward_amount = Decimal(str(reward_amount))
            fee_percentage = AdminFeeConfiguration.get_current_fee_percentage()
            admin_fee = reward_amount * (fee_percentage / 100)
            net_amount = reward_amount - admin_fee
            
            serializer = RevenueCalculationSerializer(data={
                'total_reward_amount': reward_amount,
                'admin_fee_percentage': fee_percentage,
                'admin_fee_amount': admin_fee,
                'net_reward_amount': net_amount
            })
            serializer.is_valid(raise_exception=True)
            
            return Response(serializer.data)
            
        except (ValueError, TypeError):
            return Response(
                {'error': 'Invalid reward_amount format'},
                status=status.HTTP_400_BAD_REQUEST
            )


class SurveyCampaignStatsViewSet(viewsets.ViewSet):
    """ViewSet for campaign statistics and analytics"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Get overall campaign statistics"""
        queryset = SurveyCampaign.objects.all()
        
        # Filter by creator if not admin
        if not request.user.is_staff:
            queryset = queryset.filter(creator=request.user)
        
        stats = queryset.aggregate(
            total_campaigns=Count('id'),
            active_campaigns=Count('id', filter=Q(status='active')),
            total_participants=Sum('participant_count'),
            total_rewards_distributed=Sum('total_tokens_awarded'),
            total_admin_fees=Sum('admin_fee_collected'),
            average_completion_rate=Avg('completed_responses') * 100 / Avg('participant_count')
        )
        
        # Handle None values
        for key, value in stats.items():
            if value is None:
                stats[key] = 0
        
        serializer = CampaignStatsSerializer(data=stats)
        serializer.is_valid(raise_exception=True)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def revenue_summary(self, request):
        """Get revenue summary for admin"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get date range from query params
        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')
        
        queryset = CampaignReward.objects.filter(status='completed')
        
        if from_date:
            queryset = queryset.filter(processed_at__gte=from_date)
        if to_date:
            queryset = queryset.filter(processed_at__lte=to_date)
        
        revenue_stats = queryset.aggregate(
            total_rewards_processed=Sum('reward_amount'),
            total_admin_fees_collected=Sum('admin_fee'),
            total_net_rewards=Sum('net_amount'),
            total_transactions=Count('id')
        )
        
        return Response(revenue_stats)