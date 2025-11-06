from django.db import models
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.utils import timezone
import uuid


class AnalysisProject(models.Model):
    """
    Analysis project model for managing research analysis workflows
    """
    DATA_SOURCE_CHOICES = [
        ('survey_campaign', 'Survey Campaign'),
        ('external_file', 'External File'),
        ('database_query', 'Database Query')
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('archived', 'Archived')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # Link to research project
    research_project = models.ForeignKey(
        'projects.Project', 
        on_delete=models.CASCADE,
        related_name='analysis_projects',
        null=True, blank=True
    )
    
    # Research methodology context
    theoretical_framework = models.JSONField(default=dict, blank=True)
    research_questions = models.JSONField(default=list, blank=True)
    hypotheses = models.JSONField(default=list, blank=True)
    
    # Data configuration
    data_source = models.CharField(max_length=50, choices=DATA_SOURCE_CHOICES)
    data_configuration = models.JSONField(default=dict, blank=True)
    
    # Analysis configuration
    analysis_pipeline = models.JSONField(default=list, blank=True)
    statistical_methods = models.JSONField(default=list, blank=True)
    
    # Results and outputs
    results_cache = models.JSONField(default=dict, blank=True)
    generated_reports = models.JSONField(default=list, blank=True)
    
    # Project status and metadata
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    version = models.IntegerField(default=1)
    parent_version = models.ForeignKey(
        'self', 
        null=True, blank=True, 
        on_delete=models.SET_NULL,
        related_name='child_versions'
    )
    
    # Collaboration
    collaborators = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        through='AnalysisCollaboration',
        through_fields=('project', 'user'),
        related_name='collaborative_analysis_projects'
    )
    
    # Audit fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='created_analysis_projects'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'analysis_projects'
        verbose_name = 'Analysis Project'
        verbose_name_plural = 'Analysis Projects'
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['created_by', '-updated_at']),
            models.Index(fields=['status', '-updated_at']),
            models.Index(fields=['research_project', '-updated_at']),
        ]
    
    def __str__(self):
        return f"{self.title} (v{self.version})"
    
    @property
    def is_collaborative(self):
        """Check if project has collaborators"""
        return self.collaborators.count() > 0
    
    def create_new_version(self, user):
        """Create a new version of this project"""
        new_project = AnalysisProject.objects.create(
            title=f"{self.title} (v{self.version + 1})",
            description=self.description,
            research_project=self.research_project,
            theoretical_framework=self.theoretical_framework,
            research_questions=self.research_questions,
            hypotheses=self.hypotheses,
            data_source=self.data_source,
            data_configuration=self.data_configuration,
            analysis_pipeline=self.analysis_pipeline,
            statistical_methods=self.statistical_methods,
            version=self.version + 1,
            parent_version=self,
            created_by=user
        )
        return new_project


class AnalysisResult(models.Model):
    """
    Statistical analysis results with comprehensive metadata
    """
    ANALYSIS_TYPE_CHOICES = [
        ('descriptive', 'Descriptive Statistics'),
        ('reliability', 'Reliability Analysis'),
        ('efa', 'Exploratory Factor Analysis'),
        ('cfa', 'Confirmatory Factor Analysis'),
        ('sem', 'Structural Equation Modeling'),
        ('regression', 'Regression Analysis'),
        ('anova', 'Analysis of Variance'),
        ('ttest', 'T-Test Analysis'),
        ('correlation', 'Correlation Analysis'),
        ('mediation', 'Mediation Analysis'),
        ('moderation', 'Moderation Analysis'),
        ('multigroup', 'Multi-Group Analysis'),
        ('longitudinal', 'Longitudinal Analysis')
    ]
    
    STATUS_CHOICES = [
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        AnalysisProject, 
        on_delete=models.CASCADE, 
        related_name='results'
    )
    
    # Analysis identification
    analysis_type = models.CharField(max_length=50, choices=ANALYSIS_TYPE_CHOICES)
    analysis_name = models.CharField(max_length=255)
    analysis_description = models.TextField(blank=True)
    
    # Statistical results
    statistical_output = models.JSONField(default=dict)
    fit_indices = models.JSONField(default=dict, blank=True)
    parameter_estimates = models.JSONField(default=dict, blank=True)
    
    # Validation and assumptions
    assumption_tests = models.JSONField(default=dict, blank=True)
    diagnostic_plots = models.JSONField(default=list, blank=True)
    
    # Interpretation and reporting
    statistical_interpretation = models.TextField(blank=True)
    practical_significance = models.TextField(blank=True)
    limitations = models.TextField(blank=True)
    recommendations = models.TextField(blank=True)
    
    # Reproducibility
    r_code = models.TextField(blank=True)
    r_session_info = models.JSONField(default=dict, blank=True)
    analysis_parameters = models.JSONField(default=dict, blank=True)
    
    # Execution metadata
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='running')
    executed_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    execution_time = models.DurationField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    
    class Meta:
        db_table = 'analysis_results'
        verbose_name = 'Analysis Result'
        verbose_name_plural = 'Analysis Results'
        ordering = ['-executed_at']
        indexes = [
            models.Index(fields=['project', '-executed_at']),
            models.Index(fields=['analysis_type', '-executed_at']),
            models.Index(fields=['status', '-executed_at']),
        ]
    
    def __str__(self):
        return f"{self.analysis_name} ({self.get_analysis_type_display()})"
    
    @property
    def is_successful(self):
        """Check if analysis completed successfully"""
        return self.status == 'completed' and not self.error_message


class StatisticalValidation(models.Model):
    """
    Statistical assumption validation and diagnostic results
    """
    VALIDITY_CHOICES = [
        ('valid', 'Valid'),
        ('warning', 'Valid with Warnings'),
        ('invalid', 'Invalid')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    analysis_result = models.OneToOneField(
        AnalysisResult, 
        on_delete=models.CASCADE,
        related_name='validation'
    )
    
    # Assumption testing results
    normality_tests = models.JSONField(default=dict, blank=True)
    homoscedasticity_tests = models.JSONField(default=dict, blank=True)
    independence_tests = models.JSONField(default=dict, blank=True)
    linearity_tests = models.JSONField(default=dict, blank=True)
    
    # Sample adequacy
    sample_size_adequacy = models.JSONField(default=dict, blank=True)
    power_analysis = models.JSONField(default=dict, blank=True)
    
    # Model diagnostics
    outlier_detection = models.JSONField(default=dict, blank=True)
    influential_cases = models.JSONField(default=dict, blank=True)
    multicollinearity_diagnostics = models.JSONField(default=dict, blank=True)
    
    # Factor analysis specific validations
    kmo_test = models.JSONField(default=dict, blank=True)
    bartlett_test = models.JSONField(default=dict, blank=True)
    
    # SEM specific validations
    model_identification = models.JSONField(default=dict, blank=True)
    convergence_issues = models.JSONField(default=dict, blank=True)
    
    # Overall validation status
    overall_validity = models.CharField(max_length=20, choices=VALIDITY_CHOICES)
    validation_notes = models.TextField(blank=True)
    validation_recommendations = models.TextField(blank=True)
    
    # Metadata
    validated_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'statistical_validations'
        verbose_name = 'Statistical Validation'
        verbose_name_plural = 'Statistical Validations'
    
    def __str__(self):
        return f"Validation for {self.analysis_result.analysis_name} ({self.overall_validity})"


class AnalysisCollaboration(models.Model):
    """
    Collaboration model for analysis projects
    """
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('editor', 'Editor'),
        ('analyst', 'Analyst'),
        ('viewer', 'Viewer'),
        ('reviewer', 'Reviewer')
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('pending', 'Pending'),
        ('declined', 'Declined'),
        ('removed', 'Removed')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(AnalysisProject, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # Collaboration details
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    permissions = models.JSONField(default=dict, blank=True)
    
    # Invitation details
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='sent_analysis_invitations'
    )
    invited_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    
    # Activity tracking
    last_accessed = models.DateTimeField(null=True, blank=True)
    contribution_count = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'analysis_collaborations'
        verbose_name = 'Analysis Collaboration'
        verbose_name_plural = 'Analysis Collaborations'
        unique_together = ['project', 'user']
        indexes = [
            models.Index(fields=['project', 'status']),
            models.Index(fields=['user', 'status']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.project.title} ({self.role})"
    
    def accept_invitation(self):
        """Accept collaboration invitation"""
        self.status = 'active'
        self.accepted_at = timezone.now()
        self.save()
    
    def decline_invitation(self):
        """Decline collaboration invitation"""
        self.status = 'declined'
        self.save()


class AnalysisTemplate(models.Model):
    """
    Reusable analysis templates for common research methodologies
    """
    TEMPLATE_TYPE_CHOICES = [
        ('survey_analysis', 'Survey Analysis'),
        ('experimental_design', 'Experimental Design'),
        ('longitudinal_study', 'Longitudinal Study'),
        ('cross_sectional', 'Cross-Sectional Study'),
        ('meta_analysis', 'Meta-Analysis'),
        ('psychometric', 'Psychometric Analysis'),
        ('custom', 'Custom Template')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField()
    template_type = models.CharField(max_length=50, choices=TEMPLATE_TYPE_CHOICES)
    
    # Template configuration
    analysis_pipeline = models.JSONField(default=list)
    statistical_methods = models.JSONField(default=list)
    required_variables = models.JSONField(default=dict)
    optional_variables = models.JSONField(default=dict)
    
    # Template metadata
    is_public = models.BooleanField(default=False)
    usage_count = models.IntegerField(default=0)
    
    # Audit fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='created_analysis_templates'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'analysis_templates'
        verbose_name = 'Analysis Template'
        verbose_name_plural = 'Analysis Templates'
        ordering = ['-usage_count', 'name']
        indexes = [
            models.Index(fields=['template_type', 'is_public']),
            models.Index(fields=['created_by', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_template_type_display()})"
    
    def increment_usage(self):
        """Increment usage count when template is used"""
        self.usage_count += 1
        self.save(update_fields=['usage_count'])


class AnalysisVisualization(models.Model):
    """
    Generated visualizations for analysis results
    """
    CHART_TYPE_CHOICES = [
        ('histogram', 'Histogram'),
        ('boxplot', 'Box Plot'),
        ('scatterplot', 'Scatter Plot'),
        ('correlation_heatmap', 'Correlation Heatmap'),
        ('scree_plot', 'Scree Plot'),
        ('factor_loading_plot', 'Factor Loading Plot'),
        ('path_diagram', 'Path Diagram'),
        ('coefficient_plot', 'Coefficient Plot'),
        ('diagnostic_plot', 'Diagnostic Plot'),
        ('residual_plot', 'Residual Plot'),
        ('qq_plot', 'Q-Q Plot'),
        ('custom', 'Custom Chart')
    ]
    
    FORMAT_CHOICES = [
        ('svg', 'SVG'),
        ('png', 'PNG'),
        ('pdf', 'PDF'),
        ('html', 'HTML'),
        ('json', 'JSON Data')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    analysis_result = models.ForeignKey(
        AnalysisResult, 
        on_delete=models.CASCADE,
        related_name='visualizations'
    )
    
    # Chart details
    chart_type = models.CharField(max_length=50, choices=CHART_TYPE_CHOICES)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # Chart data and configuration
    chart_data = models.JSONField(default=dict)
    chart_config = models.JSONField(default=dict)
    
    # Output formats
    svg_content = models.TextField(blank=True)
    png_file = models.FileField(upload_to='analysis_charts/png/', blank=True)
    pdf_file = models.FileField(upload_to='analysis_charts/pdf/', blank=True)
    
    # Publication settings
    is_publication_ready = models.BooleanField(default=False)
    dpi = models.IntegerField(default=300)
    width = models.IntegerField(default=800)
    height = models.IntegerField(default=600)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'analysis_visualizations'
        verbose_name = 'Analysis Visualization'
        verbose_name_plural = 'Analysis Visualizations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['analysis_result', '-created_at']),
            models.Index(fields=['chart_type']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.get_chart_type_display()})"


class AnalysisReport(models.Model):
    """
    Generated analysis reports in various formats
    """
    FORMAT_CHOICES = [
        ('pdf', 'PDF'),
        ('docx', 'Word Document'),
        ('html', 'HTML'),
        ('latex', 'LaTeX'),
        ('markdown', 'Markdown')
    ]
    
    STYLE_CHOICES = [
        ('apa', 'APA Style'),
        ('mla', 'MLA Style'),
        ('chicago', 'Chicago Style'),
        ('ieee', 'IEEE Style'),
        ('custom', 'Custom Style')
    ]
    
    STATUS_CHOICES = [
        ('generating', 'Generating'),
        ('completed', 'Completed'),
        ('failed', 'Failed')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        AnalysisProject, 
        on_delete=models.CASCADE,
        related_name='reports'
    )
    
    # Report details
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    format = models.CharField(max_length=20, choices=FORMAT_CHOICES)
    style = models.CharField(max_length=20, choices=STYLE_CHOICES, default='apa')
    
    # Report content
    content = models.TextField(blank=True)
    file = models.FileField(upload_to='analysis_reports/', blank=True)
    
    # Report configuration
    include_methodology = models.BooleanField(default=True)
    include_results = models.BooleanField(default=True)
    include_discussion = models.BooleanField(default=True)
    include_tables = models.BooleanField(default=True)
    include_figures = models.BooleanField(default=True)
    include_references = models.BooleanField(default=True)
    include_appendices = models.BooleanField(default=False)
    
    # Generation metadata
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='generating')
    generated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='generated_reports'
    )
    generated_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    
    class Meta:
        db_table = 'analysis_reports'
        verbose_name = 'Analysis Report'
        verbose_name_plural = 'Analysis Reports'
        ordering = ['-generated_at']
        indexes = [
            models.Index(fields=['project', '-generated_at']),
            models.Index(fields=['generated_by', '-generated_at']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.get_format_display()})"


class CitationReference(models.Model):
    """
    Citation references for statistical methods and software
    """
    REFERENCE_TYPE_CHOICES = [
        ('software', 'Software'),
        ('method', 'Statistical Method'),
        ('package', 'R Package'),
        ('book', 'Book'),
        ('article', 'Journal Article'),
        ('manual', 'Manual'),
        ('website', 'Website')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Citation details
    reference_type = models.CharField(max_length=20, choices=REFERENCE_TYPE_CHOICES)
    title = models.CharField(max_length=500)
    authors = models.JSONField(default=list)
    year = models.IntegerField(null=True, blank=True)
    journal = models.CharField(max_length=255, blank=True)
    volume = models.CharField(max_length=50, blank=True)
    issue = models.CharField(max_length=50, blank=True)
    pages = models.CharField(max_length=50, blank=True)
    publisher = models.CharField(max_length=255, blank=True)
    doi = models.CharField(max_length=255, blank=True)
    url = models.URLField(blank=True)
    
    # Software specific fields
    version = models.CharField(max_length=50, blank=True)
    package_name = models.CharField(max_length=100, blank=True)
    
    # Formatted citations
    apa_citation = models.TextField(blank=True)
    mla_citation = models.TextField(blank=True)
    chicago_citation = models.TextField(blank=True)
    bibtex_entry = models.TextField(blank=True)
    
    # Usage tracking
    usage_count = models.IntegerField(default=0)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'citation_references'
        verbose_name = 'Citation Reference'
        verbose_name_plural = 'Citation References'
        ordering = ['-usage_count', 'title']
        indexes = [
            models.Index(fields=['reference_type']),
            models.Index(fields=['package_name']),
            models.Index(fields=['-usage_count']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.year or 'N/A'})"
    
    def increment_usage(self):
        """Increment usage count when citation is used"""
        self.usage_count += 1
        self.save(update_fields=['usage_count'])


class AnalysisComment(models.Model):
    """
    Comments and discussions on analysis results
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Polymorphic relationship to analysis objects
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.CharField(max_length=255)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Comment details
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='analysis_comments'
    )
    content = models.TextField()
    
    # Threading support
    parent = models.ForeignKey(
        'self', 
        null=True, blank=True, 
        on_delete=models.CASCADE,
        related_name='replies'
    )
    
    # Status
    is_resolved = models.BooleanField(default=False)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='resolved_analysis_comments'
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'analysis_comments'
        verbose_name = 'Analysis Comment'
        verbose_name_plural = 'Analysis Comments'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['author', '-created_at']),
            models.Index(fields=['is_resolved']),
        ]
    
    def __str__(self):
        return f"Comment by {self.author.get_full_name()} on {self.content_object}"
