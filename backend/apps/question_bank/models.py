from django.db import models
from django.conf import settings
import uuid


class TheoreticalModel(models.Model):
    """Theoretical models/frameworks for research"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=100)  # e.g., 'psychology', 'marketing', 'sociology'
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'theoretical_models'
        ordering = ['name']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['name']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.category})"


class ResearchVariable(models.Model):
    """Variables associated with theoretical models"""
    
    VARIABLE_TYPES = [
        ('independent', 'Independent Variable'),
        ('dependent', 'Dependent Variable'),
        ('mediator', 'Mediator Variable'),
        ('moderator', 'Moderator Variable'),
        ('control', 'Control Variable'),
    ]
    
    MEASUREMENT_SCALES = [
        ('nominal', 'Nominal'),
        ('ordinal', 'Ordinal'),
        ('interval', 'Interval'),
        ('ratio', 'Ratio'),
        ('likert', 'Likert Scale'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField()
    variable_type = models.CharField(max_length=20, choices=VARIABLE_TYPES)
    measurement_scale = models.CharField(max_length=20, choices=MEASUREMENT_SCALES)
    
    # Associated theoretical models
    theoretical_models = models.ManyToManyField(TheoreticalModel, related_name='variables')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'research_variables'
        ordering = ['name']
        indexes = [
            models.Index(fields=['variable_type']),
            models.Index(fields=['measurement_scale']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_variable_type_display()})"


class QuestionTemplate(models.Model):
    """Template questions for surveys"""
    
    QUESTION_TYPES = [
        ('text', 'Text Input'),
        ('number', 'Number Input'),
        ('email', 'Email Input'),
        ('choice', 'Single Choice'),
        ('multiple_choice', 'Multiple Choice'),
        ('likert', 'Likert Scale'),
        ('rating', 'Rating Scale'),
        ('boolean', 'Yes/No'),
        ('date', 'Date'),
        ('time', 'Time'),
        ('datetime', 'Date and Time'),
        ('file', 'File Upload'),
        ('matrix', 'Matrix/Grid'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    text = models.TextField()  # Question text
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    
    # Question configuration (JSON field for flexibility)
    configuration = models.JSONField(default=dict, blank=True)  # Options, scale ranges, etc.
    
    # Associated research variable
    research_variable = models.ForeignKey(
        ResearchVariable, 
        on_delete=models.CASCADE, 
        related_name='question_templates'
    )
    
    # Validation and constraints
    is_required = models.BooleanField(default=True)
    validation_rules = models.JSONField(default=dict, blank=True)
    
    # Usage statistics
    usage_count = models.PositiveIntegerField(default=0)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'question_templates'
        ordering = ['-usage_count', 'text']
        indexes = [
            models.Index(fields=['question_type']),
            models.Index(fields=['research_variable']),
            models.Index(fields=['-usage_count']),
        ]
    
    def __str__(self):
        return f"{self.text[:50]}... ({self.get_question_type_display()})"
    
    def increment_usage(self):
        """Increment usage count when question is used"""
        self.usage_count += 1
        self.save(update_fields=['usage_count'])


class QuestionBank(models.Model):
    """Collection of question templates organized by research domain"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField()
    
    # Associated theoretical model
    theoretical_model = models.ForeignKey(
        TheoreticalModel, 
        on_delete=models.CASCADE, 
        related_name='question_banks'
    )
    
    # Questions in this bank
    questions = models.ManyToManyField(QuestionTemplate, related_name='question_banks')
    
    # Access control
    is_public = models.BooleanField(default=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'question_banks'
        ordering = ['name']
        indexes = [
            models.Index(fields=['theoretical_model']),
            models.Index(fields=['is_public']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.theoretical_model.name}"
    
    @property
    def question_count(self):
        return self.questions.count()


class QuestionUsageLog(models.Model):
    """Log question template usage for analytics"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question_template = models.ForeignKey(
        QuestionTemplate, 
        on_delete=models.CASCADE, 
        related_name='usage_logs'
    )
    used_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # Context of usage
    project_id = models.UUIDField(blank=True, null=True)  # Reference to project
    survey_id = models.UUIDField(blank=True, null=True)   # Reference to survey
    
    # Usage metadata
    used_at = models.DateTimeField(auto_now_add=True)
    modifications = models.JSONField(default=dict, blank=True)  # Any modifications made
    
    class Meta:
        db_table = 'question_usage_logs'
        ordering = ['-used_at']
        indexes = [
            models.Index(fields=['question_template', '-used_at']),
            models.Index(fields=['used_by', '-used_at']),
        ]
    
    def __str__(self):
        return f"{self.question_template.text[:30]}... used by {self.used_by.email}"