"""
Statistical Analysis Service for Advanced Data Analysis System

This service orchestrates statistical analyses using the R backend
and provides comprehensive result interpretation.
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone

from ..models import AnalysisProject, AnalysisResult, StatisticalValidation
from .statistical_validation import StatisticalValidationService, ValidationSeverity
from .result_interpretation import ResultInterpretationService
from .r_client import RAnalysisClient

logger = logging.getLogger(__name__)


@dataclass
class AnalysisConfiguration:
    """Configuration for statistical analysis"""
    project_id: str
    analysis_type: str
    analysis_name: str
    data: List[List[Any]]
    variables: Dict[str, List[str]]
    parameters: Dict[str, Any]
    research_context: Dict[str, Any]


@dataclass
class AnalysisResults:
    """Results from statistical analysis"""
    statistical_results: Dict[str, Any]
    validation_results: Dict[str, Any]
    interpretations: Dict[str, str]
    recommendations: List[str]
    r_code: str
    session_info: Dict[str, Any]
    execution_time: timedelta


class StatisticalAnalysisService:
    """Main service for statistical analysis orchestration"""
    
    def __init__(self):
        self.r_client = RAnalysisClient()
        self.validation_service = StatisticalValidationService()
        self.interpretation_service = ResultInterpretationService()
    
    async def perform_comprehensive_analysis(
        self, 
        analysis_config: AnalysisConfiguration
    ) -> AnalysisResults:
        """
        Perform comprehensive statistical analysis with validation and interpretation
        
        Args:
            analysis_config: Configuration for the analysis
            
        Returns:
            AnalysisResults with complete analysis output
        """
        start_time = timezone.now()
        logger.info(f"Starting {analysis_config.analysis_type} analysis for project {analysis_config.project_id}")
        
        try:
            # 1. Data preparation and validation
            data_df = self._prepare_data(analysis_config.data)
            
            # 2. Validate statistical assumptions
            validation_results = await self._validate_assumptions(
                data_df, analysis_config
            )
            
            # 3. Check if analysis can proceed
            if validation_results.overall_status == ValidationSeverity.CRITICAL:
                logger.warning("Critical validation issues detected, analysis may not be reliable")
            
            # 4. Execute statistical analysis
            statistical_results = await self._execute_analysis(analysis_config)
            
            # 5. Generate interpretations
            interpretations = await self._generate_interpretations(
                statistical_results, analysis_config, validation_results
            )
            
            # 6. Generate recommendations
            recommendations = self._generate_recommendations(
                statistical_results, validation_results, analysis_config
            )
            
            execution_time = timezone.now() - start_time
            
            logger.info(f"Analysis completed successfully in {execution_time.total_seconds():.2f} seconds")
            
            return AnalysisResults(
                statistical_results=statistical_results['results'],
                validation_results=validation_results.__dict__,
                interpretations=interpretations,
                recommendations=recommendations,
                r_code=statistical_results.get('r_code', ''),
                session_info=statistical_results.get('session_info', {}),
                execution_time=execution_time
            )
            
        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}")
            raise
    
    async def save_analysis_result(
        self, 
        project: AnalysisProject,
        analysis_config: AnalysisConfiguration,
        results: AnalysisResults
    ) -> AnalysisResult:
        """Save analysis results to database"""
        
        # Create analysis result record
        analysis_result = AnalysisResult.objects.create(
            project=project,
            analysis_type=analysis_config.analysis_type,
            analysis_name=analysis_config.analysis_name,
            analysis_description=analysis_config.parameters.get('description', ''),
            statistical_output=results.statistical_results,
            fit_indices=results.statistical_results.get('fit_indices', {}),
            parameter_estimates=results.statistical_results.get('parameter_estimates', {}),
            statistical_interpretation=results.interpretations.get('statistical', ''),
            practical_significance=results.interpretations.get('practical', ''),
            limitations=results.interpretations.get('limitations', ''),
            recommendations='\n'.join(results.recommendations),
            r_code=results.r_code,
            r_session_info=results.session_info,
            analysis_parameters=analysis_config.parameters,
            status='completed',
            completed_at=timezone.now(),
            execution_time=results.execution_time
        )
        
        # Create validation record
        validation_data = results.validation_results
        StatisticalValidation.objects.create(
            analysis_result=analysis_result,
            normality_tests=validation_data.get('individual_results', {}).get('normality', {}).get('details', {}),
            homoscedasticity_tests=validation_data.get('individual_results', {}).get('homoscedasticity', {}).get('details', {}),
            independence_tests=validation_data.get('individual_results', {}).get('independence', {}).get('details', {}),
            sample_size_adequacy=validation_data.get('individual_results', {}).get('sample_size', {}).get('details', {}),
            outlier_detection=validation_data.get('individual_results', {}).get('outliers', {}).get('details', {}),
            kmo_test=validation_data.get('individual_results', {}).get('kmo', {}).get('details', {}),
            bartlett_test=validation_data.get('individual_results', {}).get('bartlett', {}).get('details', {}),
            overall_validity=validation_data.get('overall_status', 'warning'),
            validation_notes=validation_data.get('summary', ''),
            validation_recommendations='\n'.join(validation_data.get('recommendations', []))
        )
        
        logger.info(f"Analysis result saved with ID: {analysis_result.id}")
        return analysis_result
    
    def _prepare_data(self, raw_data: List[List[Any]]) -> 'pd.DataFrame':
        """Prepare data for analysis"""
        import pandas as pd
        
        if not raw_data or len(raw_data) < 2:
            raise ValueError("Data must contain at least header row and one data row")
        
        # First row is headers
        headers = raw_data[0]
        data_rows = raw_data[1:]
        
        # Create DataFrame
        df = pd.DataFrame(data_rows, columns=headers)
        
        # Convert numeric columns
        for col in df.columns:
            try:
                # Try to convert to numeric
                df[col] = pd.to_numeric(df[col], errors='ignore')
            except:
                pass
        
        return df
    
    async def _validate_assumptions(
        self, 
        data_df: 'pd.DataFrame', 
        analysis_config: AnalysisConfiguration
    ):
        """Validate statistical assumptions"""
        
        # Prepare validation parameters
        validation_params = {
            'dependent_variables': analysis_config.variables.get('dependent', []),
            'independent_variables': analysis_config.variables.get('independent', []),
            'variables': analysis_config.variables.get('all', list(data_df.columns)),
            'n_variables': len(data_df.columns),
            'n_parameters': analysis_config.parameters.get('n_parameters', len(data_df.columns) * 2)
        }
        
        # Run validation
        validation_results = self.validation_service.validate_analysis_prerequisites(
            data_df, 
            analysis_config.analysis_type,
            **validation_params
        )
        
        return validation_results
    
    async def _execute_analysis(self, analysis_config: AnalysisConfiguration) -> Dict[str, Any]:
        """Execute statistical analysis using R backend"""
        
        try:
            # Map analysis type to R function
            analysis_mapping = {
                'descriptive': self.r_client.descriptive_analysis,
                'reliability': self.r_client.reliability_analysis,
                'efa': self.r_client.exploratory_factor_analysis,
                'cfa': self.r_client.confirmatory_factor_analysis,
                'sem': self.r_client.structural_equation_modeling,
                'regression': self.r_client.regression_analysis,
                'anova': self.r_client.anova_analysis,
                'ttest': self.r_client.ttest_analysis,
                'correlation': self.r_client.correlation_analysis,
                'mediation': self.r_client.mediation_analysis,
                'moderation': self.r_client.moderation_analysis
            }
            
            analysis_function = analysis_mapping.get(analysis_config.analysis_type)
            if not analysis_function:
                raise ValueError(f"Unsupported analysis type: {analysis_config.analysis_type}")
            
            # Execute analysis
            results = await analysis_function(
                data=analysis_config.data,
                variables=analysis_config.variables,
                parameters=analysis_config.parameters
            )
            
            return results
            
        except Exception as e:
            logger.error(f"R analysis execution failed: {str(e)}")
            raise
    
    async def _generate_interpretations(
        self, 
        statistical_results: Dict[str, Any],
        analysis_config: AnalysisConfiguration,
        validation_results
    ) -> Dict[str, str]:
        """Generate comprehensive interpretations"""
        
        interpretations = await self.interpretation_service.interpret_results(
            statistical_results, 
            analysis_config.analysis_type,
            analysis_config.research_context,
            validation_results
        )
        
        return interpretations
    
    def _generate_recommendations(
        self, 
        statistical_results: Dict[str, Any],
        validation_results,
        analysis_config: AnalysisConfiguration
    ) -> List[str]:
        """Generate analysis recommendations"""
        
        recommendations = []
        
        # Add validation-based recommendations
        recommendations.extend(validation_results.recommendations)
        
        # Add analysis-specific recommendations
        analysis_type = analysis_config.analysis_type
        
        if analysis_type == 'reliability':
            alpha_values = statistical_results.get('cronbach_alpha', {})
            for scale, alpha in alpha_values.items():
                if isinstance(alpha, (int, float)):
                    if alpha < 0.7:
                        recommendations.append(f"Consider improving reliability of {scale} scale (α = {alpha:.3f})")
                    elif alpha > 0.95:
                        recommendations.append(f"Consider reducing redundancy in {scale} scale (α = {alpha:.3f})")
        
        elif analysis_type in ['efa', 'cfa']:
            fit_indices = statistical_results.get('fit_indices', {})
            if 'cfi' in fit_indices and fit_indices['cfi'] < 0.95:
                recommendations.append("Consider model modifications to improve fit (CFI < 0.95)")
            if 'rmsea' in fit_indices and fit_indices['rmsea'] > 0.08:
                recommendations.append("Consider model modifications to improve fit (RMSEA > 0.08)")
        
        elif analysis_type == 'regression':
            r_squared = statistical_results.get('r_squared', 0)
            if r_squared < 0.1:
                recommendations.append("Low R² suggests weak predictive power; consider additional variables")
            
            vif_values = statistical_results.get('vif', {})
            high_vif = [var for var, vif in vif_values.items() if vif > 5]
            if high_vif:
                recommendations.append(f"Check multicollinearity for variables: {', '.join(high_vif)}")
        
        # Add general recommendations
        recommendations.extend([
            "Report effect sizes alongside significance tests",
            "Consider replication with independent samples",
            "Document all analytical decisions and assumptions"
        ])
        
        # Remove duplicates and limit
        unique_recommendations = list(dict.fromkeys(recommendations))
        return unique_recommendations[:15]  # Limit to 15 recommendations
    
    async def get_analysis_status(self, analysis_id: str) -> Dict[str, Any]:
        """Get status of running analysis"""
        try:
            analysis_result = AnalysisResult.objects.get(id=analysis_id)
            return {
                'id': str(analysis_result.id),
                'status': analysis_result.status,
                'progress': self._calculate_progress(analysis_result),
                'estimated_completion': self._estimate_completion(analysis_result),
                'error_message': analysis_result.error_message
            }
        except AnalysisResult.DoesNotExist:
            return {'error': 'Analysis not found'}
    
    def _calculate_progress(self, analysis_result: AnalysisResult) -> int:
        """Calculate analysis progress percentage"""
        if analysis_result.status == 'completed':
            return 100
        elif analysis_result.status == 'failed':
            return 0
        elif analysis_result.status == 'running':
            # Estimate based on execution time
            elapsed = timezone.now() - analysis_result.executed_at
            estimated_total = timedelta(minutes=5)  # Default estimate
            
            # Adjust based on analysis type
            type_estimates = {
                'descriptive': timedelta(minutes=1),
                'reliability': timedelta(minutes=2),
                'efa': timedelta(minutes=5),
                'cfa': timedelta(minutes=10),
                'sem': timedelta(minutes=15)
            }
            
            estimated_total = type_estimates.get(analysis_result.analysis_type, estimated_total)
            progress = min(95, int((elapsed.total_seconds() / estimated_total.total_seconds()) * 100))
            return progress
        
        return 0
    
    def _estimate_completion(self, analysis_result: AnalysisResult) -> Optional[datetime]:
        """Estimate completion time for running analysis"""
        if analysis_result.status != 'running':
            return None
        
        elapsed = timezone.now() - analysis_result.executed_at
        progress = self._calculate_progress(analysis_result)
        
        if progress > 0:
            total_estimated = elapsed.total_seconds() / (progress / 100)
            remaining = total_estimated - elapsed.total_seconds()
            return timezone.now() + timedelta(seconds=remaining)
        
        return None
    
    async def cancel_analysis(self, analysis_id: str) -> bool:
        """Cancel running analysis"""
        try:
            analysis_result = AnalysisResult.objects.get(id=analysis_id)
            if analysis_result.status == 'running':
                analysis_result.status = 'cancelled'
                analysis_result.error_message = 'Analysis cancelled by user'
                analysis_result.save()
                
                # Cancel R process if possible
                await self.r_client.cancel_analysis(analysis_id)
                
                return True
            return False
        except AnalysisResult.DoesNotExist:
            return False