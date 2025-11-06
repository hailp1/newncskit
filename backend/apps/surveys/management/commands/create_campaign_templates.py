from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.surveys.models import CampaignTemplate

User = get_user_model()


class Command(BaseCommand):
    help = 'Create default campaign templates'
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Creating default campaign templates...'))
        
        # Get or create admin user for templates
        admin_user, created = User.objects.get_or_create(
            email='admin@ncskit.com',
            defaults={
                'username': 'admin',
                'first_name': 'Admin',
                'last_name': 'User',
                'is_staff': True,
                'is_superuser': True
            }
        )
        
        templates_data = [
            {
                'name': 'Academic Research Survey',
                'description': 'Template for academic research studies with comprehensive demographic questions and research methodology compliance.',
                'category': 'academic',
                'survey_config': {
                    'sections': [
                        {
                            'title': 'Demographics',
                            'questions': [
                                {
                                    'id': 'age',
                                    'type': 'number',
                                    'text': 'What is your age?',
                                    'required': True,
                                    'validation': {'min': 18, 'max': 100}
                                },
                                {
                                    'id': 'gender',
                                    'type': 'single_choice',
                                    'text': 'What is your gender?',
                                    'required': True,
                                    'options': ['Male', 'Female', 'Non-binary', 'Prefer not to say']
                                },
                                {
                                    'id': 'education',
                                    'type': 'single_choice',
                                    'text': 'What is your highest level of education?',
                                    'required': True,
                                    'options': ['High School', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Other']
                                }
                            ]
                        },
                        {
                            'title': 'Research Questions',
                            'questions': [
                                {
                                    'id': 'research_q1',
                                    'type': 'likert_scale',
                                    'text': 'Please rate your agreement with the following statement...',
                                    'required': True,
                                    'scale': {
                                        'min': 1,
                                        'max': 7,
                                        'labels': {
                                            '1': 'Strongly Disagree',
                                            '4': 'Neutral',
                                            '7': 'Strongly Agree'
                                        }
                                    }
                                }
                            ]
                        }
                    ],
                    'settings': {
                        'randomize_questions': False,
                        'show_progress': True,
                        'allow_back_navigation': True
                    }
                },
                'default_settings': {
                    'target_participants': 200,
                    'duration_days': 30,
                    'reward_per_participant': 5.00,
                    'require_approval': True
                },
                'eligibility_criteria': {
                    'min_age': 18,
                    'max_age': 65,
                    'education_level': ['Bachelor\'s Degree', 'Master\'s Degree', 'PhD']
                },
                'is_public': True,
                'is_featured': True
            },
            {
                'name': 'Market Research Survey',
                'description': 'Template for market research and consumer behavior studies.',
                'category': 'market',
                'survey_config': {
                    'sections': [
                        {
                            'title': 'Consumer Profile',
                            'questions': [
                                {
                                    'id': 'income_range',
                                    'type': 'single_choice',
                                    'text': 'What is your annual household income?',
                                    'required': True,
                                    'options': ['Under $25,000', '$25,000-$50,000', '$50,000-$75,000', '$75,000-$100,000', 'Over $100,000']
                                },
                                {
                                    'id': 'shopping_frequency',
                                    'type': 'single_choice',
                                    'text': 'How often do you shop online?',
                                    'required': True,
                                    'options': ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never']
                                }
                            ]
                        },
                        {
                            'title': 'Product Feedback',
                            'questions': [
                                {
                                    'id': 'product_satisfaction',
                                    'type': 'rating',
                                    'text': 'How satisfied are you with our product?',
                                    'required': True,
                                    'scale': {'min': 1, 'max': 5, 'type': 'stars'}
                                }
                            ]
                        }
                    ]
                },
                'default_settings': {
                    'target_participants': 500,
                    'duration_days': 14,
                    'reward_per_participant': 3.00
                },
                'is_public': True,
                'is_featured': True
            },
            {
                'name': 'Health & Wellness Survey',
                'description': 'Template for health-related research and wellness studies.',
                'category': 'health',
                'survey_config': {
                    'sections': [
                        {
                            'title': 'Health Information',
                            'questions': [
                                {
                                    'id': 'health_status',
                                    'type': 'single_choice',
                                    'text': 'How would you rate your overall health?',
                                    'required': True,
                                    'options': ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor']
                                },
                                {
                                    'id': 'exercise_frequency',
                                    'type': 'single_choice',
                                    'text': 'How often do you exercise?',
                                    'required': True,
                                    'options': ['Daily', '3-4 times per week', '1-2 times per week', 'Rarely', 'Never']
                                }
                            ]
                        }
                    ]
                },
                'default_settings': {
                    'target_participants': 300,
                    'duration_days': 21,
                    'reward_per_participant': 4.00
                },
                'eligibility_criteria': {
                    'min_age': 18
                },
                'is_public': True
            },
            {
                'name': 'Technology Usage Survey',
                'description': 'Template for technology adoption and usage studies.',
                'category': 'technology',
                'survey_config': {
                    'sections': [
                        {
                            'title': 'Technology Usage',
                            'questions': [
                                {
                                    'id': 'devices_owned',
                                    'type': 'multiple_choice',
                                    'text': 'Which devices do you own?',
                                    'required': True,
                                    'options': ['Smartphone', 'Laptop', 'Desktop Computer', 'Tablet', 'Smart Watch', 'Smart TV']
                                },
                                {
                                    'id': 'tech_comfort',
                                    'type': 'likert_scale',
                                    'text': 'How comfortable are you with new technology?',
                                    'required': True,
                                    'scale': {'min': 1, 'max': 5}
                                }
                            ]
                        }
                    ]
                },
                'default_settings': {
                    'target_participants': 400,
                    'duration_days': 20,
                    'reward_per_participant': 3.50
                },
                'is_public': True
            },
            {
                'name': 'Educational Research Survey',
                'description': 'Template for educational research and learning studies.',
                'category': 'education',
                'survey_config': {
                    'sections': [
                        {
                            'title': 'Educational Background',
                            'questions': [
                                {
                                    'id': 'current_status',
                                    'type': 'single_choice',
                                    'text': 'What is your current educational status?',
                                    'required': True,
                                    'options': ['Student', 'Graduate', 'Working Professional', 'Retired', 'Other']
                                },
                                {
                                    'id': 'learning_preference',
                                    'type': 'single_choice',
                                    'text': 'What is your preferred learning method?',
                                    'required': True,
                                    'options': ['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Mixed']
                                }
                            ]
                        }
                    ]
                },
                'default_settings': {
                    'target_participants': 250,
                    'duration_days': 25,
                    'reward_per_participant': 4.50
                },
                'is_public': True
            },
            {
                'name': 'General Opinion Survey',
                'description': 'General purpose template for opinion polls and feedback collection.',
                'category': 'general',
                'survey_config': {
                    'sections': [
                        {
                            'title': 'Your Opinion',
                            'questions': [
                                {
                                    'id': 'opinion_q1',
                                    'type': 'text',
                                    'text': 'What is your opinion on...?',
                                    'required': True,
                                    'validation': {'min_length': 10, 'max_length': 500}
                                },
                                {
                                    'id': 'rating_q1',
                                    'type': 'rating',
                                    'text': 'How would you rate...?',
                                    'required': True,
                                    'scale': {'min': 1, 'max': 10}
                                }
                            ]
                        }
                    ]
                },
                'default_settings': {
                    'target_participants': 100,
                    'duration_days': 15,
                    'reward_per_participant': 2.00
                },
                'is_public': True
            }
        ]
        
        created_count = 0
        for template_data in templates_data:
            template, created = CampaignTemplate.objects.get_or_create(
                name=template_data['name'],
                defaults={
                    **template_data,
                    'created_by': admin_user
                }
            )
            if created:
                created_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'Created {created_count} campaign templates successfully!')
        )