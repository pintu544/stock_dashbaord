import { Stock, SectorSummary, PortfolioData } from '@/types/portfolio';

export const calculateInvestment = (purchasePrice: number, quantity: number): number => {
  return purchasePrice * quantity;
};

export const calculatePresentValue = (cmp: number, quantity: number): number => {
  return cmp * quantity;
};

export const calculateGainLoss = (presentValue: number, investment: number): number => {
  return presentValue - investment;
};

export const calculatePortfolioPercentage = (presentValue: number, totalPresentValue: number): number => {
  return totalPresentValue > 0 ? (presentValue / totalPresentValue) * 100 : 0;
};

export const updateStockMetrics = (stock: Stock, newCmp: number): Stock => {
  const presentValue = calculatePresentValue(newCmp, stock.quantity);
  const gainLoss = calculateGainLoss(presentValue, stock.investment);
  
  return {
    ...stock,
    cmp: newCmp,
    presentValue,
    gainLoss
  };
};

export const groupStocksBySector = (stocks: Stock[]): SectorSummary[] => {
  const sectorMap = new Map<string, Stock[]>();
  
  stocks.forEach(stock => {
    if (!sectorMap.has(stock.sector)) {
      sectorMap.set(stock.sector, []);
    }
    sectorMap.get(stock.sector)!.push(stock);
  });
  
  return Array.from(sectorMap.entries()).map(([sector, sectorStocks]) => {
    const totalInvestment = sectorStocks.reduce((sum, stock) => sum + stock.investment, 0);
    const totalPresentValue = sectorStocks.reduce((sum, stock) => sum + stock.presentValue, 0);
    const totalGainLoss = totalPresentValue - totalInvestment;
    
    return {
      sector,
      totalInvestment,
      totalPresentValue,
      totalGainLoss,
      stocks: sectorStocks
    };
  });
};

export const calculatePortfolioTotals = (stocks: Stock[]): PortfolioData => {
  const totalInvestment = stocks.reduce((sum, stock) => sum + stock.investment, 0);
  const totalPresentValue = stocks.reduce((sum, stock) => sum + stock.presentValue, 0);
  const totalGainLoss = totalPresentValue - totalInvestment;
  
  // Update portfolio percentages
  const updatedStocks = stocks.map(stock => ({
    ...stock,
    portfolioPercentage: calculatePortfolioPercentage(stock.presentValue, totalPresentValue)
  }));
  
  const sectorSummaries = groupStocksBySector(updatedStocks);
  
  return {
    stocks: updatedStocks,
    sectorSummaries,
    totalInvestment,
    totalPresentValue,
    totalGainLoss
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatPercentage = (percentage: number): string => {
  return `${percentage.toFixed(2)}%`;
};

export const getGainLossColor = (gainLoss: number): string => {
  if (gainLoss > 0) return 'text-green-600';
  if (gainLoss < 0) return 'text-red-600';
  return 'text-gray-600';
};

export const getGainLossBackgroundColor = (gainLoss: number): string => {
  if (gainLoss > 0) return 'bg-green-50';
  if (gainLoss < 0) return 'bg-red-50';
  return 'bg-gray-50';
};
