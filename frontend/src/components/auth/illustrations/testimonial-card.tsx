import React from 'react';

export const TestimonialCard: React.FC = () => (
  <div className="flex items-center justify-center h-full p-8">
    <div className="max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6 hover:shadow-2xl transition-shadow duration-300" role="article" aria-label="Đánh giá từ người dùng">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0" aria-hidden="true">
          NV
        </div>
        <div>
          <h4 className="font-bold text-gray-800">Nguyễn Văn A</h4>
          <p className="text-sm text-gray-600">Nghiên cứu sinh, ĐH Quốc Gia</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex gap-1" role="img" aria-label="Đánh giá 5 sao">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <blockquote className="text-gray-700 italic leading-relaxed">
          "NCSKIT đã giúp tôi tiết kiệm hàng giờ phân tích dữ liệu. Giao diện trực quan và các công cụ thống kê mạnh mẽ làm cho nghiên cứu của tôi hiệu quả hơn rất nhiều."
        </blockquote>
      </div>
    </div>
  </div>
);
