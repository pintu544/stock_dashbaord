'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, X, CheckCircle } from 'lucide-react';
import { parseExcelFile } from '@/utils/excelParser';
import { Stock } from '@/types/portfolio';
import { defaultStocks } from '@/utils/defaultStocks';

interface ExcelUploaderProps {
  onDataLoaded: (stocks: Stock[]) => void;
  currentStocks?: Stock[];
}

export const ExcelUploader: React.FC<ExcelUploaderProps> = ({ onDataLoaded, currentStocks }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      console.log(`Processing Excel file: ${file.name} (${file.size} bytes)`);
      const stocks = await parseExcelFile(file);
      
      if (stocks.length === 0) {
        setError('No valid portfolio data found in the Excel file. Using default stocks.');
        onDataLoaded(defaultStocks); // Use default stocks as fallback
      } else {
        console.log(`Successfully parsed ${stocks.length} stocks from Excel file`);
        onDataLoaded(stocks);
        setIsSuccess(true);
      }
      
      // Reset success message after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
      
    } catch (err) {
      console.error('Error parsing Excel file:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse Excel file');
      // Use default stocks as fallback
      onDataLoaded(defaultStocks);
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const loadSampleData = async () => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      // Load the sample Excel file from public directory
      const response = await fetch('/Sample Portfolio (1).xlsx');
      if (!response.ok) {
        throw new Error('Failed to load sample portfolio file');
      }

      const arrayBuffer = await response.arrayBuffer();
      const file = new File([arrayBuffer], 'Sample Portfolio.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const stocks = await parseExcelFile(file);
      
      // Display a message if we're using default stocks
      if (stocks.length === 0) {
        setError('No valid portfolio data found in the Excel file, using default portfolio');
      }
      
      onDataLoaded(stocks);
      setIsSuccess(true);
      
      setTimeout(() => setIsSuccess(false), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sample data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6 text-black dark:text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-black dark:text-white">Portfolio Data Source</h3>
        </div>
        {currentStocks && (
          <span className="text-sm text-gray-500 dark:text-gray-300">
            Currently showing {currentStocks.length} stocks
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upload Custom Excel File */}
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-blue-400 dark:hover:border-blue-600 transition-colors">
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
            <h4 className="text-sm font-medium text-black dark:text-white mb-1">Upload Your Portfolio</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Upload an Excel file (.xlsx, .xls) with your portfolio data
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isLoading}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white text-sm rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Processing...' : 'Choose File'}
            </button>
          </div>
        </div>

        {/* Load Sample Data */}
        <div className="border-2 border-dashed border-green-300 dark:border-green-600 rounded-lg p-4 hover:border-green-400 dark:hover:border-green-500 transition-colors">
          <div className="text-center">
            <FileSpreadsheet className="mx-auto h-8 w-8 text-green-500 dark:text-green-400 mb-2" />
            <h4 className="text-sm font-medium text-black dark:text-white mb-1">Load Sample Portfolio</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Load the provided sample portfolio data from Excel
            </p>
            <button
              onClick={loadSampleData}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white text-sm rounded-md hover:bg-green-700 dark:hover:bg-green-800 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Loading...' : 'Load Sample Data'}
            </button>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md">
          <div className="flex items-center gap-2">
            <X className="h-4 w-4 text-red-500 dark:text-red-300" />
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

      {isSuccess && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-md">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-300" />
            <span className="text-sm text-green-700 dark:text-green-300">
              Portfolio data loaded successfully! Real-time price updates will begin shortly.
            </span>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-md">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Processing Excel file and preparing portfolio data...
            </span>
          </div>
        </div>
      )}

      {/* Expected File Format */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
        <h5 className="text-sm font-medium text-black dark:text-white mb-2">Expected Excel Format:</h5>
        <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
          <p><strong>Columns:</strong> Particulars, Purchase Price, Qty, Investment, Portfolio (%), NSE/BSE, CMP, Present Value, Gain/Loss, P/E Ratio, Latest Earnings, Sector, Symbol</p>
          <p><strong>Note:</strong> The first row should contain column headers. Empty rows will be skipped.</p>
        </div>
      </div>
    </div>
  );
};
