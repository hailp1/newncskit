from django.core.exceptions import ValidationError
from django.core.validators import validate_email
import json
import re


class ConfigurationValidator:
    """Validator for system configuration values"""
    
    @staticmethod
    def validate_config_value(data_type, value, validation_rules=None):
        """Validate configuration value based on data type and rules"""
        validation_rules = validation_rules or {}
        
        # Type validation
        if data_type == 'string':
            if not isinstance(value, str):
                raise ValidationError("Value must be a string")
            
            # String-specific validations
            min_length = validation_rules.get('min_length')
            max_length = validation_rules.get('max_length')
            pattern = validation_rules.get('pattern')
            
            if min_length and len(value) < min_length:
                raise ValidationError(f"String must be at least {min_length} characters")
            
            if max_length and len(value) > max_length:
                raise ValidationError(f"String must be at most {max_length} characters")
            
            if pattern and not re.match(pattern, value):
                raise ValidationError(f"String must match pattern: {pattern}")
        
        elif data_type == 'integer':
            if not isinstance(value, int):
                raise ValidationError("Value must be an integer")
            
            # Integer-specific validations
            min_value = validation_rules.get('min_value')
            max_value = validation_rules.get('max_value')
            
            if min_value is not None and value < min_value:
                raise ValidationError(f"Value must be at least {min_value}")
            
            if max_value is not None and value > max_value:
                raise ValidationError(f"Value must be at most {max_value}")
        
        elif data_type == 'float':
            if not isinstance(value, (int, float)):
                raise ValidationError("Value must be a number")
            
            # Float-specific validations
            min_value = validation_rules.get('min_value')
            max_value = validation_rules.get('max_value')
            
            if min_value is not None and value < min_value:
                raise ValidationError(f"Value must be at least {min_value}")
            
            if max_value is not None and value > max_value:
                raise ValidationError(f"Value must be at most {max_value}")
        
        elif data_type == 'boolean':
            if not isinstance(value, bool):
                raise ValidationError("Value must be a boolean")
        
        elif data_type == 'json':
            if not isinstance(value, (dict, list)):
                raise ValidationError("Value must be a JSON object or array")
        
        elif data_type == 'array':
            if not isinstance(value, list):
                raise ValidationError("Value must be an array")
            
            # Array-specific validations
            min_items = validation_rules.get('min_items')
            max_items = validation_rules.get('max_items')
            item_type = validation_rules.get('item_type')
            
            if min_items is not None and len(value) < min_items:
                raise ValidationError(f"Array must have at least {min_items} items")
            
            if max_items is not None and len(value) > max_items:
                raise ValidationError(f"Array must have at most {max_items} items")
            
            if item_type:
                for i, item in enumerate(value):
                    try:
                        ConfigurationValidator.validate_config_value(item_type, item)
                    except ValidationError as e:
                        raise ValidationError(f"Item {i}: {e}")
        
        # Custom validations
        custom_validator = validation_rules.get('custom_validator')
        if custom_validator:
            ConfigurationValidator._apply_custom_validation(custom_validator, value)
        
        return True
    
    @staticmethod
    def _apply_custom_validation(validator_name, value):
        """Apply custom validation rules"""
        if validator_name == 'email':
            try:
                validate_email(value)
            except ValidationError:
                raise ValidationError("Value must be a valid email address")
        
        elif validator_name == 'url':
            from django.core.validators import URLValidator
            url_validator = URLValidator()
            try:
                url_validator(value)
            except ValidationError:
                raise ValidationError("Value must be a valid URL")
        
        elif validator_name == 'percentage':
            if not (0 <= value <= 100):
                raise ValidationError("Value must be between 0 and 100")
        
        elif validator_name == 'positive':
            if value <= 0:
                raise ValidationError("Value must be positive")
        
        elif validator_name == 'color_hex':
            if not re.match(r'^#[0-9A-Fa-f]{6}$', value):
                raise ValidationError("Value must be a valid hex color (e.g., #FF0000)")


class BrandConfigurationValidator:
    """Validator for brand configuration"""
    
    @staticmethod
    def validate_color_scheme(color_scheme):
        """Validate color scheme object"""
        if not isinstance(color_scheme, dict):
            raise ValidationError("Color scheme must be an object")
        
        required_colors = ['primary', 'secondary', 'background', 'text']
        for color in required_colors:
            if color not in color_scheme:
                raise ValidationError(f"Color scheme must include '{color}' color")
            
            color_value = color_scheme[color]
            if not re.match(r'^#[0-9A-Fa-f]{6}$', color_value):
                raise ValidationError(f"Color '{color}' must be a valid hex color")
    
    @staticmethod
    def validate_logo_url(url):
        """Validate logo URL"""
        if not url:
            return True  # Optional field
        
        from django.core.validators import URLValidator
        url_validator = URLValidator()
        try:
            url_validator(url)
        except ValidationError:
            raise ValidationError("Logo URL must be a valid URL")
        
        # Check if URL points to an image
        valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp']
        if not any(url.lower().endswith(ext) for ext in valid_extensions):
            raise ValidationError("Logo URL must point to an image file")
    
    @staticmethod
    def validate_custom_css(css):
        """Basic validation for custom CSS"""
        if not css:
            return True  # Optional field
        
        # Basic CSS syntax check
        if '{' in css and '}' not in css:
            raise ValidationError("Invalid CSS syntax: missing closing brace")
        
        if '}' in css and '{' not in css:
            raise ValidationError("Invalid CSS syntax: missing opening brace")
        
        # Check for potentially dangerous CSS
        dangerous_patterns = [
            'javascript:',
            'expression(',
            'behavior:',
            'binding:',
            '@import',
        ]
        
        css_lower = css.lower()
        for pattern in dangerous_patterns:
            if pattern in css_lower:
                raise ValidationError(f"CSS contains potentially dangerous content: {pattern}")


def validate_system_config(key, value, data_type, validation_rules=None):
    """Validate system configuration with specific rules for known keys"""
    
    # Key-specific validation rules
    key_rules = {
        'admin_fee_percentage': {
            'data_type': 'float',
            'validation_rules': {'min_value': 0, 'max_value': 100, 'custom_validator': 'percentage'}
        },
        'password_min_length': {
            'data_type': 'integer',
            'validation_rules': {'min_value': 4, 'max_value': 128}
        },
        'login_attempts_limit': {
            'data_type': 'integer',
            'validation_rules': {'min_value': 1, 'max_value': 20}
        },
        'session_timeout': {
            'data_type': 'integer',
            'validation_rules': {'min_value': 300, 'max_value': 86400}  # 5 minutes to 24 hours
        },
        'max_file_upload_size': {
            'data_type': 'integer',
            'validation_rules': {'min_value': 1024, 'max_value': 1073741824}  # 1KB to 1GB
        },
        'admin_email': {
            'data_type': 'string',
            'validation_rules': {'custom_validator': 'email'}
        },
        'support_email': {
            'data_type': 'string',
            'validation_rules': {'custom_validator': 'email'}
        },
        'min_reward_amount': {
            'data_type': 'float',
            'validation_rules': {'min_value': 0.01, 'custom_validator': 'positive'}
        },
        'max_reward_amount': {
            'data_type': 'float',
            'validation_rules': {'min_value': 1.0, 'custom_validator': 'positive'}
        },
    }
    
    # Use key-specific rules if available
    if key in key_rules:
        key_rule = key_rules[key]
        expected_type = key_rule['data_type']
        expected_rules = key_rule['validation_rules']
        
        if data_type != expected_type:
            raise ValidationError(f"Configuration '{key}' must be of type '{expected_type}'")
        
        ConfigurationValidator.validate_config_value(data_type, value, expected_rules)
    else:
        # Use provided validation rules
        ConfigurationValidator.validate_config_value(data_type, value, validation_rules)
    
    return True