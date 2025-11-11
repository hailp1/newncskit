import React from 'react';

export const JoinIllustration: React.FC = () => (
  <div className="flex items-center justify-center h-full p-8" role="img" aria-label="Lời mời tham gia cộng đồng với 5,000+ người dùng, 3,500+ dự án, và 10,000+ phân tích">
    <div className="text-center space-y-6">
      <div className="w-56 h-56 mx-auto bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300" aria-hidden="true">
        <svg className="w-32 h-32 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-gray-800">Tham gia cộng đồng</h3>
        <p className="text-gray-600">Hàng nghìn nhà nghiên cứu đã tin tưởng</p>
      </div>
      <div className="flex justify-center gap-4" role="list" aria-label="Thống kê cộng đồng">
        <div className="text-center bg-white rounded-lg p-4 shadow-md" role="listitem">
          <div className="text-3xl font-bold text-blue-600" aria-label="5,000 cộng">5K+</div>
          <div className="text-sm text-gray-600">Người dùng</div>
        </div>
        <div className="text-center bg-white rounded-lg p-4 shadow-md" role="listitem">
          <div className="text-3xl font-bold text-green-600" aria-label="3,500 cộng">3.5K+</div>
          <div className="text-sm text-gray-600">Dự án</div>
        </div>
        <div className="text-center bg-white rounded-lg p-4 shadow-md" role="listitem">
          <div className="text-3xl font-bold text-purple-600" aria-label="10,000 cộng">10K+</div>
          <div className="text-sm text-gray-600">Phân tích</div>
        </div>
      </div>
    </div>
  </div>
);
