"""
Citation Management Service for Advanced Data Analysis System

This service handles automatic citation generation for statistical methods,
software packages, and theoretical frameworks used in analysis.
"""

import logging
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from django.utils import timezone

from ..models import CitationReference

logger = logging.getLogger(__name__)


@dataclass
class CitationData:
    """Citation data structure"""
    reference_type: str
    title: str
    authors: List[str]
    year: Optional[int] = None
    journal: Optional[str] = None
    volume: Optional[str] = None
    issue: Optional[str] = None
    pages: Optional[str] = None
    publisher: Optional[str] = None
    doi: Optional[str] = None
    url: Optional[str] = None
    version: Optional[str] = None
    package_name: Optional[str] = None


class CitationFormatter:
    """Formats citations in different academic styles"""
    
    def format_apa(self, citation: CitationData) -> str:
        """Format citation in APA style"""
        
        if citation.reference_type == 'software':
            return self._format_apa_software(citation)
        elif citation.reference_type == 'package':
            return self._format_apa_package(citation)
        elif citation.reference_type == 'article':
            return self._format_apa_article(citation)
        elif citation.reference_type == 'book':
            return self._format_apa_book(citation)
        else:
            return self._format_apa_generic(citation)
    
    def _format_apa_software(self, citation: CitationData) -> str:
        """Format software citation in APA style"""
        authors_str = self._format_authors_apa(citation.authors)
        year_str = f"({citation.year})" if citation.year else "(n.d.)"
        version_str = f" (Version {citation.version})" if citation.version else ""
        publisher_str = f" {citation.publisher}." if citation.publisher else ""
        url_str = f" {citation.url}" if citation.url else ""
        
        return f"{authors_str} {year_str}. {citation.title}{version_str} [Computer software].{publisher_str}{url_str}"
    
    def _format_apa_package(self, citation: CitationData) -> str:
        """Format R package citation in APA style"""
        authors_str = self._format_authors_apa(citation.authors)
        year_str = f"({citation.year})" if citation.year else "(n.d.)"
        version_str = f" (Version {citation.version})" if citation.version else ""
        url_str = f" {citation.url}" if citation.url else ""
        
        return f"{authors_str} {year_str}. {citation.package_name}: {citation.title}{version_str} [R package].{url_str}"
    
    def _format_apa_article(self, citation: CitationData) -> str:
        """Format journal article citation in APA style"""
        authors_str = self._format_authors_apa(citation.authors)
        year_str = f"({citation.year})" if citation.year else "(n.d.)"
        
        journal_info = citation.journal or ""
        if citation.volume:
            journal_info += f", {citation.volume}"
        if citation.issue:
            journal_info += f"({citation.issue})"
        if citation.pages:
            journal_info += f", {citation.pages}"
        
        doi_str = f" https://doi.org/{citation.doi}" if citation.doi else ""
        
        return f"{authors_str} {year_str}. {citation.title}. {journal_info}.{doi_str}"
    
    def _format_apa_book(self, citation: CitationData) -> str:
        """Format book citation in APA style"""
        authors_str = self._format_authors_apa(citation.authors)
        year_str = f"({citation.year})" if citation.year else "(n.d.)"
        publisher_str = f" {citation.publisher}." if citation.publisher else ""
        
        return f"{authors_str} {year_str}. {citation.title}.{publisher_str}"
    
    def _format_apa_generic(self, citation: CitationData) -> str:
        """Format generic citation in APA style"""
        authors_str = self._format_authors_apa(citation.authors)
        year_str = f"({citation.year})" if citation.year else "(n.d.)"
        
        return f"{authors_str} {year_str}. {citation.title}."
    
    def _format_authors_apa(self, authors: List[str]) -> str:
        """Format authors list for APA style"""
        if not authors:
            return ""
        
        if len(authors) == 1:
            return authors[0]
        elif len(authors) == 2:
            return f"{authors[0]} & {authors[1]}"
        elif len(authors) <= 20:
            return f"{', '.join(authors[:-1])}, & {authors[-1]}"
        else:
            # For more than 20 authors, list first 19, then "...", then last author
            return f"{', '.join(authors[:19])}, ... {authors[-1]}"
    
    def format_mla(self, citation: CitationData) -> str:
        """Format citation in MLA style"""
        
        if citation.reference_type == 'article':
            return self._format_mla_article(citation)
        elif citation.reference_type == 'book':
            return self._format_mla_book(citation)
        elif citation.reference_type == 'software':
            return self._format_mla_software(citation)
        else:
            return self._format_mla_generic(citation)
    
    def _format_mla_article(self, citation: CitationData) -> str:
        """Format journal article citation in MLA style"""
        authors_str = self._format_authors_mla(citation.authors)
        journal_info = f"{citation.journal}, " if citation.journal else ""
        
        if citation.volume:
            journal_info += f"vol. {citation.volume}, "
        if citation.issue:
            journal_info += f"no. {citation.issue}, "
        
        year_str = f"{citation.year}, " if citation.year else ""
        pages_str = f"pp. {citation.pages}." if citation.pages else ""
        
        return f'{authors_str}"{citation.title}." {journal_info}{year_str}{pages_str}'
    
    def _format_mla_book(self, citation: CitationData) -> str:
        """Format book citation in MLA style"""
        authors_str = self._format_authors_mla(citation.authors)
        publisher_str = f"{citation.publisher}, " if citation.publisher else ""
        year_str = f"{citation.year}." if citation.year else ""
        
        return f"{authors_str}{citation.title}. {publisher_str}{year_str}"
    
    def _format_mla_software(self, citation: CitationData) -> str:
        """Format software citation in MLA style"""
        authors_str = self._format_authors_mla(citation.authors)
        version_str = f", version {citation.version}" if citation.version else ""
        publisher_str = f", {citation.publisher}" if citation.publisher else ""
        year_str = f", {citation.year}" if citation.year else ""
        url_str = f", {citation.url}" if citation.url else ""
        
        return f"{authors_str}{citation.title}{version_str}{publisher_str}{year_str}{url_str}."
    
    def _format_mla_generic(self, citation: CitationData) -> str:
        """Format generic citation in MLA style"""
        authors_str = self._format_authors_mla(citation.authors)
        year_str = f" {citation.year}." if citation.year else "."
        
        return f"{authors_str}{citation.title}.{year_str}"
    
    def _format_authors_mla(self, authors: List[str]) -> str:
        """Format authors list for MLA style"""
        if not authors:
            return ""
        
        if len(authors) == 1:
            return f"{authors[0]}. "
        elif len(authors) == 2:
            return f"{authors[0]} and {authors[1]}. "
        else:
            return f"{authors[0]} et al. "
    
    def format_chicago(self, citation: CitationData) -> str:
        """Format citation in Chicago style"""
        
        if citation.reference_type == 'article':
            return self._format_chicago_article(citation)
        elif citation.reference_type == 'book':
            return self._format_chicago_book(citation)
        elif citation.reference_type == 'software':
            return self._format_chicago_software(citation)
        else:
            return self._format_chicago_generic(citation)
    
    def _format_chicago_article(self, citation: CitationData) -> str:
        """Format journal article citation in Chicago style"""
        authors_str = self._format_authors_chicago(citation.authors)
        
        journal_info = f"{citation.journal} " if citation.journal else ""
        if citation.volume:
            journal_info += f"{citation.volume}, "
        if citation.issue:
            journal_info += f"no. {citation.issue} "
        
        year_str = f"({citation.year}): " if citation.year else ": "
        pages_str = citation.pages if citation.pages else ""
        doi_str = f". https://doi.org/{citation.doi}" if citation.doi else ""
        
        return f'{authors_str}"{citation.title}." {journal_info}{year_str}{pages_str}{doi_str}.'
    
    def _format_chicago_book(self, citation: CitationData) -> str:
        """Format book citation in Chicago style"""
        authors_str = self._format_authors_chicago(citation.authors)
        publisher_str = f"{citation.publisher}, " if citation.publisher else ""
        year_str = f"{citation.year}." if citation.year else ""
        
        return f"{authors_str}{citation.title}. {publisher_str}{year_str}"
    
    def _format_chicago_software(self, citation: CitationData) -> str:
        """Format software citation in Chicago style"""
        authors_str = self._format_authors_chicago(citation.authors)
        version_str = f", version {citation.version}" if citation.version else ""
        publisher_str = f". {citation.publisher}" if citation.publisher else ""
        year_str = f", {citation.year}" if citation.year else ""
        url_str = f". {citation.url}" if citation.url else ""
        
        return f"{authors_str}{citation.title}{version_str}{publisher_str}{year_str}{url_str}."
    
    def _format_chicago_generic(self, citation: CitationData) -> str:
        """Format generic citation in Chicago style"""
        authors_str = self._format_authors_chicago(citation.authors)
        year_str = f" {citation.year}." if citation.year else "."
        
        return f"{authors_str}{citation.title}.{year_str}"
    
    def _format_authors_chicago(self, authors: List[str]) -> str:
        """Format authors list for Chicago style"""
        if not authors:
            return ""
        
        if len(authors) == 1:
            return f"{authors[0]}. "
        elif len(authors) == 2:
            return f"{authors[0]} and {authors[1]}. "
        elif len(authors) == 3:
            return f"{authors[0]}, {authors[1]}, and {authors[2]}. "
        else:
            return f"{authors[0]} et al. "
    
    def format_bibtex(self, citation: CitationData) -> str:
        """Format citation as BibTeX entry"""
        
        # Generate citation key
        first_author = citation.authors[0].split()[-1] if citation.authors else "Unknown"
        year = citation.year or "n.d."
        key = f"{first_author}{year}"
        
        # Determine entry type
        entry_type = {
            'article': 'article',
            'book': 'book',
            'software': 'misc',
            'package': 'misc',
            'manual': 'manual',
            'website': 'misc'
        }.get(citation.reference_type, 'misc')
        
        # Build BibTeX entry
        bibtex = f"@{entry_type}{{{key},\n"
        bibtex += f"  title = {{{citation.title}}},\n"
        
        if citation.authors:
            authors_str = " and ".join(citation.authors)
            bibtex += f"  author = {{{authors_str}}},\n"
        
        if citation.year:
            bibtex += f"  year = {{{citation.year}}},\n"
        
        if citation.journal:
            bibtex += f"  journal = {{{citation.journal}}},\n"
        
        if citation.volume:
            bibtex += f"  volume = {{{citation.volume}}},\n"
        
        if citation.issue:
            bibtex += f"  number = {{{citation.issue}}},\n"
        
        if citation.pages:
            bibtex += f"  pages = {{{citation.pages}}},\n"
        
        if citation.publisher:
            bibtex += f"  publisher = {{{citation.publisher}}},\n"
        
        if citation.doi:
            bibtex += f"  doi = {{{citation.doi}}},\n"
        
        if citation.url:
            bibtex += f"  url = {{{citation.url}}},\n"
        
        if citation.version:
            bibtex += f"  note = {{Version {citation.version}}},\n"
        
        bibtex += "}"
        
        return bibtex


class StatisticalMethodCitations:
    """Predefined citations for statistical methods"""
    
    METHODS_CITATIONS = {
        'cronbach_alpha': CitationData(
            reference_type='article',
            title='Coefficient alpha and the internal structure of tests',
            authors=['Cronbach, L. J.'],
            year=1951,
            journal='Psychometrika',
            volume='16',
            issue='3',
            pages='297-334',
            doi='10.1007/BF02310555'
        ),
        
        'factor_analysis': CitationData(
            reference_type='book',
            title='Factor analysis: Statistical methods and practical issues',
            authors=['Comrey, A. L.', 'Lee, H. B.'],
            year=1992,
            publisher='Lawrence Erlbaum Associates'
        ),
        
        'structural_equation_modeling': CitationData(
            reference_type='book',
            title='Structural equation modeling: A multidisciplinary journal',
            authors=['Kline, R. B.'],
            year=2015,
            publisher='Guilford Publications'
        ),
        
        'mediation_analysis': CitationData(
            reference_type='article',
            title='Asymptotic and resampling strategies for assessing and comparing indirect effects in multiple mediator models',
            authors=['Preacher, K. J.', 'Hayes, A. F.'],
            year=2008,
            journal='Behavior Research Methods',
            volume='40',
            issue='3',
            pages='879-891',
            doi='10.3758/BRM.40.3.879'
        ),
        
        'bootstrap': CitationData(
            reference_type='book',
            title='An introduction to the bootstrap',
            authors=['Efron, B.', 'Tibshirani, R. J.'],
            year=1993,
            publisher='Chapman & Hall'
        ),
        
        'lavaan': CitationData(
            reference_type='article',
            title='lavaan: An R package for structural equation modeling',
            authors=['Rosseel, Y.'],
            year=2012,
            journal='Journal of Statistical Software',
            volume='48',
            issue='2',
            pages='1-36',
            doi='10.18637/jss.v048.i02'
        ),
        
        'psych_package': CitationData(
            reference_type='package',
            title='Procedures for Psychological, Psychometric, and Personality Research',
            authors=['Revelle, W.'],
            year=2023,
            package_name='psych',
            version='2.3.9',
            url='https://CRAN.R-project.org/package=psych'
        ),
        
        'r_software': CitationData(
            reference_type='software',
            title='R: A language and environment for statistical computing',
            authors=['R Core Team'],
            year=2023,
            publisher='R Foundation for Statistical Computing',
            url='https://www.R-project.org/'
        )
    }
    
    @classmethod
    def get_method_citation(cls, method_name: str) -> Optional[CitationData]:
        """Get citation for statistical method"""
        return cls.METHODS_CITATIONS.get(method_name.lower())
    
    @classmethod
    def get_all_methods(cls) -> List[str]:
        """Get list of all available method citations"""
        return list(cls.METHODS_CITATIONS.keys())


class CitationManager:
    """Main citation management service"""
    
    def __init__(self):
        self.formatter = CitationFormatter()
        self.method_citations = StatisticalMethodCitations()
    
    def generate_analysis_citations(
        self, 
        analysis_type: str,
        statistical_methods: List[str],
        r_packages: List[str],
        style: str = 'apa'
    ) -> Dict[str, List[str]]:
        """Generate citations for analysis"""
        
        citations = {
            'software': [],
            'methods': [],
            'packages': []
        }
        
        # Always include R software citation
        r_citation = self.method_citations.get_method_citation('r_software')
        if r_citation:
            citations['software'].append(self._format_citation(r_citation, style))
        
        # Add method-specific citations
        method_mapping = {
            'reliability': ['cronbach_alpha'],
            'efa': ['factor_analysis'],
            'cfa': ['factor_analysis', 'lavaan'],
            'sem': ['structural_equation_modeling', 'lavaan'],
            'mediation': ['mediation_analysis', 'bootstrap'],
            'moderation': ['bootstrap']
        }
        
        methods_to_cite = method_mapping.get(analysis_type, [])
        for method in methods_to_cite:
            method_citation = self.method_citations.get_method_citation(method)
            if method_citation:
                if method_citation.reference_type == 'package':
                    citations['packages'].append(self._format_citation(method_citation, style))
                else:
                    citations['methods'].append(self._format_citation(method_citation, style))
        
        # Add R package citations
        package_citations = {
            'psych': self.method_citations.get_method_citation('psych_package'),
            'lavaan': self.method_citations.get_method_citation('lavaan')
        }
        
        for package in r_packages:
            if package in package_citations:
                package_citation = package_citations[package]
                if package_citation:
                    citations['packages'].append(self._format_citation(package_citation, style))
        
        return citations
    
    def _format_citation(self, citation: CitationData, style: str) -> str:
        """Format citation in specified style"""
        if style.lower() == 'apa':
            return self.formatter.format_apa(citation)
        elif style.lower() == 'mla':
            return self.formatter.format_mla(citation)
        elif style.lower() == 'chicago':
            return self.formatter.format_chicago(citation)
        elif style.lower() == 'bibtex':
            return self.formatter.format_bibtex(citation)
        else:
            return self.formatter.format_apa(citation)  # Default to APA
    
    def create_custom_citation(
        self,
        citation_data: Dict[str, Any],
        style: str = 'apa'
    ) -> str:
        """Create custom citation from provided data"""
        
        citation = CitationData(
            reference_type=citation_data.get('reference_type', 'article'),
            title=citation_data.get('title', ''),
            authors=citation_data.get('authors', []),
            year=citation_data.get('year'),
            journal=citation_data.get('journal'),
            volume=citation_data.get('volume'),
            issue=citation_data.get('issue'),
            pages=citation_data.get('pages'),
            publisher=citation_data.get('publisher'),
            doi=citation_data.get('doi'),
            url=citation_data.get('url'),
            version=citation_data.get('version'),
            package_name=citation_data.get('package_name')
        )
        
        return self._format_citation(citation, style)
    
    def save_citation_to_database(self, citation_data: CitationData) -> CitationReference:
        """Save citation to database"""
        
        citation_ref = CitationReference.objects.create(
            reference_type=citation_data.reference_type,
            title=citation_data.title,
            authors=citation_data.authors,
            year=citation_data.year,
            journal=citation_data.journal or '',
            volume=citation_data.volume or '',
            issue=citation_data.issue or '',
            pages=citation_data.pages or '',
            publisher=citation_data.publisher or '',
            doi=citation_data.doi or '',
            url=citation_data.url or '',
            version=citation_data.version or '',
            package_name=citation_data.package_name or '',
            apa_citation=self.formatter.format_apa(citation_data),
            mla_citation=self.formatter.format_mla(citation_data),
            chicago_citation=self.formatter.format_chicago(citation_data),
            bibtex_entry=self.formatter.format_bibtex(citation_data)
        )
        
        return citation_ref
    
    def get_bibliography(
        self,
        citation_ids: List[str],
        style: str = 'apa'
    ) -> List[str]:
        """Generate bibliography from citation IDs"""
        
        citations = CitationReference.objects.filter(id__in=citation_ids)
        bibliography = []
        
        for citation in citations:
            if style.lower() == 'apa':
                bibliography.append(citation.apa_citation)
            elif style.lower() == 'mla':
                bibliography.append(citation.mla_citation)
            elif style.lower() == 'chicago':
                bibliography.append(citation.chicago_citation)
            elif style.lower() == 'bibtex':
                bibliography.append(citation.bibtex_entry)
            else:
                bibliography.append(citation.apa_citation)
        
        return sorted(bibliography)  # Sort alphabetically
    
    def suggest_theoretical_citations(
        self,
        theoretical_framework: str,
        research_domain: str
    ) -> List[Dict[str, Any]]:
        """Suggest citations for theoretical frameworks"""
        
        # This would typically query a database of theoretical citations
        # For now, return some common frameworks
        
        suggestions = []
        
        framework_citations = {
            'technology_acceptance_model': {
                'title': 'User acceptance of computer technology: A comparison of two theoretical models',
                'authors': ['Davis, F. D.', 'Bagozzi, R. P.', 'Warshaw, P. R.'],
                'year': 1989,
                'journal': 'Management Science',
                'volume': '35',
                'issue': '8',
                'pages': '982-1003'
            },
            'theory_of_planned_behavior': {
                'title': 'The theory of planned behavior',
                'authors': ['Ajzen, I.'],
                'year': 1991,
                'journal': 'Organizational Behavior and Human Decision Processes',
                'volume': '50',
                'issue': '2',
                'pages': '179-211'
            },
            'social_cognitive_theory': {
                'title': 'Social cognitive theory: An agentic perspective',
                'authors': ['Bandura, A.'],
                'year': 2001,
                'journal': 'Annual Review of Psychology',
                'volume': '52',
                'issue': '1',
                'pages': '1-26'
            }
        }
        
        framework_key = theoretical_framework.lower().replace(' ', '_')
        if framework_key in framework_citations:
            suggestions.append(framework_citations[framework_key])
        
        return suggestions
    
    def export_citations(
        self,
        citation_ids: List[str],
        format: str = 'bibtex'
    ) -> str:
        """Export citations in specified format"""
        
        citations = CitationReference.objects.filter(id__in=citation_ids)
        
        if format.lower() == 'bibtex':
            entries = [citation.bibtex_entry for citation in citations]
            return '\n\n'.join(entries)
        
        elif format.lower() == 'ris':
            # RIS format for reference managers
            ris_entries = []
            for citation in citations:
                ris_entry = self._convert_to_ris(citation)
                ris_entries.append(ris_entry)
            return '\n\n'.join(ris_entries)
        
        else:
            # Default to formatted bibliography
            return '\n\n'.join(self.get_bibliography(citation_ids, 'apa'))
    
    def _convert_to_ris(self, citation: CitationReference) -> str:
        """Convert citation to RIS format"""
        
        type_mapping = {
            'article': 'JOUR',
            'book': 'BOOK',
            'software': 'COMP',
            'package': 'COMP',
            'manual': 'BOOK',
            'website': 'ELEC'
        }
        
        ris_type = type_mapping.get(citation.reference_type, 'GEN')
        
        ris = f"TY  - {ris_type}\n"
        ris += f"TI  - {citation.title}\n"
        
        for author in citation.authors:
            ris += f"AU  - {author}\n"
        
        if citation.year:
            ris += f"PY  - {citation.year}\n"
        
        if citation.journal:
            ris += f"JO  - {citation.journal}\n"
        
        if citation.volume:
            ris += f"VL  - {citation.volume}\n"
        
        if citation.issue:
            ris += f"IS  - {citation.issue}\n"
        
        if citation.pages:
            ris += f"SP  - {citation.pages}\n"
        
        if citation.publisher:
            ris += f"PB  - {citation.publisher}\n"
        
        if citation.doi:
            ris += f"DO  - {citation.doi}\n"
        
        if citation.url:
            ris += f"UR  - {citation.url}\n"
        
        ris += "ER  -"
        
        return ris