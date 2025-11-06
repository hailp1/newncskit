"""
Result Interpretation Service for Advanced Data Analysis System

This service provides context-aware interpretation of statistical results
with academic standards and research methodology integration.
"""

import logging
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class InterpretationContext:
    """Context for result interpretation"""
    analysis_type: str
    research_context: Dict[str, Any]
    validation_results: Any
    sample_size: int
    effect_sizes: Dict[str, float]


class ResultInterpretationService:
    """Service for generating comprehensive result interpretations"""
    
    def __init__(self):
        self.effect_size_thresholds = {
            'small': 0.2,
            'medium': 0.5,
            'large': 0.8
        }
        
        self.significance_levels = {
            'highly_significant': 0.001,
            'significant': 0.01,
            'marginally_significant': 0.05,
            'not_significant': 1.0
        }
    
    async def interpret_results(
        self, 
        statistical_results: Dict[str, Any],
        analysis_type: str,
        research_context: Dict[str, Any],
        validation_results: Any
    ) -> Dict[str, str]:
        """
        Generate comprehensive interpretations for statistical results
        
        Args:
            statistical_results: Raw statistical output
            analysis_type: Type of analysis performed
            research_context: Research methodology context
            validation_results: Validation results
            
        Returns:
            Dictionary with different types of interpretations
        """
        
        context = InterpretationContext(
            analysis_type=analysis_type,
            research_context=research_context,
            validation_results=validation_results,
            sample_size=self._extract_sample_size(statistical_results),
            effect_sizes=self._calculate_effect_sizes(statistical_results, analysis_type)
        )
        
        interpretations = {
            'statistical': await self._generate_statistical_interpretation(statistical_results, context),
            'practical': await self._generate_practical_interpretation(statistical_results, context),
            'methodological': await self._generate_methodological_interpretation(statistical_results, context),
            'limitations': await self._generate_limitations_discussion(statistical_results, context),
            'academic': await self._generate_academic_interpretation(statistical_results, context)
        }
        
        return interpretations
    
    async def _generate_statistical_interpretation(
        self, 
        results: Dict[str, Any], 
        context: InterpretationContext
    ) -> str:
        """Generate statistical interpretation"""
        
        interpretation_methods = {
            'descriptive': self._interpret_descriptive_statistics,
            'reliability': self._interpret_reliability_analysis,
            'efa': self._interpret_factor_analysis,
            'cfa': self._interpret_confirmatory_factor_analysis,
            'sem': self._interpret_structural_equation_model,
            'regression': self._interpret_regression_analysis,
            'anova': self._interpret_anova_results,
            'ttest': self._interpret_ttest_results,
            'correlation': self._interpret_correlation_analysis,
            'mediation': self._interpret_mediation_analysis,
            'moderation': self._interpret_moderation_analysis
        }
        
        interpreter = interpretation_methods.get(context.analysis_type)
        if interpreter:
            return interpreter(results, context)
        else:
            return f"Statistical interpretation for {context.analysis_type} analysis completed."
    
    def _interpret_descriptive_statistics(self, results: Dict[str, Any], context: InterpretationContext) -> str:
        """Interpret descriptive statistics"""
        interpretation = []
        
        # Sample characteristics
        interpretation.append(f"Descriptive analysis was conducted on a sample of {context.sample_size} participants.")
        
        # Variable summaries
        descriptive_stats = results.get('descriptive', {})
        for variable, stats in descriptive_stats.items():
            if isinstance(stats, dict):
                mean = stats.get('mean')
                sd = stats.get('sd')
                if mean is not None and sd is not None:
                    interpretation.append(
                        f"{variable}: M = {mean:.2f}, SD = {sd:.2f}"
                    )
        
        # Correlation highlights
        correlations = results.get('correlation', {})
        if correlations:
            strong_correlations = []
            correlation_matrix = correlations.get('matrix', {})
            for var1, row in correlation_matrix.items():
                if isinstance(row, dict):
                    for var2, corr in row.items():
                        if var1 != var2 and isinstance(corr, (int, float)) and abs(corr) > 0.5:
                            strong_correlations.append(f"{var1} and {var2} (r = {corr:.3f})")
            
            if strong_correlations:
                interpretation.append(
                    f"Strong correlations were observed between: {', '.join(strong_correlations[:3])}"
                )
        
        return '. '.join(interpretation) + '.'
    
    def _interpret_reliability_analysis(self, results: Dict[str, Any], context: InterpretationContext) -> str:
        """Interpret reliability analysis results"""
        interpretation = []
        
        interpretation.append(f"Reliability analysis was conducted on {len(results)} scale(s).")
        
        for scale_name, scale_results in results.items():
            if isinstance(scale_results, dict):
                alpha = scale_results.get('cronbach_alpha')
                n_items = scale_results.get('n_items')
                
                if alpha is not None:
                    reliability_level = self._assess_reliability_level(alpha)
                    interpretation.append(
                        f"The {scale_name} scale ({n_items} items) demonstrated {reliability_level} "
                        f"internal consistency (Cronbach's α = {alpha:.3f})"
                    )
        
        return '. '.join(interpretation) + '.'
    
    def _interpret_factor_analysis(self, results: Dict[str, Any], context: InterpretationContext) -> str:
        """Interpret exploratory factor analysis"""
        interpretation = []
        
        n_factors = results.get('n_factors', 0)
        kmo = results.get('kmo', 0)
        bartlett_p = results.get('bartlett_p', 1)
        
        # Sampling adequacy
        kmo_assessment = self._assess_kmo_value(kmo)
        interpretation.append(f"The Kaiser-Meyer-Olkin measure ({kmo:.3f}) indicated {kmo_assessment} sampling adequacy")
        
        # Sphericity
        if bartlett_p < 0.001:
            interpretation.append("Bartlett's test of sphericity was significant (p < .001), supporting the factorability of the correlation matrix")
        
        # Factor extraction
        interpretation.append(f"Exploratory factor analysis extracted {n_factors} factors")
        
        # Variance explained
        variance_explained = results.get('variance_explained', {})
        if 'cumulative' in variance_explained:
            total_variance = variance_explained['cumulative'][-1] if variance_explained['cumulative'] else 0
            interpretation.append(f"explaining {total_variance:.1f}% of the total variance")
        
        return '. '.join(interpretation) + '.'
    
    def _interpret_confirmatory_factor_analysis(self, results: Dict[str, Any], context: InterpretationContext) -> str:
        """Interpret confirmatory factor analysis"""
        interpretation = []
        
        fit_indices = results.get('fit_indices', {})
        
        interpretation.append("Confirmatory factor analysis was conducted to test the proposed measurement model.")
        
        # Model fit assessment
        fit_assessment = self._assess_model_fit(fit_indices)
        interpretation.append(f"The model demonstrated {fit_assessment['overall']} fit to the data")
        
        # Specific fit indices
        fit_details = []
        if 'cfi' in fit_indices:
            fit_details.append(f"CFI = {fit_indices['cfi']:.3f}")
        if 'tli' in fit_indices:
            fit_details.append(f"TLI = {fit_indices['tli']:.3f}")
        if 'rmsea' in fit_indices:
            fit_details.append(f"RMSEA = {fit_indices['rmsea']:.3f}")
        if 'srmr' in fit_indices:
            fit_details.append(f"SRMR = {fit_indices['srmr']:.3f}")
        
        if fit_details:
            interpretation.append(f"({', '.join(fit_details)})")
        
        return '. '.join(interpretation) + '.'
    
    def _interpret_structural_equation_model(self, results: Dict[str, Any], context: InterpretationContext) -> str:
        """Interpret structural equation modeling results"""
        interpretation = []
        
        interpretation.append("Structural equation modeling was used to test the hypothesized relationships.")
        
        # Model fit
        fit_indices = results.get('fit_indices', {})
        fit_assessment = self._assess_model_fit(fit_indices)
        interpretation.append(f"The structural model showed {fit_assessment['overall']} fit")
        
        # Path coefficients
        parameter_estimates = results.get('parameter_estimates', [])
        significant_paths = []
        
        for param in parameter_estimates:
            if isinstance(param, dict) and param.get('op') == '~':
                p_value = param.get('pvalue', 1)
                estimate = param.get('est', 0)
                if p_value < 0.05:
                    significance = self._get_significance_stars(p_value)
                    significant_paths.append(
                        f"{param.get('lhs')} ← {param.get('rhs')} (β = {estimate:.3f}{significance})"
                    )
        
        if significant_paths:
            interpretation.append(f"Significant paths included: {', '.join(significant_paths[:3])}")
        
        return '. '.join(interpretation) + '.'
    
    def _interpret_regression_analysis(self, results: Dict[str, Any], context: InterpretationContext) -> str:
        """Interpret regression analysis"""
        interpretation = []
        
        r_squared = results.get('r_squared', 0)
        adj_r_squared = results.get('adj_r_squared', 0)
        f_statistic = results.get('f_statistic', 0)
        f_p_value = results.get('f_p_value', 1)
        
        # Overall model
        if f_p_value < 0.05:
            interpretation.append(f"The regression model was statistically significant (F = {f_statistic:.2f}, p < .05)")
        else:
            interpretation.append(f"The regression model was not statistically significant (F = {f_statistic:.2f}, p = {f_p_value:.3f})")
        
        # Variance explained
        interpretation.append(f"explaining {r_squared*100:.1f}% of the variance (R² = {r_squared:.3f}, adjusted R² = {adj_r_squared:.3f})")
        
        # Significant predictors
        coefficients = results.get('coefficients', {})
        significant_predictors = []
        
        for predictor, coef_data in coefficients.items():
            if isinstance(coef_data, dict):
                p_value = coef_data.get('p_value', 1)
                beta = coef_data.get('beta', 0)
                if p_value < 0.05:
                    significance = self._get_significance_stars(p_value)
                    significant_predictors.append(f"{predictor} (β = {beta:.3f}{significance})")
        
        if significant_predictors:
            interpretation.append(f"Significant predictors included: {', '.join(significant_predictors)}")
        
        return '. '.join(interpretation) + '.'
    
    def _interpret_anova_results(self, results: Dict[str, Any], context: InterpretationContext) -> str:
        """Interpret ANOVA results"""
        interpretation = []
        
        anova_table = results.get('anova_table', {})
        
        interpretation.append("Analysis of variance was conducted to test group differences.")
        
        # Main effects
        for effect, effect_data in anova_table.items():
            if isinstance(effect_data, dict):
                f_value = effect_data.get('F', 0)
                p_value = effect_data.get('p_value', 1)
                eta_squared = effect_data.get('eta_squared', 0)
                
                if p_value < 0.05:
                    effect_size_interpretation = self._interpret_eta_squared(eta_squared)
                    significance = self._get_significance_stars(p_value)
                    interpretation.append(
                        f"A significant main effect was found for {effect} "
                        f"(F = {f_value:.2f}, p {significance}, η² = {eta_squared:.3f}, {effect_size_interpretation})"
                    )
        
        return '. '.join(interpretation) + '.'
    
    def _interpret_ttest_results(self, results: Dict[str, Any], context: InterpretationContext) -> str:
        """Interpret t-test results"""
        interpretation = []
        
        t_statistic = results.get('t_statistic', 0)
        p_value = results.get('p_value', 1)
        cohens_d = results.get('cohens_d', 0)
        mean_difference = results.get('mean_difference', 0)
        
        # Significance
        if p_value < 0.05:
            significance = self._get_significance_stars(p_value)
            effect_size_interpretation = self._interpret_cohens_d(cohens_d)
            interpretation.append(
                f"A significant difference was found (t = {t_statistic:.2f}, p {significance}, "
                f"d = {cohens_d:.3f}, {effect_size_interpretation})"
            )
        else:
            interpretation.append(
                f"No significant difference was found (t = {t_statistic:.2f}, p = {p_value:.3f})"
            )
        
        # Mean difference
        interpretation.append(f"The mean difference was {mean_difference:.2f}")
        
        return '. '.join(interpretation) + '.'
    
    def _interpret_correlation_analysis(self, results: Dict[str, Any], context: InterpretationContext) -> str:
        """Interpret correlation analysis"""
        interpretation = []
        
        correlation_matrix = results.get('correlation_matrix', {})
        
        interpretation.append("Correlation analysis examined relationships between variables.")
        
        # Significant correlations
        significant_correlations = []
        for var1, row in correlation_matrix.items():
            if isinstance(row, dict):
                for var2, corr_data in row.items():
                    if var1 != var2 and isinstance(corr_data, dict):
                        r = corr_data.get('correlation', 0)
                        p = corr_data.get('p_value', 1)
                        if p < 0.05 and abs(r) > 0.3:  # Medium effect size threshold
                            strength = self._interpret_correlation_strength(abs(r))
                            significance = self._get_significance_stars(p)
                            significant_correlations.append(
                                f"{var1} and {var2} showed a {strength} correlation (r = {r:.3f}{significance})"
                            )
        
        if significant_correlations:
            interpretation.extend(significant_correlations[:3])  # Limit to top 3
        
        return '. '.join(interpretation) + '.'
    
    def _interpret_mediation_analysis(self, results: Dict[str, Any], context: InterpretationContext) -> str:
        """Interpret mediation analysis"""
        interpretation = []
        
        interpretation.append("Mediation analysis examined indirect effects through the proposed mediator.")
        
        # Direct and indirect effects
        direct_effect = results.get('direct_effect', {})
        indirect_effect = results.get('indirect_effect', {})
        
        if isinstance(indirect_effect, dict):
            estimate = indirect_effect.get('estimate', 0)
            ci_lower = indirect_effect.get('ci_lower', 0)
            ci_upper = indirect_effect.get('ci_upper', 0)
            
            if ci_lower > 0 or ci_upper < 0:  # CI doesn't include zero
                interpretation.append(
                    f"The indirect effect was significant (β = {estimate:.3f}, "
                    f"95% CI [{ci_lower:.3f}, {ci_upper:.3f}])"
                )
            else:
                interpretation.append("The indirect effect was not significant")
        
        return '. '.join(interpretation) + '.'
    
    def _interpret_moderation_analysis(self, results: Dict[str, Any], context: InterpretationContext) -> str:
        """Interpret moderation analysis"""
        interpretation = []
        
        interpretation.append("Moderation analysis examined the interaction effect.")
        
        interaction_effect = results.get('interaction_effect', {})
        if isinstance(interaction_effect, dict):
            beta = interaction_effect.get('beta', 0)
            p_value = interaction_effect.get('p_value', 1)
            
            if p_value < 0.05:
                significance = self._get_significance_stars(p_value)
                interpretation.append(
                    f"The interaction effect was significant (β = {beta:.3f}{significance})"
                )
            else:
                interpretation.append("The interaction effect was not significant")
        
        return '. '.join(interpretation) + '.'
    
    async def _generate_practical_interpretation(
        self, 
        results: Dict[str, Any], 
        context: InterpretationContext
    ) -> str:
        """Generate practical significance interpretation"""
        
        interpretation = []
        
        # Effect size interpretation
        for effect_name, effect_size in context.effect_sizes.items():
            practical_significance = self._assess_practical_significance(effect_size, context.analysis_type)
            interpretation.append(f"{effect_name}: {practical_significance}")
        
        # Sample size considerations
        if context.sample_size < 100:
            interpretation.append("The relatively small sample size suggests caution in generalizing results.")
        elif context.sample_size > 1000:
            interpretation.append("The large sample size provides good statistical power for detecting effects.")
        
        # Research context integration
        research_domain = context.research_context.get('domain', '')
        if research_domain:
            interpretation.append(f"In the context of {research_domain} research, these findings suggest...")
        
        return ' '.join(interpretation) if interpretation else "Practical significance should be evaluated in the context of the research domain and existing literature."
    
    async def _generate_methodological_interpretation(
        self, 
        results: Dict[str, Any], 
        context: InterpretationContext
    ) -> str:
        """Generate methodological interpretation"""
        
        interpretation = []
        
        # Validation results integration
        if hasattr(context.validation_results, 'overall_status'):
            if context.validation_results.overall_status.value == 'pass':
                interpretation.append("All statistical assumptions were adequately met.")
            elif context.validation_results.overall_status.value == 'warning':
                interpretation.append("Some statistical assumptions showed minor violations that should be considered when interpreting results.")
            else:
                interpretation.append("Several statistical assumptions were violated, which may affect the reliability of the results.")
        
        # Analysis-specific methodological notes
        if context.analysis_type in ['efa', 'cfa', 'sem']:
            interpretation.append("The factor analytic approach provides evidence for the underlying structure of the measured constructs.")
        elif context.analysis_type == 'regression':
            interpretation.append("The regression approach allows for examination of predictive relationships while controlling for other variables.")
        
        return ' '.join(interpretation) if interpretation else "The analytical approach was appropriate for addressing the research questions."
    
    async def _generate_limitations_discussion(
        self, 
        results: Dict[str, Any], 
        context: InterpretationContext
    ) -> str:
        """Generate limitations discussion"""
        
        limitations = []
        
        # Sample size limitations
        if context.sample_size < 200:
            limitations.append("The sample size may limit the generalizability of findings.")
        
        # Validation-based limitations
        if hasattr(context.validation_results, 'individual_results'):
            validation_issues = context.validation_results.individual_results
            
            if 'normality' in validation_issues and validation_issues['normality'].status.value != 'pass':
                limitations.append("Violations of normality assumptions may affect the accuracy of significance tests.")
            
            if 'outliers' in validation_issues and validation_issues['outliers'].status.value == 'critical':
                limitations.append("The presence of outliers may have influenced the results.")
        
        # Analysis-specific limitations
        if context.analysis_type == 'correlation':
            limitations.append("Correlation analysis cannot establish causal relationships.")
        elif context.analysis_type in ['efa', 'cfa']:
            limitations.append("Factor analysis results may be influenced by the specific variables included in the analysis.")
        
        # General limitations
        limitations.extend([
            "Cross-sectional data limits causal inferences.",
            "Self-report measures may be subject to response bias.",
            "Results should be replicated in independent samples."
        ])
        
        return ' '.join(limitations[:5])  # Limit to top 5 limitations
    
    async def _generate_academic_interpretation(
        self, 
        results: Dict[str, Any], 
        context: InterpretationContext
    ) -> str:
        """Generate academic-style interpretation with proper reporting"""
        
        interpretation = []
        
        # Theoretical framework integration
        theoretical_framework = context.research_context.get('theoretical_framework', {})
        if theoretical_framework:
            framework_name = theoretical_framework.get('name', '')
            if framework_name:
                interpretation.append(f"These findings provide support for {framework_name} theory.")
        
        # Hypothesis testing results
        hypotheses = context.research_context.get('hypotheses', [])
        if hypotheses:
            interpretation.append("Hypothesis testing results:")
            for i, hypothesis in enumerate(hypotheses[:3], 1):  # Limit to first 3
                # This would need to be matched with actual results
                interpretation.append(f"H{i}: {hypothesis} - [Result would be determined from statistical output]")
        
        # Literature integration suggestions
        interpretation.append("These results should be interpreted in light of previous research in this area.")
        
        # Future research directions
        interpretation.append("Future research should consider longitudinal designs to establish temporal relationships.")
        
        return ' '.join(interpretation) if interpretation else "Results contribute to the understanding of the research domain."
    
    # Helper methods for interpretation
    
    def _extract_sample_size(self, results: Dict[str, Any]) -> int:
        """Extract sample size from results"""
        # Try various common locations for sample size
        n = results.get('n', results.get('sample_size', results.get('n_observations', 0)))
        
        # If not found, try to extract from descriptive stats
        if n == 0:
            descriptive = results.get('descriptive', {})
            if descriptive:
                first_var = next(iter(descriptive.values()), {})
                if isinstance(first_var, dict):
                    n = first_var.get('n', 0)
        
        return int(n) if n else 0
    
    def _calculate_effect_sizes(self, results: Dict[str, Any], analysis_type: str) -> Dict[str, float]:
        """Calculate or extract effect sizes"""
        effect_sizes = {}
        
        if analysis_type == 'ttest':
            cohens_d = results.get('cohens_d', 0)
            effect_sizes['Cohen\'s d'] = cohens_d
        
        elif analysis_type == 'anova':
            eta_squared = results.get('eta_squared', {})
            if isinstance(eta_squared, dict):
                effect_sizes.update(eta_squared)
        
        elif analysis_type == 'regression':
            r_squared = results.get('r_squared', 0)
            effect_sizes['R²'] = r_squared
        
        elif analysis_type == 'correlation':
            # Extract correlation coefficients as effect sizes
            correlations = results.get('correlation_matrix', {})
            for var1, row in correlations.items():
                if isinstance(row, dict):
                    for var2, corr_data in row.items():
                        if var1 != var2 and isinstance(corr_data, dict):
                            r = corr_data.get('correlation', 0)
                            effect_sizes[f'{var1}-{var2}'] = abs(r)
        
        return effect_sizes
    
    def _assess_reliability_level(self, alpha: float) -> str:
        """Assess reliability level based on Cronbach's alpha"""
        if alpha >= 0.9:
            return "excellent"
        elif alpha >= 0.8:
            return "good"
        elif alpha >= 0.7:
            return "acceptable"
        elif alpha >= 0.6:
            return "questionable"
        else:
            return "poor"
    
    def _assess_kmo_value(self, kmo: float) -> str:
        """Assess KMO value"""
        if kmo >= 0.9:
            return "marvelous"
        elif kmo >= 0.8:
            return "meritorious"
        elif kmo >= 0.7:
            return "middling"
        elif kmo >= 0.6:
            return "mediocre"
        elif kmo >= 0.5:
            return "miserable"
        else:
            return "unacceptable"
    
    def _assess_model_fit(self, fit_indices: Dict[str, float]) -> Dict[str, str]:
        """Assess overall model fit"""
        fit_assessment = {'overall': 'poor', 'details': []}
        
        good_fit_count = 0
        total_indices = 0
        
        if 'cfi' in fit_indices:
            total_indices += 1
            if fit_indices['cfi'] >= 0.95:
                good_fit_count += 1
                fit_assessment['details'].append('excellent CFI')
            elif fit_indices['cfi'] >= 0.90:
                fit_assessment['details'].append('acceptable CFI')
        
        if 'rmsea' in fit_indices:
            total_indices += 1
            if fit_indices['rmsea'] <= 0.05:
                good_fit_count += 1
                fit_assessment['details'].append('excellent RMSEA')
            elif fit_indices['rmsea'] <= 0.08:
                fit_assessment['details'].append('acceptable RMSEA')
        
        if 'srmr' in fit_indices:
            total_indices += 1
            if fit_indices['srmr'] <= 0.05:
                good_fit_count += 1
                fit_assessment['details'].append('excellent SRMR')
            elif fit_indices['srmr'] <= 0.08:
                fit_assessment['details'].append('acceptable SRMR')
        
        # Determine overall fit
        if total_indices > 0:
            fit_ratio = good_fit_count / total_indices
            if fit_ratio >= 0.75:
                fit_assessment['overall'] = 'excellent'
            elif fit_ratio >= 0.5:
                fit_assessment['overall'] = 'acceptable'
            else:
                fit_assessment['overall'] = 'poor'
        
        return fit_assessment
    
    def _get_significance_stars(self, p_value: float) -> str:
        """Get significance stars based on p-value"""
        if p_value < 0.001:
            return "***"
        elif p_value < 0.01:
            return "**"
        elif p_value < 0.05:
            return "*"
        else:
            return ""
    
    def _interpret_eta_squared(self, eta_squared: float) -> str:
        """Interpret eta squared effect size"""
        if eta_squared >= 0.14:
            return "large effect"
        elif eta_squared >= 0.06:
            return "medium effect"
        elif eta_squared >= 0.01:
            return "small effect"
        else:
            return "negligible effect"
    
    def _interpret_cohens_d(self, cohens_d: float) -> str:
        """Interpret Cohen's d effect size"""
        d = abs(cohens_d)
        if d >= 0.8:
            return "large effect"
        elif d >= 0.5:
            return "medium effect"
        elif d >= 0.2:
            return "small effect"
        else:
            return "negligible effect"
    
    def _interpret_correlation_strength(self, r: float) -> str:
        """Interpret correlation strength"""
        if r >= 0.7:
            return "strong"
        elif r >= 0.5:
            return "moderate"
        elif r >= 0.3:
            return "weak"
        else:
            return "negligible"
    
    def _assess_practical_significance(self, effect_size: float, analysis_type: str) -> str:
        """Assess practical significance of effect size"""
        
        # Different thresholds for different analysis types
        if analysis_type in ['ttest', 'anova']:
            # Cohen's d or eta-squared
            if effect_size >= 0.8:
                return "The large effect size suggests strong practical significance."
            elif effect_size >= 0.5:
                return "The medium effect size suggests moderate practical significance."
            elif effect_size >= 0.2:
                return "The small effect size suggests limited practical significance."
            else:
                return "The negligible effect size suggests minimal practical significance."
        
        elif analysis_type == 'regression':
            # R-squared
            if effect_size >= 0.25:
                return "The large proportion of variance explained suggests strong practical utility."
            elif effect_size >= 0.09:
                return "The moderate proportion of variance explained suggests some practical utility."
            elif effect_size >= 0.01:
                return "The small proportion of variance explained suggests limited practical utility."
            else:
                return "The minimal variance explained suggests little practical utility."
        
        elif analysis_type == 'correlation':
            # Correlation coefficient
            if effect_size >= 0.5:
                return "The strong correlation suggests substantial practical relationship."
            elif effect_size >= 0.3:
                return "The moderate correlation suggests meaningful practical relationship."
            elif effect_size >= 0.1:
                return "The weak correlation suggests limited practical relationship."
            else:
                return "The negligible correlation suggests minimal practical relationship."
        
        else:
            return "Practical significance should be evaluated based on domain-specific criteria."