'use client';

import { Suspense } from 'react';
import { AnalysisWorkflow } from '@/features/analysis/AnalysisWorkflow';

export default function NewAnalysisPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Data Analysis Workflow</h1>
          <p className="text-sm text-slate-600">
            Tải dữ liệu, thiết lập biến và thực hiện phân tích thống kê từng bước.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
              Đang khởi tạo workflow...
            </div>
          }
        >
          <AnalysisWorkflow />
        </Suspense>
      </div>
    </div>
  );
}
