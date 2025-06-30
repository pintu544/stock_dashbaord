// Updated code to fix TypeScript errors and remove 'any' types

import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

interface Quote {
  trailingPE?: number;
  forwardPE?: number;
}

interface EarningsActual {
  fmt?: string;
  raw?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    // Validate symbol format (should not be a number)
    if (/^\d+\.?\d*$/.test(symbol.trim())) {
      return NextResponse.json(
        { error: `Invalid symbol format: ${symbol}` },
        { status: 400 }
      );
    }

    // Fetch financial metrics from Yahoo Finance
    const [quote, fundamentals] = await Promise.all([
      yahooFinance.quote(symbol, {
        fields: ['trailingPE', 'forwardPE']
      }).catch(() => null),
      yahooFinance.quoteSummary(symbol, {
        modules: ['earnings', 'financialData']
      }).catch(() => null)
    ]);

    // Check if quote is valid
    if (!quote || typeof quote !== 'object') {
      throw new Error(`No quote data received for ${symbol}`);
    }

    // Convert array to single object if yahooFinance returns an array
    const typedQuote: Quote = Array.isArray(quote) ? quote[0] : quote;
    const peRatio = typedQuote?.trailingPE || typedQuote?.forwardPE;
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

    return NextResponse.json({
      symbol,
      peRatio: peRatio !== undefined ? Number(peRatio.toFixed(2)) : undefined,
      earnings
    });

  } catch (error) {
    console.error(`Error fetching metrics for symbol:`, error);

    // Return mock data as fallback
    const mockMetrics: { [key: string]: { peRatio: number; earnings: string } } = {
      'RELIANCE.NS': { peRatio: 14.2 + (Math.random() - 0.5) * 2, earnings: 'Q3 FY24: ₹18,951 Cr' },
      'TCS.NS': { peRatio: 28.5 + (Math.random() - 0.5) * 3, earnings: 'Q3 FY24: ₹11,735 Cr' },
      'HDFCBANK.NS': { peRatio: 19.8 + (Math.random() - 0.5) * 2, earnings: 'Q3 FY24: ₹16,511 Cr' },
      'INFY.NS': { peRatio: 25.1 + (Math.random() - 0.5) * 2, earnings: 'Q3 FY24: ₹6,586 Cr' },
      'ICICIBANK.NS': { peRatio: 16.7 + (Math.random() - 0.5) * 2, earnings: 'Q3 FY24: ₹10,261 Cr' },
    };

    const symbol = new URL(request.url).searchParams.get('symbol') || '';
    const metrics = mockMetrics[symbol] || { peRatio: 15 + Math.random() * 10, earnings: 'Q3 FY24: N/A' };

    return NextResponse.json({
      symbol,
      peRatio: Math.round(metrics.peRatio * 100) / 100,
      earnings: metrics.earnings,
      fallback: true
    });
  }
}
