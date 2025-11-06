'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LogIn, 
  UserPlus,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import LoginForm from './login-form';
import RegisterForm from './register-form';

interface AuthContainerProps {
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
  redirectTo?: string;
}

export default function AuthContainer({ 
  initialMode = 'login', 
  onSuccess, 
  redirectTo = '/dashboard' 
}: AuthContainerProps) {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Check URL parameters for initial mode
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'register' || urlMode === 'login') {
      setMode(urlMode);
    }
  }, [searchParams]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const switchMode = (newMode: 'login' | 'register') => {
    if (newMode === mode) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setMode(newMode);
      setIsTransitioning(false);
    }, 150);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 400 : -400,
      opacity: 0,
      scale: 0.9,
      rotateY: direction > 0 ? 15 : -15
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 400 : -400,
      opacity: 0,
      scale: 0.9,
      rotateY: direction < 0 ? 15 : -15
    })
  };

  const direction = mode === 'register' ? 1 : -1;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Mode Toggle Tabs */}
      <div className="mb-8">
        <div className="relative flex bg-gray-100 rounded-xl p-1 shadow-inner">
          {/* Sliding Background */}
          <motion.div
            className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm"
            initial={false}
            animate={{
              left: mode === 'login' ? '4px' : '50%',
              right: mode === 'login' ? '50%' : '4px'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          
          <Button
            variant="ghost"
            onClick={() => switchMode('login')}
            className={`flex-1 relative z-10 transition-all duration-200 ${
              mode === 'login' 
                ? 'text-gray-900 font-medium' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            disabled={isTransitioning}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>
          <Button
            variant="ghost"
            onClick={() => switchMode('register')}
            className={`flex-1 relative z-10 transition-all duration-200 ${
              mode === 'register' 
                ? 'text-gray-900 font-medium' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            disabled={isTransitioning}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Sign Up
          </Button>
        </div>
      </div>

      {/* Animated Form Container */}
      <div className="relative overflow-hidden">
        {/* Transition Overlay */}
        <AnimatePresence>
          {isTransitioning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg"
            >
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Switching...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={mode}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 },
              rotateY: { duration: 0.3 }
            }}
            className="w-full"
          >
            {mode === 'login' ? (
              <LoginForm 
                onSuccess={onSuccess} 
                redirectTo={redirectTo}
                showSwitchLink={false}
              />
            ) : (
              <RegisterForm 
                onSuccess={onSuccess} 
                redirectTo={redirectTo}
                showSwitchLink={false}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Alternative Switch Links */}
      <div className="mt-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              {mode === 'login' ? 'New to NCSKIT?' : 'Already have an account?'}
            </span>
          </div>
        </div>
        
        <Button
          variant="link"
          onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
          className="mt-2 text-blue-600 hover:text-blue-500 font-medium"
          disabled={isTransitioning}
        >
          {mode === 'login' ? (
            <>
              Create your account
              <ArrowRight className="ml-1 h-4 w-4" />
            </>
          ) : (
            <>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to sign in
            </>
          )}
        </Button>
      </div>

      {/* Mode Benefits */}
      <motion.div 
        className="mt-6 text-center"
        key={`benefits-${mode}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            {mode === 'login' ? 'Welcome back!' : 'Join thousands of researchers'}
          </h3>
          <p className="text-xs text-gray-600">
            {mode === 'login' 
              ? 'Access your projects, surveys, and analytics dashboard'
              : 'Start creating professional surveys and analyzing data with AI-powered tools'
            }
          </p>
        </div>
      </motion.div>

      {/* Progress Indicator */}
      <div className="mt-4 flex justify-center">
        <div className="flex space-x-2">
          <motion.div 
            className={`h-2 w-2 rounded-full transition-colors duration-200 ${
              mode === 'login' ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            animate={{ scale: mode === 'login' ? 1.2 : 1 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div 
            className={`h-2 w-2 rounded-full transition-colors duration-200 ${
              mode === 'register' ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            animate={{ scale: mode === 'register' ? 1.2 : 1 }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>
    </div>
  );
}