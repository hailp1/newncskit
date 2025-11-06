import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Use DATABASE_URL if available, otherwise construct from individual env vars
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || 'postgres'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'ncskit'}`
})

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user in database
    const client = await pool.connect()
    try {
      const userResult = await client.query(
        'SELECT id, email, password_hash, full_name, role, is_active FROM users WHERE email = $1',
        [email]
      )

      if (userResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      const user = userResult.rows[0]

      if (!user.is_active) {
        return NextResponse.json(
          { error: 'Account is deactivated' },
          { status: 401 }
        )
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash)
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      // Update last login
      await client.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      )

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'development' ? 'temp-dev-jwt-secret-key-change-in-production' : null);
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
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}