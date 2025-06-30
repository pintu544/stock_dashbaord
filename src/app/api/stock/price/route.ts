import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

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

    // Fetch stock price from Yahoo Finance
    const quote = await yahooFinance.quote(symbol, {
      fields: ['regularMarketPrice', 'regularMarketPreviousClose']
    });

    // Check if quote is valid
    if (!quote || typeof quote !== 'object') {
      throw new Error(`No quote data received for ${symbol}`);
    }

    const price = quote.regularMarketPrice || quote.regularMarketPreviousClose || 0;

    return NextResponse.json({
      symbol,
      price: Math.round(price * 100) / 100
    });

  } catch (error) {
    console.error(`Error fetching price for symbol:`, error);
    
    // Return mock data as fallback
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

    const symbol = new URL(request.url).searchParams.get('symbol') || '';
    const fallbackPrice = mockPrices[symbol] || 1000 + Math.random() * 500;

    return NextResponse.json({
      symbol,
      price: Math.round(fallbackPrice * 100) / 100,
      fallback: true
    });
  }
}
