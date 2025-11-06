from django.test import TestCase, TransactionTestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
import json
from decimal import Decimal

from .models import TheoreticalModel, ResearchVariable, QuestionTemplate, QuestionBank
from .serializers import (
    TheoreticalModelSerializer, 
    ResearchVariableSerializer, 
    QuestionTemplateSerializer,
    QuestionBankSerializer
)


class TheoreticalModelTests(TestCase):
    """Test cases for TheoreticalModel model"""

    def test_create_theoretical_model(self):
        """Test creating a theoretical model"""
        model = TheoreticalModel.objects.create(
            name='Technology Acceptance Model',
            description='A model that explains how users accept and use technology',
            category='Information Systems'
        )

        self.assertEqual(model.name, 'Technology Acceptance Model')
        self.assertEqual(model.category, 'Information Systems')
        self.assertTrue(model.is_active)

    def test_theoretical_model_str_representation(self):
        """Test string representation of theoretical model"""
        model = TheoreticalModel.objects.create(
            name='UTAUT',
            description='Unified Theory of Acceptance and Use of Technology'
        )

        self.assertEqual(str(model), 'UTAUT')

    def test_theoretical_model_slug_generation(self):
        """Test automatic slug generation"""
        model = TheoreticalModel.objects.create(
            name='Theory of Planned Behavior',
            description='TPB model description'
        )

        self.assertEqual(model.slug, 'theory-of-planned-behavior')


class ResearchVariableTests(TestCase):
    """Test cases for ResearchVariable model"""

    def setUp(self):
        self.theoretical_model = TheoreticalModel.objects.create(
            name='Technology Acceptance Model',
            description='TAM model'
        )

    def test_create_research_variable(self):
        """Test creating a research variable"""
        variable = ResearchVariable.objects.create(
            name='Perceived Usefulness',
            description='The degree to which a person believes using technology will enhance performance',
            variable_type='independent',
            measurement_scale='likert'
        )
        variable.theoretical_models.add(self.theoretical_model)

        self.assertEqual(variable.name, 'Perceived Usefulness')
        self.assertEqual(variable.variable_type, 'independent')
        self.assertEqual(variable.measurement_scale, 'likert')
        self.assertIn(self.theoretical_model, variable.theoretical_models.all())

    def test_research_variable_str_representation(self):
        """Test string representation of research variable"""
        variable = ResearchVariable.objects.create(
            name='Perceived Ease of Use',
            description='PEOU description',
            variable_type='independent'
        )

        self.assertEqual(str(variable), 'Perceived Ease of Use')

    def test_variable_type_choices(self):
        """Test variable type choices"""
        variable = ResearchVariable.objects.create(
            name='Test Variable',
            variable_type='mediator'
        )

        valid_types = ['independent', 'dependent', 'mediator', 'moderator']
        for var_type in valid_types:
            variable.variable_type = var_type
            variable.save()
            self.assertEqual(variable.variable_type, var_type)


class QuestionTemplateTests(TestCase):
    """Test cases for QuestionTemplate model"""

    def setUp(self):
        self.theoretical_model = TheoreticalModel.objects.create(
            name='TAM',
            description='Technology Acceptance Model'
        )
        
        self.research_variable = ResearchVariable.objects.create(
            name='Perceived Usefulness',
            description='PU description',
            variable_type='independent'
        )
        self.research_variable.theoretical_models.add(self.theoretical_model)

    def test_create_question_template(self):
        """Test creating a question template"""
        question = QuestionTemplate.objects.create(
            text='Using this system would improve my job performance',
            question_type='likert',
            research_variable=self.research_variable,
            configuration={
                'scale_min': 1,
                'scale_max': 7,
                'scale_labels': {
                    '1': 'Strongly Disagree',
                    '7': 'Strongly Agree'
                }
            },
            reliability=Decimal('0.85'),
            source='Davis, F. D. (1989)'
        )

        self.assertEqual(question.text, 'Using this system would improve my job performance')
        self.assertEqual(question.question_type, 'likert')
        self.assertEqual(question.research_variable, self.research_variable)
        self.assertEqual(question.reliability, Decimal('0.85'))
        self.assertTrue(question.is_active)

    def test_question_template_str_representation(self):
        """Test string representation of question template"""
        question = QuestionTemplate.objects.create(
            text='This is a test question',
            question_type='text',
            research_variable=self.research_variable
        )

        expected_str = 'This is a test question (text)'
        self.assertEqual(str(question), expected_str)

    def test_question_type_choices(self):
        """Test question type choices"""
        question = QuestionTemplate.objects.create(
            text='Test question',
            question_type='multiple_choice',
            research_variable=self.research_variable
        )

        valid_types = ['likert', 'multiple_choice', 'text', 'numeric', 'boolean', 'rating']
        for q_type in valid_types:
            question.question_type = q_type
            question.save()
            self.assertEqual(question.question_type, q_type)

    def test_question_validation_rules(self):
        """Test question validation rules"""
        question = QuestionTemplate.objects.create(
            text='Age question',
            question_type='numeric',
            research_variable=self.research_variable,
            validation_rules={
                'min_value': 18,
                'max_value': 100,
                'required': True
            }
        )

        self.assertEqual(question.validation_rules['min_value'], 18)
        self.assertEqual(question.validation_rules['max_value'], 100)
        self.assertTrue(question.validation_rules['required'])


class QuestionBankTests(TestCase):
    """Test cases for QuestionBank model"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

        self.theoretical_model = TheoreticalModel.objects.create(
            name='TAM',
            description='Technology Acceptance Model'
        )

        self.research_variable = ResearchVariable.objects.create(
            name='Perceived Usefulness',
            variable_type='independent'
        )

        self.question = QuestionTemplate.objects.create(
            text='Test question',
            question_type='likert',
            research_variable=self.research_variable
        )

    def test_create_question_bank(self):
        """Test creating a question bank"""
        bank = QuestionBank.objects.create(
            name='TAM Question Bank',
            description='Questions for Technology Acceptance Model',
            theoretical_model=self.theoretical_model,
            created_by=self.user,
            is_public=True
        )
        bank.questions.add(self.question)

        self.assertEqual(bank.name, 'TAM Question Bank')
        self.assertEqual(bank.theoretical_model, self.theoretical_model)
        self.assertEqual(bank.created_by, self.user)
        self.assertTrue(bank.is_public)
        self.assertIn(self.question, bank.questions.all())

    def test_question_bank_str_representation(self):
        """Test string representation of question bank"""
        bank = QuestionBank.objects.create(
            name='Test Bank',
            theoretical_model=self.theoretical_model,
            created_by=self.user
        )

        self.assertEqual(str(bank), 'Test Bank')

    def test_question_count_property(self):
        """Test question count property"""
        bank = QuestionBank.objects.create(
            name='Count Test Bank',
            theoretical_model=self.theoretical_model,
            created_by=self.user
        )

        # Add questions
        question1 = QuestionTemplate.objects.create(
            text='Question 1',
            question_type='likert',
            research_variable=self.research_variable
        )
        question2 = QuestionTemplate.objects.create(
            text='Question 2',
            question_type='text',
            research_variable=self.research_variable
        )

        bank.questions.add(question1, question2)

        self.assertEqual(bank.question_count, 2)


class QuestionBankAPITests(APITestCase):
    """Test cases for Question Bank API endpoints"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        # Create test data
        self.theoretical_model = TheoreticalModel.objects.create(
            name='Technology Acceptance Model',
            description='TAM model for testing'
        )

        self.research_variable = ResearchVariable.objects.create(
            name='Perceived Usefulness',
            description='PU variable',
            variable_type='independent'
        )
        self.research_variable.theoretical_models.add(self.theoretical_model)

    def test_create_theoretical_model_api(self):
        """Test creating theoretical model via API"""
        url = reverse('theoreticalmodel-list')
        data = {
            'name': 'UTAUT Model',
            'description': 'Unified Theory of Acceptance and Use of Technology',
            'category': 'Information Systems'
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'UTAUT Model')
        self.assertEqual(response.data['category'], 'Information Systems')

    def test_get_theoretical_models_api(self):
        """Test getting theoretical models via API"""
        # Create additional model
        TheoreticalModel.objects.create(
            name='Theory of Planned Behavior',
            description='TPB model'
        )

        url = reverse('theoreticalmodel-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # TAM + TPB

    def test_create_research_variable_api(self):
        """Test creating research variable via API"""
        url = reverse('researchvariable-list')
        data = {
            'name': 'Perceived Ease of Use',
            'description': 'The degree to which a person believes using technology will be free of effort',
            'variable_type': 'independent',
            'measurement_scale': 'likert',
            'theoretical_models': [self.theoretical_model.id]
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Perceived Ease of Use')
        self.assertEqual(response.data['variable_type'], 'independent')

    def test_create_question_template_api(self):
        """Test creating question template via API"""
        url = reverse('questiontemplate-list')
        data = {
            'text': 'Using this system would improve my job performance',
            'question_type': 'likert',
            'research_variable': self.research_variable.id,
            'configuration': {
                'scale_min': 1,
                'scale_max': 7,
                'scale_labels': {
                    '1': 'Strongly Disagree',
                    '7': 'Strongly Agree'
                }
            },
            'reliability': '0.85',
            'source': 'Davis, F. D. (1989)',
            'is_required': True
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['text'], 'Using this system would improve my job performance')
        self.assertEqual(response.data['question_type'], 'likert')
        self.assertEqual(response.data['reliability'], '0.85')

    def test_search_questions_api(self):
        """Test searching questions via API"""
        # Create test questions
        question1 = QuestionTemplate.objects.create(
            text='Performance related question',
            question_type='likert',
            research_variable=self.research_variable,
            reliability=Decimal('0.85')
        )

        question2 = QuestionTemplate.objects.create(
            text='Usefulness related question',
            question_type='likert',
            research_variable=self.research_variable,
            reliability=Decimal('0.90')
        )

        url = reverse('questiontemplate-search')
        data = {
            'query': 'performance',
            'question_type': 'likert',
            'min_reliability': 0.8
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_get_questions_by_model_api(self):
        """Test getting questions by theoretical model via API"""
        # Create question
        QuestionTemplate.objects.create(
            text='TAM question',
            question_type='likert',
            research_variable=self.research_variable
        )

        url = reverse('questiontemplate-by-model')
        response = self.client.get(url, {'theoretical_model': self.theoretical_model.name})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_create_question_bank_api(self):
        """Test creating question bank via API"""
        # Create question first
        question = QuestionTemplate.objects.create(
            text='Bank test question',
            question_type='likert',
            research_variable=self.research_variable
        )

        url = reverse('questionbank-list')
        data = {
            'name': 'API Test Bank',
            'description': 'Question bank created via API',
            'theoretical_model': self.theoretical_model.id,
            'is_public': True,
            'questions': [question.id]
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'API Test Bank')
        self.assertTrue(response.data['is_public'])

    def test_question_validation_api(self):
        """Test question validation via API"""
        url = reverse('questiontemplate-validate')
        data = {
            'text': 'Test validation question',
            'question_type': 'likert',
            'research_variable': self.research_variable.id,
            'configuration': {
                'scale_min': 1,
                'scale_max': 7
            }
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('is_valid', response.data)
        self.assertIn('errors', response.data)
        self.assertIn('warnings', response.data)

    def test_get_similar_questions_api(self):
        """Test getting similar questions via API"""
        # Create base question
        base_question = QuestionTemplate.objects.create(
            text='Base question for similarity',
            question_type='likert',
            research_variable=self.research_variable
        )

        # Create similar questions
        QuestionTemplate.objects.create(
            text='Similar question 1',
            question_type='likert',
            research_variable=self.research_variable
        )

        url = reverse('questiontemplate-similar', kwargs={'pk': base_question.id})
        response = self.client.get(url, {'limit': 5})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)

    def test_unauthorized_access(self):
        """Test unauthorized access to question bank API"""
        self.client.force_authenticate(user=None)

        url = reverse('theoreticalmodel-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class QuestionBankSerializerTests(TestCase):
    """Test cases for Question Bank serializers"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

        self.theoretical_model = TheoreticalModel.objects.create(
            name='TAM',
            description='Technology Acceptance Model'
        )

    def test_theoretical_model_serializer(self):
        """Test theoretical model serializer"""
        serializer = TheoreticalModelSerializer(self.theoretical_model)
        data = serializer.data

        self.assertEqual(data['name'], 'TAM')
        self.assertEqual(data['description'], 'Technology Acceptance Model')
        self.assertTrue(data['is_active'])

    def test_research_variable_serializer(self):
        """Test research variable serializer"""
        variable = ResearchVariable.objects.create(
            name='Perceived Usefulness',
            description='PU description',
            variable_type='independent',
            measurement_scale='likert'
        )
        variable.theoretical_models.add(self.theoretical_model)

        serializer = ResearchVariableSerializer(variable)
        data = serializer.data

        self.assertEqual(data['name'], 'Perceived Usefulness')
        self.assertEqual(data['variable_type'], 'independent')
        self.assertEqual(data['measurement_scale'], 'likert')
        self.assertIn(self.theoretical_model.id, data['theoretical_models'])

    def test_question_template_serializer(self):
        """Test question template serializer"""
        variable = ResearchVariable.objects.create(
            name='Test Variable',
            variable_type='independent'
        )

        question = QuestionTemplate.objects.create(
            text='Test question text',
            question_type='likert',
            research_variable=variable,
            reliability=Decimal('0.85'),
            source='Test Source'
        )

        serializer = QuestionTemplateSerializer(question)
        data = serializer.data

        self.assertEqual(data['text'], 'Test question text')
        self.assertEqual(data['question_type'], 'likert')
        self.assertEqual(data['reliability'], '0.85')
        self.assertEqual(data['source'], 'Test Source')

    def test_question_bank_serializer(self):
        """Test question bank serializer"""
        variable = ResearchVariable.objects.create(
            name='Test Variable',
            variable_type='independent'
        )

        question = QuestionTemplate.objects.create(
            text='Bank question',
            question_type='text',
            research_variable=variable
        )

        bank = QuestionBank.objects.create(
            name='Test Bank',
            description='Test bank description',
            theoretical_model=self.theoretical_model,
            created_by=self.user,
            is_public=True
        )
        bank.questions.add(question)

        serializer = QuestionBankSerializer(bank)
        data = serializer.data

        self.assertEqual(data['name'], 'Test Bank')
        self.assertEqual(data['description'], 'Test bank description')
        self.assertTrue(data['is_public'])
        self.assertEqual(data['question_count'], 1)


class QuestionBankIntegrationTests(TransactionTestCase):
    """Integration tests for question bank workflow"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='integrationuser',
            email='integration@example.com',
            password='integrationpass123'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_complete_question_bank_workflow(self):
        """Test complete workflow from model creation to question bank"""
        # Step 1: Create theoretical model
        model_url = reverse('theoreticalmodel-list')
        model_data = {
            'name': 'Integration Test Model',
            'description': 'Model for integration testing',
            'category': 'Testing'
        }

        model_response = self.client.post(model_url, model_data, format='json')
        self.assertEqual(model_response.status_code, status.HTTP_201_CREATED)
        model_id = model_response.data['id']

        # Step 2: Create research variable
        variable_url = reverse('researchvariable-list')
        variable_data = {
            'name': 'Integration Variable',
            'description': 'Variable for integration testing',
            'variable_type': 'independent',
            'measurement_scale': 'likert',
            'theoretical_models': [model_id]
        }

        variable_response = self.client.post(variable_url, variable_data, format='json')
        self.assertEqual(variable_response.status_code, status.HTTP_201_CREATED)
        variable_id = variable_response.data['id']

        # Step 3: Create question templates
        question_url = reverse('questiontemplate-list')
        questions_data = [
            {
                'text': 'Integration question 1',
                'question_type': 'likert',
                'research_variable': variable_id,
                'reliability': '0.85'
            },
            {
                'text': 'Integration question 2',
                'question_type': 'likert',
                'research_variable': variable_id,
                'reliability': '0.90'
            }
        ]

        question_ids = []
        for question_data in questions_data:
            question_response = self.client.post(question_url, question_data, format='json')
            self.assertEqual(question_response.status_code, status.HTTP_201_CREATED)
            question_ids.append(question_response.data['id'])

        # Step 4: Create question bank
        bank_url = reverse('questionbank-list')
        bank_data = {
            'name': 'Integration Test Bank',
            'description': 'Question bank for integration testing',
            'theoretical_model': model_id,
            'is_public': True,
            'questions': question_ids
        }

        bank_response = self.client.post(bank_url, bank_data, format='json')
        self.assertEqual(bank_response.status_code, status.HTTP_201_CREATED)
        bank_id = bank_response.data['id']

        # Step 5: Search questions
        search_url = reverse('questiontemplate-search')
        search_data = {
            'query': 'integration',
            'theoretical_model': 'Integration Test Model'
        }

        search_response = self.client.post(search_url, search_data, format='json')
        self.assertEqual(search_response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(search_response.data), 2)

        # Step 6: Validate question bank creation
        bank_detail_url = reverse('questionbank-detail', kwargs={'pk': bank_id})
        bank_detail_response = self.client.get(bank_detail_url)
        self.assertEqual(bank_detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(bank_detail_response.data['question_count'], 2)

    @patch('apps.question_bank.services.AIService.generate_questions')
    def test_ai_question_generation_workflow(self, mock_ai_service):
        """Test AI-powered question generation workflow"""
        # Mock AI service response
        mock_ai_service.return_value = [
            {
                'text': 'AI generated question 1',
                'question_type': 'likert',
                'reliability_estimate': 0.80
            },
            {
                'text': 'AI generated question 2',
                'question_type': 'multiple_choice',
                'options': ['Option A', 'Option B', 'Option C'],
                'reliability_estimate': 0.75
            }
        ]

        # Create model and variable first
        model = TheoreticalModel.objects.create(
            name='AI Test Model',
            description='Model for AI testing'
        )

        variable = ResearchVariable.objects.create(
            name='AI Variable',
            variable_type='independent'
        )
        variable.theoretical_models.add(model)

        # Test AI generation endpoint
        generate_url = reverse('questiontemplate-generate')
        generate_data = {
            'theoretical_frameworks': [
                {
                    'name': 'AI Test Model',
                    'variables': [
                        {
                            'name': 'AI Variable',
                            'construct': 'Test Construct'
                        }
                    ]
                }
            ],
            'project_context': 'AI testing context'
        }

        generate_response = self.client.post(generate_url, generate_data, format='json')
        self.assertEqual(generate_response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(generate_response.data), 2)

        # Verify AI service was called
        mock_ai_service.assert_called_once()