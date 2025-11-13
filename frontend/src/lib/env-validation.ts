/**
 * Environment Variable Validation
 * Validates required environment variables on startup
 */

interface EnvVar {
  name: string
  required: boolean
  description: string
}

const ENV_VARS: EnvVar[] = [
  {
    name: 'DATABASE_URL',
    required: true,
    description: 'PostgreSQL database connection string',
  },
  {
    name: 'NEXTAUTH_URL',
    required: true,
    description: 'NextAuth URL (e.g., http://localhost:3000)',
  },
  {
    name: 'NEXTAUTH_SECRET',
    required: true,
    description: 'NextAuth secret key',
  },
  {
    name: 'R_SERVICE_URL',
    required: false,
    description: 'R Analytics Service URL (default: http://localhost:8000)',
  },
  {
    name: 'GOOGLE_CLIENT_ID',
    required: false,
    description: 'Google OAuth Client ID',
  },
  {
    name: 'GOOGLE_CLIENT_SECRET',
    required: false,
    description: 'Google OAuth Client Secret',
  },
  {
    name: 'NODE_ENV',
    required: false,
    description: 'Node environment (development, production, test)',
  },
]

export function validateEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.name]

    if (envVar.required && !value) {
      errors.push(
        `❌ Missing required environment variable: ${envVar.name}\n   Description: ${envVar.description}`
      )
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function printEnvStatus(): void {
  console.log('\n🔍 Environment Variables Check:\n')

  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.name]
    const status = value ? '✅' : envVar.required ? '❌' : '⚠️'
    const label = envVar.required ? 'REQUIRED' : 'OPTIONAL'

    console.log(`${status} ${envVar.name} [${label}]`)
    if (!value && envVar.required) {
      console.log(`   ⮑ ${envVar.description}`)
    }
  }

  console.log('')
}

/**
 * Validate environment on module load (only in development)
 */
if (process.env.NODE_ENV === 'development') {
  const { valid, errors } = validateEnv()

  if (!valid) {
    console.error('\n❌ Environment validation failed:\n')
    errors.forEach((error) => console.error(error))
    console.error('\n💡 Please check your .env.local file\n')
  } else {
    console.log('✅ All required environment variables are set\n')
  }
}
