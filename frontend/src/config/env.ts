/**
 * Environment Configuration
 * 
 * Centralized environment variable management with validation and type safety.
 * This module provides a single source of truth for all environment variables.
 */

// ============================================
// Type Definitions
// ============================================

export interface EnvironmentConfig {
  // Supabase
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  
  // Analytics Service
  analytics: {
    url: string;
    apiKey: string;
  };
  
  // App Configuration
  app: {
    url: string;
    env: 'development' | 'production' | 'test';
  };
  
  // Optional: Monitoring
  monitoring?: {
    sentryDsn?: string;
    sentryAuthToken?: string;
    sentryOrg?: string;
    sentryProject?: string;
    vercelAnalyticsId?: string;
  };
  
  // Optional: Notifications
  notifications?: {
    slackWebhookUrl?: string;
    emailServiceApiKey?: string;
    emailFrom?: string;
    emailAdmin?: string;
  };
  
  // Optional: Feature Flags
  features?: {
    enableAnalytics: boolean;
    enableRealtime: boolean;
    enableFileUpload: boolean;
    maintenanceMode: boolean;
  };
  
  // Optional: Performance
  performance?: {
    upstashRedisUrl?: string;
    upstashRedisToken?: string;
    cacheTtlAnalytics: number;
    cacheTtlStatic: number;
  };
  
  // Optional: Security
  security?: {
    rateLimitRequests: number;
    rateLimitWindow: number;
  };
  
  // Optional: Development
  development?: {
    debug: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get environment variable with optional fallback
 */
function getEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  if (value === undefined || value === '') {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get optional environment variable
 */
function getOptionalEnv(key: string, fallback?: string): string | undefined {
  const value = process.env[key];
  return value || fallback;
}

/**
 * Get boolean environment variable
 */
function getBooleanEnv(key: string, fallback: boolean = false): boolean {
  const value = process.env[key];
  if (value === undefined || value === '') {
    return fallback;
  }
  return value === 'true' || value === '1';
}

/**
 * Get number environment variable
 */
function getNumberEnv(key: string, fallback: number): number {
  const value = process.env[key];
  if (value === undefined || value === '') {
    return fallback;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    console.warn(`Invalid number for ${key}, using fallback: ${fallback}`);
    return fallback;
  }
  return parsed;
}

/**
 * Validate URL format
 */
function validateUrl(url: string, name: string): void {
  try {
    new URL(url);
  } catch (error) {
    throw new Error(`Invalid URL for ${name}: ${url}`);
  }
}

/**
 * Validate required configuration
 */
function validateConfig(config: EnvironmentConfig): void {
  // Skip validation if SKIP_ENV_VALIDATION is set
  if (process.env.SKIP_ENV_VALIDATION === 'true') {
    console.warn('[Environment Config] Skipping validation (SKIP_ENV_VALIDATION=true)');
    return;
  }

  const errors: string[] = [];
  
  // Validate Supabase URL
  try {
    validateUrl(config.supabase.url, 'NEXT_PUBLIC_SUPABASE_URL');
  } catch (error) {
    errors.push((error as Error).message);
  }
  
  // Validate Supabase keys
  if (!config.supabase.anonKey || config.supabase.anonKey.length < 20) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY must be at least 20 characters');
  }
  
  // Validate Analytics URL
  try {
    validateUrl(config.analytics.url, 'NEXT_PUBLIC_ANALYTICS_URL');
  } catch (error) {
    errors.push((error as Error).message);
  }
  
  // Validate Analytics API Key
  if (!config.analytics.apiKey || config.analytics.apiKey.length < 16) {
    errors.push('ANALYTICS_API_KEY must be at least 16 characters');
  }
  
  // Validate App URL
  try {
    validateUrl(config.app.url, 'NEXT_PUBLIC_APP_URL');
  } catch (error) {
    errors.push((error as Error).message);
  }
  
  // Check for placeholder values in production
  if (config.app.env === 'production') {
    const placeholders = [
      'your-project',
      'your-anon-key',
      'your-service-role-key',
      'change-this',
      'change-in-production',
      'placeholder'
    ];
    
    const checkPlaceholder = (value: string | undefined, name: string) => {
      if (value && placeholders.some(p => value.toLowerCase().includes(p))) {
        errors.push(`${name} contains placeholder value in production`);
      }
    };
    
    checkPlaceholder(config.supabase.url, 'NEXT_PUBLIC_SUPABASE_URL');
    checkPlaceholder(config.supabase.anonKey, 'NEXT_PUBLIC_SUPABASE_ANON_KEY');
    checkPlaceholder(config.supabase.serviceRoleKey, 'SUPABASE_SERVICE_ROLE_KEY');
    checkPlaceholder(config.analytics.apiKey, 'ANALYTICS_API_KEY');
  }
  
  if (errors.length > 0) {
    throw new Error(
      `Environment configuration validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`
    );
  }
}

// ============================================
// Configuration Object
// ============================================

/**
 * Load and validate environment configuration
 */
function loadConfig(): EnvironmentConfig {
  const config: EnvironmentConfig = {
    // Required: Supabase
    supabase: {
      url: getEnv('NEXT_PUBLIC_SUPABASE_URL'),
      anonKey: getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
      serviceRoleKey: getOptionalEnv('SUPABASE_SERVICE_ROLE_KEY'),
    },
    
    // Required: Analytics
    analytics: {
      url: getEnv('NEXT_PUBLIC_ANALYTICS_URL'),
      apiKey: getEnv('ANALYTICS_API_KEY'),
    },
    
    // Required: App
    app: {
      url: getEnv('NEXT_PUBLIC_APP_URL'),
      env: (getEnv('NODE_ENV', 'development') as 'development' | 'production' | 'test'),
    },
    
    // Optional: Monitoring
    monitoring: {
      sentryDsn: getOptionalEnv('SENTRY_DSN'),
      sentryAuthToken: getOptionalEnv('SENTRY_AUTH_TOKEN'),
      sentryOrg: getOptionalEnv('SENTRY_ORG'),
      sentryProject: getOptionalEnv('SENTRY_PROJECT'),
      vercelAnalyticsId: getOptionalEnv('VERCEL_ANALYTICS_ID'),
    },
    
    // Optional: Notifications
    notifications: {
      slackWebhookUrl: getOptionalEnv('SLACK_WEBHOOK_URL'),
      emailServiceApiKey: getOptionalEnv('EMAIL_SERVICE_API_KEY'),
      emailFrom: getOptionalEnv('EMAIL_FROM', 'noreply@ncskit.app'),
      emailAdmin: getOptionalEnv('EMAIL_ADMIN'),
    },
    
    // Optional: Feature Flags
    features: {
      enableAnalytics: getBooleanEnv('NEXT_PUBLIC_ENABLE_ANALYTICS', true),
      enableRealtime: getBooleanEnv('NEXT_PUBLIC_ENABLE_REALTIME', true),
      enableFileUpload: getBooleanEnv('NEXT_PUBLIC_ENABLE_FILE_UPLOAD', true),
      maintenanceMode: getBooleanEnv('NEXT_PUBLIC_MAINTENANCE_MODE', false),
    },
    
    // Optional: Performance
    performance: {
      upstashRedisUrl: getOptionalEnv('UPSTASH_REDIS_REST_URL'),
      upstashRedisToken: getOptionalEnv('UPSTASH_REDIS_REST_TOKEN'),
      cacheTtlAnalytics: getNumberEnv('CACHE_TTL_ANALYTICS', 3600),
      cacheTtlStatic: getNumberEnv('CACHE_TTL_STATIC', 86400),
    },
    
    // Optional: Security
    security: {
      rateLimitRequests: getNumberEnv('RATE_LIMIT_REQUESTS', 100),
      rateLimitWindow: getNumberEnv('RATE_LIMIT_WINDOW', 60),
    },
    
    // Optional: Development
    development: {
      debug: getBooleanEnv('DEBUG', false),
      logLevel: (getOptionalEnv('LOG_LEVEL', 'info') as 'debug' | 'info' | 'warn' | 'error'),
    },
  };
  
  // Validate configuration
  validateConfig(config);
  
  return config;
}

// ============================================
// Export Configuration
// ============================================

/**
 * Global environment configuration
 * Loaded once at application startup
 */
export const env = loadConfig();

/**
 * Check if running in production
 */
export const isProduction = env.app.env === 'production';

/**
 * Check if running in development
 */
export const isDevelopment = env.app.env === 'development';

/**
 * Check if running in test
 */
export const isTest = env.app.env === 'test';

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof NonNullable<EnvironmentConfig['features']>): boolean {
  return env.features?.[feature] ?? false;
}

/**
 * Get monitoring configuration
 */
export function getMonitoringConfig() {
  return env.monitoring;
}

/**
 * Get notification configuration
 */
export function getNotificationConfig() {
  return env.notifications;
}

/**
 * Get performance configuration
 */
export function getPerformanceConfig() {
  return env.performance;
}

/**
 * Get security configuration
 */
export function getSecurityConfig() {
  return env.security;
}

// ============================================
// Development Helpers
// ============================================

/**
 * Log configuration (development only)
 */
if (isDevelopment && env.development?.debug) {
  console.log('[Environment Config]', {
    supabase: {
      url: env.supabase.url,
      hasAnonKey: !!env.supabase.anonKey,
      hasServiceRoleKey: !!env.supabase.serviceRoleKey,
    },
    analytics: {
      url: env.analytics.url,
      hasApiKey: !!env.analytics.apiKey,
    },
    app: {
      url: env.app.url,
      env: env.app.env,
    },
    features: env.features,
  });
}

// ============================================
// Type Exports (already exported above)
// ============================================
