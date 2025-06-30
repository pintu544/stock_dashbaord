// Updated code to fix TypeScript errors and remove 'any' types

import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

interface SymbolsPayload {
  symbols: string[];
}

interface QuoteData {
  regularMarketPrice?: number;
  regularMarketPreviousClose?: number;
  trailingPE?: number;
  forwardPE?: number;
}

interface EarningsActual {
  fmt?: string;
  raw?: number;
}

export async function POST(request: NextRequest) {
  try {
    // Previously: const { symbols } = await request.json();
    // Replaced to avoid 'any' type from request.json().
    const body = (await request.json()) as SymbolsPayload;
    const { symbols } = body;

    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json(
        { error: 'Symbols array is required' },
        { status: 400 }
      );
    }

    // Filter out invalid symbols before processing
    const validSymbols = symbols.filter((symbol) => {
      if (!symbol || typeof symbol !== 'string') return false;
      const trimmedSymbol = symbol.trim();
      if (/^\d+\.?\d*$/.test(trimmedSymbol)) return false; // Exclude pure numbers
      if (trimmedSymbol.length < 2) return false; // Exclude very short symbols
      return true;
    });

    if (validSymbols.length === 0) {
      return NextResponse.json({
        results: [],
        message: 'No valid symbols found'
      });
    }

    const results: Array<{
      symbol: string;
      price: number;
      peRatio?: number;
      earnings: string;
      fallback?: boolean;
    }> = [];

    const rateLimitDelay = 200; // Delay between API calls

    // Process symbols sequentially to avoid rate limiting
    for (let i = 0; i < validSymbols.length; i++) {
      const symbol = validSymbols[i];

      try {
        // Removed 'any' by defining QuoteData type
        const quote = (await yahooFinance.quote(symbol, {
          fields: ['regularMarketPrice', 'regularMarketPreviousClose', 'trailingPE', 'forwardPE']
        }).catch(() => null)) as QuoteData | QuoteData[] | null;

        let quoteData: QuoteData | null = null;
        if (Array.isArray(quote)) {
          // If yahooFinance returns an array, use first element
          quoteData = quote[0] || null;
        } else {
          quoteData = quote;
        }

        const fundamentals = await yahooFinance.quoteSummary(symbol, {
          modules: ['earnings', 'financialData']
        }).catch(() => null);

        const price = quoteData?.regularMarketPrice || quoteData?.regularMarketPreviousClose || 0;
        const peRatio = quoteData?.trailingPE || quoteData?.forwardPE;

        let earnings = 'N/A';
        if (fundamentals?.earnings?.earningsChart?.quarterly) {
          const latestQuarter = fundamentals.earnings.earningsChart.quarterly[0];
          if (latestQuarter?.actual) {
            const actual = latestQuarter.actual;
            if (typeof actual === 'object' && actual !== null) {
              const earningsActual = actual as EarningsActual;
              earnings = `Q${latestQuarter.date}: ${earningsActual.fmt || earningsActual.raw}`;
            } else if (typeof actual === 'number') {
              earnings = `Q${latestQuarter.date}: ${actual}`;
            } else {
              earnings = `Q${latestQuarter.date}: N/A`;
            }
          }
        }

        results.push({
          symbol,
          price: Math.round(price * 100) / 100,
          peRatio: peRatio !== undefined ? Number(peRatio.toFixed(2)) : undefined,
          earnings
        });

        // Add delay between requests to avoid rate limiting
        if (i < validSymbols.length - 1) {
          await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
        }

      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);

        // Add fallback data for failed requests
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

        const mockMetrics: { [key: string]: { peRatio: number; earnings: string } } = {
          'RELIANCE.NS': { peRatio: 14.2 + (Math.random() - 0.5) * 2, earnings: 'Q3 FY24: ₹18,951 Cr' },
          'TCS.NS': { peRatio: 28.5 + (Math.random() - 0.5) * 3, earnings: 'Q3 FY24: ₹11,735 Cr' },
          'HDFCBANK.NS': { peRatio: 19.8 + (Math.random() - 0.5) * 2, earnings: 'Q3 FY24: ₹16,511 Cr' },
          'INFY.NS': { peRatio: 25.1 + (Math.random() - 0.5) * 2, earnings: 'Q3 FY24: ₹6,586 Cr' },
          'ICICIBANK.NS': { peRatio: 16.7 + (Math.random() - 0.5) * 2, earnings: 'Q3 FY24: ₹10,261 Cr' },
        };

        const fallbackPrice = mockPrices[symbol] || 1000 + Math.random() * 500;
        const fallbackMetrics = mockMetrics[symbol] || { peRatio: 15 + Math.random() * 10, earnings: 'Q3 FY24: N/A' };

        results.push({
          symbol,
          price: Math.round(fallbackPrice * 100) / 100,
          peRatio: Math.round(fallbackMetrics.peRatio * 100) / 100,
          earnings: fallbackMetrics.earnings,
          fallback: true
        });
      }
    }

    return NextResponse.json({ results });

  } catch (error) {
    console.error('Error fetching multiple stock data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}
