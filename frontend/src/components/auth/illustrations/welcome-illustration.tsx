import React from 'react';

export const WelcomeIllustration: React.FC = () => (
  <div className="flex items-center justify-center h-full p-8" role="img" aria-label="Biểu tượng chào mừng với dấu kiểm trong vòng tròn màu xanh và tím">
    <div className="text-center space-y-4">
      <div className="w-48 h-48 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
        <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-lg text-gray-600 font-medium">Chào mừng trở lại với NCSKIT</p>
    </div>
  </div>
);
