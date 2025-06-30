import { Stock } from '@/types/portfolio';

export const samplePortfolioData: Stock[] = [
  {
    id: '1',
    particulars: 'Reliance Industries Ltd',
    purchasePrice: 2450.00,
    quantity: 10,
    investment: 24500.00,
    portfolioPercentage: 25.5,
    exchange: 'NSE',
    cmp: 2680.00,
    presentValue: 26800.00,
    gainLoss: 2300.00,
    peRatio: 14.2,
    latestEarnings: 'Q3 FY24: ₹18,951 Cr',
    sector: 'Energy',
    symbol: 'RELIANCE.NS'
  },
  {
    id: '2',
    particulars: 'Tata Consultancy Services',
    purchasePrice: 3650.00,
    quantity: 8,
    investment: 29200.00,
    portfolioPercentage: 30.4,
    exchange: 'NSE',
    cmp: 3920.00,
    presentValue: 31360.00,
    gainLoss: 2160.00,
    peRatio: 28.5,
    latestEarnings: 'Q3 FY24: ₹11,735 Cr',
    sector: 'Technology',
    symbol: 'TCS.NS'
  },
  {
    id: '3',
    particulars: 'HDFC Bank Ltd',
    purchasePrice: 1580.00,
    quantity: 15,
    investment: 23700.00,
    portfolioPercentage: 24.7,
    exchange: 'NSE',
    cmp: 1620.00,
    presentValue: 24300.00,
    gainLoss: 600.00,
    peRatio: 19.8,
    latestEarnings: 'Q3 FY24: ₹16,511 Cr',
    sector: 'Financials',
    symbol: 'HDFCBANK.NS'
  },
  {
    id: '4',
    particulars: 'Infosys Ltd',
    purchasePrice: 1420.00,
    quantity: 12,
    investment: 17040.00,
    portfolioPercentage: 17.7,
    exchange: 'NSE',
    cmp: 1380.00,
    presentValue: 16560.00,
    gainLoss: -480.00,
    peRatio: 25.1,
    latestEarnings: 'Q3 FY24: ₹6,586 Cr',
    sector: 'Technology',
    symbol: 'INFY.NS'
  },
  {
    id: '5',
    particulars: 'ICICI Bank Ltd',
    purchasePrice: 920.00,
    quantity: 20,
    investment: 18400.00,
    portfolioPercentage: 19.1,
    exchange: 'NSE',
    cmp: 1050.00,
    presentValue: 21000.00,
    gainLoss: 2600.00,
    peRatio: 16.7,
    latestEarnings: 'Q3 FY24: ₹10,261 Cr',
    sector: 'Financials',
    symbol: 'ICICIBANK.NS'
  }
];

export const calculatePortfolioMetrics = (stocks: Stock[]) => {
  const totalInvestment = stocks.reduce((sum, stock) => sum + stock.investment, 0);
  const totalPresentValue = stocks.reduce((sum, stock) => sum + stock.presentValue, 0);
  const totalGainLoss = totalPresentValue - totalInvestment;

  // Calculate portfolio percentages based on current values
  const updatedStocks = stocks.map(stock => ({
    ...stock,
    portfolioPercentage: (stock.presentValue / totalPresentValue) * 100
  }));

  return {
    stocks: updatedStocks,
    totalInvestment,
    totalPresentValue,
    totalGainLoss
  };
};
