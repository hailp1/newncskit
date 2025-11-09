'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, CheckCircle, BarChart3, TrendingUp, FileSpreadsheet, Sparkles } from 'lucide-react';

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
 * Analysis Page - Professional Redirect to New Workflow
 * 
 * This page redirects to the improved analysis workflow at /analysis/new
 */
export default function DataAnalysisPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-redirect after 3 seconds
    const redirectTimer = setTimeout(() => {
      router.push('/analysis/new');
    }, 3000);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  const handleRedirect = () => {
    router.push('/analysis/new');
  };

  const features = [
    { icon: FileSpreadsheet, text: 'Tự động phát hiện loại dữ liệu', color: 'text-blue-600' },
    { icon: BarChart3, text: 'Điều hướng từng bước rõ ràng', color: 'text-green-600' },
    { icon: TrendingUp, text: 'Quản lý trạng thái tối ưu', color: 'text-purple-600' },
    { icon: Sparkles, text: 'Giao diện hiện đại, dễ sử dụng', color: 'text-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="max-w-2xl w-full shadow-2xl border-0 backdrop-blur-sm bg-white/95 relative z-10 animate-fade-in">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl w-fit shadow-lg transform hover:scale-110 transition-transform duration-300">
            <Zap className="h-10 w-10 text-white animate-pulse" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Quy Trình Phân Tích Nâng Cấp!
          </CardTitle>
          <p className="text-gray-600 text-lg leading-relaxed max-w-xl mx-auto">
            Chúng tôi đã tối ưu hóa quy trình phân tích với khả năng tự động phát hiện và điều hướng thông minh hơn
          </p>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-8">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`p-2 rounded-lg bg-white shadow-sm ${feature.color}`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-gray-700 leading-relaxed">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>

          {/* Improvements List */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 shadow-sm">
            <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5" />
              Cải Tiến Mới:
            </h4>
            <ul className="space-y-2">
              {[
                'Tự động phát hiện và phân loại biến số',
                'Điều hướng từng bước với thanh tiến trình trực quan',
                'Quản lý trạng thái ổn định và đáng tin cậy',
                'Xử lý lỗi thông minh với thông báo rõ ràng',
                'Giao diện người dùng hiện đại và chuyên nghiệp',
              ].map((item, index) => (
                <li
                  key={index}
                  className="text-sm text-green-800 flex items-start gap-2 animate-slide-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleRedirect}
            className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 group"
          >
            <span>Bắt Đầu Phân Tích Ngay</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>

          {/* Countdown */}
          <div className="text-center">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Tự động chuyển hướng trong {countdown} giây...
            </p>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-in {
          animation: slide-in 0.4s ease-out forwards;
          opacity: 0;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}