'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, CheckCircle } from 'lucide-react';

export interface DataColumn {
  name: string;
  type: 'numeric' | 'categorical' | 'ordinal' | 'text';
  role: 'independent' | 'dependent' | 'demographic' | 'control' | 'none';
  group?: string;
  description?: string;
  values?: any[];
  missing?: number;
  stats?: {
    mean?: number;
    std?: number;
    min?: number;
    max?: number;
    unique?: number;
  };
}

export interface AnalysisProject {
  id: string;
  name: string;
  description: string;
  data: any[][];
  columns: DataColumn[];
  models: ResearchModel[];
  results: AnalysisResult[];
  createdAt: string;
  updatedAt: string;
}

export interface ResearchModel {
  id: string;
  name: string;
  type: 'regression' | 'sem' | 'anova' | 'ttest' | 'correlation';
  variables: {
    independent: string[];
    dependent: string[];
    mediator?: string[];
    moderator?: string[];
  };
  hypotheses: string[];
}

export interface AnalysisResult {
  id: string;
  modelId: string;
  type: string;
  data: any;
  tables: any[];
  charts: any[];
  interpretation: string;
}

/**
 * Analysis Page - Redirects to New Workflow
 * 
 * This page now redirects to the improved analysis workflow at /analysis/new
 */
export default function DataAnalysisPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      router.push('/analysis/new');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleRedirect = () => {
    router.push('/analysis/new');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <Zap className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Improved Analysis Workflow!</CardTitle>
          <p className="text-gray-600 mt-2">
            We've streamlined the analysis process with better auto-detection and step navigation.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              What's New:
            </h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Auto-detection triggers reliably</li>
              <li>• Improved step navigation</li>
              <li>• Better state management</li>
              <li>• Enhanced error handling</li>
              <li>• Cleaner UI/UX</li>
            </ul>
          </div>
          
          <Button 
            onClick={handleRedirect} 
            className="w-full flex items-center justify-center gap-2"
          >
            Go to New Workflow
            <ArrowRight className="h-4 w-4" />
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            Redirecting automatically in 3 seconds...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}