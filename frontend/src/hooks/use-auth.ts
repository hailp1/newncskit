import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Mock authentication for now
    // In a real app, this would check for stored tokens, validate with backend, etc.
    const mockUser: User = {
      id: 'user-1',
      email: 'user@example.com',
      name: 'Test User',
      role: 'researcher'
    };

    setTimeout(() => {
      setAuthState({
        user: mockUser,
        loading: false,
        error: null
      });
    }, 1000);
  }, []);

  return authState;
}