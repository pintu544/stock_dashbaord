'use client';

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { PortfolioData } from '@/types/portfolio';
import { formatCurrency, getGainLossColor } from '@/utils/portfolioCalculations';

interface PortfolioSummaryProps {
  portfolioData: PortfolioData;
  lastUpdated: Date | null;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  portfolioData,
  lastUpdated,
}) => {
  const { totalInvestment, totalPresentValue, totalGainLoss } = portfolioData;
  const gainLossPercentage = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;

  return (
    <div className="bg-white">
      {/* Main Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Investment</p>
              <p className="text-2xl font-bold">{formatCurrency(totalInvestment)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Current Value</p>
              <p className="text-2xl font-bold">{formatCurrency(totalPresentValue)}</p>
            </div>
            <PieChart className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className={`rounded-lg p-6 text-white ${
          totalGainLoss >= 0 
            ? 'bg-gradient-to-r from-green-500 to-green-600' 
            : 'bg-gradient-to-r from-red-500 to-red-600'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                totalGainLoss >= 0 ? 'text-green-100' : 'text-red-100'
              }`}>
                Total Gain/Loss
              </p>
              <p className="text-2xl font-bold">{formatCurrency(totalGainLoss)}</p>
            </div>
            {totalGainLoss >= 0 ? (
              <TrendingUp className="h-8 w-8 text-green-200" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-200" />
            )}
          </div>
        </div>

        <div className={`rounded-lg p-6 text-white ${
          gainLossPercentage >= 0 
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' 
            : 'bg-gradient-to-r from-orange-500 to-orange-600'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                gainLossPercentage >= 0 ? 'text-emerald-100' : 'text-orange-100'
              }`}>
                Return %
              </p>
              <p className="text-2xl font-bold">
                {gainLossPercentage >= 0 ? '+' : ''}{gainLossPercentage.toFixed(2)}%
              </p>
            </div>
            {gainLossPercentage >= 0 ? (
              <TrendingUp className="h-8 w-8 text-emerald-200" />
            ) : (
              <TrendingDown className="h-8 w-8 text-orange-200" />
            )}
          </div>
        </div>
      </div>

      {/* Sector-wise Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Sector-wise Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolioData.sectorSummaries.map((sector) => {
            const sectorGainLossPercentage = sector.totalInvestment > 0 
              ? (sector.totalGainLoss / sector.totalInvestment) * 100 
              : 0;
            
            return (
              <div key={sector.sector} className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{sector.sector}</h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{sector.stocks.length} stocks</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Investment:</span>
                    <span className="font-medium">{formatCurrency(sector.totalInvestment)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Current Value:</span>
                    <span className="font-medium">{formatCurrency(sector.totalPresentValue)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Gain/Loss:</span>
                    <span className={`font-medium ${getGainLossColor(sector.totalGainLoss)}`}>
                      {formatCurrency(sector.totalGainLoss)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Return:</span>
                    <span className={`font-medium ${getGainLossColor(sector.totalGainLoss)}`}>
                      {sectorGainLossPercentage >= 0 ? '+' : ''}{sectorGainLossPercentage.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

            {/* Last Updated */}
            {lastUpdated && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {lastUpdated.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        );
      };
