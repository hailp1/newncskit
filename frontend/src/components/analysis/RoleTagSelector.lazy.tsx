/**
 * Lazy-loaded RoleTagSelector Component
 * 
 * Task 16: Implement lazy loading for RoleTagSelector (Requirement 7.1)
 * This wrapper provides lazy loading with a loading fallback
 */

'use client';

import { lazy, Suspense } from 'react';
import { VariableRole, RoleSuggestion } from '@/types/analysis';

// Task 16: Lazy load RoleTagSelector component (Requirement 7.1)
const RoleTagSelectorComponent = lazy(() => import('./RoleTagSelector'));

interface RoleTagSelectorProps {
  entityId: string;
  entityName: string;
  currentRole: VariableRole;
  suggestion?: RoleSuggestion;
  onRoleChange: (role: VariableRole) => void;
  disabled?: boolean;
}

/**
 * Loading fallback for RoleTagSelector
 */
function RoleTagSelectorSkeleton() {
  return (
    <div className="flex items-center gap-2 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded-md"></div>
    </div>
  );
}

/**
 * Lazy-loaded RoleTagSelector with Suspense boundary
 */
export default function RoleTagSelectorLazy(props: RoleTagSelectorProps) {
  return (
    <Suspense fallback={<RoleTagSelectorSkeleton />}>
      <RoleTagSelectorComponent {...props} />
    </Suspense>
  );
}
