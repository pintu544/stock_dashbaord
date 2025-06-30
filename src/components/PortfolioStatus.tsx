'use client';

import React from 'react';
import { Wifi, WifiOff, Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface PortfolioStatusProps {
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;
  stockCount: number;
  nextUpdateIn?: number;
}

export const PortfolioStatus: React.FC<PortfolioStatusProps> = ({
  lastUpdated,
  isLoading,
  error,
  stockCount,
  nextUpdateIn = 0
}) => {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    return date.toLocaleTimeString();
  };

  const getStatusColor = () => {
    if (error) return 'text-red-600';
    if (isLoading) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (error) return <WifiOff className="h-4 w-4" />;
    if (isLoading) return <Clock className="h-4 w-4 animate-spin" />;
    return <Wifi className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (error) return 'Connection Error';
    if (isLoading) return 'Updating...';
    return 'Connected';
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        {/* Connection Status */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="text-sm font-medium text-black dark:text-white">{getStatusText()}</span>
          </div>
          
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{stockCount} stocks</span>
            </div>
            
            {lastUpdated && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Updated {formatTimeAgo(lastUpdated)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Next Update Timer */}
        <div className="flex items-center gap-3">
          {nextUpdateIn > 0 && !isLoading && !error && (
            <div className="text-xs text-gray-500 dark:text-gray-300">
              Next update in {nextUpdateIn}s
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              error ? 'bg-red-500' :
              isLoading ? 'bg-yellow-500 animate-pulse' :
              'bg-green-500 animate-pulse'
            }`}></div>
            <span className="text-xs text-gray-500 dark:text-gray-300">Live</span>
          </div>
        </div>
      </div>

        {/* Error Message */}
        {error && (
          <div className="mt-3 p-2 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-red-700 dark:text-red-400">
                <strong>Error:</strong> {error}
              </div>
            </div>
          </div>
        )}

        {/* Data Source Info */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-300">
            <span>Data sources: Yahoo Finance (CMP) • Google Finance (P/E, Earnings)</span>
            <span>Auto-refresh: 15s intervals</span>
          </div>
        </div>
      </div>
    );
  };
