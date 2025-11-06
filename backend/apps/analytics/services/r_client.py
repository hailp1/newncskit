"""
R Analysis Client for Advanced Data Analysis System

This service provides interface to the R statistical computing backend.
"""

import asyncio
import aiohttp
import json
import logging
from typing import Dict, List, Any, Optional
from django.conf import settings

logger = logging.getLogger(__name__)


class RAnalysisClient:
    """Client for communicating with R analysis server"""
    
    def __init__(self):
        self.base_url = getattr(settings, 'R_ANALYSIS_URL', 'http://localhost:8000')
        self.timeout = getattr(settings, 'R_ANALYSIS_TIMEOUT', 300)  # 5 minutes
        self.session = None
    
    async def _get_session(self):
        """Get or create aiohttp session"""
        if self.session is None or self.session.closed:
            timeout = aiohttp.ClientTimeout(total=self.timeout)
            self.session = aiohttp.ClientSession(timeout=timeout)
        return self.session
    
    async def _make_request(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make request to R analysis server"""
        session = await self._get_session()
        url = f"{self.base_url}{endpoint}"
        
        try:
            async with session.post(url, json=data) as response:
                if response.status == 200:
                    result = await response.json()
                    if result.get('status') == 'success':
                        return result
                    else:
                        raise Exception(f"R analysis error: {result.get('message', 'Unknown error')}")
                else:
                    error_text = await response.text()
                    raise Exception(f"HTTP {response.status}: {error_text}")
        
        except asyncio.TimeoutError:
            raise Exception("R analysis timeout - analysis took too long to complete")
        except Exception as e:
            logger.error(f"R analysis request failed: {str(e)}")
            raise
    
    async def descriptive_analysis(
        self, 
        data: List[List[Any]], 
        variables: Dict[str, List[str]], 
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Perform descriptive statistical analysis"""
        
        request_data = {
            'data': data,
            'variables': {
                'numeric': variables.get('numeric', []),
                'categorical': variables.get('categorical', [])
            }
        }
        
        return await self._make_request('/analysis/descriptive', request_data)
    
    async def reliability_analysis(
        self, 
        data: List[List[Any]], 
        variables: Dict[str, List[str]], 
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Perform reliability analysis"""
        
        # Extract scales from variables or parameters
        scales = parameters.get('scales', {})
        if not scales and 'constructs' in variables:
            scales = variables['constructs']
        
        request_data = {
            'data': data,
            'scales': scales
        }
        
        return await self._make_request('/analysis/reliability', request_data)
    
    async def exploratory_factor_analysis(
        self, 
        data: List[List[Any]], 
        variables: Dict[str, List[str]], 
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Perform exploratory factor analysis"""
        
        request_data = {
            'data': data,
            'variables': variables.get('all', variables.get('numeric', [])),
            'n_factors': parameters.get('n_factors'),
            'rotation': parameters.get('rotation', 'varimax')
        }
        
        return await self._make_request('/analysis/efa', request_data)
    
    async def confirmatory_factor_analysis(
        self, 
        data: List[List[Any]], 
        variables: Dict[str, List[str]], 
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Perform confirmatory factor analysis"""
        
        model_syntax = parameters.get('model_syntax', '')
        if not model_syntax:
            # Generate basic CFA syntax from constructs
            constructs = variables.get('constructs', {})
            syntax_lines = []
            for construct, items in constructs.items():
                syntax_lines.append(f"{construct} =~ {' + '.join(items)}")
            model_syntax = '\n'.join(syntax_lines)
        
        request_data = {
            'data': data,
            'model_syntax': model_syntax
        }
        
        return await self._make_request('/analysis/cfa', request_data)
    
    async def structural_equation_modeling(
        self, 
        data: List[List[Any]], 
        variables: Dict[str, List[str]], 
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Perform structural equation modeling"""
        
        model_syntax = parameters.get('model_syntax', '')
        
        request_data = {
            'data': data,
            'model_syntax': model_syntax
        }
        
        return await self._make_request('/analysis/sem', request_data)
    
    async def regression_analysis(
        self, 
        data: List[List[Any]], 
        variables: Dict[str, List[str]], 
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Perform regression analysis"""
        
        dependent = variables.get('dependent', [])
        independent = variables.get('independent', [])
        
        if not dependent or not independent:
            raise ValueError("Regression requires dependent and independent variables")
        
        # Create formula
        formula = f"{dependent[0]} ~ {' + '.join(independent)}"
        
        request_data = {
            'data': data,
            'formula': formula,
            'robust': parameters.get('robust', False)
        }
        
        return await self._make_request('/analysis/linear-regression', request_data)
    
    async def anova_analysis(
        self, 
        data: List[List[Any]], 
        variables: Dict[str, List[str]], 
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Perform ANOVA analysis"""
        
        dependent = variables.get('dependent', [])
        independent = variables.get('independent', [])
        
        if not dependent or not independent:
            raise ValueError("ANOVA requires dependent and independent variables")
        
        request_data = {
            'data': data,
            'dependent': dependent[0],
            'independent': independent
        }
        
        return await self._make_request('/analysis/anova', request_data)
    
    async def ttest_analysis(
        self, 
        data: List[List[Any]], 
        variables: Dict[str, List[str]], 
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Perform t-test analysis"""
        
        dependent = variables.get('dependent', [])
        independent = variables.get('independent', [])
        
        if not dependent:
            raise ValueError("T-test requires dependent variable")
        
        request_data = {
            'data': data,
            'dependent': dependent[0],
            'independent': independent[0] if independent else None,
            'test_type': parameters.get('test_type', 'independent')
        }
        
        return await self._make_request('/analysis/ttest', request_data)
    
    async def correlation_analysis(
        self, 
        data: List[List[Any]], 
        variables: Dict[str, List[str]], 
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Perform correlation analysis"""
        
        request_data = {
            'data': data,
            'variables': variables.get('numeric', []),
            'method': parameters.get('method', 'pearson')
        }
        
        return await self._make_request('/analysis/correlation', request_data)
    
    async def mediation_analysis(
        self, 
        data: List[List[Any]], 
        variables: Dict[str, List[str]], 
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Perform mediation analysis"""
        
        x = variables.get('independent', [])
        m = variables.get('mediator', [])
        y = variables.get('dependent', [])
        
        if not all([x, m, y]):
            raise ValueError("Mediation requires independent, mediator, and dependent variables")
        
        request_data = {
            'data': data,
            'x': x[0],
            'm': m[0],
            'y': y[0],
            'covariates': variables.get('control', [])
        }
        
        return await self._make_request('/analysis/mediation', request_data)
    
    async def moderation_analysis(
        self, 
        data: List[List[Any]], 
        variables: Dict[str, List[str]], 
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Perform moderation analysis"""
        
        dependent = variables.get('dependent', [])
        independent = variables.get('independent', [])
        moderator = variables.get('moderator', [])
        
        if not all([dependent, independent, moderator]):
            raise ValueError("Moderation requires dependent, independent, and moderator variables")
        
        # Create interaction formula
        formula = f"{dependent[0]} ~ {independent[0]} * {moderator[0]}"
        
        request_data = {
            'data': data,
            'formula': formula
        }
        
        return await self._make_request('/analysis/linear-regression', request_data)
    
    async def cancel_analysis(self, analysis_id: str) -> bool:
        """Cancel running analysis"""
        try:
            # This would need to be implemented in the R server
            # For now, just return True
            return True
        except Exception as e:
            logger.error(f"Failed to cancel analysis {analysis_id}: {str(e)}")
            return False
    
    async def close(self):
        """Close the client session"""
        if self.session and not self.session.closed:
            await self.session.close()