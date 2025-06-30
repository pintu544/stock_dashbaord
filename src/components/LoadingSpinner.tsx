'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading portfolio data...' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-black dark:text-white">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
      <p className="text-gray-600 dark:text-gray-300 text-lg">{message}</p>
    </div>
  );
};

export const ErrorMessage: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-6">
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-red-400 dark:bg-red-500 rounded-full"></div>
        <h3 className="text-red-800 dark:text-red-400 font-medium">Error</h3>
      </div>
      <p className="text-red-700 dark:text-red-300 mt-2">{message}</p>
    </div>
  );
};
