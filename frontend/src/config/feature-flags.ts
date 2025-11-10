/**
 * Feature Flags Configuration
 * 
 * Centralized feature flag management for the application
 * Flags can be controlled via environment variables or hardcoded defaults
 */

export interface FeatureFlags {
  /**
   * Enable automatic workflow progression from health check to grouping
   * When disabled, users must manually click "Continue" to proceed
   */
  enableAutoContinue: boolean;

  /**
   * Enable auto-continue for existing projects
   * When disabled, auto-continue only works for new projects
   */
  enableAutoContinueForExistingProjects: boolean;

  /**
   * Enable role tagging feature
   */
  enableRoleTagging: boolean;

  /**
   * Enable smart role suggestions
   */
  enableRoleSuggestions: boolean;

  /**
   * Enable model preview visualization
   */
  enableModelPreview: boolean;
}

/**
 * Get feature flag value from environment or default
 */
function getFeatureFlag(envVar: string, defaultValue: boolean): boolean {
  if (typeof window === 'undefined') {
    // Server-side: check process.env
    const value = process.env[envVar];
    if (value !== undefined) {
      return value === 'true' || value === '1';
    }
  } else {
    // Client-side: check window.ENV if available
    const value = (window as any).ENV?.[envVar];
    if (value !== undefined) {
      return value === 'true' || value === '1';
    }
  }
  return defaultValue;
}

/**
 * Feature flags instance
 * Can be imported and used throughout the application
 */
export const featureFlags: FeatureFlags = {
  enableAutoContinue: getFeatureFlag('NEXT_PUBLIC_ENABLE_AUTO_CONTINUE', true),
  enableAutoContinueForExistingProjects: getFeatureFlag('NEXT_PUBLIC_ENABLE_AUTO_CONTINUE_EXISTING', false),
  enableRoleTagging: getFeatureFlag('NEXT_PUBLIC_ENABLE_ROLE_TAGGING', true),
  enableRoleSuggestions: getFeatureFlag('NEXT_PUBLIC_ENABLE_ROLE_SUGGESTIONS', true),
  enableModelPreview: getFeatureFlag('NEXT_PUBLIC_ENABLE_MODEL_PREVIEW', true),
};

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return featureFlags[feature];
}

/**
 * Override feature flags (useful for testing)
 */
export function setFeatureFlag(feature: keyof FeatureFlags, value: boolean): void {
  featureFlags[feature] = value;
}

/**
 * Reset all feature flags to defaults
 */
export function resetFeatureFlags(): void {
  featureFlags.enableAutoContinue = getFeatureFlag('NEXT_PUBLIC_ENABLE_AUTO_CONTINUE', true);
  featureFlags.enableAutoContinueForExistingProjects = getFeatureFlag('NEXT_PUBLIC_ENABLE_AUTO_CONTINUE_EXISTING', false);
  featureFlags.enableRoleTagging = getFeatureFlag('NEXT_PUBLIC_ENABLE_ROLE_TAGGING', true);
  featureFlags.enableRoleSuggestions = getFeatureFlag('NEXT_PUBLIC_ENABLE_ROLE_SUGGESTIONS', true);
  featureFlags.enableModelPreview = getFeatureFlag('NEXT_PUBLIC_ENABLE_MODEL_PREVIEW', true);
}
