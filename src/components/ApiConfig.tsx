'use client';

import React, { useState } from 'react';
import { Settings, ToggleLeft, ToggleRight, Info, AlertTriangle } from 'lucide-react';

interface ApiConfigProps {
  onConfigChange?: (useRealApis: boolean) => void;
}

export const ApiConfig: React.FC<ApiConfigProps> = ({ onConfigChange }) => {
  const [useRealApis, setUseRealApis] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const handleToggle = () => {
    const newValue = !useRealApis;
    setUseRealApis(newValue);
    onConfigChange?.(newValue);
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6 text-black dark:text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          <div>
            <h3 className="text-sm font-medium text-black dark:text-white">API Configuration</h3>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              Choose between real financial APIs or demo data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
          >
            <Info className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs ${
                useRealApis ? 'text-gray-600 dark:text-gray-300' : 'text-blue-600 dark:text-blue-400 font-medium'
              }`}
            >
              Demo
            </span>
            <button
              onClick={handleToggle}
              className="focus:outline-none"
              title={useRealApis ? 'Switch to demo data' : 'Switch to real APIs'}
            >
              {useRealApis ? (
                <ToggleRight className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-gray-400 dark:text-gray-500" />
              )}
            </button>
            <span
              className={`text-xs ${
                useRealApis ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Real APIs
            </span>
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                <ToggleRight className="h-3 w-3" />
                Real APIs Mode
              </h4>
              <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Live data from Yahoo Finance</li>
                <li>• Real-time stock prices (CMP)</li>
                <li>• Actual P/E ratios and earnings</li>
                <li>• May have rate limits and delays</li>
                <li>• Requires internet connection</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <ToggleLeft className="h-3 w-3" />
                Demo Mode
              </h4>
              <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Simulated market data</li>
                <li>• Realistic price fluctuations</li>
                <li>• No API rate limits</li>
                <li>• Works offline</li>
                <li>• Perfect for testing</li>
              </ul>
            </div>
          </div>

          {useRealApis && (
            <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> Real APIs may have limitations. Yahoo Finance doesn&apos;t provide 
                  an official public API. This application uses unofficial methods that may be subject 
                  to rate limiting or temporary unavailability. For production use, consider subscribing 
                  to official financial data providers like Alpha Vantage, IEX Cloud, or Bloomberg API.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
