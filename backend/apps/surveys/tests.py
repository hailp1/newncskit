from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from .models import SurveyCampaign, CampaignParticipant, CampaignReward, AdminFeeConfiguration


class SurveyCampaignModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_campaign_creation(self):
        campaign = SurveyCampaign.objects.create(
            title='Test Campaign',
            description='Test Description',
            creator=self.user,
            target_participants=100,
            reward_per_participant=Decimal('10.00')
        )
        
        self.assertEqual(campaign.title, 'Test Campaign')
        self.assertEqual(campaign.creator, self.user)
        self.assertEqual(campaign.status, 'draft')
        self.assertEqual(campaign.participant_count, 0)
    
    def test_completion_rate_calculation(self):
        campaign = SurveyCampaign.objects.create(
            title='Test Campaign',
            description='Test Description',
            creator=self.user,
            target_participants=100,
            reward_per_participant=Decimal('10.00'),
            participant_count=50,
            completed_responses=25
        )
        
        self.assertEqual(campaign.completion_rate, 50.0)


class SurveyCampaignAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123'
        )
    
    def test_create_campaign(self):
        self.client.force_authenticate(user=self.user)
        
        data = {
            'title': 'Test Campaign',
            'description': 'Test Description',
            'target_participants': 100,
            'reward_per_participant': '10.00',
            'duration_days': 30
        }
        
        response = self.client.post('/api/surveys/campaigns/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Test Campaign')
        self.assertEqual(response.data['creator']['id'], self.user.id)
    
    def test_launch_campaign(self):
        self.client.force_authenticate(user=self.user)
        
        campaign = SurveyCampaign.objects.create(
            title='Test Campaign',
            description='Test Description',
            creator=self.user,
            target_participants=100,
            reward_per_participant=Decimal('10.00')
        )
        
        response = self.client.post(f'/api/surveys/campaigns/{campaign.id}/launch/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        campaign.refresh_from_db()
        self.assertEqual(campaign.status, 'active')
        self.assertIsNotNone(campaign.launched_at)
    
    def test_join_campaign(self):
        self.client.force_authenticate(user=self.user)
        
        # Create another user as campaign creator
        creator = User.objects.create_user(
            username='creator',
            email='creator@example.com',
            password='creatorpass123'
        )
        
        campaign = SurveyCampaign.objects.create(
            title='Test Campaign',
            description='Test Description',
            creator=creator,
            target_participants=100,
            reward_per_participant=Decimal('10.00'),
            status='active'
        )
        
        data = {'campaign': campaign.id}
        response = self.client.post('/api/surveys/participants/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check that participant was created
        participant = CampaignParticipant.objects.get(
            campaign=campaign,
            participant=self.user
        )
        self.assertEqual(participant.status, 'invited')


class AdminFeeConfigurationTest(TestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123'
        )
    
    def test_get_current_fee_percentage(self):
        # Test default fee percentage
        default_fee = AdminFeeConfiguration.get_current_fee_percentage()
        self.assertEqual(default_fee, Decimal('10.0'))
        
        # Create custom fee configuration
        AdminFeeConfiguration.objects.create(
            fee_percentage=Decimal('15.0'),
            created_by=self.admin_user,
            is_active=True
        )
        
        custom_fee = AdminFeeConfiguration.get_current_fee_percentage()
        self.assertEqual(custom_fee, Decimal('15.0'))


class CampaignRewardTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.creator = User.objects.create_user(
            username='creator',
            email='creator@example.com',
            password='creatorpass123'
        )
        
        self.campaign = SurveyCampaign.objects.create(
            title='Test Campaign',
            description='Test Description',
            creator=self.creator,
            target_participants=100,
            reward_per_participant=Decimal('10.00')
        )
    
    def test_reward_creation(self):
        reward = CampaignReward.objects.create(
            campaign=self.campaign,
            participant=self.user,
            reward_amount=Decimal('10.00'),
            admin_fee=Decimal('1.00'),
            net_amount=Decimal('9.00')
        )
        
        self.assertEqual(reward.reward_amount, Decimal('10.00'))
        self.assertEqual(reward.admin_fee, Decimal('1.00'))
        self.assertEqual(reward.net_amount, Decimal('9.00'))
        self.assertEqual(reward.status, 'pending')