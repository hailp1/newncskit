from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()


class SimpleTestCase(TestCase):
    """Simple test to verify Django test setup is working"""

    def test_django_setup(self):
        """Test that Django test setup is working"""
        self.assertTrue(True)

    def test_user_creation(self):
        """Test that we can create a user"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')

    def test_database_operations(self):
        """Test basic database operations"""
        # Create user
        user = User.objects.create_user(username='dbtest', password='pass')
        
        # Verify user exists
        self.assertTrue(User.objects.filter(username='dbtest').exists())
        
        # Update user
        user.email = 'updated@example.com'
        user.save()
        
        # Verify update
        updated_user = User.objects.get(username='dbtest')
        self.assertEqual(updated_user.email, 'updated@example.com')
        
        # Delete user
        user.delete()
        
        # Verify deletion
        self.assertFalse(User.objects.filter(username='dbtest').exists())