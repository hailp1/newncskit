from django.test import TestCase, TransactionTestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
import json
from datetime import datetime, timedelta
from decimal import Decimal

from .models import SurveyCampaign, FeeConfiguration
from .serializers import SurveyCampaignSerializer, FeeConfigurationSerializer


class SurveyCampaignModelTests(TestCase):
    """Test cases for SurveyCampaign model"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_create_survey_campaign(self):
        """Test creating a survey campaign"""
        campaign = SurveyCampaign.objects.create(
            title='Test Campaign',
            description='Test campaign description',
            project_id='project_123',
            survey_id='survey_123',
            target_participants=100,
            reward_per_participant=Decimal('10.00'),
            duration_days=30,
            eligibility_criteria={
                'min_age': 18,
                'max_age': 65,
                'required_demographics': ['age', 'gender']
            },
            created_by=self.user
        )

        self.assertEqual(campaign.title, 'Test Campaign')
        self.assertEqual(campaign.status, 'draft')
        self.assertEqual(campaign.target_participants, 100)
        self.assertEqual(campaign.reward_per_participant, Decimal('10.00'))
        self.assertEqual(campaign.duration_days, 30)
        self.assertEqual(campaign.created_by, self.user)

    def test_campaign_str_representation(self):
        """Test string representation of campaign"""
        campaign = SurveyCampaign.objects.create(
            title='Test Campaign',
            project_id='project_123',
            survey_id='survey_123',
            target_participants=50,
            reward_per_participant=Decimal('5.00'),
            duration_days=14,
            created_by=self.user
        )

        self.assertEqual(str(campaign), 'Test Campaign')

    def test_campaign_total_cost_calculation(self):
        """Test total cost calculation property"""
        campaign = SurveyCampaign.objects.create(
            title='Cost Test Campaign',
            project_id='project_123',
            survey_id='survey_123',
            target_participants=100,
            reward_per_participant=Decimal('15.00'),
            duration_days=30,
            created_by=self.user
        )

        expected_cost = 100 * Decimal('15.00')  # 1500.00
        self.assertEqual(campaign.total_cost, expected_cost)

    def test_campaign_status_choices(self):
        """Test campaign status choices"""
        campaign = SurveyCampaign.objects.create(
            title='Status Test Campaign',
            project_id='project_123',
            survey_id='survey_123',
            target_participants=50,
            reward_per_participant=Decimal('10.00'),
            duration_days=30,
            created_by=self.user
        )

        # Test valid status changes
        valid_statuses = ['draft', 'active', 'paused', 'completed', 'cancelled']
        for status in valid_statuses:
            campaign.status = status
            campaign.save()
            self.assertEqual(campaign.status, status)

    def test_campaign_participation_tracking(self):
        """Test participation tracking fields"""
        campaign = SurveyCampaign.objects.create(
            title='Participation Test',
            project_id='project_123',
            survey_id='survey_123',
            target_participants=100,
            reward_per_participant=Decimal('10.00'),
            duration_days=30,
            created_by=self.user
        )

        # Update participation stats
        campaign.total_participants = 75
        campaign.completed_responses = 60
        campaign.total_tokens_awarded = Decimal('600.00')
        campaign.admin_fee_collected = Decimal('30.00')
        campaign.save()

        self.assertEqual(campaign.total_participants, 75)
        self.assertEqual(campaign.completed_responses, 60)
        self.assertEqual(campaign.total_tokens_awarded, Decimal('600.00'))
        self.assertEqual(campaign.admin_fee_collected, Decimal('30.00'))


class FeeConfigurationModelTests(TestCase):
    """Test cases for FeeConfiguration model"""

    def test_create_fee_configuration(self):
        """Test creating fee configuration"""
        config = FeeConfiguration.objects.create(
            fee_percentage=Decimal('5.0'),
            is_active=True
        )

        self.assertEqual(config.fee_percentage, Decimal('5.0'))
        self.assertTrue(config.is_active)

    def test_fee_configuration_str_representation(self):
        """Test string representation of fee configuration"""
        config = FeeConfiguration.objects.create(
            fee_percentage=Decimal('7.5'),
            is_active=True
        )

        expected_str = f"Fee Configuration: 7.5% (Active)"
        self.assertEqual(str(config), expected_str)

    def test_get_current_fee_configuration(self):
        """Test getting current active fee configuration"""
        # Create inactive config
        FeeConfiguration.objects.create(
            fee_percentage=Decimal('3.0'),
            is_active=False
        )

        # Create active config
        active_config = FeeConfiguration.objects.create(
            fee_percentage=Decimal('5.0'),
            is_active=True
        )

        current_config = FeeConfiguration.get_current()
        self.assertEqual(current_config, active_config)
        self.assertEqual(current_config.fee_percentage, Decimal('5.0'))

    def test_calculate_fee(self):
        """Test fee calculation method"""
        config = FeeConfiguration.objects.create(
            fee_percentage=Decimal('5.0'),
            is_active=True
        )

        # Test fee calculation
        reward_amount = Decimal('100.00')
        calculated_fee = config.calculate_fee(reward_amount)
        expected_fee = Decimal('5.00')  # 5% of 100

        self.assertEqual(calculated_fee, expected_fee)

    def test_calculate_fee_with_zero_amount(self):
        """Test fee calculation with zero amount"""
        config = FeeConfiguration.objects.create(
            fee_percentage=Decimal('5.0'),
            is_active=True
        )

        calculated_fee = config.calculate_fee(Decimal('0.00'))
        self.assertEqual(calculated_fee, Decimal('0.00'))


class SurveyCampaignAPITests(APITestCase):
    """Test cases for Survey Campaign API endpoints"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        # Create fee configuration
        self.fee_config = FeeConfiguration.objects.create(
            fee_percentage=Decimal('5.0'),
            is_active=True
        )

    def test_create_campaign_api(self):
        """Test creating campaign via API"""
        url = reverse('surveycampaign-list')
        data = {
            'title': 'API Test Campaign',
            'description': 'Campaign created via API',
            'project_id': 'project_api_123',
            'survey_id': 'survey_api_123',
            'target_participants': 150,
            'reward_per_participant': '12.00',
            'duration_days': 45,
            'eligibility_criteria': {
                'min_age': 18,
                'max_age': 65,
                'required_demographics': ['age', 'gender', 'education']
            }
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'API Test Campaign')
        self.assertEqual(response.data['status'], 'draft')
        self.assertEqual(response.data['created_by'], self.user.id)

        # Verify campaign was created in database
        campaign = SurveyCampaign.objects.get(id=response.data['id'])
        self.assertEqual(campaign.title, 'API Test Campaign')
        self.assertEqual(campaign.target_participants, 150)

    def test_get_campaign_list_api(self):
        """Test getting campaign list via API"""
        # Create test campaigns
        SurveyCampaign.objects.create(
            title='Campaign 1',
            project_id='project_1',
            survey_id='survey_1',
            target_participants=100,
            reward_per_participant=Decimal('10.00'),
            duration_days=30,
            created_by=self.user
        )

        SurveyCampaign.objects.create(
            title='Campaign 2',
            project_id='project_2',
            survey_id='survey_2',
            target_participants=200,
            reward_per_participant=Decimal('15.00'),
            duration_days=45,
            created_by=self.user
        )

        url = reverse('surveycampaign-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['title'], 'Campaign 1')
        self.assertEqual(response.data[1]['title'], 'Campaign 2')

    def test_get_campaign_detail_api(self):
        """Test getting campaign detail via API"""
        campaign = SurveyCampaign.objects.create(
            title='Detail Test Campaign',
            project_id='project_detail',
            survey_id='survey_detail',
            target_participants=75,
            reward_per_participant=Decimal('8.00'),
            duration_days=21,
            created_by=self.user
        )

        url = reverse('surveycampaign-detail', kwargs={'pk': campaign.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Detail Test Campaign')
        self.assertEqual(response.data['target_participants'], 75)

    def test_update_campaign_api(self):
        """Test updating campaign via API"""
        campaign = SurveyCampaign.objects.create(
            title='Update Test Campaign',
            project_id='project_update',
            survey_id='survey_update',
            target_participants=100,
            reward_per_participant=Decimal('10.00'),
            duration_days=30,
            created_by=self.user
        )

        url = reverse('surveycampaign-detail', kwargs={'pk': campaign.id})
        data = {
            'title': 'Updated Campaign Title',
            'target_participants': 150,
            'reward_per_participant': '15.00'
        }

        response = self.client.patch(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Campaign Title')
        self.assertEqual(response.data['target_participants'], 150)

        # Verify database was updated
        campaign.refresh_from_db()
        self.assertEqual(campaign.title, 'Updated Campaign Title')
        self.assertEqual(campaign.target_participants, 150)

    def test_delete_campaign_api(self):
        """Test deleting campaign via API"""
        campaign = SurveyCampaign.objects.create(
            title='Delete Test Campaign',
            project_id='project_delete',
            survey_id='survey_delete',
            target_participants=50,
            reward_per_participant=Decimal('5.00'),
            duration_days=14,
            created_by=self.user
        )

        url = reverse('surveycampaign-detail', kwargs={'pk': campaign.id})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Verify campaign was deleted
        with self.assertRaises(SurveyCampaign.DoesNotExist):
            SurveyCampaign.objects.get(id=campaign.id)

    def test_launch_campaign_api(self):
        """Test launching campaign via API"""
        campaign = SurveyCampaign.objects.create(
            title='Launch Test Campaign',
            project_id='project_launch',
            survey_id='survey_launch',
            target_participants=100,
            reward_per_participant=Decimal('10.00'),
            duration_days=30,
            status='draft',
            created_by=self.user
        )

        url = reverse('surveycampaign-launch', kwargs={'pk': campaign.id})
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'active')

        # Verify database was updated
        campaign.refresh_from_db()
        self.assertEqual(campaign.status, 'active')
        self.assertIsNotNone(campaign.launched_at)

    def test_pause_campaign_api(self):
        """Test pausing campaign via API"""
        campaign = SurveyCampaign.objects.create(
            title='Pause Test Campaign',
            project_id='project_pause',
            survey_id='survey_pause',
            target_participants=100,
            reward_per_participant=Decimal('10.00'),
            duration_days=30,
            status='active',
            launched_at=datetime.now(),
            created_by=self.user
        )

        url = reverse('surveycampaign-pause', kwargs={'pk': campaign.id})
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'paused')

        # Verify database was updated
        campaign.refresh_from_db()
        self.assertEqual(campaign.status, 'paused')

    def test_complete_campaign_api(self):
        """Test completing campaign via API"""
        campaign = SurveyCampaign.objects.create(
            title='Complete Test Campaign',
            project_id='project_complete',
            survey_id='survey_complete',
            target_participants=100,
            reward_per_participant=Decimal('10.00'),
            duration_days=30,
            status='active',
            launched_at=datetime.now(),
            created_by=self.user
        )

        url = reverse('surveycampaign-complete', kwargs={'pk': campaign.id})
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'completed')

        # Verify database was updated
        campaign.refresh_from_db()
        self.assertEqual(campaign.status, 'completed')
        self.assertIsNotNone(campaign.completed_at)

    def test_campaign_analytics_api(self):
        """Test getting campaign analytics via API"""
        campaign = SurveyCampaign.objects.create(
            title='Analytics Test Campaign',
            project_id='project_analytics',
            survey_id='survey_analytics',
            target_participants=100,
            reward_per_participant=Decimal('10.00'),
            duration_days=30,
            total_participants=75,
            completed_responses=60,
            total_tokens_awarded=Decimal('600.00'),
            admin_fee_collected=Decimal('30.00'),
            created_by=self.user
        )

        url = reverse('surveycampaign-analytics', kwargs={'pk': campaign.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('campaign_id', response.data)
        self.assertIn('total_participants', response.data)
        self.assertIn('completion_rate', response.data)
        self.assertEqual(response.data['campaign_id'], str(campaign.id))

    def test_unauthorized_access(self):
        """Test unauthorized access to campaign API"""
        self.client.force_authenticate(user=None)

        url = reverse('surveycampaign-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_campaign_filtering(self):
        """Test filtering campaigns by status"""
        # Create campaigns with different statuses
        SurveyCampaign.objects.create(
            title='Draft Campaign',
            project_id='project_draft',
            survey_id='survey_draft',
            target_participants=50,
            reward_per_participant=Decimal('5.00'),
            duration_days=14,
            status='draft',
            created_by=self.user
        )

        SurveyCampaign.objects.create(
            title='Active Campaign',
            project_id='project_active',
            survey_id='survey_active',
            target_participants=100,
            reward_per_participant=Decimal('10.00'),
            duration_days=30,
            status='active',
            created_by=self.user
        )

        # Test filtering by status
        url = reverse('surveycampaign-list')
        response = self.client.get(url, {'status': 'draft'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['status'], 'draft')


class FeeConfigurationAPITests(APITestCase):
    """Test cases for Fee Configuration API endpoints"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='adminpass123',
            is_staff=True
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_get_current_fee_config_api(self):
        """Test getting current fee configuration via API"""
        config = FeeConfiguration.objects.create(
            fee_percentage=Decimal('5.0'),
            is_active=True
        )

        url = reverse('feeconfiguration-current')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['fee_percentage'], '5.0')
        self.assertTrue(response.data['is_active'])

    def test_calculate_fee_api(self):
        """Test fee calculation via API"""
        FeeConfiguration.objects.create(
            fee_percentage=Decimal('7.5'),
            is_active=True
        )

        url = reverse('feeconfiguration-calculate-fee')
        data = {'reward_amount': '200.00'}

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['reward_amount'], '200.00')
        self.assertEqual(response.data['fee_amount'], '15.00')  # 7.5% of 200
        self.assertEqual(response.data['total_cost'], '215.00')

    def test_update_fee_config_api(self):
        """Test updating fee configuration via API"""
        config = FeeConfiguration.objects.create(
            fee_percentage=Decimal('5.0'),
            is_active=True
        )

        url = reverse('feeconfiguration-detail', kwargs={'pk': config.id})
        data = {'fee_percentage': '6.0'}

        response = self.client.patch(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['fee_percentage'], '6.0')

        # Verify database was updated
        config.refresh_from_db()
        self.assertEqual(config.fee_percentage, Decimal('6.0'))


class SurveyCampaignSerializerTests(TestCase):
    """Test cases for SurveyCampaign serializer"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_serialize_campaign(self):
        """Test serializing campaign data"""
        campaign = SurveyCampaign.objects.create(
            title='Serializer Test Campaign',
            description='Test campaign for serializer',
            project_id='project_serializer',
            survey_id='survey_serializer',
            target_participants=100,
            reward_per_participant=Decimal('10.00'),
            duration_days=30,
            eligibility_criteria={'min_age': 18},
            created_by=self.user
        )

        serializer = SurveyCampaignSerializer(campaign)
        data = serializer.data

        self.assertEqual(data['title'], 'Serializer Test Campaign')
        self.assertEqual(data['target_participants'], 100)
        self.assertEqual(data['reward_per_participant'], '10.00')
        self.assertEqual(data['status'], 'draft')
        self.assertEqual(data['created_by'], self.user.id)

    def test_deserialize_campaign(self):
        """Test deserializing campaign data"""
        data = {
            'title': 'Deserializer Test Campaign',
            'description': 'Test campaign for deserializer',
            'project_id': 'project_deserializer',
            'survey_id': 'survey_deserializer',
            'target_participants': 150,
            'reward_per_participant': '15.00',
            'duration_days': 45,
            'eligibility_criteria': {'min_age': 21, 'max_age': 60}
        }

        serializer = SurveyCampaignSerializer(data=data)
        self.assertTrue(serializer.is_valid())

        campaign = serializer.save(created_by=self.user)
        self.assertEqual(campaign.title, 'Deserializer Test Campaign')
        self.assertEqual(campaign.target_participants, 150)
        self.assertEqual(campaign.reward_per_participant, Decimal('15.00'))

    def test_serializer_validation(self):
        """Test serializer validation"""
        # Test invalid data
        invalid_data = {
            'title': '',  # Empty title
            'target_participants': -10,  # Negative participants
            'reward_per_participant': '-5.00',  # Negative reward
            'duration_days': 0  # Zero duration
        }

        serializer = SurveyCampaignSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('title', serializer.errors)
        self.assertIn('target_participants', serializer.errors)
        self.assertIn('reward_per_participant', serializer.errors)
        self.assertIn('duration_days', serializer.errors)


class SurveyCampaignIntegrationTests(TransactionTestCase):
    """Integration tests for survey campaign workflow"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='integrationuser',
            email='integration@example.com',
            password='integrationpass123'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        # Create fee configuration
        self.fee_config = FeeConfiguration.objects.create(
            fee_percentage=Decimal('5.0'),
            is_active=True
        )

    def test_complete_campaign_workflow(self):
        """Test complete campaign workflow from creation to completion"""
        # Step 1: Create campaign
        create_url = reverse('surveycampaign-list')
        create_data = {
            'title': 'Integration Test Campaign',
            'description': 'Complete workflow test',
            'project_id': 'project_integration',
            'survey_id': 'survey_integration',
            'target_participants': 100,
            'reward_per_participant': '10.00',
            'duration_days': 30,
            'eligibility_criteria': {'min_age': 18, 'max_age': 65}
        }

        create_response = self.client.post(create_url, create_data, format='json')
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        campaign_id = create_response.data['id']

        # Step 2: Launch campaign
        launch_url = reverse('surveycampaign-launch', kwargs={'pk': campaign_id})
        launch_response = self.client.post(launch_url)
        self.assertEqual(launch_response.status_code, status.HTTP_200_OK)
        self.assertEqual(launch_response.data['status'], 'active')

        # Step 3: Update participation stats
        update_url = reverse('surveycampaign-detail', kwargs={'pk': campaign_id})
        update_data = {
            'total_participants': 75,
            'completed_responses': 60,
            'total_tokens_awarded': '600.00',
            'admin_fee_collected': '30.00'
        }
        update_response = self.client.patch(update_url, update_data, format='json')
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        # Step 4: Get analytics
        analytics_url = reverse('surveycampaign-analytics', kwargs={'pk': campaign_id})
        analytics_response = self.client.get(analytics_url)
        self.assertEqual(analytics_response.status_code, status.HTTP_200_OK)
        self.assertIn('completion_rate', analytics_response.data)

        # Step 5: Complete campaign
        complete_url = reverse('surveycampaign-complete', kwargs={'pk': campaign_id})
        complete_response = self.client.post(complete_url)
        self.assertEqual(complete_response.status_code, status.HTTP_200_OK)
        self.assertEqual(complete_response.data['status'], 'completed')

        # Verify final state
        campaign = SurveyCampaign.objects.get(id=campaign_id)
        self.assertEqual(campaign.status, 'completed')
        self.assertEqual(campaign.total_participants, 75)
        self.assertEqual(campaign.completed_responses, 60)
        self.assertIsNotNone(campaign.completed_at)

    @patch('apps.surveys.services.TokenService.check_balance')
    @patch('apps.surveys.services.NotificationService.send_campaign_notification')
    def test_campaign_with_external_services(self, mock_notification, mock_token_check):
        """Test campaign integration with external services"""
        # Mock external service responses
        mock_token_check.return_value = {'balance': 2000, 'sufficient': True}
        mock_notification.return_value = {'sent': 150, 'failed': 0}

        # Create and launch campaign
        create_url = reverse('surveycampaign-list')
        create_data = {
            'title': 'External Services Test',
            'project_id': 'project_external',
            'survey_id': 'survey_external',
            'target_participants': 150,
            'reward_per_participant': '12.00',
            'duration_days': 30,
            'eligibility_criteria': {'min_age': 18}
        }

        create_response = self.client.post(create_url, create_data, format='json')
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        campaign_id = create_response.data['id']
        launch_url = reverse('surveycampaign-launch', kwargs={'pk': campaign_id})
        launch_response = self.client.post(launch_url)

        self.assertEqual(launch_response.status_code, status.HTTP_200_OK)

        # Verify external services were called
        mock_token_check.assert_called_once()
        mock_notification.assert_called_once()