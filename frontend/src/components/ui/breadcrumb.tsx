'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

// Default breadcrumb mapping based on pathname
const getDefaultBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: HomeIcon }
  ];

  // Build breadcrumbs based on path segments
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    // Custom labels for specific routes
    const segmentLabels: { [key: string]: string } = {
      'projects': 'Projects',
      'new': 'Create New Project',
      'edit': 'Edit Project',
      'analysis': 'Data Analysis',
      'campaigns': 'Survey Campaigns',
      'admin': 'Administration',
      'users': 'User Management',
      'questions': 'Question Bank',
      'revenue': 'Revenue Management',
      'topics': 'Topic Suggestions',
      'references': 'References',
      'editor': 'Smart Editor',
      'journals': 'Journal Matcher',
      'reviews': 'Review Manager',
      'blog': 'Blog',
      'settings': 'Settings',
      'profile': 'Profile'
    };

    const label = segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    
    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
      current: isLast
    });
  });

  return breadcrumbs;
};

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const pathname = usePathname();
  const breadcrumbItems = items || getDefaultBreadcrumbs(pathname);

  if (breadcrumbItems.length <= 1) {
    return null; // Don't show breadcrumb for single items
  }

  return (
    <nav className={cn('flex', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />
            )}
            
            {item.href ? (
              <Link
                href={item.href}
                className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                {item.icon && (
                  <item.icon className="h-4 w-4 mr-1.5" />
                )}
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'flex items-center text-sm font-medium',
                  item.current 
                    ? 'text-gray-900' 
                    : 'text-gray-500'
                )}
                aria-current={item.current ? 'page' : undefined}
              >
                {item.icon && (
                  <item.icon className="h-4 w-4 mr-1.5" />
                )}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Workflow-specific breadcrumb component
interface WorkflowBreadcrumbProps {
  projectTitle?: string;
  currentStep?: 'basic' | 'research' | 'data' | 'analysis' | 'results';
  className?: string;
}

export function WorkflowBreadcrumb({ 
  projectTitle, 
  currentStep, 
  className 
}: WorkflowBreadcrumbProps) {
  const stepLabels = {
    basic: 'Basic Information',
    research: 'Research Design',
    data: 'Data Collection',
    analysis: 'Analysis',
    results: 'Results'
  };

  const stepOrder = ['basic', 'research', 'data', 'analysis', 'results'];
  const currentStepIndex = currentStep ? stepOrder.indexOf(currentStep) : -1;

  const items: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { label: 'Projects', href: '/projects' },
  ];

  if (projectTitle) {
    items.push({ label: projectTitle });
  }

  if (currentStep) {
    // Add completed steps as links, current step as current
    stepOrder.forEach((step, index) => {
      if (index <= currentStepIndex) {
        items.push({
          label: stepLabels[step as keyof typeof stepLabels],
          href: index < currentStepIndex ? `#${step}` : undefined,
          current: index === currentStepIndex
        });
      }
    });
  }

  return <Breadcrumb items={items} className={className} />;
}

// Progress breadcrumb for showing workflow progress
interface ProgressBreadcrumbProps {
  steps: Array<{
    key: string;
    label: string;
    completed: boolean;
    current: boolean;
    href?: string;
  }>;
  className?: string;
}

export function ProgressBreadcrumb({ steps, className }: ProgressBreadcrumbProps) {
  return (
    <nav className={cn('flex', className)} aria-label="Progress">
      <ol className="flex items-center space-x-2">
        {steps.map((step, index) => (
          <li key={step.key} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />
            )}
            
            <div className="flex items-center">
              {/* Step indicator */}
              <div
                className={cn(
                  'flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mr-2',
                  step.completed
                    ? 'bg-green-100 text-green-800'
                    : step.current
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-500'
                )}
              >
                {step.completed ? '✓' : index + 1}
              </div>
              
              {/* Step label */}
              {step.href && !step.current ? (
                <Link
                  href={step.href}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {step.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'text-sm font-medium',
                    step.current 
                      ? 'text-gray-900' 
                      : step.completed
                      ? 'text-green-700'
                      : 'text-gray-500'
                  )}
                >
                  {step.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}