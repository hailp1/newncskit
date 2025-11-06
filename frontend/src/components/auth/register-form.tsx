'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus,
  AlertCircle,
  CheckCircle,
  X,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import SocialLoginButtons from './social-login-buttons';

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  showSwitchLink?: boolean;
}

export default function RegisterForm({ onSuccess, redirectTo = '/dashboard', showSwitchLink = true }: RegisterFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    const checks = {
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    Object.values(checks).forEach(check => {
      if (check) strength += 20;
    });

    return { strength, checks };
  };

  const passwordAnalysis = calculatePasswordStrength(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (passwordAnalysis.strength < 100) {
      setError('Password does not meet all security requirements');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            router.push(redirectTo);
          }
        }, 2000);
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthText = (strength: number) => {
    if (strength < 40) return 'Weak';
    if (strength < 60) return 'Fair';
    if (strength < 80) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 40) return 'text-red-600';
    if (strength < 60) return 'text-orange-600';
    if (strength < 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl text-center">Create Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Social Login Buttons */}
        <SocialLoginButtons callbackUrl={redirectTo} />

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or create account with email</span>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Your full name"
                className="pl-10 h-11"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className="pl-10 h-11"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                className="pl-10 pr-10 h-11"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Password Strength</span>
                  <span className={`text-xs font-medium ${getStrengthColor(passwordAnalysis.strength)}`}>
                    {getStrengthText(passwordAnalysis.strength)}
                  </span>
                </div>
                <Progress 
                  value={passwordAnalysis.strength} 
                  className="h-2"
                />
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center gap-1 ${passwordAnalysis.checks.length ? 'text-green-600' : 'text-gray-400'}`}>
                    {passwordAnalysis.checks.length ? <CheckCircle className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    12+ characters
                  </div>
                  <div className={`flex items-center gap-1 ${passwordAnalysis.checks.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                    {passwordAnalysis.checks.uppercase ? <CheckCircle className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    Uppercase
                  </div>
                  <div className={`flex items-center gap-1 ${passwordAnalysis.checks.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                    {passwordAnalysis.checks.lowercase ? <CheckCircle className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    Lowercase
                  </div>
                  <div className={`flex items-center gap-1 ${passwordAnalysis.checks.numbers ? 'text-green-600' : 'text-gray-400'}`}>
                    {passwordAnalysis.checks.numbers ? <CheckCircle className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    Numbers
                  </div>
                  <div className={`flex items-center gap-1 ${passwordAnalysis.checks.special ? 'text-green-600' : 'text-gray-400'}`}>
                    {passwordAnalysis.checks.special ? <CheckCircle className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    Special chars
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="pl-10 pr-10 h-11"
                disabled={isLoading}
              />
              <div className="absolute right-3 top-3 flex items-center gap-1">
                {formData.confirmPassword && (
                  formData.password === formData.confirmPassword ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )
                )}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors ml-1"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
              disabled={isLoading}
            />
            <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
              I agree to the{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500 transition-colors">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500 transition-colors">
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            disabled={isLoading || passwordAnalysis.strength < 100 || !formData.agreeToTerms}
            className="w-full h-11 text-base font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </>
            )}
          </Button>
        </form>

        {/* Sign In Link */}
        {showSwitchLink && (
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}