import React from 'react';
import AuthLayout from '@/components/layout/auth-layout';
import AuthContainer from '@/components/auth/auth-container';

export default function AuthPage() {
  return (
    <AuthLayout
      title="Welcome to NCSKIT"
      subtitle="Sign in to your account or create a new one to start your research journey"
      showBackButton={true}
    >
      <AuthContainer />
    </AuthLayout>
  );
}