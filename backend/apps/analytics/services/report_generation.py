"""
Professional Report Generation Service for Advanced Data Analysis System

This service generates academic-quality reports in multiple formats
with proper statistical reporting standards.
"""

import logging
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import json
import io
from pathlib import Path

from django.template.loader import render_to_string
from django.conf import settings
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors

from ..models import AnalysisProject, AnalysisResult, AnalysisReport
from .citation_management import CitationManager

logger = logging.getLogger(__name__)


@dataclass
class ReportConfiguration:
    """Report generation configuration"""
    format: str  # 'pdf', 'docx', 'html', 'latex'
    style: str   # 'apa', 'mla', 'chicago', 'ieee'
    include_methodology: bool = True
    include_results: bool = True
    include_discussion: bool = True
    include_tables: bool = True
    include_figures: bool = True
    include_references: bool = True
    include_appendices: bool = False
    page_size: str = 'letter'
    font_size: int = 12
    line_spacing: float = 2.0


class AcademicReportGenerator:
    """Main report generator with academic formatting"""
    
    def __init__(self):
        self.citation_manager = CitationManager()
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles for academic formatting"""
        
        # APA Style configurations
        self.styles.add(ParagraphStyle(
            name='APATitle',
            parent=self.styles['Title'],
            fontSize=12,
            spaceAfter=12,
            alignment=1,  # Center
            fontName='Times-Roman'
        ))
        
        self.styles.add(ParagraphStyle(
            name='APAHeading1',
            parent=self.styles['Heading1'],
            fontSize=12,
            spaceAfter=6,
            spaceBefore=12,
            alignment=1,  # Center
            fontName='Times-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='APAHeading2',
            parent=self.styles['Heading2'],
            fontSize=12,
            spaceAfter=6,
            spaceBefore=6,
            alignment=0,  # Left
            fontName='Times-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='APABody',
            parent=self.styles['Normal'],
            fontSize=12,
            spaceAfter=12,
            alignment=4,  # Justify
            fontName='Times-Roman',
            firstLineIndent=0.5*inch
        ))
    
    async def generate_comprehensive_report(
        self,
        project: AnalysisProject,
        config: ReportConfiguration
    ) -> bytes:
        """Generate comprehensive analysis report"""
        
        if config.format == 'pdf':
            return await self._generate_pdf_report(project, config)
        elif config.format == 'html':
            return await self._generate_html_report(project, config)
        elif config.format == 'latex':
            return await self._generate_latex_report(project, config)
        else:
            raise ValueError(f"Unsupported format: {config.format}")
    
    async def _generate_pdf_report(
        self,
        project: AnalysisProject,
        config: ReportConfiguration
    ) -> bytes:
        """Generate PDF report using ReportLab"""
        
        buffer = io.BytesIO()
        
        # Create document
        page_size = A4 if config.page_size == 'a4' else letter
        doc = SimpleDocTemplate(
            buffer,
            pagesize=page_size,
            rightMargin=1*inch,
            leftMargin=1*inch,
            topMargin=1*inch,
            bottomMargin=1*inch
        )
        
        # Build story (content)
        story = []
        
        # Title page
        story.extend(await self._generate_title_page(project, config))
        
        # Abstract (if available)
        if project.description:
            story.extend(await self._generate_abstract(project, config))
        
        # Methodology section
        if config.include_methodology:
            story.extend(await self._generate_methodology_section(project, config))
        
        # Results section
        if config.include_results:
            story.extend(await self._generate_results_section(project, config))
        
        # Discussion section
        if config.include_discussion:
            story.extend(await self._generate_discussion_section(project, config))
        
        # References
        if config.include_references:
            story.extend(await self._generate_references_section(project, config))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()
    
    async def _generate_title_page(
        self,
        project: AnalysisProject,
        config: ReportConfiguration
    ) -> List[Any]:
        """Generate title page elements"""
        
        elements = []
        
        # Title
        title = Paragraph(project.title, self.styles['APATitle'])
        elements.append(title)
        elements.append(Spacer(1, 0.5*inch))
        
        # Author
        author = Paragraph(
            f"Author: {project.created_by.get_full_name()}",
            self.styles['APABody']
        )
        elements.append(author)
        elements.append(Spacer(1, 0.25*inch))
        
        # Institution (if available)
        if hasattr(project.created_by, 'profile') and project.created_by.profile.institution:
            institution = Paragraph(
                project.created_by.profile.institution,
                self.styles['APABody']
            )
            elements.append(institution)
            elements.append(Spacer(1, 0.25*inch))
        
        # Date
        date = Paragraph(
            f"Date: {project.created_at.strftime('%B %d, %Y')}",
            self.styles['APABody']
        )
        elements.append(date)
        elements.append(Spacer(1, 1*inch))
        
        return elements
    
    async def _generate_abstract(
        self,
        project: AnalysisProject,
        config: ReportConfiguration
    ) -> List[Any]:
        """Generate abstract section"""
        
        elements = []
        
        # Abstract heading
        heading = Paragraph("Abstract", self.styles['APAHeading1'])
        elements.append(heading)
        
        # Abstract content
        abstract_text = project.description
        if len(abstract_text) > 250:  # Typical abstract length
            abstract_text = abstract_text[:247] + "..."
        
        abstract = Paragraph(abstract_text, self.styles['APABody'])
        elements.append(abstract)
        elements.append(Spacer(1, 0.5*inch))
        
        return elements
    
    async def _generate_methodology_section(
        self,
        project: AnalysisProject,
        config: ReportConfiguration
    ) -> List[Any]:
        """Generate methodology section"""
        
        elements = []
        
        # Method heading
        heading = Paragraph("Method", self.styles['APAHeading1'])
        elements.append(heading)
        
        # Participants subsection
        participants_heading = Paragraph("Participants", self.styles['APAHeading2'])
        elements.append(participants_heading)
        
        # Extract sample information
        sample_info = self._extract_sample_information(project)
        participants_text = f"The sample consisted of {sample_info['n']} participants."
        
        if sample_info.get('demographics'):
            participants_text += f" {sample_info['demographics']}"
        
        participants = Paragraph(participants_text, self.styles['APABody'])
        elements.append(participants)
        
        # Measures subsection
        measures_heading = Paragraph("Measures", self.styles['APAHeading2'])
        elements.append(measures_heading)
        
        measures_text = self._generate_measures_description(project)
        measures = Paragraph(measures_text, self.styles['APABody'])
        elements.append(measures)
        
        # Statistical Analysis subsection
        analysis_heading = Paragraph("Statistical Analysis", self.styles['APAHeading2'])
        elements.append(analysis_heading)
        
        analysis_text = self._generate_analysis_description(project)
        analysis = Paragraph(analysis_text, self.styles['APABody'])
        elements.append(analysis)
        
        elements.append(Spacer(1, 0.5*inch))
        
        return elements
    
    async def _generate_results_section(
        self,
        project: AnalysisProject,
        config: ReportConfiguration
    ) -> List[Any]:
        """Generate results section"""
        
        elements = []
        
        # Results heading
        heading = Paragraph("Results", self.styles['APAHeading1'])
        elements.append(heading)
        
        # Process each analysis result
        results = project.results.all().order_by('executed_at')
        
        for i, result in enumerate(results, 1):
            # Analysis subsection
            analysis_heading = Paragraph(
                f"{result.analysis_name}",
                self.styles['APAHeading2']
            )
            elements.append(analysis_heading)
            
            # Statistical results text
            results_text = self._format_statistical_results(result)
            results_paragraph = Paragraph(results_text, self.styles['APABody'])
            elements.append(results_paragraph)
            
            # Add statistical table if available
            if config.include_tables and result.statistical_output:
                table_elements = self._create_statistical_table(result, i)
                elements.extend(table_elements)
            
            elements.append(Spacer(1, 0.25*inch))
        
        return elements
    
    async def _generate_discussion_section(
        self,
        project: AnalysisProject,
        config: ReportConfiguration
    ) -> List[Any]:
        """Generate discussion section"""
        
        elements = []
        
        # Discussion heading
        heading = Paragraph("Discussion", self.styles['APAHeading1'])
        elements.append(heading)
        
        # Generate discussion content
        discussion_text = self._generate_discussion_content(project)
        discussion = Paragraph(discussion_text, self.styles['APABody'])
        elements.append(discussion)
        
        # Limitations subsection
        limitations_heading = Paragraph("Limitations", self.styles['APAHeading2'])
        elements.append(limitations_heading)
        
        limitations_text = self._generate_limitations_content(project)
        limitations = Paragraph(limitations_text, self.styles['APABody'])
        elements.append(limitations)
        
        # Future Research subsection
        future_heading = Paragraph("Future Research", self.styles['APAHeading2'])
        elements.append(future_heading)
        
        future_text = self._generate_future_research_content(project)
        future = Paragraph(future_text, self.styles['APABody'])
        elements.append(future)
        
        elements.append(Spacer(1, 0.5*inch))
        
        return elements
    
    async def _generate_references_section(
        self,
        project: AnalysisProject,
        config: ReportConfiguration
    ) -> List[Any]:
        """Generate references section"""
        
        elements = []
        
        # References heading
        heading = Paragraph("References", self.styles['APAHeading1'])
        elements.append(heading)
        
        # Generate citations for statistical methods used
        citations = self._generate_method_citations(project, config.style)
        
        for citation in citations:
            ref_paragraph = Paragraph(citation, self.styles['APABody'])
            elements.append(ref_paragraph)
        
        return elements
    
    def _extract_sample_information(self, project: AnalysisProject) -> Dict[str, Any]:
        """Extract sample information from project data"""
        
        sample_info = {'n': 0}
        
        # Try to get sample size from results
        if project.results.exists():
            first_result = project.results.first()
            if first_result and first_result.statistical_output:
                output = first_result.statistical_output
                sample_info['n'] = output.get('n', output.get('sample_size', 0))
        
        # Try to get demographics from data configuration
        data_config = project.data_configuration
        if data_config and 'demographics' in data_config:
            demographics = data_config['demographics']
            sample_info['demographics'] = self._format_demographics(demographics)
        
        return sample_info
    
    def _format_demographics(self, demographics: Dict[str, Any]) -> str:
        """Format demographics information"""
        
        demo_parts = []
        
        if 'age' in demographics:
            age_info = demographics['age']
            if isinstance(age_info, dict):
                mean_age = age_info.get('mean')
                sd_age = age_info.get('sd')
                if mean_age and sd_age:
                    demo_parts.append(f"Mean age was {mean_age:.1f} years (SD = {sd_age:.1f})")
        
        if 'gender' in demographics:
            gender_info = demographics['gender']
            if isinstance(gender_info, dict):
                female_pct = gender_info.get('female_percentage', 0)
                demo_parts.append(f"{female_pct:.1f}% were female")
        
        return '. '.join(demo_parts) + '.' if demo_parts else ''
    
    def _generate_measures_description(self, project: AnalysisProject) -> str:
        """Generate description of measures used"""
        
        measures_text = "The following measures were used in this study: "
        
        # Extract variable information from data configuration
        data_config = project.data_configuration
        variable_mapping = data_config.get('variable_mapping', {})
        
        constructs = {}
        for var, info in variable_mapping.items():
            construct = info.get('construct', 'Unspecified')
            if construct not in constructs:
                constructs[construct] = []
            constructs[construct].append(var)
        
        construct_descriptions = []
        for construct, variables in constructs.items():
            if construct != 'Unspecified':
                construct_descriptions.append(
                    f"{construct} (measured using {len(variables)} items)"
                )
        
        if construct_descriptions:
            measures_text += ', '.join(construct_descriptions) + '.'
        else:
            measures_text += "detailed information about measures is available in the data configuration."
        
        return measures_text
    
    def _generate_analysis_description(self, project: AnalysisProject) -> str:
        """Generate description of statistical analyses"""
        
        analysis_text = "Statistical analyses were conducted using R statistical software. "
        
        # List analysis types used
        analysis_types = list(project.results.values_list('analysis_type', flat=True).distinct())
        
        if analysis_types:
            type_descriptions = {
                'descriptive': 'descriptive statistics',
                'reliability': 'reliability analysis using Cronbach\'s alpha',
                'efa': 'exploratory factor analysis',
                'cfa': 'confirmatory factor analysis',
                'sem': 'structural equation modeling',
                'regression': 'multiple regression analysis',
                'anova': 'analysis of variance',
                'ttest': 't-test analysis',
                'correlation': 'correlation analysis'
            }
            
            descriptions = [type_descriptions.get(t, t) for t in analysis_types]
            analysis_text += f"Analyses included {', '.join(descriptions)}. "
        
        analysis_text += "Statistical significance was set at α = 0.05 for all tests."
        
        return analysis_text