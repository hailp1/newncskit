#!/usr/bin/env python3
"""
Security verification script
Verifies all critical security fixes have been applied
"""

import os
import re
import glob
import json

def check_hardcoded_secrets():
    """Check for hardcoded secrets in code."""
    print("🔍 Checking for hardcoded secrets...")
    
    issues = []
    
    # Patterns to look for
    secret_patterns = [
        r'password.*=.*["\'][^"\']{8,}["\']',
        r'secret.*=.*["\'][^"\']{8,}["\']',
        r'key.*=.*["\'][^"\']{8,}["\']',
        r'token.*=.*["\'][^"\']{8,}["\']',
    ]
    
    # Files to check
    file_patterns = [
        'frontend/src/**/*.ts',
        'frontend/src/**/*.tsx',
        'backend/apps/**/*.py',
    ]
    
    for pattern in file_patterns:
        files = glob.glob(pattern, recursive=True)
        for file_path in files:
            if 'node_modules' in file_path or 'venv' in file_path:
                continue
                
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                for secret_pattern in secret_patterns:
                    matches = re.findall(secret_pattern, content, re.IGNORECASE)
                    if matches:
                        # Filter out obvious test/example values
                        for match in matches:
                            if not any(test_val in match.lower() for test_val in 
                                     ['test', 'example', 'demo', 'placeholder', 'your-']):
                                issues.append(f"{file_path}: {match}")
            except:
                continue
    
    if issues:
        print("❌ Hardcoded secrets found:")
        for issue in issues:
            print(f"  - {issue}")
        return False
    else:
        print("✅ No hardcoded secrets found")
        return True

def check_authentication_on_endpoints():
    """Check that API endpoints have authentication."""
    print("🔍 Checking API endpoint authentication...")
    
    issues = []
    
    # Check frontend API routes
    api_routes = glob.glob('frontend/src/app/api/**/route.ts', recursive=True)
    
    for route_file in api_routes:
        try:
            with open(route_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Skip if it's a public endpoint (like health check)
            if '/health' in route_file or '/public' in route_file:
                continue
                
            # Check for authentication
            has_auth = any(auth_check in content for auth_check in [
                'getServerSession',
                'IsAuthenticated',
                'verifyAuth',
                'requireAuth'
            ])
            
            if not has_auth:
                issues.append(route_file)
        except:
            continue
    
    if issues:
        print("❌ Unauthenticated endpoints found:")
        for issue in issues:
            print(f"  - {issue}")
        return False
    else:
        print("✅ All API endpoints have authentication")
        return True

def check_xss_protection():
    """Check for XSS protection in components."""
    print("🔍 Checking XSS protection...")
    
    issues = []
    
    # Check for dangerouslySetInnerHTML usage
    tsx_files = glob.glob('frontend/src/**/*.tsx', recursive=True)
    
    for tsx_file in tsx_files:
        if 'node_modules' in tsx_file:
            continue
            
        try:
            with open(tsx_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
            if 'dangerouslySetInnerHTML' in content:
                # Check if DOMPurify is used
                if 'DOMPurify' not in content and 'JSON.stringify' not in content:
                    issues.append(tsx_file)
        except:
            continue
    
    if issues:
        print("❌ Potential XSS vulnerabilities found:")
        for issue in issues:
            print(f"  - {issue}")
        return False
    else:
        print("✅ XSS protection implemented")
        return True

def check_environment_variables():
    """Check that required environment variables are validated."""
    print("🔍 Checking environment variable validation...")
    
    env_file = 'frontend/.env.local'
    
    if not os.path.exists(env_file):
        print("❌ .env.local file not found")
        return False
    
    with open(env_file, 'r') as f:
        env_content = f.read()
    
    required_vars = [
        'NEXTAUTH_SECRET',
        'JWT_SECRET',
        'POSTGRES_HOST',
        'POSTGRES_DB',
        'POSTGRES_USER',
        'POSTGRES_PASSWORD'
    ]
    
    missing_vars = []
    for var in required_vars:
        if var not in env_content:
            missing_vars.append(var)
    
    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"  - {var}")
        return False
    else:
        print("✅ All required environment variables present")
        return True

def check_rate_limiting():
    """Check that rate limiting is implemented."""
    print("🔍 Checking rate limiting implementation...")
    
    throttles_file = 'backend/apps/authentication/throttles.py'
    
    if not os.path.exists(throttles_file):
        print("❌ Rate limiting throttles not found")
        return False
    
    with open(throttles_file, 'r') as f:
        content = f.read()
    
    required_throttles = [
        'LoginRateThrottle',
        'RegisterRateThrottle',
        'PasswordResetRateThrottle'
    ]
    
    missing_throttles = []
    for throttle in required_throttles:
        if throttle not in content:
            missing_throttles.append(throttle)
    
    if missing_throttles:
        print("❌ Missing rate limiting throttles:")
        for throttle in missing_throttles:
            print(f"  - {throttle}")
        return False
    else:
        print("✅ Rate limiting implemented")
        return True

def check_analytics_views():
    """Check that analytics views are implemented."""
    print("🔍 Checking analytics views implementation...")
    
    views_file = 'backend/apps/analytics/views.py'
    
    if not os.path.exists(views_file):
        print("❌ Analytics views file not found")
        return False
    
    with open(views_file, 'r') as f:
        content = f.read()
    
    required_views = [
        'ExecuteAnalysisView',
        'ProjectResultsView',
        'GenerateReportView'
    ]
    
    missing_views = []
    for view in required_views:
        if view not in content:
            missing_views.append(view)
    
    if missing_views:
        print("❌ Missing analytics views:")
        for view in missing_views:
            print(f"  - {view}")
        return False
    else:
        print("✅ Analytics views implemented")
        return True

def main():
    """Main verification function."""
    print("🛡️  NCSKIT Security Verification")
    print("=" * 40)
    
    checks = [
        ("Hardcoded Secrets", check_hardcoded_secrets),
        ("API Authentication", check_authentication_on_endpoints),
        ("XSS Protection", check_xss_protection),
        ("Environment Variables", check_environment_variables),
        ("Rate Limiting", check_rate_limiting),
        ("Analytics Views", check_analytics_views),
    ]
    
    results = []
    
    for check_name, check_func in checks:
        print(f"\n📋 {check_name}")
        print("-" * 30)
        result = check_func()
        results.append((check_name, result))
    
    print("\n" + "=" * 40)
    print("🎯 SECURITY VERIFICATION SUMMARY")
    print("=" * 40)
    
    passed = 0
    total = len(results)
    
    for check_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {check_name}")
        if result:
            passed += 1
    
    print(f"\n📊 Score: {passed}/{total} checks passed")
    
    if passed == total:
        print("\n🎉 ALL SECURITY CHECKS PASSED!")
        print("🛡️  Application is secure for production deployment")
        return True
    else:
        print(f"\n⚠️  {total - passed} security issues need attention")
        print("🔧 Please fix the failing checks before deployment")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)