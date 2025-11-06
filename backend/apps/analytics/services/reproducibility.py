"""
Reproducibility Framework for Advanced Data Analysis System

This service ensures complete reproducibility of statistical analyses
by capturing all necessary information for replication.
"""

import json
import hashlib
import logging
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
import zipfile
import io

from django.core.files.base import ContentFile
from django.utils import timezone

from ..models import AnalysisProject, AnalysisResult

logger = logging.getLogger(__name__)


@dataclass
class AnalysisEnvironment:
    """Analysis environment information"""
    r_version: str
    r_packages: Dict[str, str]  # package_name: version
    system_info: Dict[str, str]
    timestamp: str
    session_info: Dict[str, Any]


@dataclass
class DataProvenance:
    """Data provenance information"""
    source_type: str
    source_identifier: str
    data_hash: str
    preprocessing_steps: List[Dict[str, Any]]
    variable_transformations: List[Dict[str, Any]]
    missing_data_handling: Dict[str, Any]
    outlier_treatment: Dict[str, Any]


@dataclass
class AnalysisProvenance:
    """Analysis provenance information"""
    analysis_id: str
    analysis_type: str
    parameters: Dict[str, Any]
    statistical_assumptions: Dict[str, Any]
    validation_results: Dict[str, Any]
    r_code: str
    execution_log: List[str]
    warnings: List[str]
    errors: List[str]


@dataclass
class ReproducibilityPackage:
    """Complete reproducibility package"""
    project_metadata: Dict[str, Any]
    data_provenance: DataProvenance
    analysis_provenance: AnalysisProvenance
    environment: AnalysisEnvironment
    results: Dict[str, Any]
    verification_hash: str

c
lass DataHasher:
    """Service for creating data hashes for integrity verification"""
    
    @staticmethod
    def hash_data(data: List[List[Any]]) -> str:
        """Create hash of data for integrity verification"""
        # Convert data to string representation
        data_str = json.dumps(data, sort_keys=True, default=str)
        
        # Create SHA-256 hash
        hash_obj = hashlib.sha256(data_str.encode('utf-8'))
        return hash_obj.hexdigest()
    
    @staticmethod
    def verify_data_integrity(data: List[List[Any]], expected_hash: str) -> bool:
        """Verify data integrity against expected hash"""
        current_hash = DataHasher.hash_data(data)
        return current_hash == expected_hash


class EnvironmentCapture:
    """Service for capturing analysis environment information"""
    
    def capture_r_environment(self, r_session_info: Dict[str, Any]) -> AnalysisEnvironment:
        """Capture R environment information"""
        
        # Extract R version
        r_version = r_session_info.get('R.version', {}).get('version.string', 'Unknown')
        
        # Extract package versions
        packages = {}
        attached_packages = r_session_info.get('otherPkgs', {})
        loaded_packages = r_session_info.get('loadedOnly', {})
        
        for pkg_info in [attached_packages, loaded_packages]:
            if isinstance(pkg_info, dict):
                for pkg_name, pkg_details in pkg_info.items():
                    if isinstance(pkg_details, dict):
                        version = pkg_details.get('Version', 'Unknown')
                        packages[pkg_name] = version
        
        # Extract system information
        system_info = {
            'platform': r_session_info.get('platform', 'Unknown'),
            'arch': r_session_info.get('arch', 'Unknown'),
            'os': r_session_info.get('running', 'Unknown'),
            'locale': str(r_session_info.get('locale', 'Unknown'))
        }
        
        return AnalysisEnvironment(
            r_version=r_version,
            r_packages=packages,
            system_info=system_info,
            timestamp=timezone.now().isoformat(),
            session_info=r_session_info
        )


class CodeGenerator:
    """Service for generating reproducible R code"""
    
    def generate_complete_script(
        self,
        data_provenance: DataProvenance,
        analysis_provenance: AnalysisProvenance,
        environment: AnalysisEnvironment
    ) -> str:
        """Generate complete R script for reproduction"""
        
        script_parts = []
        
        # Header with metadata
        script_parts.append(self._generate_header(analysis_provenance, environment))
        
        # Package loading
        script_parts.append(self._generate_package_loading(environment))
        
        # Data loading and preprocessing
        script_parts.append(self._generate_data_section(data_provenance))
        
        # Analysis code
        script_parts.append(self._generate_analysis_section(analysis_provenance))
        
        # Session info
        script_parts.append(self._generate_session_info())
        
        return '\n\n'.join(script_parts)
    
    def _generate_header(self, analysis_provenance: AnalysisProvenance, environment: AnalysisEnvironment) -> str:
        """Generate script header with metadata"""
        header = f"""# Reproducible Analysis Script
# Generated by NCSKIT Advanced Data Analysis System
# Analysis ID: {analysis_provenance.analysis_id}
# Analysis Type: {analysis_provenance.analysis_type}
# Generated: {environment.timestamp}
# R Version: {environment.r_version}

# This script contains all code necessary to reproduce the analysis results.
# Ensure you have the same R version and package versions for exact reproduction.
"""
        return header
    
    def _generate_package_loading(self, environment: AnalysisEnvironment) -> str:
        """Generate package loading code"""
        code = "# Load required packages\n"
        
        # Essential packages
        essential_packages = ['dplyr', 'psych', 'lavaan', 'car']
        
        for package in essential_packages:
            version = environment.r_packages.get(package, 'latest')
            code += f"library({package})  # Version: {version}\n"
        
        # Additional packages used in analysis
        for package, version in environment.r_packages.items():
            if package not in essential_packages:
                code += f"library({package})  # Version: {version}\n"
        
        return code
    
    def _generate_data_section(self, data_provenance: DataProvenance) -> str:
        """Generate data loading and preprocessing code"""
        code = "# Data loading and preprocessing\n"
        
        if data_provenance.source_type == 'survey_campaign':
            code += f"# Data source: Survey Campaign {data_provenance.source_identifier}\n"
            code += "# Note: Original survey data should be loaded here\n"
            code += "# data <- read_survey_data(campaign_id = '{}')\n".format(data_provenance.source_identifier)
        elif data_provenance.source_type == 'external_file':
            code += f"# Data source: External file {data_provenance.source_identifier}\n"
            code += f"# data <- read.csv('{data_provenance.source_identifier}')\n"
        
        # Add preprocessing steps
        if data_provenance.preprocessing_steps:
            code += "\n# Preprocessing steps:\n"
            for i, step in enumerate(data_provenance.preprocessing_steps, 1):
                code += f"# Step {i}: {step.get('description', 'Preprocessing step')}\n"
                if 'code' in step:
                    code += f"{step['code']}\n"
        
        # Add variable transformations
        if data_provenance.variable_transformations:
            code += "\n# Variable transformations:\n"
            for transform in data_provenance.variable_transformations:
                code += f"# {transform.get('description', 'Variable transformation')}\n"
                if 'code' in transform:
                    code += f"{transform['code']}\n"
        
        # Add missing data handling
        if data_provenance.missing_data_handling:
            code += "\n# Missing data handling:\n"
            method = data_provenance.missing_data_handling.get('method', 'listwise')
            code += f"# Method: {method}\n"
            if 'code' in data_provenance.missing_data_handling:
                code += f"{data_provenance.missing_data_handling['code']}\n"
        
        # Data integrity check
        code += f"\n# Data integrity verification\n"
        code += f"# Expected data hash: {data_provenance.data_hash}\n"
        code += "# Verify data integrity before proceeding\n"
        
        return code
    
    def _generate_analysis_section(self, analysis_provenance: AnalysisProvenance) -> str:
        """Generate analysis code section"""
        code = f"# {analysis_provenance.analysis_type.upper()} Analysis\n"
        
        # Add parameters
        if analysis_provenance.parameters:
            code += "\n# Analysis parameters:\n"
            for param, value in analysis_provenance.parameters.items():
                code += f"# {param}: {value}\n"
        
        # Add the actual R code
        code += "\n# Analysis code:\n"
        code += analysis_provenance.r_code
        
        return code
    
    def _generate_session_info(self) -> str:
        """Generate session info code"""
        return """# Session information for reproducibility
sessionInfo()

# Package versions
installed.packages()[names(sessionInfo()$otherPkgs), "Version"]"""


class ReproducibilityService:
    """Main service for managing analysis reproducibility"""
    
    def __init__(self):
        self.data_hasher = DataHasher()
        self.environment_capture = EnvironmentCapture()
        self.code_generator = CodeGenerator()
    
    def create_reproducibility_package(
        self,
        project: AnalysisProject,
        analysis_result: AnalysisResult,
        data: List[List[Any]],
        r_session_info: Dict[str, Any]
    ) -> ReproducibilityPackage:
        """Create complete reproducibility package"""
        
        # Capture environment
        environment = self.environment_capture.capture_r_environment(r_session_info)
        
        # Create data provenance
        data_provenance = DataProvenance(
            source_type=project.data_source,
            source_identifier=self._get_source_identifier(project),
            data_hash=self.data_hasher.hash_data(data),
            preprocessing_steps=self._extract_preprocessing_steps(project),
            variable_transformations=self._extract_variable_transformations(project),
            missing_data_handling=self._extract_missing_data_handling(project),
            outlier_treatment=self._extract_outlier_treatment(project)
        )
        
        # Create analysis provenance
        analysis_provenance = AnalysisProvenance(
            analysis_id=str(analysis_result.id),
            analysis_type=analysis_result.analysis_type,
            parameters=analysis_result.analysis_parameters,
            statistical_assumptions=self._extract_assumptions(analysis_result),
            validation_results=self._extract_validation_results(analysis_result),
            r_code=analysis_result.r_code,
            execution_log=self._extract_execution_log(analysis_result),
            warnings=self._extract_warnings(analysis_result),
            errors=self._extract_errors(analysis_result)
        )
        
        # Create project metadata
        project_metadata = {
            'project_id': str(project.id),
            'project_title': project.title,
            'project_description': project.description,
            'theoretical_framework': project.theoretical_framework,
            'research_questions': project.research_questions,
            'hypotheses': project.hypotheses,
            'created_by': project.created_by.email,
            'created_at': project.created_at.isoformat(),
            'analysis_date': analysis_result.executed_at.isoformat()
        }
        
        # Create reproducibility package
        package = ReproducibilityPackage(
            project_metadata=project_metadata,
            data_provenance=data_provenance,
            analysis_provenance=analysis_provenance,
            environment=environment,
            results=analysis_result.statistical_output,
            verification_hash=self._create_verification_hash(
                project_metadata, data_provenance, analysis_provenance, environment
            )
        )
        
        return package
    
    def export_reproducibility_package(
        self,
        package: ReproducibilityPackage,
        include_data: bool = False
    ) -> bytes:
        """Export reproducibility package as ZIP file"""
        
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            
            # Add metadata file
            metadata = {
                'project_metadata': package.project_metadata,
                'verification_hash': package.verification_hash,
                'created_at': timezone.now().isoformat()
            }
            zip_file.writestr('metadata.json', json.dumps(metadata, indent=2))
            
            # Add environment information
            zip_file.writestr('environment.json', json.dumps(asdict(package.environment), indent=2))
            
            # Add data provenance
            zip_file.writestr('data_provenance.json', json.dumps(asdict(package.data_provenance), indent=2))
            
            # Add analysis provenance
            zip_file.writestr('analysis_provenance.json', json.dumps(asdict(package.analysis_provenance), indent=2))
            
            # Add results
            zip_file.writestr('results.json', json.dumps(package.results, indent=2))
            
            # Add complete R script
            r_script = self.code_generator.generate_complete_script(
                package.data_provenance,
                package.analysis_provenance,
                package.environment
            )
            zip_file.writestr('analysis_script.R', r_script)
            
            # Add README
            readme = self._generate_readme(package)
            zip_file.writestr('README.md', readme)
            
            # Add data file if requested (placeholder)
            if include_data:
                zip_file.writestr('data_placeholder.txt', 
                    'Data file should be placed here for complete reproduction.\n'
                    f'Expected data hash: {package.data_provenance.data_hash}\n'
                    'Verify data integrity before running analysis.')
        
        zip_buffer.seek(0)
        return zip_buffer.getvalue()
    
    def verify_reproducibility_package(self, package: ReproducibilityPackage) -> Dict[str, Any]:
        """Verify integrity of reproducibility package"""
        
        verification_results = {
            'is_valid': True,
            'issues': [],
            'warnings': []
        }
        
        # Verify hash
        expected_hash = package.verification_hash
        calculated_hash = self._create_verification_hash(
            package.project_metadata,
            package.data_provenance,
            package.analysis_provenance,
            package.environment
        )
        
        if expected_hash != calculated_hash:
            verification_results['is_valid'] = False
            verification_results['issues'].append('Package integrity hash mismatch')
        
        # Check for required components
        required_components = [
            'project_metadata', 'data_provenance', 'analysis_provenance',
            'environment', 'results'
        ]
        
        for component in required_components:
            if not hasattr(package, component) or getattr(package, component) is None:
                verification_results['is_valid'] = False
                verification_results['issues'].append(f'Missing required component: {component}')
        
        # Check R code availability
        if not package.analysis_provenance.r_code:
            verification_results['warnings'].append('No R code available for reproduction')
        
        # Check environment completeness
        if not package.environment.r_packages:
            verification_results['warnings'].append('No R package information available')
        
        return verification_results
    
    def _get_source_identifier(self, project: AnalysisProject) -> str:
        """Get source identifier from project"""
        data_config = project.data_configuration
        
        if project.data_source == 'survey_campaign':
            return data_config.get('campaign_id', 'unknown')
        elif project.data_source == 'external_file':
            return data_config.get('filename', 'unknown')
        else:
            return 'unknown'
    
    def _extract_preprocessing_steps(self, project: AnalysisProject) -> List[Dict[str, Any]]:
        """Extract preprocessing steps from project"""
        # This would extract actual preprocessing steps from project configuration
        return project.data_configuration.get('preprocessing_steps', [])
    
    def _extract_variable_transformations(self, project: AnalysisProject) -> List[Dict[str, Any]]:
        """Extract variable transformations from project"""
        return project.data_configuration.get('variable_transformations', [])
    
    def _extract_missing_data_handling(self, project: AnalysisProject) -> Dict[str, Any]:
        """Extract missing data handling information"""
        return project.data_configuration.get('missing_data_handling', {})
    
    def _extract_outlier_treatment(self, project: AnalysisProject) -> Dict[str, Any]:
        """Extract outlier treatment information"""
        return project.data_configuration.get('outlier_treatment', {})
    
    def _extract_assumptions(self, analysis_result: AnalysisResult) -> Dict[str, Any]:
        """Extract statistical assumptions from analysis result"""
        return analysis_result.assumption_tests
    
    def _extract_validation_results(self, analysis_result: AnalysisResult) -> Dict[str, Any]:
        """Extract validation results"""
        if hasattr(analysis_result, 'validation'):
            validation = analysis_result.validation
            return {
                'overall_validity': validation.overall_validity,
                'normality_tests': validation.normality_tests,
                'homoscedasticity_tests': validation.homoscedasticity_tests,
                'independence_tests': validation.independence_tests,
                'outlier_detection': validation.outlier_detection
            }
        return {}
    
    def _extract_execution_log(self, analysis_result: AnalysisResult) -> List[str]:
        """Extract execution log from analysis result"""
        # This would extract actual execution log
        return []
    
    def _extract_warnings(self, analysis_result: AnalysisResult) -> List[str]:
        """Extract warnings from analysis result"""
        # This would extract actual warnings
        return []
    
    def _extract_errors(self, analysis_result: AnalysisResult) -> List[str]:
        """Extract errors from analysis result"""
        if analysis_result.error_message:
            return [analysis_result.error_message]
        return []
    
    def _create_verification_hash(
        self,
        project_metadata: Dict[str, Any],
        data_provenance: DataProvenance,
        analysis_provenance: AnalysisProvenance,
        environment: AnalysisEnvironment
    ) -> str:
        """Create verification hash for package integrity"""
        
        # Combine all components
        combined_data = {
            'project': project_metadata,
            'data': asdict(data_provenance),
            'analysis': asdict(analysis_provenance),
            'environment': asdict(environment)
        }
        
        # Create hash
        data_str = json.dumps(combined_data, sort_keys=True, default=str)
        hash_obj = hashlib.sha256(data_str.encode('utf-8'))
        return hash_obj.hexdigest()
    
    def _generate_readme(self, package: ReproducibilityPackage) -> str:
        """Generate README for reproducibility package"""
        
        readme = f"""# Reproducibility Package

## Project Information
- **Project**: {package.project_metadata['project_title']}
- **Analysis Type**: {package.analysis_provenance.analysis_type}
- **Analysis Date**: {package.project_metadata['analysis_date']}
- **Created By**: {package.project_metadata['created_by']}

## Description
{package.project_metadata.get('project_description', 'No description available')}

## Files Included
- `analysis_script.R`: Complete R script for reproducing the analysis
- `metadata.json`: Project and package metadata
- `environment.json`: R environment and package information
- `data_provenance.json`: Data source and preprocessing information
- `analysis_provenance.json`: Analysis parameters and execution details
- `results.json`: Original analysis results for verification

## Reproduction Instructions

1. **Environment Setup**
   - Install R version: {package.environment.r_version}
   - Install required packages (see environment.json for versions)

2. **Data Preparation**
   - Obtain the original data (see data_provenance.json for source information)
   - Verify data integrity using hash: {package.data_provenance.data_hash}

3. **Run Analysis**
   - Execute the analysis_script.R file
   - Compare results with those in results.json

## Verification
- Package Hash: {package.verification_hash}
- Use this hash to verify package integrity

## Notes
- Exact reproduction requires the same R version and package versions
- Data preprocessing steps are documented in data_provenance.json
- Any warnings or issues during original analysis are noted in analysis_provenance.json

## Contact
For questions about this analysis, contact: {package.project_metadata['created_by']}
"""
        
        return readme