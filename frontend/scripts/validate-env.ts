#!/usr/bin/env node
/**
 * Environment Variables Validation Script
 * 
 * This script validates that all required environment variables are set
 * and have valid values before starting the application.
 * 
 * Usage:
 *   npm run validate-env
 *   node scripts/validate-env.ts
 */

import * as fs from 'fs'
import * as path from 'path'

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Load environment variables from .env.local
 */
function loadEnvFile(): Record<string, string> {
  const envPath = path.join(process.cwd(), '.env.local')
  
  if (!fs.existsSync(envPath)) {
    console.warn(`${colors.yellow}⚠ Warning: .env.local file not found${colors.reset}`)
    return {}
  }

  const envContent = fs.readFileSync(envPath, 'utf-8')
  const env: Record<string, string> = {}

  envContent.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || !line.trim()) {
      return
    }

    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim()
      env[key] = value
    }
  })

  return env
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Check if value is a placeholder
 */
function isPlaceholder(value: string): boolean {
  const placeholders = [
    'your-project',
    'your-anon-key',
    'your-service-role-key',
    'change-this',
    'change-in-production',
    'placeholder',
    'your-',
    'example',
  ]
  
  const lowerValue = value.toLowerCase()
  return placeholders.some(p => lowerValue.includes(p))
}

/**
 * Validate required environment variables
 */
function validateEnvironment(): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  }

  // Load environment variables
  const env = { ...process.env, ...loadEnvFile() }
  const nodeEnv = env.NODE_ENV || 'development'
  const isProduction = nodeEnv === 'production'

  console.log(`${colors.cyan}🔍 Validating environment variables...${colors.reset}`)
  console.log(`${colors.blue}Environment: ${nodeEnv}${colors.reset}\n`)

  // Required variables
  const requiredVars = [
    {
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      validator: (value: string) => isValidUrl(value),
      errorMessage: 'Must be a valid URL',
    },
    {
      name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      validator: (value: string) => value.length >= 20,
      errorMessage: 'Must be at least 20 characters',
    },
    {
      name: 'NEXT_PUBLIC_ANALYTICS_URL',
      validator: (value: string) => isValidUrl(value),
      errorMessage: 'Must be a valid URL',
    },
    {
      name: 'ANALYTICS_API_KEY',
      validator: (value: string) => value.length >= 16,
      errorMessage: 'Must be at least 16 characters',
    },
    {
      name: 'NEXT_PUBLIC_APP_URL',
      validator: (value: string) => isValidUrl(value),
      errorMessage: 'Must be a valid URL',
    },
  ]

  // Optional but recommended variables
  const recommendedVars = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'SENTRY_DSN',
    'SLACK_WEBHOOK_URL',
  ]

  // Check required variables
  requiredVars.forEach(({ name, validator, errorMessage }) => {
    const value = env[name]

    if (!value) {
      result.valid = false
      result.errors.push(`${name} is required but not set`)
      return
    }

    if (!validator(value)) {
      result.valid = false
      result.errors.push(`${name}: ${errorMessage}`)
      return
    }

    // Check for placeholders in production
    if (isProduction && isPlaceholder(value)) {
      result.valid = false
      result.errors.push(`${name} contains placeholder value in production`)
      return
    }

    console.log(`${colors.green}✓${colors.reset} ${name}`)
  })

  // Check recommended variables
  console.log(`\n${colors.cyan}Optional but recommended:${colors.reset}`)
  recommendedVars.forEach(name => {
    const value = env[name]

    if (!value) {
      result.warnings.push(`${name} is not set (recommended for production)`)
      console.log(`${colors.yellow}⚠${colors.reset} ${name} (not set)`)
    } else if (isProduction && isPlaceholder(value)) {
      result.warnings.push(`${name} contains placeholder value`)
      console.log(`${colors.yellow}⚠${colors.reset} ${name} (placeholder value)`)
    } else {
      console.log(`${colors.green}✓${colors.reset} ${name}`)
    }
  })

  // Additional production checks
  if (isProduction) {
    console.log(`\n${colors.cyan}Production-specific checks:${colors.reset}`)

    // Check that URLs use HTTPS in production
    const httpsVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_ANALYTICS_URL', 'NEXT_PUBLIC_APP_URL']
    httpsVars.forEach(name => {
      const value = env[name]
      if (value && !value.startsWith('https://')) {
        result.warnings.push(`${name} should use HTTPS in production`)
        console.log(`${colors.yellow}⚠${colors.reset} ${name} should use HTTPS`)
      }
    })

    // Check that localhost is not used in production
    const localhostVars = ['NEXT_PUBLIC_ANALYTICS_URL', 'NEXT_PUBLIC_APP_URL']
    localhostVars.forEach(name => {
      const value = env[name]
      if (value && (value.includes('localhost') || value.includes('127.0.0.1'))) {
        result.valid = false
        result.errors.push(`${name} cannot use localhost in production`)
      }
    })
  }

  return result
}

/**
 * Main execution
 */
function main() {
  console.log(`${colors.cyan}╔════════════════════════════════════════════╗${colors.reset}`)
  console.log(`${colors.cyan}║  Environment Variables Validation         ║${colors.reset}`)
  console.log(`${colors.cyan}╚════════════════════════════════════════════╝${colors.reset}\n`)

  const result = validateEnvironment()

  // Print results
  console.log('\n' + '='.repeat(50))

  if (result.errors.length > 0) {
    console.log(`\n${colors.red}❌ Validation Failed${colors.reset}\n`)
    console.log(`${colors.red}Errors:${colors.reset}`)
    result.errors.forEach(error => {
      console.log(`  ${colors.red}✗${colors.reset} ${error}`)
    })
  }

  if (result.warnings.length > 0) {
    console.log(`\n${colors.yellow}⚠ Warnings:${colors.reset}`)
    result.warnings.forEach(warning => {
      console.log(`  ${colors.yellow}⚠${colors.reset} ${warning}`)
    })
  }

  if (result.valid && result.warnings.length === 0) {
    console.log(`\n${colors.green}✅ All environment variables are valid!${colors.reset}`)
  } else if (result.valid) {
    console.log(`\n${colors.green}✅ Required variables are valid${colors.reset}`)
    console.log(`${colors.yellow}⚠ But there are some warnings to address${colors.reset}`)
  }

  console.log('\n' + '='.repeat(50))

  // Exit with appropriate code
  if (!result.valid) {
    console.log(`\n${colors.red}Please fix the errors above before starting the application.${colors.reset}`)
    console.log(`${colors.cyan}Refer to .env.example or docs/ENVIRONMENT_VARIABLES.md for guidance.${colors.reset}\n`)
    process.exit(1)
  }

  if (result.warnings.length > 0) {
    console.log(`\n${colors.yellow}Consider addressing the warnings above for production readiness.${colors.reset}\n`)
  }

  process.exit(0)
}

// Run validation
main()
