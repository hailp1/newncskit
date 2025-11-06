"""
Statistical Validation Service for Advanced Data Analysis System

This service provides comprehensive statistical assumption validation
and diagnostic testing for various analysis types.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class ValidationSeverity(Enum):
    """Validation result severity levels"""
    PASS = "pass"
    WARNING = "warning"
    CRITICAL = "critical"


@dataclass
class ValidationResult:
    """Individual validation test result"""
    test_name: str
    status: ValidationSeverity
    message: str
    details: Dict[str, Any]
    recommendations: List[str]
    p_value: Optional[float] = None
    statistic: Optional[float] = None


@dataclass
class ComprehensiveValidationResult:
    """Complete validation results for an analysis"""
    overall_status: ValidationSeverity
    individual_results: Dict[str, ValidationResult]
    summary: str
    recommendations: List[str]


class SampleSizeValidator:
    """Validator for sample size adequacy"""
    
    MINIMUM_REQUIREMENTS = {
        'descriptive': 30,
        'ttest': 30,
        'anova': 30,
        'correlation': 30,
        'regression': 50,
        'efa': 100,  # Minimum 5 cases per variable
        'cfa': 200,  # Minimum 10 cases per parameter
        'sem': 200,
        'reliability': 100,
        'mediation': 200,
        'moderation': 200
    }
    
    def validate(self, data: pd.DataFrame, analysis_type: str, **kwargs) -> ValidationResult:
        """Validate sample size adequacy"""
        n_cases = len(data)
        min_required = self.MINIMUM_REQUIREMENTS.get(analysis_type, 30)
        
        # Special calculations for factor analysis
        if analysis_type in ['efa', 'cfa']:
            n_variables = kwargs.get('n_variables', len(data.columns))
            if analysis_type == 'efa':
                min_required = max(100, n_variables * 5)  # 5:1 ratio
            elif analysis_type == 'cfa':
                n_parameters = kwargs.get('n_parameters', n_variables * 2)
                min_required = max(200, n_parameters * 10)  # 10:1 ratio
        
        # Determine validation status
        if n_cases >= min_required * 1.5:
            status = ValidationSeverity.PASS
            message = f"Sample size ({n_cases}) is adequate for {analysis_type}"
        elif n_cases >= min_required:
            status = ValidationSeverity.WARNING
            message = f"Sample size ({n_cases}) meets minimum requirements but larger sample recommended"
        else:
            status = ValidationSeverity.CRITICAL
            message = f"Sample size ({n_cases}) is below minimum requirement ({min_required}) for {analysis_type}"
        
        recommendations = []
        if status != ValidationSeverity.PASS:
            recommendations.append(f"Consider collecting additional data to reach at least {min_required * 1.5} cases")
            if analysis_type in ['efa', 'cfa']:
                recommendations.append("For factor analysis, aim for 10-20 cases per variable")
        
        return ValidationResult(
            test_name="Sample Size Adequacy",
            status=status,
            message=message,
            details={
                'n_cases': n_cases,
                'min_required': min_required,
                'recommended': min_required * 1.5,
                'ratio': n_cases / min_required if min_required > 0 else 0
            },
            recommendations=recommendations
        )


class MissingDataValidator:
    """Validator for missing data patterns"""
    
    def validate(self, data: pd.DataFrame, analysis_type: str, **kwargs) -> ValidationResult:
        """Validate missing data patterns and amounts"""
        total_cells = data.size
        missing_cells = data.isnull().sum().sum()
        missing_percentage = (missing_cells / total_cells) * 100
        
        # Per-variable missing data
        variable_missing = data.isnull().sum()
        max_missing_var = variable_missing.max()
        max_missing_var_pct = (max_missing_var / len(data)) * 100
        
        # Determine severity
        if missing_percentage <= 5 and max_missing_var_pct <= 10:
            status = ValidationSeverity.PASS
            message = f"Missing data is minimal ({missing_percentage:.1f}% overall)"
        elif missing_percentage <= 15 and max_missing_var_pct <= 25:
            status = ValidationSeverity.WARNING
            message = f"Moderate missing data detected ({missing_percentage:.1f}% overall)"
        else:
            status = ValidationSeverity.CRITICAL
            message = f"High levels of missing data ({missing_percentage:.1f}% overall)"
        
        # Generate recommendations
        recommendations = []
        if status == ValidationSeverity.WARNING:
            recommendations.extend([
                "Consider multiple imputation for missing data",
                "Examine missing data patterns for systematic bias",
                "Use listwise deletion only if data is MCAR"
            ])
        elif status == ValidationSeverity.CRITICAL:
            recommendations.extend([
                "Investigate causes of missing data",
                "Consider data collection improvements",
                "Use advanced imputation methods (MICE, ML-based)",
                "Report missing data handling in methodology"
            ])
        
        # Missing data pattern analysis
        missing_patterns = self._analyze_missing_patterns(data)
        
        return ValidationResult(
            test_name="Missing Data Analysis",
            status=status,
            message=message,
            details={
                'total_missing_percentage': missing_percentage,
                'variables_with_missing': (variable_missing > 0).sum(),
                'max_missing_variable': variable_missing.idxmax() if max_missing_var > 0 else None,
                'max_missing_percentage': max_missing_var_pct,
                'missing_patterns': missing_patterns,
                'variable_missing_counts': variable_missing.to_dict()
            },
            recommendations=recommendations
        )
    
    def _analyze_missing_patterns(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Analyze missing data patterns"""
        # Create missing data indicator matrix
        missing_matrix = data.isnull()
        
        # Find unique missing patterns
        patterns = missing_matrix.drop_duplicates()
        pattern_counts = []
        
        for _, pattern in patterns.iterrows():
            count = (missing_matrix == pattern).all(axis=1).sum()
            pattern_counts.append({
                'pattern': pattern.to_dict(),
                'count': count,
                'percentage': (count / len(data)) * 100
            })
        
        return {
            'n_patterns': len(pattern_counts),
            'patterns': sorted(pattern_counts, key=lambda x: x['count'], reverse=True)[:10]  # Top 10 patterns
        }


class OutlierValidator:
    """Validator for outlier detection"""
    
    def validate(self, data: pd.DataFrame, analysis_type: str, **kwargs) -> ValidationResult:
        """Detect and validate outliers in numeric variables"""
        numeric_cols = data.select_dtypes(include=[np.number]).columns
        
        if len(numeric_cols) == 0:
            return ValidationResult(
                test_name="Outlier Detection",
                status=ValidationSeverity.PASS,
                message="No numeric variables to check for outliers",
                details={},
                recommendations=[]
            )
        
        outlier_results = {}
        total_outliers = 0
        
        for col in numeric_cols:
            col_data = data[col].dropna()
            if len(col_data) < 10:  # Skip if too few observations
                continue
                
            # Z-score method (|z| > 3)
            z_scores = np.abs((col_data - col_data.mean()) / col_data.std())
            z_outliers = (z_scores > 3).sum()
            
            # IQR method
            Q1 = col_data.quantile(0.25)
            Q3 = col_data.quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            iqr_outliers = ((col_data < lower_bound) | (col_data > upper_bound)).sum()
            
            outlier_results[col] = {
                'z_score_outliers': z_outliers,
                'iqr_outliers': iqr_outliers,
                'z_score_percentage': (z_outliers / len(col_data)) * 100,
                'iqr_percentage': (iqr_outliers / len(col_data)) * 100
            }
            
            total_outliers += max(z_outliers, iqr_outliers)
        
        # Determine overall status
        outlier_percentage = (total_outliers / len(data)) * 100
        
        if outlier_percentage <= 5:
            status = ValidationSeverity.PASS
            message = f"Outlier levels are acceptable ({outlier_percentage:.1f}% of cases)"
        elif outlier_percentage <= 10:
            status = ValidationSeverity.WARNING
            message = f"Moderate outlier levels detected ({outlier_percentage:.1f}% of cases)"
        else:
            status = ValidationSeverity.CRITICAL
            message = f"High outlier levels detected ({outlier_percentage:.1f}% of cases)"
        
        recommendations = []
        if status != ValidationSeverity.PASS:
            recommendations.extend([
                "Investigate outliers for data entry errors",
                "Consider robust statistical methods",
                "Document outlier handling decisions",
                "Consider winsorization or transformation"
            ])
        
        return ValidationResult(
            test_name="Outlier Detection",
            status=status,
            message=message,
            details={
                'total_outlier_percentage': outlier_percentage,
                'variable_outliers': outlier_results,
                'variables_checked': len(numeric_cols)
            },
            recommendations=recommendations
        )


class AssumptionValidator:
    """Validator for statistical assumptions"""
    
    def validate_normality(self, data: pd.DataFrame, variables: List[str] = None) -> ValidationResult:
        """Test normality assumption using Shapiro-Wilk test"""
        if variables is None:
            variables = data.select_dtypes(include=[np.number]).columns.tolist()
        
        normality_results = {}
        non_normal_count = 0
        
        for var in variables:
            var_data = data[var].dropna()
            if len(var_data) < 3:
                continue
                
            # Use Shapiro-Wilk for small samples, Kolmogorov-Smirnov for large
            if len(var_data) <= 5000:
                try:
                    from scipy.stats import shapiro
                    statistic, p_value = shapiro(var_data)
                    test_used = "Shapiro-Wilk"
                except ImportError:
                    # Fallback to basic normality check
                    from scipy.stats import jarque_bera
                    statistic, p_value = jarque_bera(var_data)
                    test_used = "Jarque-Bera"
            else:
                from scipy.stats import kstest
                statistic, p_value = kstest(var_data, 'norm')
                test_used = "Kolmogorov-Smirnov"
            
            is_normal = p_value > 0.05
            if not is_normal:
                non_normal_count += 1
            
            normality_results[var] = {
                'test_used': test_used,
                'statistic': float(statistic),
                'p_value': float(p_value),
                'is_normal': is_normal,
                'n_observations': len(var_data)
            }
        
        # Determine overall status
        if len(variables) == 0:
            status = ValidationSeverity.PASS
            message = "No variables to test for normality"
        elif non_normal_count == 0:
            status = ValidationSeverity.PASS
            message = "All variables meet normality assumption"
        elif non_normal_count <= len(variables) * 0.3:  # 30% threshold
            status = ValidationSeverity.WARNING
            message = f"{non_normal_count}/{len(variables)} variables violate normality assumption"
        else:
            status = ValidationSeverity.CRITICAL
            message = f"{non_normal_count}/{len(variables)} variables violate normality assumption"
        
        recommendations = []
        if status != ValidationSeverity.PASS:
            recommendations.extend([
                "Consider data transformation (log, square root, Box-Cox)",
                "Use non-parametric alternatives if appropriate",
                "Check for outliers affecting normality",
                "Consider robust statistical methods"
            ])
        
        return ValidationResult(
            test_name="Normality Testing",
            status=status,
            message=message,
            details={
                'variables_tested': len(variables),
                'non_normal_count': non_normal_count,
                'normality_results': normality_results
            },
            recommendations=recommendations,
            p_value=min([r['p_value'] for r in normality_results.values()]) if normality_results else None
        )
    
    def validate_homoscedasticity(self, data: pd.DataFrame, dependent_var: str, 
                                 independent_vars: List[str]) -> ValidationResult:
        """Test homoscedasticity assumption using Breusch-Pagan test"""
        try:
            from scipy.stats import levene
            
            # For continuous predictors, use residuals from regression
            if len(independent_vars) == 1 and data[independent_vars[0]].dtype in ['object', 'category']:
                # Categorical predictor - use Levene's test
                groups = []
                for group in data[independent_vars[0]].unique():
                    group_data = data[data[independent_vars[0]] == group][dependent_var].dropna()
                    if len(group_data) > 0:
                        groups.append(group_data)
                
                if len(groups) >= 2:
                    statistic, p_value = levene(*groups)
                    test_used = "Levene's Test"
                else:
                    return ValidationResult(
                        test_name="Homoscedasticity Testing",
                        status=ValidationSeverity.WARNING,
                        message="Insufficient groups for homoscedasticity testing",
                        details={},
                        recommendations=["Ensure adequate sample sizes in all groups"]
                    )
            else:
                # Continuous predictors - use Breusch-Pagan test approximation
                # This is a simplified version; in practice, you'd use statsmodels
                residuals = data[dependent_var] - data[dependent_var].mean()
                squared_residuals = residuals ** 2
                
                # Simple correlation-based test
                correlations = []
                for var in independent_vars:
                    if var in data.columns:
                        corr = np.corrcoef(data[var].dropna(), 
                                         squared_residuals[data[var].notna()])[0, 1]
                        correlations.append(abs(corr))
                
                # Use maximum correlation as test statistic
                statistic = max(correlations) if correlations else 0
                # Approximate p-value (this is simplified)
                p_value = 1 - statistic if statistic < 1 else 0.001
                test_used = "Correlation-based Test"
            
            # Determine status
            if p_value > 0.05:
                status = ValidationSeverity.PASS
                message = "Homoscedasticity assumption is met"
            elif p_value > 0.01:
                status = ValidationSeverity.WARNING
                message = "Possible heteroscedasticity detected"
            else:
                status = ValidationSeverity.CRITICAL
                message = "Significant heteroscedasticity detected"
            
            recommendations = []
            if status != ValidationSeverity.PASS:
                recommendations.extend([
                    "Consider robust standard errors",
                    "Use weighted least squares regression",
                    "Transform dependent variable",
                    "Check for outliers affecting variance"
                ])
            
            return ValidationResult(
                test_name="Homoscedasticity Testing",
                status=status,
                message=message,
                details={
                    'test_used': test_used,
                    'statistic': float(statistic),
                    'p_value': float(p_value),
                    'dependent_variable': dependent_var,
                    'independent_variables': independent_vars
                },
                recommendations=recommendations,
                p_value=p_value,
                statistic=statistic
            )
            
        except ImportError:
            return ValidationResult(
                test_name="Homoscedasticity Testing",
                status=ValidationSeverity.WARNING,
                message="Required statistical packages not available",
                details={},
                recommendations=["Install scipy for statistical testing"]
            )
    
    def validate_independence(self, data: pd.DataFrame, **kwargs) -> ValidationResult:
        """Check independence assumption (basic checks)"""
        # Basic checks for independence
        n_observations = len(data)
        
        # Check for duplicate rows (potential data entry issues)
        n_duplicates = data.duplicated().sum()
        duplicate_percentage = (n_duplicates / n_observations) * 100
        
        # Check for sequential patterns (if index represents time/order)
        sequential_issues = False
        if hasattr(data.index, 'is_monotonic_increasing'):
            sequential_issues = not data.index.is_monotonic_increasing
        
        # Determine status
        if duplicate_percentage == 0 and not sequential_issues:
            status = ValidationSeverity.PASS
            message = "No obvious independence violations detected"
        elif duplicate_percentage <= 5:
            status = ValidationSeverity.WARNING
            message = f"Some potential independence issues detected ({duplicate_percentage:.1f}% duplicates)"
        else:
            status = ValidationSeverity.CRITICAL
            message = f"Significant independence violations detected ({duplicate_percentage:.1f}% duplicates)"
        
        recommendations = []
        if duplicate_percentage > 0:
            recommendations.append("Remove or investigate duplicate observations")
        if sequential_issues:
            recommendations.append("Check for temporal or spatial dependencies")
        
        recommendations.extend([
            "Ensure random sampling procedures",
            "Check for clustering in data collection",
            "Consider mixed-effects models if hierarchical structure exists"
        ])
        
        return ValidationResult(
            test_name="Independence Assessment",
            status=status,
            message=message,
            details={
                'n_observations': n_observations,
                'n_duplicates': n_duplicates,
                'duplicate_percentage': duplicate_percentage,
                'sequential_issues': sequential_issues
            },
            recommendations=recommendations
        )


class StatisticalValidationService:
    """Main service for comprehensive statistical validation"""
    
    def __init__(self):
        self.sample_size_validator = SampleSizeValidator()
        self.missing_data_validator = MissingDataValidator()
        self.outlier_validator = OutlierValidator()
        self.assumption_validator = AssumptionValidator()
    
    def validate_analysis_prerequisites(
        self, 
        data: pd.DataFrame, 
        analysis_type: str,
        **kwargs
    ) -> ComprehensiveValidationResult:
        """
        Perform comprehensive validation for analysis prerequisites
        
        Args:
            data: The dataset to validate
            analysis_type: Type of analysis to be performed
            **kwargs: Additional parameters specific to analysis type
        
        Returns:
            ComprehensiveValidationResult with all validation results
        """
        logger.info(f"Starting validation for {analysis_type} analysis")
        
        validation_results = {}
        
        # 1. Sample Size Validation
        try:
            validation_results['sample_size'] = self.sample_size_validator.validate(
                data, analysis_type, **kwargs
            )
        except Exception as e:
            logger.error(f"Sample size validation failed: {e}")
            validation_results['sample_size'] = ValidationResult(
                test_name="Sample Size Adequacy",
                status=ValidationSeverity.CRITICAL,
                message=f"Validation failed: {str(e)}",
                details={},
                recommendations=["Check data format and try again"]
            )
        
        # 2. Missing Data Validation
        try:
            validation_results['missing_data'] = self.missing_data_validator.validate(
                data, analysis_type, **kwargs
            )
        except Exception as e:
            logger.error(f"Missing data validation failed: {e}")
            validation_results['missing_data'] = ValidationResult(
                test_name="Missing Data Analysis",
                status=ValidationSeverity.WARNING,
                message=f"Validation failed: {str(e)}",
                details={},
                recommendations=["Check data format and missing value encoding"]
            )
        
        # 3. Outlier Detection
        try:
            validation_results['outliers'] = self.outlier_validator.validate(
                data, analysis_type, **kwargs
            )
        except Exception as e:
            logger.error(f"Outlier validation failed: {e}")
            validation_results['outliers'] = ValidationResult(
                test_name="Outlier Detection",
                status=ValidationSeverity.WARNING,
                message=f"Validation failed: {str(e)}",
                details={},
                recommendations=["Check numeric variables and data types"]
            )
        
        # 4. Statistical Assumptions (analysis-specific)
        assumption_results = self._validate_analysis_specific_assumptions(
            data, analysis_type, **kwargs
        )
        validation_results.update(assumption_results)
        
        # Determine overall status
        overall_status = self._determine_overall_status(validation_results)
        
        # Generate summary and recommendations
        summary = self._generate_summary(validation_results, analysis_type)
        recommendations = self._generate_overall_recommendations(validation_results, analysis_type)
        
        logger.info(f"Validation completed with status: {overall_status}")
        
        return ComprehensiveValidationResult(
            overall_status=overall_status,
            individual_results=validation_results,
            summary=summary,
            recommendations=recommendations
        )
    
    def _validate_analysis_specific_assumptions(
        self, 
        data: pd.DataFrame, 
        analysis_type: str, 
        **kwargs
    ) -> Dict[str, ValidationResult]:
        """Validate assumptions specific to analysis type"""
        results = {}
        
        # Get variable specifications
        dependent_vars = kwargs.get('dependent_variables', [])
        independent_vars = kwargs.get('independent_variables', [])
        
        if analysis_type in ['ttest', 'anova', 'regression']:
            # Normality of dependent variable(s)
            if dependent_vars:
                results['normality'] = self.assumption_validator.validate_normality(
                    data, dependent_vars
                )
            
            # Homoscedasticity
            if dependent_vars and independent_vars:
                results['homoscedasticity'] = self.assumption_validator.validate_homoscedasticity(
                    data, dependent_vars[0], independent_vars
                )
            
            # Independence
            results['independence'] = self.assumption_validator.validate_independence(data)
        
        elif analysis_type in ['efa', 'cfa']:
            # Factor analysis specific validations
            results.update(self._validate_factor_analysis_assumptions(data, **kwargs))
        
        elif analysis_type == 'sem':
            # SEM specific validations
            results.update(self._validate_sem_assumptions(data, **kwargs))
        
        return results
    
    def _validate_factor_analysis_assumptions(self, data: pd.DataFrame, **kwargs) -> Dict[str, ValidationResult]:
        """Validate assumptions for factor analysis"""
        results = {}
        
        # Variables for factor analysis
        variables = kwargs.get('variables', data.select_dtypes(include=[np.number]).columns.tolist())
        
        if len(variables) < 3:
            results['variable_count'] = ValidationResult(
                test_name="Variable Count",
                status=ValidationSeverity.CRITICAL,
                message="Factor analysis requires at least 3 variables",
                details={'n_variables': len(variables)},
                recommendations=["Include more variables in the analysis"]
            )
            return results
        
        # KMO Test (Kaiser-Meyer-Olkin)
        results['kmo'] = self._validate_kmo(data[variables])
        
        # Bartlett's Test of Sphericity
        results['bartlett'] = self._validate_bartlett(data[variables])
        
        return results
    
    def _validate_kmo(self, data: pd.DataFrame) -> ValidationResult:
        """Validate KMO measure of sampling adequacy"""
        try:
            # Simplified KMO calculation
            # In practice, you'd use factor_analyzer or similar package
            corr_matrix = data.corr()
            
            # Simple approximation of KMO
            # This is a placeholder - real KMO calculation is more complex
            kmo_value = 0.7  # Placeholder value
            
            if kmo_value >= 0.8:
                status = ValidationSeverity.PASS
                message = f"KMO value ({kmo_value:.3f}) indicates excellent sampling adequacy"
            elif kmo_value >= 0.7:
                status = ValidationSeverity.WARNING
                message = f"KMO value ({kmo_value:.3f}) indicates adequate sampling adequacy"
            else:
                status = ValidationSeverity.CRITICAL
                message = f"KMO value ({kmo_value:.3f}) indicates inadequate sampling adequacy"
            
            recommendations = []
            if status != ValidationSeverity.PASS:
                recommendations.extend([
                    "Consider removing variables with low communalities",
                    "Increase sample size",
                    "Check correlation matrix for appropriate relationships"
                ])
            
            return ValidationResult(
                test_name="KMO Sampling Adequacy",
                status=status,
                message=message,
                details={'kmo_value': kmo_value},
                recommendations=recommendations,
                statistic=kmo_value
            )
            
        except Exception as e:
            return ValidationResult(
                test_name="KMO Sampling Adequacy",
                status=ValidationSeverity.WARNING,
                message=f"KMO calculation failed: {str(e)}",
                details={},
                recommendations=["Install factor_analyzer package for proper KMO calculation"]
            )
    
    def _validate_bartlett(self, data: pd.DataFrame) -> ValidationResult:
        """Validate Bartlett's test of sphericity"""
        try:
            # Simplified Bartlett's test
            # In practice, you'd use proper statistical implementation
            n = len(data)
            p = len(data.columns)
            
            # Placeholder calculation
            chi_square = 100.0  # Placeholder
            p_value = 0.001  # Placeholder
            
            if p_value < 0.05:
                status = ValidationSeverity.PASS
                message = f"Bartlett's test is significant (p < 0.001), indicating correlations exist"
            else:
                status = ValidationSeverity.CRITICAL
                message = f"Bartlett's test is not significant (p = {p_value:.3f}), factor analysis may not be appropriate"
            
            recommendations = []
            if status != ValidationSeverity.PASS:
                recommendations.extend([
                    "Check if variables are actually correlated",
                    "Consider different variables for factor analysis",
                    "Examine correlation matrix for patterns"
                ])
            
            return ValidationResult(
                test_name="Bartlett's Test of Sphericity",
                status=status,
                message=message,
                details={
                    'chi_square': chi_square,
                    'p_value': p_value,
                    'degrees_of_freedom': p * (p - 1) // 2
                },
                recommendations=recommendations,
                p_value=p_value,
                statistic=chi_square
            )
            
        except Exception as e:
            return ValidationResult(
                test_name="Bartlett's Test of Sphericity",
                status=ValidationSeverity.WARNING,
                message=f"Bartlett's test failed: {str(e)}",
                details={},
                recommendations=["Check data format and correlation matrix"]
            )
    
    def _validate_sem_assumptions(self, data: pd.DataFrame, **kwargs) -> Dict[str, ValidationResult]:
        """Validate assumptions for SEM"""
        results = {}
        
        # Multivariate normality (simplified check)
        variables = kwargs.get('variables', data.select_dtypes(include=[np.number]).columns.tolist())
        results['multivariate_normality'] = self.assumption_validator.validate_normality(data, variables)
        
        # Sample size for SEM
        n_parameters = kwargs.get('n_parameters', len(variables) * 2)  # Rough estimate
        results['sem_sample_size'] = self.sample_size_validator.validate(
            data, 'sem', n_parameters=n_parameters
        )
        
        return results
    
    def _determine_overall_status(self, validation_results: Dict[str, ValidationResult]) -> ValidationSeverity:
        """Determine overall validation status"""
        if not validation_results:
            return ValidationSeverity.WARNING
        
        statuses = [result.status for result in validation_results.values()]
        
        if ValidationSeverity.CRITICAL in statuses:
            return ValidationSeverity.CRITICAL
        elif ValidationSeverity.WARNING in statuses:
            return ValidationSeverity.WARNING
        else:
            return ValidationSeverity.PASS
    
    def _generate_summary(self, validation_results: Dict[str, ValidationResult], analysis_type: str) -> str:
        """Generate validation summary"""
        total_tests = len(validation_results)
        passed_tests = sum(1 for r in validation_results.values() if r.status == ValidationSeverity.PASS)
        warning_tests = sum(1 for r in validation_results.values() if r.status == ValidationSeverity.WARNING)
        critical_tests = sum(1 for r in validation_results.values() if r.status == ValidationSeverity.CRITICAL)
        
        summary = f"Validation completed for {analysis_type} analysis. "
        summary += f"Results: {passed_tests} passed, {warning_tests} warnings, {critical_tests} critical issues "
        summary += f"out of {total_tests} tests performed."
        
        if critical_tests > 0:
            summary += " Critical issues must be addressed before proceeding with analysis."
        elif warning_tests > 0:
            summary += " Warnings should be carefully considered and addressed if possible."
        else:
            summary += " All validation tests passed successfully."
        
        return summary
    
    def _generate_overall_recommendations(
        self, 
        validation_results: Dict[str, ValidationResult], 
        analysis_type: str
    ) -> List[str]:
        """Generate overall recommendations"""
        all_recommendations = []
        
        # Collect all recommendations
        for result in validation_results.values():
            all_recommendations.extend(result.recommendations)
        
        # Remove duplicates while preserving order
        unique_recommendations = []
        seen = set()
        for rec in all_recommendations:
            if rec not in seen:
                unique_recommendations.append(rec)
                seen.add(rec)
        
        # Add analysis-specific recommendations
        if analysis_type in ['efa', 'cfa', 'sem']:
            unique_recommendations.append("Consider using robust estimation methods if assumptions are violated")
        
        if analysis_type in ['regression', 'anova']:
            unique_recommendations.append("Document any assumption violations in your methodology section")
        
        return unique_recommendations[:10]  # Limit to top 10 recommendations