import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Validate required environment variables
if (!process.env.DATABASE_URL && (!process.env.POSTGRES_HOST || !process.env.POSTGRES_DB || !process.env.POSTGRES_USER || !process.env.POSTGRES_PASSWORD)) {
  throw new Error('DATABASE_URL or individual PostgreSQL environment variables are required');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB}`
})

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 12) {
      return NextResponse.json(
        { error: 'Password must be at least 12 characters long' },
        { status: 400 }
      )
    }
    
    // Check password complexity
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return NextResponse.json(
        { error: 'Password must contain uppercase, lowercase, numbers, and special characters' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      )

      if (existingUser.rows.length > 0) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        )
      }

      // Hash password
      const saltRounds = 12
      const passwordHash = await bcrypt.hash(password, saltRounds)

      // Create user
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, full_name, role, is_active, email_verified, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
         RETURNING id, email, full_name, role`,
        [email, passwordHash, fullName, 'user', true, false]
      )

      const user = userResult.rows[0]

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is required');
      }
      
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        jwtSecret,
        { expiresIn: '7d' }
      )

      // Create session
      await client.query(
        'INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES ($1, $2, $3)',
        [user.id, token, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
      )

      const response = NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        },
        token
      })

      // Set HTTP-only cookie
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      })

      return response
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}