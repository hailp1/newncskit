'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Activity, 
  Layers, 
  Users, 
  Settings, 
  Play, 
  BarChart3,
  Check 
} from 'lucide-react';
import { WorkflowStep } from '@/types/workflow';
import { cn } from '@/lib/utils';

interface WorkflowStepperProps {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  onStepClick: (step: WorkflowStep) => void;
  progress: number;
  compact?: boolean;
}

const STEP_CONFIGS = [
  {
    id: 'upload' as WorkflowStep,
    label: 'Upload',
    description: 'Upload CSV file',
    icon: Upload,
  },
  {
    id: 'health-check' as WorkflowStep,
    label: 'Health Check',
    description: 'Data quality analysis',
    icon: Activity,
  },
  {
    id: 'grouping' as WorkflowStep,
    label: 'Grouping',
    description: 'Variable grouping',
    icon: Layers,
  },
  {
    id: 'demographic' as WorkflowStep,
    label: 'Demographics',
    description: 'Configure demographics',
    icon: Users,
  },
  {
    id: 'analysis-selection' as WorkflowStep,
    label: 'Analysis',
    description: 'Select analyses',
    icon: Settings,
  },
  {
    id: 'execution' as WorkflowStep,
    label: 'Execute',
    description: 'Run analysis',
    icon: Play,
  },
  {
    id: 'results' as WorkflowStep,
    label: 'Results',
    description: 'View results',
    icon: BarChart3,
  },
];

export function WorkflowStepper({
  currentStep,
  completedSteps,
  onStepClick,
  progress,
  compact = false,
}: WorkflowStepperProps) {
  const currentIndex = STEP_CONFIGS.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progress
          </span>
          <span className="text-sm font-medium text-blue-600">
            {progress}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Stepper */}
      <div className={cn(
        'flex',
        compact ? 'flex-col space-y-2' : 'items-center justify-between'
      )}>
        {STEP_CONFIGS.map((step, index) => {
          const isComplete = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isAccessible = isComplete || isCurrent || 
            (index > 0 && completedSteps.includes(STEP_CONFIGS[index - 1].id));
          
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              {/* Step */}
              <button
                onClick={() => isAccessible && onStepClick(step.id)}
                disabled={!isAccessible}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  compact ? 'w-full' : 'flex-col text-center',
                  isAccessible && 'cursor-pointer hover:bg-gray-50',
                  !isAccessible && 'cursor-not-allowed opacity-50',
                  isCurrent && 'bg-blue-50 border-2 border-blue-500',
                )}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`${step.label}: ${step.description}`}
              >
                {/* Icon */}
                <div
                  className={cn(
                    'relative flex items-center justify-center',
                    'w-12 h-12 rounded-full transition-all',
                    isComplete && 'bg-green-500 text-white',
                    isCurrent && 'bg-blue-600 text-white',
                    !isComplete && !isCurrent && isAccessible && 'bg-gray-200 text-gray-600',
                    !isAccessible && 'bg-gray-100 text-gray-400'
                  )}
                >
                  {isComplete ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <Check className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>

                {/* Label */}
                <div className={cn(
                  'flex flex-col',
                  compact ? 'text-left' : 'items-center'
                )}>
                  <span className={cn(
                    'text-sm font-medium',
                    isCurrent && 'text-blue-600',
                    isComplete && 'text-green-600',
                    !isCurrent && !isComplete && 'text-gray-700'
                  )}>
                    {step.label}
                  </span>
                  {!compact && (
                    <span className="text-xs text-gray-500 mt-1">
                      {step.description}
                    </span>
                  )}
                </div>
              </button>

              {/* Connector Line */}
              {index < STEP_CONFIGS.length - 1 && !compact && (
                <div className="flex-1 h-0.5 mx-2 bg-gray-200">
                  <motion.div
                    className="h-full bg-blue-600"
                    initial={{ width: '0%' }}
                    animate={{
                      width: index < currentIndex ? '100%' : '0%',
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
