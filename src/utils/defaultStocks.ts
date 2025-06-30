import { Stock } from '@/types/portfolio';

/**
 * Default stocks to use when no valid stocks are parsed from the Excel file
 */
export const defaultStocks: Stock[] = [
  {
    id: '1',
    particulars: 'Reliance Industries Ltd',
    purchasePrice: 2500,
    quantity: 10,
    investment: 25000,
    portfolioPercentage: 25,
    exchange: 'NSE',
    cmp: 2680,
    presentValue: 26800,
    gainLoss: 1800,
    sector: 'Energy',
    symbol: 'RELIANCE.NS',
    peRatio: 14.2,
    latestEarnings: 'Q3 FY24: ₹18,951 Cr'
  },
  {
    id: '2',
    particulars: 'HDFC Bank Ltd',
    purchasePrice: 1500,
    quantity: 20,
    investment: 30000,
    portfolioPercentage: 30,
    exchange: 'NSE',
    cmp: 1620,
    presentValue: 32400,
    gainLoss: 2400,
    sector: 'Banking',
    symbol: 'HDFCBANK.NS',
    peRatio: 19.8,
    latestEarnings: 'Q3 FY24: ₹16,511 Cr'
  },
  {
    id: '3',
    particulars: 'Tata Consultancy Services',
    purchasePrice: 3800,
    quantity: 5,
    investment: 19000,
    portfolioPercentage: 19,
    exchange: 'NSE',
    cmp: 3920,
    presentValue: 19600,
    gainLoss: 600,
    sector: 'IT',
    symbol: 'TCS.NS',
    peRatio: 28.5,
    latestEarnings: 'Q3 FY24: ₹11,735 Cr'
  },
  {
    id: '4',
    particulars: 'Infosys Ltd',
    purchasePrice: 1300,
    quantity: 15,
    investment: 19500,
    portfolioPercentage: 19.5,
    exchange: 'NSE',
    cmp: 1380,
    presentValue: 20700,
    gainLoss: 1200,
    sector: 'IT',
    symbol: 'INFY.NS',
    peRatio: 25.1,
    latestEarnings: 'Q3 FY24: ₹6,586 Cr'
  },
  {
    id: '5',
    particulars: 'ICICI Bank Ltd',
    purchasePrice: 950,
    quantity: 10,
    investment: 9500,
    portfolioPercentage: 9.5,
    exchange: 'NSE',
    cmp: 1050,
    presentValue: 10500,
    gainLoss: 1000,
    sector: 'Banking',
    symbol: 'ICICIBANK.NS',
    peRatio: 16.7,
    latestEarnings: 'Q3 FY24: ₹10,261 Cr'
  }
];
