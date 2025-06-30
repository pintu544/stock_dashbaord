import axios from 'axios';
import { ApiResponse } from '@/types/portfolio';

class FinancialApiService {
  private useRealAPIs = true; // Toggle between real APIs and mock data
  private rateLimitDelay = 200; // Delay between API calls to avoid rate limiting
  
  // Real API integration using Next.js API routes
  async fetchRealStockPrice(symbol: string): Promise<number> {
    try {
      const response = await fetch(`/api/stock/price?symbol=${encodeURIComponent(symbol)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stock price');
      }
      
      return data.price || 0;
    } catch (error) {
      console.error(`Error fetching real price for ${symbol}:`, error);
      // Fallback to mock data if real API fails
      return this.fetchMockStockPrice(symbol);
    }
  }

  // Real financial metrics using Next.js API routes
  async fetchRealStockMetrics(symbol: string): Promise<{ peRatio?: number; earnings?: string }> {
    try {
      const response = await fetch(`/api/stock/metrics?symbol=${encodeURIComponent(symbol)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stock metrics');
      }
      
      return {
        peRatio: data.peRatio,
        earnings: data.earnings || 'N/A'
      };
    } catch (error) {
      console.error(`Error fetching real metrics for ${symbol}:`, error);
      return this.fetchMockStockMetrics(symbol);
    }
  }

  // Mock functions (for fallback or when real APIs are unavailable)
  private async fetchMockStockPrice(symbol: string): Promise<number> {
    const mockPrices: { [key: string]: number } = {
      'RELIANCE.NS': 2680 + (Math.random() - 0.5) * 100,
      'TCS.NS': 3920 + (Math.random() - 0.5) * 150,
      'HDFCBANK.NS': 1620 + (Math.random() - 0.5) * 80,
      'INFY.NS': 1380 + (Math.random() - 0.5) * 70,
      'ICICIBANK.NS': 1050 + (Math.random() - 0.5) * 50,
      'BHARTIARTL.NS': 850 + (Math.random() - 0.5) * 40,
      'SBIN.NS': 550 + (Math.random() - 0.5) * 30,
      'ITC.NS': 410 + (Math.random() - 0.5) * 20,
      'HINDUNILVR.NS': 2650 + (Math.random() - 0.5) * 120,
      'KOTAKBANK.NS': 1750 + (Math.random() - 0.5) * 90,
    };
    
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
    return Math.round((mockPrices[symbol] || 1000 + Math.random() * 500) * 100) / 100;
  }

  private async fetchMockStockMetrics(symbol: string): Promise<{ peRatio?: number; earnings?: string }> {
    const mockMetrics: { [key: string]: { peRatio: number; earnings: string } } = {
      'RELIANCE.NS': { peRatio: 14.2 + (Math.random() - 0.5) * 2, earnings: 'Q3 FY24: ₹18,951 Cr' },
      'TCS.NS': { peRatio: 28.5 + (Math.random() - 0.5) * 3, earnings: 'Q3 FY24: ₹11,735 Cr' },
      'HDFCBANK.NS': { peRatio: 19.8 + (Math.random() - 0.5) * 2, earnings: 'Q3 FY24: ₹16,511 Cr' },
      'INFY.NS': { peRatio: 25.1 + (Math.random() - 0.5) * 2, earnings: 'Q3 FY24: ₹6,586 Cr' },
      'ICICIBANK.NS': { peRatio: 16.7 + (Math.random() - 0.5) * 2, earnings: 'Q3 FY24: ₹10,261 Cr' },
    };
    
    await new Promise(resolve => setTimeout(resolve, 150)); // Simulate API delay
    const metrics = mockMetrics[symbol] || { peRatio: 15 + Math.random() * 10, earnings: 'Q3 FY24: N/A' };
    return {
      peRatio: Math.round(metrics.peRatio * 100) / 100,
      earnings: metrics.earnings
    };
  }

  // Main API methods (use real or mock based on configuration)
  async fetchStockPrice(symbol: string): Promise<number> {
    if (this.useRealAPIs) {
      return await this.fetchRealStockPrice(symbol);
    } else {
      return await this.fetchMockStockPrice(symbol);
    }
  }

  async fetchStockMetrics(symbol: string): Promise<{ peRatio?: number; earnings?: string }> {
    if (this.useRealAPIs) {
      return await this.fetchRealStockMetrics(symbol);
    } else {
      return await this.fetchMockStockMetrics(symbol);
    }
  }

  async fetchMultipleStockData(symbols: string[]): Promise<ApiResponse[]> {
    console.log(`fetchMultipleStockData called with ${symbols?.length || 0} symbols:`, symbols);
    
    // Check for undefined or empty array
    if (!symbols || symbols.length === 0) {
      console.warn('Empty symbols array provided to fetchMultipleStockData');
      return this.getFallbackStockData();
    }
    
    // Filter out invalid symbols
    const validSymbols = symbols.filter(symbol => {
      if (!symbol || typeof symbol !== 'string') {
        console.warn(`Filtering out invalid symbol type: ${typeof symbol}`);
        return false;
      }
      
      const trimmedSymbol = symbol.trim();
      const isValid = trimmedSymbol.length >= 2 && 
                     !/^\d+\.?\d*$/.test(trimmedSymbol) &&
                     /^[A-Z0-9.-]+$/i.test(trimmedSymbol);
      
      if (!isValid) {
        console.warn(`Filtering out invalid symbol format: "${trimmedSymbol}"`);
      }
      
      return isValid;
    });

    console.log(`After filtering: ${validSymbols.length} valid symbols:`, validSymbols);

    if (validSymbols.length === 0) {
      console.warn('No valid symbols provided, using fallback data');
      return this.getFallbackStockData();
    }
    
    try {

      if (this.useRealAPIs) {
        // Use the batch API route for better performance
        const response = await fetch('/api/stock/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ symbols: validSymbols }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch batch stock data');
        }
        
        return data.results || [];
      } else {
        // Use mock data
        const results: ApiResponse[] = [];
        
        for (let i = 0; i < validSymbols.length; i++) {
          const symbol = validSymbols[i];
          
          const [price, metrics] = await Promise.all([
            this.fetchMockStockPrice(symbol),
            this.fetchMockStockMetrics(symbol)
          ]);
          
          results.push({
            symbol,
            price,
            peRatio: metrics.peRatio,
            earnings: metrics.earnings
          });
          
          // Add delay between requests to simulate real API behavior
          if (i < validSymbols.length - 1) {
            await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
          }
        }

        return results;
      }
    } catch (error) {
      console.error('Error fetching multiple stock data:', error);
      
      // Fallback to individual calls if batch fails
      const results: ApiResponse[] = [];
      
      for (let i = 0; i < validSymbols.length; i++) {
        const symbol = validSymbols[i];
        
        try {
          const [price, metrics] = await Promise.all([
            this.fetchStockPrice(symbol),
            this.fetchStockMetrics(symbol)
          ]);
          
          results.push({
            symbol,
            price,
            peRatio: metrics.peRatio,
            earnings: metrics.earnings
          });
          
          // Add delay between requests to avoid rate limiting
          if (i < validSymbols.length - 1) {
            await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
          }
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
          // Add a fallback result for failed requests
          results.push({
            symbol,
            price: 0,
            peRatio: undefined,
            earnings: 'Error fetching data'
          });
        }
      }

      return results;
    }
  }

  // Configuration methods
  setUseRealAPIs(useReal: boolean) {
    this.useRealAPIs = useReal;
  }

  setRateLimitDelay(delay: number) {
    this.rateLimitDelay = delay;
  }

  // Alternative API integration methods for future enhancement
  async fetchFromAlphaVantage(symbol: string, apiKey: string): Promise<number> {
    try {
      const response = await axios.get(`https://www.alphavantage.co/query`, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: apiKey
        }
      });
      
      const price = response.data['Global Quote']['05. price'];
      return parseFloat(price);
    } catch (error) {
      console.error(`Alpha Vantage API error for ${symbol}:`, error);
      throw error;
    }
  }

  // Note: Real API calls are now handled by Next.js API routes
  // This provides better security and avoids CORS issues
  async fetchFromCustomAPI(symbol: string): Promise<{ peRatio?: number; earnings?: string }> {
    console.log('Custom API integration can be implemented via Next.js API routes');
    return this.fetchMockStockMetrics(symbol);
  }

  // Helper method to get fallback stock data
  private getFallbackStockData(): ApiResponse[] {
    console.log('Providing fallback stock data');
    return [
      { symbol: 'RELIANCE.NS', price: 2680, peRatio: 14.2, earnings: 'Q3 FY24: ₹18,951 Cr' },
      { symbol: 'HDFCBANK.NS', price: 1620, peRatio: 19.8, earnings: 'Q3 FY24: ₹16,511 Cr' },
      { symbol: 'TCS.NS', price: 3920, peRatio: 28.5, earnings: 'Q3 FY24: ₹11,735 Cr' },
      { symbol: 'INFY.NS', price: 1380, peRatio: 25.1, earnings: 'Q3 FY24: ₹6,586 Cr' },
      { symbol: 'ICICIBANK.NS', price: 1050, peRatio: 16.7, earnings: 'Q3 FY24: ₹10,261 Cr' }
    ];
  }
}

export const financialApiService = new FinancialApiService();

// Export individual functions for direct use
export const { 
  fetchStockPrice, 
  fetchStockMetrics, 
  fetchMultipleStockData,
  setUseRealAPIs,
  setRateLimitDelay
} = financialApiService;
