import React from 'react';

export const CapabilitiesChart: React.FC = () => (
  <div className="flex items-center justify-center h-full p-8" role="img" aria-label="Khả năng phân tích mạnh mẽ: 95% độ chính xác, nhanh gấp 10 lần, và hỗ trợ 24/7">
    <div className="w-full max-w-md space-y-6">
      <h3 className="text-xl font-bold text-gray-800 text-center">Khả năng phân tích mạnh mẽ</h3>
      <div className="space-y-4" role="list" aria-label="Danh sách khả năng">
        <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300" role="listitem">
          <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center" aria-hidden="true">
            <span className="text-2xl font-bold text-blue-600">95%</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">Độ chính xác</h4>
            <p className="text-sm text-gray-600">Phân tích thống kê chuyên nghiệp</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300" role="listitem">
          <div className="flex-shrink-0 w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center" aria-hidden="true">
            <span className="text-2xl font-bold text-purple-600">10x</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">Tốc độ xử lý</h4>
            <p className="text-sm text-gray-600">Nhanh hơn phương pháp thủ công</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300" role="listitem">
          <div className="flex-shrink-0 w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center" aria-hidden="true">
            <span className="text-2xl font-bold text-green-600">24/7</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">Hỗ trợ liên tục</h4>
            <p className="text-sm text-gray-600">Luôn sẵn sàng phục vụ</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
