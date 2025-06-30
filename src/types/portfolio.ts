export interface Stock {
  id: string;
  particulars: string; // Stock Name
  purchasePrice: number;
  quantity: number;
  investment: number; // Purchase Price × Qty
  portfolioPercentage: number; // Proportional weight in the portfolio
  exchange: 'NSE' | 'BSE'; // Stock Exchange Code
  cmp: number; // Current Market Price (from Yahoo Finance)
  presentValue: number; // CMP × Qty
  gainLoss: number; // Present Value – Investment
  peRatio?: number; // P/E Ratio (from Google Finance)
  latestEarnings?: string; // Latest Earnings (from Google Finance)
  sector: string; // For sector grouping
  symbol: string; // Stock symbol for API calls
}

export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  stocks: Stock[];
}

export interface PortfolioData {
  stocks: Stock[];
  sectorSummaries: SectorSummary[];
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
}

export interface ApiResponse {
  symbol: string;
  price: number;
  peRatio?: number;
  earnings?: string;
}
