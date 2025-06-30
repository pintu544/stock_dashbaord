'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { PortfolioTable } from '@/components/PortfolioTable';
import { PortfolioSummary } from '@/components/PortfolioSummary';
import { LoadingSpinner, ErrorMessage } from '@/components/LoadingSpinner';
import { ExcelUploader } from '@/components/ExcelUploader';
import { ApiConfig } from '@/components/ApiConfig';
import { PortfolioStatus } from '@/components/PortfolioStatus';

export default function Home() {
  const { portfolioData, isLoading, error, lastUpdated, refreshData, loadPortfolioFromData } = usePortfolio();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ErrorMessage message={error} />
        </div>
      </div>
    );
  }

  if (!portfolioData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ErrorMessage message="No portfolio data available" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Portfolio Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Real-time portfolio tracking with live market data
              </p>
            </div>
            <button
              onClick={refreshData}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* API Configuration */}
        <ApiConfig />

        {/* Excel Data Uploader */}
        <div className="mb-8">
          <ExcelUploader 
            onDataLoaded={loadPortfolioFromData}
            currentStocks={portfolioData?.stocks}
          />
        </div>

        {/* Portfolio Status */}
        <PortfolioStatus
          lastUpdated={lastUpdated}
          isLoading={isLoading}
          error={error}
          stockCount={portfolioData?.stocks?.length || 0}
        />

        {/* Portfolio Summary */}
        <div className="mb-8">
          <PortfolioSummary portfolioData={portfolioData} lastUpdated={lastUpdated} />
        </div>

        {/* Portfolio Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Holdings</h2>
            <p className="text-gray-600 text-sm mt-1">
              Data updates automatically every 15 seconds
            </p>
          </div>
          <div className="p-6">
            <PortfolioTable stocks={portfolioData.stocks} />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Data sourced from Yahoo Finance and Google Finance APIs. 
            Prices may be delayed by up to 15 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
