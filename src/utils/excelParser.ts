import * as XLSX from 'xlsx';
import { Stock } from '@/types/portfolio';
import { defaultStocks } from '@/utils/defaultStocks';

type GenericCellValue = unknown;
type GenericRow = Record<string, GenericCellValue>;

// Map __EMPTY-prefixed columns to standard column names
const mapExcelColumns = (row: GenericRow): GenericRow => {
  const columnMapping: Record<string, string> = {
    '__EMPTY': 'No',
    '__EMPTY_1': 'Particulars',
    '__EMPTY_2': 'Purchase Price',
    '__EMPTY_3': 'Qty',
    '__EMPTY_4': 'Investment',
    '__EMPTY_5': 'Portfolio (%)',
    '__EMPTY_6': 'NSE/BSE',
    '__EMPTY_7': 'CMP',
    '__EMPTY_8': 'Present Value',
    '__EMPTY_9': 'Gain/Loss',
    '__EMPTY_10': 'P/E Ratio',
    '__EMPTY_11': 'Latest Earnings',
    '__EMPTY_12': 'Sector',
    '__EMPTY_13': 'Symbol'
  };

  const mappedRow: GenericRow = {};
  Object.keys(row).forEach((key) => {
    mappedRow[key] = row[key];
    if (columnMapping[key]) {
      mappedRow[columnMapping[key]] = row[key];
    }
  });

  return mappedRow;
};

export interface ExcelPortfolioRow {
  Particulars?: string;
  'Purchase Price'?: number;
  Qty?: number;
  Investment?: number;
  'Portfolio (%)'?: number;
  'NSE/BSE'?: string;
  CMP?: number;
  'Present Value'?: number;
  'Gain/Loss'?: number;
  'P/E Ratio'?: number;
  'Latest Earnings'?: string;
  Sector?: string;
  Symbol?: string;
  [key: string]: unknown;
}

export const parseExcelFile = async (file: File): Promise<Stock[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];

        // Attempt to parse with headers
        const jsonWithHeaders: GenericRow[] = XLSX.utils.sheet_to_json<GenericRow>(worksheet, {
          defval: '',
          raw: false,
          blankrows: false
        });

        if (jsonWithHeaders.length > 0 && typeof jsonWithHeaders[0] === 'object') {
          const processedRows = jsonWithHeaders.map((row, index) => {
            const mappedRow = mapExcelColumns(row);

            if (index < 3) {
              console.log(`Row ${index} before mapping:`, row);
              console.log(`Row ${index} after mapping:`, mappedRow);
            }

            const particulars = String(mappedRow['Particulars'] || '').trim();
            const purchasePrice = parseFloat(String(mappedRow['Purchase Price'] || 0));
            const qty = parseInt(String(mappedRow['Qty'] || 0));
            const investment = parseFloat(String(mappedRow['Investment'] || 0));
            const portfolioPercentage = parseFloat(String(mappedRow['Portfolio (%)'] || 0));
            const exchangeString = String(mappedRow['NSE/BSE'] || 'NSE').trim();
            const exchange = exchangeString === 'BSE' ? 'BSE' : 'NSE';
            const cmp = parseFloat(String(mappedRow['CMP'] || 0));
            const presentValue = parseFloat(String(mappedRow['Present Value'] || 0));
            const gainLoss = parseFloat(String(mappedRow['Gain/Loss'] || 0));
            const peRatio = parseFloat(String(mappedRow['P/E Ratio'] || 0));
            const earnings = String(mappedRow['Latest Earnings'] || '').trim();
            const sector = String(mappedRow['Sector'] || 'Others').trim();
            const symbol = String(mappedRow['Symbol'] || '').trim();

            console.log(`Processing row: ${particulars}, Symbol: "${symbol}", Exchange: ${exchangeString}`);

            return {
              Particulars: particulars,
              'Purchase Price': purchasePrice,
              Qty: qty,
              Investment: investment || purchasePrice * qty,
              'Portfolio (%)': portfolioPercentage,
              'NSE/BSE': exchange,
              CMP: cmp || purchasePrice,
              'Present Value': presentValue || cmp * qty,
              'Gain/Loss': gainLoss,
              'P/E Ratio': peRatio || undefined,
              'Latest Earnings': earnings || undefined,
              Sector: sector,
              Symbol: symbol
            } as ExcelPortfolioRow;
          });

          const stocks = processPortfolioData(processedRows);
          resolve(stocks);
          return;
        }

        // Fallback to array-based parsing
        const rawData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: ''
        }) as unknown[][];

        const jsonData: ExcelPortfolioRow[] = rawData.slice(1).map((row) => {
          const exchangeString = String(row[5] || 'NSE').trim();
          const exchange = exchangeString === 'BSE' ? 'BSE' : 'NSE';

          return {
            Particulars: String(row[0] || '').trim(),
            'Purchase Price': parseFloat(String(row[1])) || 0,
            Qty: parseInt(String(row[2])) || 0,
            Investment: parseFloat(String(row[3])) || 0,
            'Portfolio (%)': parseFloat(String(row[4])) || 0,
            'NSE/BSE': exchange,
            CMP: parseFloat(String(row[6])) || 0,
            'Present Value': parseFloat(String(row[7])) || 0,
            'Gain/Loss': parseFloat(String(row[8])) || 0,
            'P/E Ratio': parseFloat(String(row[9])) || 0,
            'Latest Earnings': String(row[10] || '').trim(),
            Sector: String(row[11] || 'Others').trim(),
            Symbol: String(row[12] || '').trim()
          };
        });

        const stocks = processPortfolioData(jsonData);
        resolve(stocks);

      } catch (error) {
        reject(
          new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`)
        );
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'));
    };

    reader.readAsArrayBuffer(file);
  });
};

const processPortfolioData = (jsonData: ExcelPortfolioRow[]): Stock[] => {
  const filteredRows = jsonData.filter((row) => {
    const particulars = String(row.Particulars || '').trim();
    const purchasePrice = Number(row['Purchase Price'] || 0);
    const quantity = Number(row.Qty || 0);
    const isPurchasePriceValid = !isNaN(purchasePrice) && purchasePrice > 0;
    const isQuantityValid = !isNaN(quantity) && quantity > 0;

    // Skip known header or sector summary rows
    if (
      particulars === '' ||
      particulars === 'Particulars' ||
      particulars === 'No' ||
      particulars.toLowerCase().includes('sector') ||
      /^\d+\.?\d*$/.test(particulars) ||
      !isPurchasePriceValid ||
      !isQuantityValid
    ) {
      return false;
    }

    return true;
  });

  if (filteredRows.length === 0) {
    return defaultStocks;
  }

  const stocks: Stock[] = filteredRows.map((row, idx) => {
    const exchangeVal: 'BSE' | 'NSE' = row['NSE/BSE'] === 'BSE' ? 'BSE' : 'NSE';

    return {
      id: (idx + 1).toString(),
      particulars: row.Particulars || '',
      purchasePrice: row['Purchase Price'] || 0,
      quantity: row.Qty || 0,
      investment: row.Investment || (row['Purchase Price'] || 0) * (row.Qty || 0),
      portfolioPercentage: row['Portfolio (%)'] || 0,
      exchange: exchangeVal,
      cmp: row.CMP || (row['Purchase Price'] || 0),
      presentValue: row['Present Value'] || ((row.CMP || 0) * (row.Qty || 0)),
      gainLoss: row['Gain/Loss'] || 0,
      peRatio: row['P/E Ratio'] || undefined,
      latestEarnings: row['Latest Earnings'] || undefined,
      sector: row.Sector || 'Others',
      symbol: generateSymbol(row.Particulars || '', exchangeVal)
    };
  });

  const validStocks = stocks.filter((stock) => {
    if (!stock.symbol || stock.symbol.trim().length < 2) {
      return false;
    }
    return /^[A-Z0-9.-]+$/i.test(stock.symbol);
  });

  return validStocks.length > 0 ? validStocks : defaultStocks;
};

const generateSymbol = (companyName: string, exchange: 'BSE' | 'NSE'): string => {
  if (!companyName.trim()) return 'UNKNOWN.NS';
  const cleanName = companyName.trim();

  if (/^\d+(\.\d+)?$/.test(cleanName)) {
    return 'UNKNOWN.NS';
  }

  const symbolMap: { [key: string]: string } = {
    'Reliance Industries Ltd': 'RELIANCE',
    'Tata Consultancy Services': 'TCS',
    'HDFC Bank Ltd': 'HDFCBANK',
    'Infosys Ltd': 'INFY',
    'ICICI Bank Ltd': 'ICICIBANK',
    'State Bank of India': 'SBIN',
    'SBI': 'SBIN'
  };

  for (const [mappedName, mappedSymbol] of Object.entries(symbolMap)) {
    if (cleanName.toLowerCase() === mappedName.toLowerCase()) {
      return exchange === 'BSE' ? mappedSymbol : `${mappedSymbol}.NS`;
    }
  }

  let generatedSymbol = cleanName
    .replace(/\bLimited\b|\bLtd\b|\bInc\b|\bCorp\b|\bCorporation\b|\bCompany\b|\b&\sCo\b/gi, '')
    .replace(/\(\w+\)/g, '')
    .replace(/[-&,.:;]/g, ' ')
    .trim()
    .replace(/\s+/g, '')
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
    .substring(0, 10);

  if (!generatedSymbol || generatedSymbol.length < 2) {
    generatedSymbol = 'UNKNOWN';
  }

  return exchange === 'BSE' ? generatedSymbol : `${generatedSymbol}.NS`;
};
