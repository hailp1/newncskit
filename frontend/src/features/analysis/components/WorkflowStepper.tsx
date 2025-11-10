'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import { WorkflowStep } from '../store/workflow-store';

const STEP_ORDER: WorkflowStep[] = ['upload', 'health', 'group', 'demographic', 'analyze', 'results'];

const STEP_LABELS: Record<WorkflowStep, { title: string; description: string }> = {
  upload: { title: 'Upload CSV', description: 'Import your dataset' },
  health: { title: 'Data Health', description: 'Review quality checks' },
  group: { title: 'Grouping', description: 'Organize variables' },
  demographic: { title: 'Demographics', description: 'Configure demographic data' },
  analyze: { title: 'Analysis', description: 'Select and run analyses' },
  results: { title: 'Results', description: 'Review and export findings' },
};

interface WorkflowStepperProps {
  currentStep: WorkflowStep;
}

export function WorkflowStepper({ currentStep }: WorkflowStepperProps) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
        {STEP_ORDER.map((step, index) => {
          const { title, description } = STEP_LABELS[step];
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <div
              key={step}
              className={`flex items-start md:items-center gap-3 md:gap-4 flex-1 ${
                index !== STEP_ORDER.length - 1 ? 'relative md:pb-0' : ''
              }`}
            >
              <div
                className={`flex-shrink-0 rounded-full p-2 ${
                  isCompleted
                    ? 'bg-green-100 text-green-600'
                    : isActive
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Circle className="w-6 h-6" />
                )}
              </div>
              <div className="flex flex-col">
                <p
                  className={`text-sm font-semibold ${
                    isActive ? 'text-blue-700' : isCompleted ? 'text-green-700' : 'text-gray-600'
                  }`}
                >
                  {title}
                </p>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
              {index < STEP_ORDER.length - 1 && (
                <div className="hidden md:block absolute top-6 left-9 right-[-50%] h-px bg-gradient-to-r from-gray-200 via-gray-200 to-transparent pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

