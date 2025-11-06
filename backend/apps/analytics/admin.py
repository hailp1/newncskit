from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import (
    AnalysisProject, AnalysisResult, StatisticalValidation,
    AnalysisCollaboration, AnalysisTemplate, AnalysisVisualization,
    AnalysisReport, CitationReference, AnalysisComment
)


@admin.register(AnalysisProject)
class AnalysisProjectAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'status', 'data_source', 'created_by', 
        'collaborator_count', 'results_count', 'created_at'
    ]
    list_filter = ['status', 'data_source', 'created_at']
    search_fields = ['title', 'description', 'created_by__email']
    readonly_fields = ['id', 'created_at', 'updated_at', 'version']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'status', 'research_project')
        }),
        ('Research Context', {
            'fields': ('theoretical_framework', 'research_questions', 'hypotheses'),
            'classes': ('collapse',)
        }),
        ('Data Configuration', {
            'fields': ('data_source', 'data_configuration'),
            'classes': ('collapse',)
        }),
        ('Analysis Configuration', {
            'fields': ('analysis_pipeline', 'statistical_methods'),
            'classes': ('collapse',)
        }),
        ('Versioning', {
            'fields': ('version', 'parent_version'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('id', 'created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def collaborator_count(self, obj):
        return obj.collaborators.count()
    collaborator_count.short_description = 'Collaborators'
    
    def results_count(self, obj):
        return obj.results.count()
    results_count.short_description = 'Results'


@admin.register(AnalysisResult)
class AnalysisResultAdmin(admin.ModelAdmin):
    list_display = [
        'analysis_name', 'analysis_type', 'project', 'status', 
        'executed_at', 'execution_time', 'has_validation'
    ]
    list_filter = ['analysis_type', 'status', 'executed_at']
    search_fields = ['analysis_name', 'project__title', 'statistical_interpretation']
    readonly_fields = ['id', 'executed_at', 'completed_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('project', 'analysis_name', 'analysis_type', 'analysis_description', 'status')
        }),
        ('Results', {
            'fields': ('statistical_output', 'fit_indices', 'parameter_estimates'),
            'classes': ('collapse',)
        }),
        ('Validation', {
            'fields': ('assumption_tests', 'diagnostic_plots'),
            'classes': ('collapse',)
        }),
        ('Interpretation', {
            'fields': ('statistical_interpretation', 'practical_significance', 'limitations', 'recommendations'),
            'classes': ('collapse',)
        }),
        ('Reproducibility', {
            'fields': ('r_code', 'r_session_info', 'analysis_parameters'),
            'classes': ('collapse',)
        }),
        ('Execution', {
            'fields': ('executed_at', 'completed_at', 'execution_time', 'error_message'),
            'classes': ('collapse',)
        })
    )
    
    def has_validation(self, obj):
        return hasattr(obj, 'validation')
    has_validation.boolean = True
    has_validation.short_description = 'Validated'


@admin.register(StatisticalValidation)
class StatisticalValidationAdmin(admin.ModelAdmin):
    list_display = [
        'analysis_result', 'overall_validity', 'validated_at'
    ]
    list_filter = ['overall_validity', 'validated_at']
    readonly_fields = ['id', 'validated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('analysis_result', 'overall_validity', 'validation_notes', 'validation_recommendations')
        }),
        ('Assumption Tests', {
            'fields': ('normality_tests', 'homoscedasticity_tests', 'independence_tests', 'linearity_tests'),
            'classes': ('collapse',)
        }),
        ('Sample Adequacy', {
            'fields': ('sample_size_adequacy', 'power_analysis'),
            'classes': ('collapse',)
        }),
        ('Diagnostics', {
            'fields': ('outlier_detection', 'influential_cases', 'multicollinearity_diagnostics'),
            'classes': ('collapse',)
        }),
        ('Factor Analysis', {
            'fields': ('kmo_test', 'bartlett_test'),
            'classes': ('collapse',)
        }),
        ('SEM Validation', {
            'fields': ('model_identification', 'convergence_issues'),
            'classes': ('collapse',)
        })
    )


@admin.register(AnalysisCollaboration)
class AnalysisCollaborationAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'project', 'role', 'status', 'invited_at', 
        'accepted_at', 'contribution_count'
    ]
    list_filter = ['role', 'status', 'invited_at']
    search_fields = ['user__email', 'project__title']
    readonly_fields = ['id', 'invited_at', 'accepted_at', 'last_accessed']


@admin.register(AnalysisTemplate)
class AnalysisTemplateAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'template_type', 'is_public', 'usage_count', 
        'created_by', 'created_at'
    ]
    list_filter = ['template_type', 'is_public', 'created_at']
    search_fields = ['name', 'description', 'created_by__email']
    readonly_fields = ['id', 'usage_count', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'template_type', 'is_public')
        }),
        ('Configuration', {
            'fields': ('analysis_pipeline', 'statistical_methods', 'required_variables', 'optional_variables'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('usage_count', 'created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(AnalysisVisualization)
class AnalysisVisualizationAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'chart_type', 'analysis_result', 'is_publication_ready', 
        'dpi', 'created_at'
    ]
    list_filter = ['chart_type', 'is_publication_ready', 'created_at']
    search_fields = ['title', 'description', 'analysis_result__analysis_name']
    readonly_fields = ['id', 'created_at']


@admin.register(AnalysisReport)
class AnalysisReportAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'project', 'format', 'style', 'status', 
        'generated_by', 'generated_at'
    ]
    list_filter = ['format', 'style', 'status', 'generated_at']
    search_fields = ['title', 'project__title', 'generated_by__email']
    readonly_fields = ['id', 'generated_at', 'completed_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('project', 'title', 'description', 'format', 'style', 'status')
        }),
        ('Content Options', {
            'fields': (
                'include_methodology', 'include_results', 'include_discussion',
                'include_tables', 'include_figures', 'include_references', 'include_appendices'
            )
        }),
        ('Generated Content', {
            'fields': ('content', 'file'),
            'classes': ('collapse',)
        }),
        ('Generation Info', {
            'fields': ('generated_by', 'generated_at', 'completed_at', 'error_message'),
            'classes': ('collapse',)
        })
    )


@admin.register(CitationReference)
class CitationReferenceAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'reference_type', 'year', 'usage_count', 'created_at'
    ]
    list_filter = ['reference_type', 'year', 'created_at']
    search_fields = ['title', 'authors', 'journal', 'package_name']
    readonly_fields = ['id', 'usage_count', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('reference_type', 'title', 'authors', 'year')
        }),
        ('Publication Details', {
            'fields': ('journal', 'volume', 'issue', 'pages', 'publisher', 'doi', 'url'),
            'classes': ('collapse',)
        }),
        ('Software Details', {
            'fields': ('version', 'package_name'),
            'classes': ('collapse',)
        }),
        ('Formatted Citations', {
            'fields': ('apa_citation', 'mla_citation', 'chicago_citation', 'bibtex_entry'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('usage_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(AnalysisComment)
class AnalysisCommentAdmin(admin.ModelAdmin):
    list_display = [
        'author', 'content_object', 'is_resolved', 'created_at'
    ]
    list_filter = ['is_resolved', 'created_at']
    search_fields = ['author__email', 'content']
    readonly_fields = ['id', 'created_at', 'updated_at', 'resolved_at']
