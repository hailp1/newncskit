'use client';

import { useState } from 'react';
import { 
  QuestionMarkCircleIcon, 
  XMarkIcon,
  InformationCircleIcon,
  LightBulbIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './card';
import { Button } from './button';

interface HelpTextProps {
  title?: string;
  content: string | React.ReactNode;
  type?: 'info' | 'tip' | 'warning' | 'help';
  dismissible?: boolean;
  className?: string;
  compact?: boolean;
}

export function HelpText({ 
  title, 
  content, 
  type = 'info', 
  dismissible = false,
  className,
  compact = false
}: HelpTextProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const icons = {
    info: InformationCircleIcon,
    tip: LightBulbIcon,
    warning: ExclamationTriangleIcon,
    help: QuestionMarkCircleIcon
  };

  const colors = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    tip: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    warning: 'bg-orange-50 border-orange-200 text-orange-800',
    help: 'bg-purple-50 border-purple-200 text-purple-800'
  };

  const iconColors = {
    info: 'text-blue-500',
    tip: 'text-yellow-500',
    warning: 'text-orange-500',
    help: 'text-purple-500'
  };

  const Icon = icons[type];

  if (compact) {
    return (
      <div className={cn(
        'flex items-start space-x-2 p-3 rounded-lg border',
        colors[type],
        className
      )}>
        <Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', iconColors[type])} />
        <div className="flex-1 text-sm">
          {typeof content === 'string' ? (
            <p>{content}</p>
          ) : (
            content
          )}
        </div>
        {dismissible && (
          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 ml-2"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <Card className={cn('border-l-4', className)}>
      <CardContent className={cn('p-4', colors[type])}>
        <div className="flex items-start space-x-3">
          <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', iconColors[type])} />
          <div className="flex-1">
            {title && (
              <h4 className="font-medium mb-1">{title}</h4>
            )}
            <div className="text-sm">
              {typeof content === 'string' ? (
                <p>{content}</p>
              ) : (
                content
              )}
            </div>
          </div>
          {dismissible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(true)}
              className="flex-shrink-0 -mt-1 -mr-1"
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Workflow-specific help components
interface WorkflowHelpProps {
  step: 'basic' | 'research' | 'data' | 'analysis';
  className?: string;
}

export function WorkflowHelp({ step, className }: WorkflowHelpProps) {
  const helpContent = {
    basic: {
      title: 'Project Setup',
      content: (
        <div className="space-y-2">
          <p>Start by providing basic information about your research project:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Choose a descriptive title that reflects your research focus</li>
            <li>Select the appropriate business domain and theoretical models</li>
            <li>Write a clear description of your research objectives</li>
          </ul>
        </div>
      )
    },
    research: {
      title: 'Research Design',
      content: (
        <div className="space-y-2">
          <p>Define your theoretical framework and research variables:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Select theoretical frameworks that guide your research</li>
            <li>Define independent, dependent, and mediating variables</li>
            <li>Formulate clear hypotheses based on your theoretical model</li>
            <li>Describe your research methodology</li>
          </ul>
        </div>
      )
    },
    data: {
      title: 'Data Collection Setup',
      content: (
        <div className="space-y-2">
          <p>Configure how you'll collect data for your research:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Internal Survey:</strong> Create surveys with our intelligent question generator</li>
            <li><strong>External Data:</strong> Upload data collected through other methods</li>
            <li>Set up survey campaigns with token rewards for participants</li>
            <li>Configure eligibility criteria and campaign duration</li>
          </ul>
        </div>
      )
    },
    analysis: {
      title: 'Data Analysis',
      content: (
        <div className="space-y-2">
          <p>Analyze your collected data:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Upload your data files (CSV, Excel, SPSS, JSON)</li>
            <li>Preview and validate your data</li>
            <li>Run statistical analyses appropriate for your research design</li>
            <li>Export results and visualizations</li>
          </ul>
        </div>
      )
    }
  };

  const content = helpContent[step];

  return (
    <HelpText
      title={content.title}
      content={content.content}
      type="help"
      dismissible
      className={className}
    />
  );
}

// Quick tips component
interface QuickTipsProps {
  tips: string[];
  title?: string;
  className?: string;
}

export function QuickTips({ tips, title = 'Quick Tips', className }: QuickTipsProps) {
  return (
    <HelpText
      title={title}
      type="tip"
      content={
        <ul className="space-y-1">
          {tips.map((tip, index) => (
            <li key={index} className="flex items-start">
              <span className="text-yellow-600 mr-2">•</span>
              <span className="text-sm">{tip}</span>
            </li>
          ))}
        </ul>
      }
      className={className}
    />
  );
}

// Feature announcement component
interface FeatureAnnouncementProps {
  title: string;
  description: string;
  features: string[];
  onDismiss?: () => void;
  className?: string;
}

export function FeatureAnnouncement({ 
  title, 
  description, 
  features, 
  onDismiss,
  className 
}: FeatureAnnouncementProps) {
  return (
    <Card className={cn('border-green-200 bg-green-50', className)}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <LightBulbIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-green-900 mb-1">{title}</h3>
            <p className="text-sm text-green-800 mb-3">{description}</p>
            <div className="space-y-1">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-green-700">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                  {feature}
                </div>
              ))}
            </div>
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="flex-shrink-0 -mt-1 -mr-1 text-green-600 hover:text-green-700"
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}