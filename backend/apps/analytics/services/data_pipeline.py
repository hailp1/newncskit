"""
Data Pipeline Service for Advanced Data Analysis System

This service handles data integration from various sources including
survey campaigns, external files, and database queries.
"""

import pandas as pd
import numpy as np
import json
import logging
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from django.core.files.uploadedfile import UploadedFile
from django.db import transaction

from ..models import AnalysisProject
from apps.surveys.models import SurveyCampaign, SurveyResponse

logger = logging.getLogger(__name__)


@dataclass
class DataSource:
    """Data source configuration"""
    source_type: str  # 'survey_campaign', 'external_file', 'database_query'
    source_id: str
    metadata: Dict[str, Any]


@dataclass
class ProcessedData:
    """Processed data with metadata"""
    data: List[List[Any]]
    columns: List[str]
    variable_mapping: Dict[str, Dict[str, Any]]
    metadata: Dict[str, Any]
    quality_indicators: Dict[str, Any]


class SurveyDataProcessor:
    """Processor for survey campaign data"""
    
    def process_campaign_data(
        self, 
        campaign_id: str, 
        include_metadata: bool = True
    ) -> ProcessedData:
        """Process survey campaign data for analysis"""
        
        try:
            campaign = SurveyCampaign.objects.get(id=campaign_id)
            responses = SurveyResponse.objects.filter(campaign=campaign, is_complete=True)
            
            logger.info(f"Processing {responses.count()} responses from campaign {campaign.title}")
            
            # Extract response data
            data_rows = []
            columns = []
            variable_mapping = {}
            
            # Get survey structure
            survey_structure = campaign.survey_structure
            
            # Build column headers and variable mapping
            for section in survey_structure.get('sections', []):
                for question in section.get('questions', []):
                    question_id = question.get('id')
                    question_text = question.get('text', '')
                    question_type = question.get('type', 'text')
                    
                    # Create column name
                    column_name = f"q_{question_id}"
                    columns.append(column_name)
                    
                    # Map to theoretical construct if available
                    construct = question.get('construct', '')
                    variable_info = {
                        'question_text': question_text,
                        'question_type': question_type,
                        'construct': construct,
                        'scale_type': self._determine_scale_type(question_type),
                        'response_options': question.get('options', [])
                    }
                    
                    variable_mapping[column_name] = variable_info
            
            # Add demographic columns if available
            demographic_fields = ['age', 'gender', 'education', 'occupation', 'location']
            for field in demographic_fields:
                if any(field in str(resp.demographic_data) for resp in responses[:10]):  # Check sample
                    columns.append(field)
                    variable_mapping[field] = {
                        'question_text': field.title(),
                        'question_type': 'demographic',
                        'construct': 'Demographics',
                        'scale_type': 'categorical' if field in ['gender', 'education', 'occupation'] else 'numeric'
                    }
            
            # Extract response data
            for response in responses:
                row = []
                response_data = response.response_data
                
                # Extract question responses
                for section in survey_structure.get('sections', []):
                    for question in section.get('questions', []):
                        question_id = question.get('id')
                        value = response_data.get(str(question_id), '')
                        
                        # Convert to appropriate type
                        processed_value = self._process_response_value(
                            value, question.get('type', 'text')
                        )
                        row.append(processed_value)
                
                # Add demographic data
                demographic_data = response.demographic_data or {}
                for field in demographic_fields:
                    if field in columns:
                        demo_value = demographic_data.get(field, '')
                        row.append(demo_value)
                
                data_rows.append(row)
            
            # Create header row
            data_with_headers = [columns] + data_rows
            
            # Generate quality indicators
            quality_indicators = self._assess_data_quality(
                data_rows, columns, variable_mapping, responses
            )
            
            # Create metadata
            metadata = {
                'source_type': 'survey_campaign',
                'campaign_id': campaign_id,
                'campaign_title': campaign.title,
                'response_count': len(data_rows),
                'collection_period': {
                    'start': campaign.start_date.isoformat() if campaign.start_date else None,
                    'end': campaign.end_date.isoformat() if campaign.end_date else None
                },
                'target_sample_size': campaign.target_participants,
                'theoretical_framework': campaign.research_design.get('theoretical_framework', {}) if hasattr(campaign, 'research_design') else {},
                'constructs': list(set(vm.get('construct', '') for vm in variable_mapping.values() if vm.get('construct')))
            }
            
            return ProcessedData(
                data=data_with_headers,
                columns=columns,
                variable_mapping=variable_mapping,
                metadata=metadata,
                quality_indicators=quality_indicators
            )
            
        except SurveyCampaign.DoesNotExist:
            raise ValueError(f"Survey campaign {campaign_id} not found")
        except Exception as e:
            logger.error(f"Error processing campaign data: {str(e)}")
            raise
    
    def _determine_scale_type(self, question_type: str) -> str:
        """Determine scale type from question type"""
        type_mapping = {
            'likert': 'ordinal',
            'multiple_choice': 'categorical',
            'text': 'categorical',
            'numeric': 'numeric',
            'boolean': 'categorical',
            'rating': 'ordinal',
            'ranking': 'ordinal'
        }
        return type_mapping.get(question_type, 'categorical')
    
    def _process_response_value(self, value: Any, question_type: str) -> Any:
        """Process individual response value"""
        if value is None or value == '':
            return np.nan
        
        if question_type in ['numeric', 'rating']:
            try:
                return float(value)
            except (ValueError, TypeError):
                return np.nan
        
        elif question_type == 'boolean':
            if isinstance(value, bool):
                return 1 if value else 0
            elif isinstance(value, str):
                return 1 if value.lower() in ['true', 'yes', '1'] else 0
            else:
                return int(bool(value))
        
        elif question_type == 'likert':
            # Convert likert responses to numeric
            if isinstance(value, (int, float)):
                return float(value)
            elif isinstance(value, str):
                # Try to extract number from string
                import re
                numbers = re.findall(r'\d+', value)
                if numbers:
                    return float(numbers[0])
                else:
                    # Map text responses to numbers
                    likert_mapping = {
                        'strongly disagree': 1, 'disagree': 2, 'neutral': 3,
                        'agree': 4, 'strongly agree': 5
                    }
                    return likert_mapping.get(value.lower(), np.nan)
        
        # Default: return as string
        return str(value)
    
    def _assess_data_quality(
        self, 
        data_rows: List[List[Any]], 
        columns: List[str], 
        variable_mapping: Dict[str, Dict[str, Any]],
        responses
    ) -> Dict[str, Any]:
        """Assess data quality indicators"""
        
        if not data_rows:
            return {'overall_quality': 'poor', 'issues': ['No data available']}
        
        df = pd.DataFrame(data_rows, columns=columns)
        
        quality_indicators = {
            'response_count': len(data_rows),
            'completion_rate': len(data_rows) / responses.count() if responses.count() > 0 else 0,
            'missing_data_percentage': (df.isnull().sum().sum() / df.size) * 100,
            'variables_with_missing': (df.isnull().sum() > 0).sum(),
            'response_time_analysis': {},
            'data_quality_flags': []
        }
        
        # Check for straight-lining (same response across likert items)
        likert_columns = [col for col, mapping in variable_mapping.items() 
                         if mapping.get('scale_type') == 'ordinal']
        
        if len(likert_columns) >= 3:
            straight_line_count = 0
            for _, row in df[likert_columns].iterrows():
                if len(set(row.dropna())) <= 1:  # All same values
                    straight_line_count += 1
            
            straight_line_percentage = (straight_line_count / len(df)) * 100
            quality_indicators['straight_lining_percentage'] = straight_line_percentage
            
            if straight_line_percentage > 10:
                quality_indicators['data_quality_flags'].append('High straight-lining detected')
        
        # Check response time if available
        response_times = []
        for response in responses:
            if hasattr(response, 'completion_time') and response.completion_time:
                response_times.append(response.completion_time)
        
        if response_times:
            avg_time = sum(response_times, pd.Timedelta(0)) / len(response_times)
            quality_indicators['response_time_analysis'] = {
                'average_completion_time': str(avg_time),
                'fast_responses': sum(1 for t in response_times if t < pd.Timedelta(minutes=2)),
                'slow_responses': sum(1 for t in response_times if t > pd.Timedelta(hours=1))
            }
        
        # Overall quality assessment
        issues = []
        if quality_indicators['missing_data_percentage'] > 20:
            issues.append('High missing data')
        if quality_indicators.get('straight_lining_percentage', 0) > 15:
            issues.append('Excessive straight-lining')
        if quality_indicators['completion_rate'] < 0.7:
            issues.append('Low completion rate')
        
        if not issues:
            quality_indicators['overall_quality'] = 'good'
        elif len(issues) <= 1:
            quality_indicators['overall_quality'] = 'acceptable'
        else:
            quality_indicators['overall_quality'] = 'poor'
        
        quality_indicators['issues'] = issues
        
        return quality_indicators


class ExternalFileProcessor:
    """Processor for external data files"""
    
    SUPPORTED_FORMATS = ['.csv', '.xlsx', '.xls', '.sav', '.json']
    
    def process_file(self, file: UploadedFile) -> ProcessedData:
        """Process external data file"""
        
        file_extension = self._get_file_extension(file.name)
        
        if file_extension not in self.SUPPORTED_FORMATS:
            raise ValueError(f"Unsupported file format: {file_extension}")
        
        try:
            # Read file based on format
            if file_extension == '.csv':
                df = pd.read_csv(file)
            elif file_extension in ['.xlsx', '.xls']:
                df = pd.read_excel(file)
            elif file_extension == '.json':
                df = pd.read_json(file)
            elif file_extension == '.sav':
                # SPSS files require pyreadstat
                try:
                    import pyreadstat
                    df, meta = pyreadstat.read_sav(file)
                except ImportError:
                    raise ValueError("SPSS file support requires pyreadstat package")
            else:
                raise ValueError(f"Handler not implemented for {file_extension}")
            
            # Process the dataframe
            processed_data = self._process_dataframe(df, file.name)
            
            return processed_data
            
        except Exception as e:
            logger.error(f"Error processing file {file.name}: {str(e)}")
            raise
    
    def _get_file_extension(self, filename: str) -> str:
        """Get file extension"""
        return '.' + filename.split('.')[-1].lower() if '.' in filename else ''
    
    def _process_dataframe(self, df: pd.DataFrame, filename: str) -> ProcessedData:
        """Process pandas DataFrame into analysis format"""
        
        # Clean column names
        df.columns = [self._clean_column_name(col) for col in df.columns]
        
        # Detect variable types
        variable_mapping = {}
        for col in df.columns:
            variable_mapping[col] = self._detect_variable_type(df[col], col)
        
        # Convert to list format
        columns = df.columns.tolist()
        data_rows = df.values.tolist()
        data_with_headers = [columns] + data_rows
        
        # Generate quality indicators
        quality_indicators = self._assess_external_data_quality(df)
        
        # Create metadata
        metadata = {
            'source_type': 'external_file',
            'filename': filename,
            'file_size': len(df),
            'variables': len(df.columns),
            'data_types': {col: str(df[col].dtype) for col in df.columns}
        }
        
        return ProcessedData(
            data=data_with_headers,
            columns=columns,
            variable_mapping=variable_mapping,
            metadata=metadata,
            quality_indicators=quality_indicators
        )
    
    def _clean_column_name(self, col_name: str) -> str:
        """Clean column name for analysis"""
        import re
        # Remove special characters and spaces
        cleaned = re.sub(r'[^\w\s]', '', str(col_name))
        cleaned = re.sub(r'\s+', '_', cleaned.strip())
        return cleaned.lower()
    
    def _detect_variable_type(self, series: pd.Series, col_name: str) -> Dict[str, Any]:
        """Detect variable type and properties"""
        
        # Basic type detection
        if pd.api.types.is_numeric_dtype(series):
            unique_values = series.nunique()
            if unique_values <= 10 and series.min() >= 1 and series.max() <= 10:
                scale_type = 'ordinal'  # Likely Likert scale
            else:
                scale_type = 'numeric'
        elif pd.api.types.is_categorical_dtype(series) or series.dtype == 'object':
            unique_values = series.nunique()
            if unique_values <= 20:
                scale_type = 'categorical'
            else:
                scale_type = 'text'
        else:
            scale_type = 'categorical'
        
        # Detect potential construct from column name
        construct = self._infer_construct_from_name(col_name)
        
        return {
            'question_text': col_name.replace('_', ' ').title(),
            'question_type': 'external',
            'construct': construct,
            'scale_type': scale_type,
            'unique_values': series.nunique(),
            'missing_count': series.isnull().sum(),
            'data_type': str(series.dtype)
        }
    
    def _infer_construct_from_name(self, col_name: str) -> str:
        """Infer theoretical construct from column name"""
        
        construct_keywords = {
            'satisfaction': ['satisfaction', 'satisfy', 'happy'],
            'intention': ['intention', 'intend', 'plan', 'will'],
            'attitude': ['attitude', 'feel', 'opinion'],
            'usefulness': ['useful', 'benefit', 'helpful'],
            'ease_of_use': ['easy', 'simple', 'user_friendly'],
            'trust': ['trust', 'reliable', 'dependable'],
            'performance': ['performance', 'speed', 'efficiency'],
            'demographics': ['age', 'gender', 'education', 'income', 'occupation']
        }
        
        col_lower = col_name.lower()
        for construct, keywords in construct_keywords.items():
            if any(keyword in col_lower for keyword in keywords):
                return construct.replace('_', ' ').title()
        
        return 'Unspecified'
    
    def _assess_external_data_quality(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Assess quality of external data"""
        
        quality_indicators = {
            'row_count': len(df),
            'column_count': len(df.columns),
            'missing_data_percentage': (df.isnull().sum().sum() / df.size) * 100,
            'duplicate_rows': df.duplicated().sum(),
            'numeric_columns': len(df.select_dtypes(include=[np.number]).columns),
            'categorical_columns': len(df.select_dtypes(include=['object', 'category']).columns),
            'data_quality_flags': []
        }
        
        # Check for issues
        issues = []
        if quality_indicators['missing_data_percentage'] > 25:
            issues.append('High missing data')
        if quality_indicators['duplicate_rows'] > len(df) * 0.1:
            issues.append('Many duplicate rows')
        if len(df) < 30:
            issues.append('Small sample size')
        
        quality_indicators['issues'] = issues
        quality_indicators['overall_quality'] = 'poor' if len(issues) > 2 else 'acceptable' if issues else 'good'
        
        return quality_indicators


class DataPipelineService:
    """Main service for data pipeline operations"""
    
    def __init__(self):
        self.survey_processor = SurveyDataProcessor()
        self.file_processor = ExternalFileProcessor()
    
    async def connect_survey_campaign(
        self, 
        project: AnalysisProject, 
        campaign_id: str
    ) -> ProcessedData:
        """Connect analysis project to survey campaign"""
        
        try:
            processed_data = self.survey_processor.process_campaign_data(campaign_id)
            
            # Update project configuration
            project.data_source = 'survey_campaign'
            project.data_configuration = {
                'campaign_id': campaign_id,
                'variable_mapping': processed_data.variable_mapping,
                'metadata': processed_data.metadata
            }
            project.save()
            
            logger.info(f"Connected project {project.id} to campaign {campaign_id}")
            return processed_data
            
        except Exception as e:
            logger.error(f"Failed to connect to campaign {campaign_id}: {str(e)}")
            raise
    
    async def process_external_file(
        self, 
        project: AnalysisProject, 
        file: UploadedFile
    ) -> ProcessedData:
        """Process external data file for analysis project"""
        
        try:
            processed_data = self.file_processor.process_file(file)
            
            # Update project configuration
            project.data_source = 'external_file'
            project.data_configuration = {
                'filename': file.name,
                'variable_mapping': processed_data.variable_mapping,
                'metadata': processed_data.metadata
            }
            project.save()
            
            logger.info(f"Processed external file {file.name} for project {project.id}")
            return processed_data
            
        except Exception as e:
            logger.error(f"Failed to process file {file.name}: {str(e)}")
            raise
    
    def get_variable_suggestions(
        self, 
        processed_data: ProcessedData, 
        analysis_type: str
    ) -> Dict[str, List[str]]:
        """Get variable role suggestions based on analysis type and data"""
        
        suggestions = {
            'dependent': [],
            'independent': [],
            'mediator': [],
            'moderator': [],
            'control': []
        }
        
        variable_mapping = processed_data.variable_mapping
        
        # Analysis-specific suggestions
        if analysis_type in ['regression', 'anova', 'ttest']:
            # Suggest numeric variables as dependent
            numeric_vars = [col for col, info in variable_mapping.items() 
                          if info.get('scale_type') == 'numeric']
            suggestions['dependent'] = numeric_vars[:3]  # Top 3
            
            # Suggest other variables as independent
            other_vars = [col for col in variable_mapping.keys() 
                         if col not in suggestions['dependent']]
            suggestions['independent'] = other_vars[:5]  # Top 5
        
        elif analysis_type in ['efa', 'cfa', 'reliability']:
            # Group by construct
            construct_groups = {}
            for col, info in variable_mapping.items():
                construct = info.get('construct', 'Unspecified')
                if construct not in construct_groups:
                    construct_groups[construct] = []
                construct_groups[construct].append(col)
            
            # Suggest largest construct groups
            sorted_constructs = sorted(construct_groups.items(), 
                                     key=lambda x: len(x[1]), reverse=True)
            
            suggestions['constructs'] = dict(sorted_constructs[:5])  # Top 5 constructs
        
        elif analysis_type == 'correlation':
            # Suggest all numeric variables
            numeric_vars = [col for col, info in variable_mapping.items() 
                          if info.get('scale_type') in ['numeric', 'ordinal']]
            suggestions['variables'] = numeric_vars
        
        return suggestions
    
    def validate_variable_assignment(
        self, 
        variables: Dict[str, List[str]], 
        processed_data: ProcessedData, 
        analysis_type: str
    ) -> Dict[str, List[str]]:
        """Validate variable assignments for analysis"""
        
        validation_results = {
            'errors': [],
            'warnings': [],
            'suggestions': []
        }
        
        variable_mapping = processed_data.variable_mapping
        
        # Check variable existence
        all_assigned_vars = []
        for role, var_list in variables.items():
            if isinstance(var_list, list):
                all_assigned_vars.extend(var_list)
        
        missing_vars = [var for var in all_assigned_vars 
                       if var not in variable_mapping]
        if missing_vars:
            validation_results['errors'].append(
                f"Variables not found in data: {', '.join(missing_vars)}"
            )
        
        # Analysis-specific validation
        if analysis_type in ['regression', 'anova', 'ttest']:
            dependent_vars = variables.get('dependent', [])
            independent_vars = variables.get('independent', [])
            
            if not dependent_vars:
                validation_results['errors'].append("Dependent variable is required")
            elif len(dependent_vars) > 1:
                validation_results['warnings'].append("Multiple dependent variables specified")
            
            if not independent_vars:
                validation_results['errors'].append("At least one independent variable is required")
            
            # Check variable types
            for var in dependent_vars:
                if var in variable_mapping:
                    scale_type = variable_mapping[var].get('scale_type')
                    if scale_type not in ['numeric', 'ordinal']:
                        validation_results['warnings'].append(
                            f"Dependent variable {var} is not numeric"
                        )
        
        elif analysis_type in ['efa', 'cfa']:
            constructs = variables.get('constructs', {})
            if not constructs:
                validation_results['errors'].append("Variable groupings (constructs) are required")
            else:
                for construct, var_list in constructs.items():
                    if len(var_list) < 3:
                        validation_results['warnings'].append(
                            f"Construct {construct} has fewer than 3 variables"
                        )
        
        return validation_results
    
    def export_data(
        self, 
        processed_data: ProcessedData, 
        format: str = 'csv'
    ) -> bytes:
        """Export processed data in specified format"""
        
        df = pd.DataFrame(processed_data.data[1:], columns=processed_data.data[0])
        
        if format == 'csv':
            return df.to_csv(index=False).encode('utf-8')
        elif format == 'excel':
            import io
            buffer = io.BytesIO()
            df.to_excel(buffer, index=False)
            return buffer.getvalue()
        elif format == 'json':
            return df.to_json(orient='records').encode('utf-8')
        else:
            raise ValueError(f"Unsupported export format: {format}")
    
    def get_data_summary(self, processed_data: ProcessedData) -> Dict[str, Any]:
        """Get comprehensive data summary"""
        
        df = pd.DataFrame(processed_data.data[1:], columns=processed_data.data[0])
        
        summary = {
            'basic_info': {
                'rows': len(df),
                'columns': len(df.columns),
                'missing_cells': df.isnull().sum().sum(),
                'missing_percentage': (df.isnull().sum().sum() / df.size) * 100
            },
            'variable_types': {},
            'constructs': {},
            'quality_indicators': processed_data.quality_indicators,
            'metadata': processed_data.metadata
        }
        
        # Variable type summary
        for scale_type in ['numeric', 'ordinal', 'categorical', 'text']:
            count = sum(1 for info in processed_data.variable_mapping.values() 
                       if info.get('scale_type') == scale_type)
            summary['variable_types'][scale_type] = count
        
        # Construct summary
        construct_counts = {}
        for info in processed_data.variable_mapping.values():
            construct = info.get('construct', 'Unspecified')
            construct_counts[construct] = construct_counts.get(construct, 0) + 1
        
        summary['constructs'] = construct_counts
        
        return summary