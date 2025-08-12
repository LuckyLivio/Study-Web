import React from 'react';
import { ExclamationTriangleIcon, UserIcon } from '@heroicons/react/24/outline';

interface AuthRequiredProps {
  message?: string;
}

const AuthRequired: React.FC<AuthRequiredProps> = ({ 
  message = "请先登录以访问此功能" 
}) => {
  const handleLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
      <div className="text-center p-8 max-w-md">
        <div className="text-blue-500 text-6xl mb-4">
          <UserIcon className="h-16 w-16 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          需要登录
        </h3>
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        <button
          onClick={handleLogin}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          前往登录
        </button>
      </div>
    </div>
  );
};

export default AuthRequired;