'use client';

import { useState, useEffect, useCallback } from 'react';
import { Stock, PortfolioData } from '@/types/portfolio';
import { financialApiService } from '@/services/financialApi';
import { calculatePortfolioTotals, updateStockMetrics } from '@/utils/portfolioCalculations';
import { samplePortfolioData } from '@/data/sampleData';
import { defaultStocks } from '@/utils/defaultStocks';

export const usePortfolio = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const updateStockPrices = useCallback(async (stocks: Stock[]) => {
    try {
      setError(null);
      
      // Make sure we have stocks to update
      if (!stocks || stocks.length === 0) {
        console.warn('No stocks provided to updateStockPrices');
        setError('No portfolio stocks available');
        return;
      }
      
      // Extract symbols for API call
      const symbols = stocks.map(stock => stock.symbol).filter(symbol => !!symbol);
      
      if (symbols.length === 0) {
        console.warn('No valid symbols found in stocks');
        setError('No valid stock symbols in portfolio');
        return;
      }
      
      const apiResponses = await financialApiService.fetchMultipleStockData(symbols);
      
      const updatedStocks = stocks.map(stock => {
        const apiData = apiResponses.find(response => response.symbol === stock.symbol);
        if (apiData) {
          const updatedStock = updateStockMetrics(stock, apiData.price);
          return {
            ...updatedStock,
            peRatio: apiData.peRatio || stock.peRatio,
            latestEarnings: apiData.earnings || stock.latestEarnings
          };
        }
        return stock;
      });
      
      const newPortfolioData = calculatePortfolioTotals(updatedStocks);
      setPortfolioData(newPortfolioData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stock prices');
      console.error('Error updating stock prices:', err);
    }
  }, []);

  const loadPortfolioFromData = useCallback(async (stocks: Stock[]) => {
    try {
      setError(null);
      
      // Check if stocks array is valid
      if (!stocks || stocks.length === 0) {
        console.warn('No stocks provided to loadPortfolioFromData, using default stocks');
        // Using defaultStocks already imported at the top of the file
        const defaultData = calculatePortfolioTotals(defaultStocks);
        setPortfolioData(defaultData);
        
        // Fetch real-time data for default stocks
        await updateStockPrices(defaultStocks);
        return;
      }
      
      // Initialize with provided data
      const initialData = calculatePortfolioTotals(stocks);
      setPortfolioData(initialData);
      
      // Fetch real-time data for the new stocks
      await updateStockPrices(stocks);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolio data');
      console.error('Error loading portfolio data:', err);
    }
  }, [updateStockPrices]);

  const initializePortfolio = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Initialize with sample data (users can upload Excel files via UI)
      const initialStocks = samplePortfolioData;
      
      // Initialize with loaded data
      const initialData = calculatePortfolioTotals(initialStocks);
      setPortfolioData(initialData);
      
      // Fetch real-time data from financial APIs
      await updateStockPrices(initialStocks);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize portfolio');
      console.error('Error initializing portfolio:', err);
    } finally {
      setIsLoading(false);
    }
  }, [updateStockPrices]);

  const refreshData = useCallback(async () => {
    if (portfolioData) {
      await updateStockPrices(portfolioData.stocks);
    }
  }, [portfolioData, updateStockPrices]);

  // Initialize portfolio on mount
  useEffect(() => {
    initializePortfolio();
  }, [initializePortfolio]);

  // Set up auto-refresh every 15 seconds
  useEffect(() => {
    if (!portfolioData) return;

    const interval = setInterval(() => {
      refreshData();
    }, 15000); // 15 seconds

    return () => clearInterval(interval);
  }, [portfolioData, refreshData]);

  return {
    portfolioData,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    initializePortfolio,
    loadPortfolioFromData
  };
};
