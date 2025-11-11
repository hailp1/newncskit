import React from 'react';

export const StatsChart: React.FC = () => (
  <div className="flex items-center justify-center h-full p-8" role="img" aria-label="Biểu đồ thống kê nền tảng: 10,000+ phân tích hoàn thành, 5,000+ người dùng hoạt động, 3,500+ dự án nghiên cứu">
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 font-medium">Phân tích hoàn thành</span>
          <span className="text-2xl font-bold text-blue-600" aria-label="10,000 cộng">10,000+</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden" role="progressbar" aria-valuenow={85} aria-valuemin={0} aria-valuemax={100} aria-label="Tiến độ phân tích hoàn thành: 85%">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: '85%' }}
          ></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 font-medium">Người dùng hoạt động</span>
          <span className="text-2xl font-bold text-purple-600" aria-label="5,000 cộng">5,000+</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden" role="progressbar" aria-valuenow={70} aria-valuemin={0} aria-valuemax={100} aria-label="Tiến độ người dùng hoạt động: 70%">
          <div 
            className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: '70%' }}
          ></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 font-medium">Dự án nghiên cứu</span>
          <span className="text-2xl font-bold text-green-600" aria-label="3,500 cộng">3,500+</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden" role="progressbar" aria-valuenow={60} aria-valuemin={0} aria-valuemax={100} aria-label="Tiến độ dự án nghiên cứu: 60%">
          <div 
            className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: '60%' }}
          ></div>
        </div>
      </div>
    </div>
  </div>
);
