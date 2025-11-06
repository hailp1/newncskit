#!/usr/bin/env python3
"""
Security fix script for test endpoints
Adds authentication to all test API endpoints
"""

import os
import glob

def fix_test_endpoint(file_path):
    """Fix a single test endpoint file."""
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Skip if already has authentication
    if 'getServerSession' in content or 'IsAuthenticated' in content:
        return False
    
    # Template for secure test endpoint
    if 'NextResponse' in content and 'export async function GET' in content:
        # Frontend API route
        secure_imports = '''import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';'''
        
        # Replace imports
        content = content.replace(
            "import { NextResponse } from 'next/server';",
            secure_imports
        )
        
        # Add authentication check
        auth_check = '''  // Require authentication for test endpoints
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({
      success: false,
      error: 'Authentication required'
    }, { status: 401 });
  }
  
  // Only allow admin users to access test endpoints
  if (session.user.role !== 'admin') {
    return NextResponse.json({
      success: false,
      error: 'Admin access required'
    }, { status: 403 });
  }

'''
        
        # Replace function signature and add auth check
        content = content.replace(
            'export async function GET() {',
            f'export async function GET(request: NextRequest) {{\n{auth_check}'
        )
        
        # Also fix POST if exists
        content = content.replace(
            'export async function POST() {',
            f'export async function POST(request: NextRequest) {{\n{auth_check}'
        )
        
        with open(file_path, 'w') as f:
            f.write(content)
        
        return True
    
    return False

def main():
    """Main function to fix all test endpoints."""
    print("🔧 Fixing Test Endpoint Security Issues...")
    
    # Find all test API routes
    test_routes_pattern = os.path.join('frontend', 'src', 'app', 'api', 'test', '**', 'route.ts')
    test_files = glob.glob(test_routes_pattern, recursive=True)
    
    fixed_count = 0
    
    for file_path in test_files:
        print(f"Checking {file_path}...")
        
        if fix_test_endpoint(file_path):
            print(f"✅ Fixed {file_path}")
            fixed_count += 1
        else:
            print(f"⚠️  Skipped {file_path} (already secure or not applicable)")
    
    print(f"\n✅ Security fixes completed!")
    print(f"📊 Fixed {fixed_count} test endpoints")
    
    if fixed_count > 0:
        print("\n📋 Changes made:")
        print("- Added authentication requirement")
        print("- Added admin role requirement")
        print("- Added proper error responses")
        print("- Updated function signatures")
        
        print("\n🧪 Next steps:")
        print("1. Test the endpoints with admin credentials")
        print("2. Verify unauthorized access is blocked")
        print("3. Update any frontend code that calls these endpoints")

if __name__ == "__main__":
    main()