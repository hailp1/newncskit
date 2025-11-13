/**
 * Logout API Route
 * Handles user logout and session cleanup
 * Note: NextAuth handles logout via /api/auth/signout
 * This endpoint is kept for backward compatibility
 */

import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // NextAuth handles logout via /api/auth/signout
    // This endpoint just returns success for backward compatibility
    return NextResponse.json({ 
      success: true,
      message: 'Please use /api/auth/signout for NextAuth logout'
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    )
  }
}
