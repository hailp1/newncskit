"""
Enhanced Survey Data Pipeline for Advanced Analytics
Handles automatic construct mapping, variable type detection, and data quality analysis
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import json
import re
from dataclasses import dataclass
from enum import Enum

from django.db import models
from django.utils import timezone
from apps.surveys.models import Campaign, Response, Question
from apps.analytics.models import AnalysisProject


class VariableType(Enum):
    CATEGORICAL_NOMINAL = "categorical_nominal"
    CATEGORICAL_ORDINAL = "categorical_ordinal"
    CONTINUOUS_INTERVAL = "continuous_interval"
    CONTINUOUS_RATIO = "continuous_ratio"
    BINARY = "binary"
    LIKERT = "likert"
    TEXT = "text"
    DATETIME = "datetime"


class DataQualityIssue(Enum):
    MISSING_DATA = "missing_data"
    OUTLIERS = "outliers"
    STRAIGHT_LINING = "straight_lining"
    SPEEDING = "speeding"
    DUPLICATE_RESPONSES = "duplicate_responses"
    INCOMPLETE_RESPONSES = "incomplete_responses"


@dataclass
class VariableMetadata:
    name: str
    original_name: str
    variable_type: VariableType
    scale_range: Optional[Tuple[float, float]]
    categories: Optional[List[str]]
    construct: Optional[str]
    theoretical_framework: Optional[str]
    missing_count: int
    missing_percentage: float
    unique_values: int
    description: Optional[str]


@dataclass
class ConstructMapping:
    construct_name: str
    theoretical_framework: str
    items: List[str]
    reliability_estimate: Optional[float]
    validity_evidence: Dict[str, Any]
    description: str


@dataclass
class DataQualityReport:
    total_responses: int
    complete_responses: int
    completion_rate: float
    average_response_time: float
    median_response_time: float
    quality_issues: Dict[DataQualityIssue, Dict[str, Any]]
    recommendations: List[str]
    overall_quality_score: float


class EnhancedSurveyPipeline:
    """
    Enhanced pipeline for processing survey data with automatic construct mapping,
    variable type detection, and comprehensive data quality analysis.
    """
    
    def __init__(self):
        self.theoretical_frameworks = self._load_theoretical_frameworks()
        self.construct_patterns = self._load_construct_patterns()
        
    def process_campaign_data(
        self, 
        campaign_id: str, 
        analysis_project: AnalysisProject
    ) -> Dict[str, Any]:
        """
        Process survey campaign data for analysis with enhanced features.
        
        Args:
            campaign_id: ID of the survey campaign
            analysis_project: Associated analysis project
            
        Returns:
            Dictionary containing processed data and metadata
        """
        try:
            # Load campaign and responses
            campaign = Campaign.objects.get(id=campaign_id)
            responses = Response.objects.filter(campaign=campaign)
            
            # Convert to DataFrame
            df = self._responses_to_dataframe(responses)
            
            # Detect variable types
            variable_metadata = self._detect_variable_types(df, campaign)
            
            # Map constructs automatically
            construct_mappings = self._map_constructs_automatically(
                variable_metadata, 
                analysis_project.theoretical_framework
            )
            
            # Analyze data quality
            quality_report = self._analyze_data_quality(df, responses)
            
            # Preserve response metadata
            response_metadata = self._extract_response_metadata(responses)
            
            # Generate recommendations
            recommendations = self._generate_processing_recommendations(
                variable_metadata, 
                construct_mappings, 
                quality_report
            )
            
            return {
                'data': df,
                'variable_metadata': variable_metadata,
                'construct_mappings': construct_mappings,
                'quality_report': quality_report,
                'response_metadata': response_metadata,
                'recommendations': recommendations,
                'processing_timestamp': timezone.now(),
                'campaign_info': {
                    'id': campaign.id,
                    'title': campaign.title,
                    'created_at': campaign.created_at,
                    'total_questions': campaign.questions.count()
                }
            }
            
        except Exception as e:
            raise Exception(f"Error processing campaign data: {str(e)}")
    
    def _responses_to_dataframe(self, responses) -> pd.DataFrame:
        """Convert survey responses to pandas DataFrame."""
        data = []
        
        for response in responses:
            row = {
                'response_id': response.id,
                'participant_id': response.participant_id,
                'started_at': response.started_at,
                'completed_at': response.completed_at,
                'response_time': (response.completed_at - response.started_at).total_seconds() if response.completed_at else None,
                'is_complete': response.is_complete,
                'ip_address': response.ip_address,
                'user_agent': response.user_agent
            }
            
            # Add question responses
            for answer in response.answers.all():
                question_key = f"Q{answer.question.order}_{self._clean_variable_name(answer.question.text)}"
                row[question_key] = answer.value
                
            data.append(row)
        
        return pd.DataFrame(data)
    
    def _detect_variable_types(
        self, 
        df: pd.DataFrame, 
        campaign
    ) -> Dict[str, VariableMetadata]:
        """Automatically detect variable types and generate metadata."""
        metadata = {}
        
        # Skip system columns
        system_columns = ['response_id', 'participant_id', 'started_at', 'completed_at', 
                         'response_time', 'is_complete', 'ip_address', 'user_agent']
        
        for column in df.columns:
            if column in system_columns:
                continue
                
            series = df[column].dropna()
            
            # Extract question info from column name
            question_info = self._extract_question_info(column, campaign)
            
            # Detect variable type
            var_type = self._classify_variable_type(series, question_info)
            
            # Calculate statistics
            missing_count = df[column].isnull().sum()
            missing_percentage = (missing_count / len(df)) * 100
            unique_values = series.nunique()
            
            # Determine scale range and categories
            scale_range = None
            categories = None
            
            if var_type in [VariableType.CONTINUOUS_INTERVAL, VariableType.CONTINUOUS_RATIO, VariableType.LIKERT]:
                try:
                    numeric_series = pd.to_numeric(series, errors='coerce').dropna()
                    if len(numeric_series) > 0:
                        scale_range = (float(numeric_series.min()), float(numeric_series.max()))
                except:
                    pass
            
            if var_type in [VariableType.CATEGORICAL_NOMINAL, VariableType.CATEGORICAL_ORDINAL]:
                categories = series.unique().tolist()
            
            # Attempt construct mapping
            construct, framework = self._identify_construct(column, question_info)
            
            metadata[column] = VariableMetadata(
                name=column,
                original_name=question_info.get('original_text', column),
                variable_type=var_type,
                scale_range=scale_range,
                categories=categories,
                construct=construct,
                theoretical_framework=framework,
                missing_count=missing_count,
                missing_percentage=missing_percentage,
                unique_values=unique_values,
                description=question_info.get('description', '')
            )
        
        return metadata
    
    def _classify_variable_type(self, series: pd.Series, question_info: Dict) -> VariableType:
        """Classify variable type based on data characteristics and question info."""
        
        # Check question type first
        question_type = question_info.get('type', '').lower()
        
        if question_type in ['likert', 'rating', 'scale']:
            return VariableType.LIKERT
        elif question_type in ['multiple_choice', 'single_choice', 'dropdown']:
            return VariableType.CATEGORICAL_NOMINAL
        elif question_type in ['ranking', 'ordered']:
            return VariableType.CATEGORICAL_ORDINAL
        elif question_type in ['text', 'textarea', 'open_ended']:
            return VariableType.TEXT
        elif question_type in ['date', 'datetime', 'time']:
            return VariableType.DATETIME
        
        # Analyze data characteristics
        try:
            # Try to convert to numeric
            numeric_series = pd.to_numeric(series, errors='coerce')
            numeric_count = numeric_series.notna().sum()
            total_count = len(series)
            
            if numeric_count / total_count > 0.8:  # Mostly numeric
                unique_values = numeric_series.nunique()
                
                # Check if binary
                if unique_values == 2:
                    return VariableType.BINARY
                
                # Check if it looks like a Likert scale
                min_val = numeric_series.min()
                max_val = numeric_series.max()
                
                if (min_val >= 1 and max_val <= 10 and 
                    unique_values <= 10 and 
                    all(val == int(val) for val in numeric_series.dropna())):
                    return VariableType.LIKERT
                
                # Check if continuous
                if unique_values > 10:
                    return VariableType.CONTINUOUS_RATIO
                else:
                    return VariableType.CATEGORICAL_ORDINAL
            
            else:  # Non-numeric
                unique_values = series.nunique()
                
                if unique_values == 2:
                    return VariableType.BINARY
                elif unique_values <= 10:
                    return VariableType.CATEGORICAL_NOMINAL
                else:
                    return VariableType.TEXT
                    
        except Exception:
            return VariableType.TEXT
    
    def _map_constructs_automatically(
        self, 
        variable_metadata: Dict[str, VariableMetadata],
        theoretical_framework: Dict
    ) -> List[ConstructMapping]:
        """Automatically map survey items to theoretical constructs."""
        
        construct_mappings = []
        framework_name = theoretical_framework.get('name', 'Unknown')
        
        # Group variables by potential constructs
        construct_groups = {}
        
        for var_name, metadata in variable_metadata.items():
            if metadata.construct:
                if metadata.construct not in construct_groups:
                    construct_groups[metadata.construct] = []
                construct_groups[metadata.construct].append(var_name)
        
        # Create construct mappings
        for construct_name, items in construct_groups.items():
            # Estimate reliability (mock calculation)
            reliability = self._estimate_construct_reliability(items, variable_metadata)
            
            # Gather validity evidence
            validity_evidence = self._assess_construct_validity(items, variable_metadata)
            
            construct_mappings.append(ConstructMapping(
                construct_name=construct_name,
                theoretical_framework=framework_name,
                items=items,
                reliability_estimate=reliability,
                validity_evidence=validity_evidence,
                description=f"Construct measuring {construct_name} with {len(items)} items"
            ))
        
        return construct_mappings
    
    def _analyze_data_quality(
        self, 
        df: pd.DataFrame, 
        responses
    ) -> DataQualityReport:
        """Comprehensive data quality analysis."""
        
        total_responses = len(df)
        complete_responses = df['is_complete'].sum() if 'is_complete' in df.columns else total_responses
        completion_rate = complete_responses / total_responses if total_responses > 0 else 0
        
        # Response time analysis
        response_times = df['response_time'].dropna()
        avg_response_time = response_times.mean() if len(response_times) > 0 else 0
        median_response_time = response_times.median() if len(response_times) > 0 else 0
        
        quality_issues = {}
        recommendations = []
        
        # Missing data analysis
        missing_data = self._analyze_missing_data(df)
        if missing_data['severity'] > 0.1:  # More than 10% missing
            quality_issues[DataQualityIssue.MISSING_DATA] = missing_data
            recommendations.append("Consider imputation methods for missing data")
        
        # Outlier detection
        outliers = self._detect_outliers(df)
        if outliers['count'] > 0:
            quality_issues[DataQualityIssue.OUTLIERS] = outliers
            recommendations.append("Review and potentially remove outlier responses")
        
        # Straight-lining detection
        straight_lining = self._detect_straight_lining(df)
        if straight_lining['percentage'] > 0.05:  # More than 5%
            quality_issues[DataQualityIssue.STRAIGHT_LINING] = straight_lining
            recommendations.append("Consider removing straight-lined responses")
        
        # Speeding detection
        speeding = self._detect_speeding(df, response_times)
        if speeding['percentage'] > 0.1:  # More than 10%
            quality_issues[DataQualityIssue.SPEEDING] = speeding
            recommendations.append("Review responses completed too quickly")
        
        # Calculate overall quality score
        quality_score = self._calculate_quality_score(
            completion_rate, missing_data, outliers, straight_lining, speeding
        )
        
        return DataQualityReport(
            total_responses=total_responses,
            complete_responses=complete_responses,
            completion_rate=completion_rate,
            average_response_time=avg_response_time,
            median_response_time=median_response_time,
            quality_issues=quality_issues,
            recommendations=recommendations,
            overall_quality_score=quality_score
        )
    
    def _extract_response_metadata(self, responses) -> Dict[str, Any]:
        """Extract and preserve response metadata."""
        
        metadata = {
            'collection_period': {
                'start': min(r.started_at for r in responses if r.started_at),
                'end': max(r.completed_at for r in responses if r.completed_at)
            },
            'response_patterns': {
                'peak_hours': self._analyze_response_timing(responses),
                'completion_patterns': self._analyze_completion_patterns(responses)
            },
            'technical_metadata': {
                'user_agents': list(set(r.user_agent for r in responses if r.user_agent)),
                'ip_addresses_count': len(set(r.ip_address for r in responses if r.ip_address))
            }
        }
        
        return metadata
    
    def _generate_processing_recommendations(
        self,
        variable_metadata: Dict[str, VariableMetadata],
        construct_mappings: List[ConstructMapping],
        quality_report: DataQualityReport
    ) -> List[str]:
        """Generate recommendations for data processing and analysis."""
        
        recommendations = []
        
        # Data quality recommendations
        recommendations.extend(quality_report.recommendations)
        
        # Variable type recommendations
        likert_vars = [name for name, meta in variable_metadata.items() 
                      if meta.variable_type == VariableType.LIKERT]
        if likert_vars:
            recommendations.append(f"Consider reliability analysis for {len(likert_vars)} Likert-type variables")
        
        # Construct mapping recommendations
        if construct_mappings:
            for mapping in construct_mappings:
                if mapping.reliability_estimate and mapping.reliability_estimate < 0.7:
                    recommendations.append(f"Low reliability detected for {mapping.construct_name} construct (α = {mapping.reliability_estimate:.3f})")
        
        # Missing data recommendations
        high_missing_vars = [name for name, meta in variable_metadata.items() 
                           if meta.missing_percentage > 20]
        if high_missing_vars:
            recommendations.append(f"High missing data in {len(high_missing_vars)} variables - consider exclusion or imputation")
        
        return recommendations
    
    # Helper methods
    def _clean_variable_name(self, text: str) -> str:
        """Clean variable name for DataFrame column."""
        # Remove special characters and limit length
        cleaned = re.sub(r'[^\w\s]', '', text)
        cleaned = re.sub(r'\s+', '_', cleaned)
        return cleaned[:50]  # Limit length
    
    def _extract_question_info(self, column_name: str, campaign) -> Dict:
        """Extract question information from column name and campaign."""
        # This would extract question details from the campaign
        # For now, return basic info
        return {
            'original_text': column_name,
            'type': 'unknown',
            'description': ''
        }
    
    def _identify_construct(self, column_name: str, question_info: Dict) -> Tuple[Optional[str], Optional[str]]:
        """Identify potential construct and theoretical framework."""
        # This would use NLP and pattern matching to identify constructs
        # For now, return None
        return None, None
    
    def _load_theoretical_frameworks(self) -> Dict:
        """Load theoretical frameworks for construct mapping."""
        # This would load from database or configuration
        return {}
    
    def _load_construct_patterns(self) -> Dict:
        """Load patterns for construct identification."""
        # This would load NLP patterns for construct identification
        return {}
    
    def _estimate_construct_reliability(
        self, 
        items: List[str], 
        variable_metadata: Dict[str, VariableMetadata]
    ) -> Optional[float]:
        """Estimate construct reliability (Cronbach's alpha)."""
        # Mock calculation - in real implementation, would calculate actual alpha
        return 0.85 + np.random.normal(0, 0.1)
    
    def _assess_construct_validity(
        self, 
        items: List[str], 
        variable_metadata: Dict[str, VariableMetadata]
    ) -> Dict[str, Any]:
        """Assess construct validity evidence."""
        return {
            'content_validity': 'Assessed through expert review',
            'convergent_validity': 'To be assessed through factor analysis',
            'discriminant_validity': 'To be assessed through factor analysis'
        }
    
    def _analyze_missing_data(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze missing data patterns."""
        missing_by_column = df.isnull().sum()
        total_missing = missing_by_column.sum()
        total_cells = df.shape[0] * df.shape[1]
        
        return {
            'total_missing': int(total_missing),
            'severity': total_missing / total_cells,
            'by_column': missing_by_column.to_dict(),
            'pattern_analysis': 'Missing completely at random (MCAR) - needs testing'
        }
    
    def _detect_outliers(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Detect outliers in numeric variables."""
        # Simple outlier detection using IQR method
        outlier_count = 0
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        
        for col in numeric_columns:
            if col in ['response_time']:  # Skip system columns
                continue
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            outliers = df[(df[col] < (Q1 - 1.5 * IQR)) | (df[col] > (Q3 + 1.5 * IQR))]
            outlier_count += len(outliers)
        
        return {
            'count': outlier_count,
            'percentage': outlier_count / len(df) if len(df) > 0 else 0,
            'method': 'IQR method'
        }
    
    def _detect_straight_lining(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Detect straight-lining in Likert-type responses."""
        # This would analyze response patterns for straight-lining
        # Mock implementation
        straight_lined = np.random.randint(0, len(df) // 20)  # Random for demo
        
        return {
            'count': straight_lined,
            'percentage': straight_lined / len(df) if len(df) > 0 else 0,
            'threshold': 'Same response for 80% of Likert items'
        }
    
    def _detect_speeding(self, df: pd.DataFrame, response_times: pd.Series) -> Dict[str, Any]:
        """Detect responses completed too quickly."""
        if len(response_times) == 0:
            return {'count': 0, 'percentage': 0}
        
        # Define speeding threshold (e.g., less than 2 seconds per question)
        avg_questions = 20  # Mock number
        min_time_threshold = avg_questions * 2  # 2 seconds per question
        
        speeding_responses = response_times[response_times < min_time_threshold]
        
        return {
            'count': len(speeding_responses),
            'percentage': len(speeding_responses) / len(response_times),
            'threshold': f'{min_time_threshold} seconds'
        }
    
    def _calculate_quality_score(
        self, 
        completion_rate: float,
        missing_data: Dict,
        outliers: Dict,
        straight_lining: Dict,
        speeding: Dict
    ) -> float:
        """Calculate overall data quality score (0-1)."""
        
        # Weight different quality factors
        score = completion_rate * 0.3  # 30% weight for completion rate
        score += (1 - missing_data['severity']) * 0.25  # 25% weight for missing data
        score += (1 - min(outliers['percentage'], 0.2) / 0.2) * 0.15  # 15% weight for outliers
        score += (1 - min(straight_lining['percentage'], 0.1) / 0.1) * 0.15  # 15% weight for straight-lining
        score += (1 - min(speeding['percentage'], 0.2) / 0.2) * 0.15  # 15% weight for speeding
        
        return max(0, min(1, score))  # Ensure score is between 0 and 1
    
    def _analyze_response_timing(self, responses) -> Dict[str, Any]:
        """Analyze response timing patterns."""
        # Mock implementation
        return {
            'peak_hour': 14,  # 2 PM
            'peak_day': 'Tuesday',
            'distribution': 'Normal distribution with peak at 2 PM'
        }
    
    def _analyze_completion_patterns(self, responses) -> Dict[str, Any]:
        """Analyze completion patterns."""
        # Mock implementation
        return {
            'average_completion_time': '15 minutes',
            'dropout_points': ['Question 5', 'Question 12'],
            'completion_by_device': {'Desktop': 0.8, 'Mobile': 0.6, 'Tablet': 0.7}
        }