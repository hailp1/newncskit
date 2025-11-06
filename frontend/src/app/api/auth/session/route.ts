import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import jwt from 'jsonwebtoken'

// Use DATABASE_URL if available, otherwise construct from individual env vars
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || 'postgres'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'ncskit'}`
})

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ user: null })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any

    const client = await pool.connect()
    try {
      // Check if session exists and is valid
      const sessionResult = await client.query(
        'SELECT user_id FROM user_sessions WHERE session_token = $1 AND expires_at > NOW()',
        [token]
      )

      if (sessionResult.rows.length === 0) {
        return NextResponse.json({ user: null })
      }

      // Get user data
      const userResult = await client.query(
        'SELECT id, email, full_name, role, is_active FROM users WHERE id = $1',
        [decoded.userId]
      )

      if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
        return NextResponse.json({ user: null })
      }

      const user = userResult.rows[0]

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        }
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ user: null })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (token) {
      const client = await pool.connect()
      try {
        // Delete session from database
        await client.query(
          'DELETE FROM user_sessions WHERE session_token = $1',
          [token]
        )
      } finally {
        client.release()
      }
    }

    const response = NextResponse.json({ success: true })
    
    // Clear cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}