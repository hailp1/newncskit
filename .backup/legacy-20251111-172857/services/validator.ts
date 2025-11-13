/**
 * Validator Utility
 * Provides validation methods for all input types with security features
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Common weak passwords to check against
 */
const COMMON_PASSWORDS = [
  'password', '12345678', 'password1', 'qwerty123', 'abc12345',
  'password123', '12345678a', 'welcome1', 'admin123', 'letmein1',
  'passw0rd', 'p@ssword', 'Password1', 'Qwerty123', 'Welcome1'
];

export class Validator {
  /**
   * Validate email format (RFC 5322 compliant)
   * @param email - Email address to validate
   * @returns boolean indicating if email is valid
   */
  static validateEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }

    // Trim whitespace
    email = email.trim();

    // Check length constraints
    if (email.length === 0 || email.length > 254) {
      return false;
    }

    // RFC 5322 compliant regex (simplified but comprehensive)
    // This regex covers most valid email formats
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(email)) {
      return false;
    }

    // Additional checks
    const [localPart, domain] = email.split('@');

    // Local part should not exceed 64 characters
    if (localPart.length > 64) {
      return false;
    }

    // Domain should not exceed 253 characters
    if (domain.length > 253) {
      return false;
    }

    // Check for consecutive dots
    if (email.includes('..')) {
      return false;
    }

    // Check domain has at least one dot
    if (!domain.includes('.')) {
      return false;
    }

    // Check domain parts
    const domainParts = domain.split('.');
    for (const part of domainParts) {
      if (part.length === 0 || part.length > 63) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate ORCID ID format (0000-0000-0000-000X)
   * Includes checksum validation
   * @param orcid - ORCID ID to validate
   * @returns boolean indicating if ORCID is valid
   */
  static validateOrcidId(orcid: string): boolean {
    if (!orcid || typeof orcid !== 'string') {
      return false;
    }

    // Remove whitespace and convert to uppercase
    orcid = orcid.trim().toUpperCase();

    // Check format: 0000-0000-0000-000X (where X can be 0-9 or X)
    const orcidRegex = /^(\d{4})-(\d{4})-(\d{4})-(\d{3}[0-9X])$/;
    
    if (!orcidRegex.test(orcid)) {
      return false;
    }

    // Validate checksum using ISO 7064 11,2 algorithm
    const digits = orcid.replace(/-/g, '');
    let total = 0;

    for (let i = 0; i < digits.length - 1; i++) {
      const digit = parseInt(digits[i], 10);
      total = (total + digit) * 2;
    }

    const remainder = total % 11;
    const checkDigit = (12 - remainder) % 11;
    const expectedCheckChar = checkDigit === 10 ? 'X' : checkDigit.toString();
    const actualCheckChar = digits[digits.length - 1];

    return expectedCheckChar === actualCheckChar;
  }

  /**
   * Validate password strength
   * @param password - Password to validate
   * @returns ValidationResult with detailed error message
   */
  static validatePassword(password: string): ValidationResult {
    if (!password || typeof password !== 'string') {
      return {
        isValid: false,
        error: 'Mật khẩu không được để trống'
      };
    }

    // Check minimum length
    if (password.length < 8) {
      return {
        isValid: false,
        error: 'Mật khẩu phải có ít nhất 8 ký tự'
      };
    }

    // Check maximum length (prevent DoS)
    if (password.length > 128) {
      return {
        isValid: false,
        error: 'Mật khẩu không được vượt quá 128 ký tự'
      };
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        error: 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa'
      };
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
      return {
        isValid: false,
        error: 'Mật khẩu phải chứa ít nhất một chữ cái viết thường'
      };
    }

    // Check for number
    if (!/[0-9]/.test(password)) {
      return {
        isValid: false,
        error: 'Mật khẩu phải chứa ít nhất một chữ số'
      };
    }

    // Check against common passwords (case-insensitive)
    const lowerPassword = password.toLowerCase();
    if (COMMON_PASSWORDS.some(common => lowerPassword.includes(common.toLowerCase()))) {
      return {
        isValid: false,
        error: 'Mật khẩu quá phổ biến, vui lòng chọn mật khẩu khác'
      };
    }

    // Check for sequential characters
    if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
      return {
        isValid: false,
        error: 'Mật khẩu không nên chứa chuỗi ký tự liên tiếp'
      };
    }

    // Check for repeated characters
    if (/(.)\1{2,}/.test(password)) {
      return {
        isValid: false,
        error: 'Mật khẩu không nên chứa ký tự lặp lại liên tiếp'
      };
    }

    return {
      isValid: true
    };
  }

  /**
   * Sanitize input to prevent XSS attacks
   * Removes HTML tags and escapes special characters
   * @param input - Input string to sanitize
   * @returns Sanitized string
   */
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Remove script tags and their content first
    let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove style tags and their content
    sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    // Remove all HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Escape special HTML characters
    const htmlEscapeMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };

    sanitized = sanitized.replace(/[&<>"'\/]/g, (char) => htmlEscapeMap[char] || char);

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Trim whitespace
    sanitized = sanitized.trim();

    return sanitized;
  }

  /**
   * Sanitize HTML content while preserving safe tags
   * @param html - HTML content to sanitize
   * @param allowedTags - Array of allowed HTML tags (default: ['b', 'i', 'em', 'strong', 'p', 'br'])
   * @returns Sanitized HTML string
   */
  static sanitizeHtml(html: string, allowedTags: string[] = ['b', 'i', 'em', 'strong', 'p', 'br']): string {
    if (!html || typeof html !== 'string') {
      return '';
    }

    // Remove script tags and their content
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove event handlers
    html = html.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    html = html.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

    // Remove javascript: protocol
    html = html.replace(/javascript:/gi, '');

    // Remove data: protocol (can be used for XSS)
    html = html.replace(/data:text\/html/gi, '');

    // If no allowed tags, remove all tags
    if (allowedTags.length === 0) {
      return html.replace(/<[^>]*>/g, '');
    }

    // Remove tags not in allowed list
    const allowedTagsRegex = new RegExp(`<(?!\\/?(${allowedTags.join('|')})\\b)[^>]*>`, 'gi');
    html = html.replace(allowedTagsRegex, '');

    return html;
  }

  /**
   * Prevent SQL injection by validating and escaping input
   * Note: This is a basic check. Always use parameterized queries in the backend.
   * @param input - Input string to check
   * @returns boolean indicating if input is safe
   */
  static isSqlSafe(input: string): boolean {
    if (!input || typeof input !== 'string') {
      return true;
    }

    // Check for common SQL injection patterns
    const sqlInjectionPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/i,
      /(--|;|\/\*|\*\/|xp_|sp_)/i,
      /('|(\\')|(;)|(--)|(\/\*))/i
    ];

    for (const pattern of sqlInjectionPatterns) {
      if (pattern.test(input)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate name format (for full names, institutions, etc.)
   * @param name - Name to validate
   * @param maxLength - Maximum length (default: 255)
   * @returns ValidationResult
   */
  static validateName(name: string, maxLength: number = 255): ValidationResult {
    if (!name || typeof name !== 'string') {
      return {
        isValid: false,
        error: 'Tên không được để trống'
      };
    }

    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      return {
        isValid: false,
        error: 'Tên không được để trống'
      };
    }

    if (trimmedName.length > maxLength) {
      return {
        isValid: false,
        error: `Tên không được vượt quá ${maxLength} ký tự`
      };
    }

    // Allow letters, spaces, hyphens, apostrophes, and Vietnamese characters
    const nameRegex = /^[a-zA-ZÀ-ỹ\s'-]+$/;
    if (!nameRegex.test(trimmedName)) {
      return {
        isValid: false,
        error: 'Tên chỉ được chứa chữ cái, dấu gạch nối và dấu nháy đơn'
      };
    }

    return {
      isValid: true
    };
  }

  /**
   * Validate URL format
   * @param url - URL to validate
   * @returns boolean indicating if URL is valid
   */
  static validateUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
      return false;
    }

    try {
      const urlObj = new URL(url);
      // Only allow http and https protocols
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Validate phone number (international format)
   * @param phone - Phone number to validate
   * @returns boolean indicating if phone is valid
   */
  static validatePhone(phone: string): boolean {
    if (!phone || typeof phone !== 'string') {
      return false;
    }

    // Remove spaces, dashes, and parentheses
    const cleanPhone = phone.replace(/[\s\-()]/g, '');

    // Check for international format: +[country code][number]
    // Should be 10-15 digits
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;

    return phoneRegex.test(cleanPhone);
  }

  /**
   * Validate research domains array
   * @param domains - Array of research domains
   * @returns ValidationResult
   */
  static validateResearchDomains(domains: string[]): ValidationResult {
    if (!Array.isArray(domains)) {
      return {
        isValid: false,
        error: 'Lĩnh vực nghiên cứu phải là một mảng'
      };
    }

    if (domains.length === 0) {
      return {
        isValid: true // Empty array is valid
      };
    }

    if (domains.length > 10) {
      return {
        isValid: false,
        error: 'Không được chọn quá 10 lĩnh vực nghiên cứu'
      };
    }

    for (const domain of domains) {
      if (typeof domain !== 'string' || domain.trim().length === 0) {
        return {
          isValid: false,
          error: 'Lĩnh vực nghiên cứu không hợp lệ'
        };
      }

      if (domain.length > 100) {
        return {
          isValid: false,
          error: 'Tên lĩnh vực nghiên cứu không được vượt quá 100 ký tự'
        };
      }
    }

    return {
      isValid: true
    };
  }

  /**
   * Validate institution name
   * @param institution - Institution name to validate
   * @returns ValidationResult
   */
  static validateInstitution(institution: string): ValidationResult {
    if (!institution || typeof institution !== 'string') {
      return {
        isValid: false,
        error: 'Tên cơ quan không được để trống'
      };
    }

    const trimmed = institution.trim();

    if (trimmed.length === 0) {
      return {
        isValid: false,
        error: 'Tên cơ quan không được để trống'
      };
    }

    if (trimmed.length > 255) {
      return {
        isValid: false,
        error: 'Tên cơ quan không được vượt quá 255 ký tự'
      };
    }

    return {
      isValid: true
    };
  }

  /**
   * Comprehensive input validation and sanitization
   * @param input - Input to validate and sanitize
   * @param type - Type of validation to perform
   * @returns Sanitized and validated input or null if invalid
   */
  static validateAndSanitize(
    input: string,
    type: 'email' | 'orcid' | 'name' | 'url' | 'phone' | 'text'
  ): string | null {
    if (!input || typeof input !== 'string') {
      return null;
    }

    // First sanitize the input
    const sanitized = this.sanitizeInput(input);

    // Then validate based on type
    switch (type) {
      case 'email':
        return this.validateEmail(sanitized) ? sanitized : null;
      case 'orcid':
        return this.validateOrcidId(sanitized) ? sanitized : null;
      case 'name':
        return this.validateName(sanitized).isValid ? sanitized : null;
      case 'url':
        return this.validateUrl(sanitized) ? sanitized : null;
      case 'phone':
        return this.validatePhone(sanitized) ? sanitized : null;
      case 'text':
        return this.isSqlSafe(sanitized) ? sanitized : null;
      default:
        return sanitized;
    }
  }
}
