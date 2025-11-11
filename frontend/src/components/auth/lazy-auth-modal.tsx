'use client';

import { lazy, Suspense, useEffect, useState } from 'react';
import { useAuthModal } from '@/hooks/use-auth-modal';

// Lazy load the AuthModal component for code splitting
const AuthModal = lazy(() => import('./auth-modal').then(m => ({ default: m.AuthModal })));

// Preload the modal component
let isPreloaded = false;
const preloadAuthModal = () => {
  if (!isPreloaded) {
    isPreloaded = true;
    import('./auth-modal');
  }
};

export function LazyAuthModal() {
  const { isOpen } = useAuthModal();
  const [shouldRender, setShouldRender] = useState(false);

  // Preload on mount after a short delay (when user is likely to interact)
  useEffect(() => {
    const timer = setTimeout(() => {
      preloadAuthModal();
    }, 2000); // Preload after 2 seconds

    return () => clearTimeout(timer);
  }, []);

  // Render the modal once it's opened for the first time
  useEffect(() => {
    if (isOpen && !shouldRender) {
      setShouldRender(true);
    }
  }, [isOpen, shouldRender]);

  // Don't render anything until the modal is opened for the first time
  if (!shouldRender) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <AuthModal />
    </Suspense>
  );
}

// Export preload function for manual preloading on user interaction
export { preloadAuthModal };
