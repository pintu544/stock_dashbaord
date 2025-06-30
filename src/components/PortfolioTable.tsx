'use client';

import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  GroupingState,
  ExpandedState,
} from '@tanstack/react-table';
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Stock } from '@/types/portfolio';
import { formatCurrency, formatPercentage, getGainLossColor } from '@/utils/portfolioCalculations';

interface PortfolioTableProps {
  stocks: Stock[];
}

const columnHelper = createColumnHelper<Stock>();

export const PortfolioTable: React.FC<PortfolioTableProps> = ({ stocks }) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [grouping, setGrouping] = React.useState<GroupingState>(['sector']);
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const columns = React.useMemo(
    () => [
      columnHelper.accessor('sector', {
        header: 'Sector',
        cell: ({ getValue, row }) => {
          const sector = getValue();
          if (row.getIsGrouped()) {
            return (
              <div className="flex items-center gap-2 font-semibold text-blue-600">
                <button
                  onClick={row.getToggleExpandedHandler()}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {row.getIsExpanded() ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                {sector} ({row.subRows.length} stocks)
              </div>
            );
          }
          return <span className="text-gray-600 text-sm">{sector}</span>;
        },
        aggregationFn: 'count',
        enableGrouping: true,
      }),
      columnHelper.accessor('particulars', {
        header: 'Particulars',
        cell: ({ getValue, row }) => {
          if (row.getIsGrouped()) return null;
          return (
            <div className="font-medium text-red-900">
              {getValue()}
            </div>
          );
        },
        enableGrouping: false,
      }),
      columnHelper.accessor('purchasePrice', {
        header: 'Purchase Price',
        cell: ({ getValue, row }) => {
          if (row.getIsGrouped()) return null;
          return (
            <div className="text-right font-mono">
              {formatCurrency(getValue())}
            </div>
          );
        },
        enableGrouping: false,
      }),
      columnHelper.accessor('quantity', {
        header: 'Qty',
        cell: ({ getValue, row }) => {
          if (row.getIsGrouped()) {
            const totalQty = row.subRows.reduce((sum, subRow) => sum + subRow.original.quantity, 0);
            return <div className="text-right font-semibold">{totalQty}</div>;
          }
          return <div className="text-right">{getValue()}</div>;
        },
        aggregationFn: 'sum',
        enableGrouping: false,
      }),
      columnHelper.accessor('investment', {
        header: 'Investment',
        cell: ({ getValue, row }) => {
          if (row.getIsGrouped()) {
            const totalInvestment = row.subRows.reduce((sum, subRow) => sum + subRow.original.investment, 0);
            return <div className="text-right font-semibold">{formatCurrency(totalInvestment)}</div>;
          }
          return (
            <div className="text-right font-mono">
              {formatCurrency(getValue())}
            </div>
          );
        },
        aggregationFn: 'sum',
        enableGrouping: false,
      }),
      columnHelper.accessor('portfolioPercentage', {
        header: 'Portfolio (%)',
        cell: ({ getValue, row }) => {
          if (row.getIsGrouped()) {
            const totalPercentage = row.subRows.reduce((sum, subRow) => sum + subRow.original.portfolioPercentage, 0);
            return <div className="text-right font-semibold">{formatPercentage(totalPercentage)}</div>;
          }
          return (
            <div className="text-right">
              {formatPercentage(getValue())}
            </div>
          );
        },
        aggregationFn: 'sum',
        enableGrouping: false,
      }),
      columnHelper.accessor('exchange', {
        header: 'Exchange',
        cell: ({ getValue, row }) => {
          if (row.getIsGrouped()) return null;
          return (
            <div className="text-center">
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                {getValue()}
              </span>
            </div>
          );
        },
        enableGrouping: false,
      }),
      columnHelper.accessor('cmp', {
        header: 'CMP',
        cell: ({ getValue, row }) => {
          if (row.getIsGrouped()) return null;
          const cmp = getValue();
          const purchasePrice = row.original.purchasePrice;
          const isUp = cmp > purchasePrice;
          
          return (
            <div className={`text-right font-mono flex items-center justify-end gap-1 ${isUp ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(cmp)}
              {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            </div>
          );
        },
        enableGrouping: false,
      }),
      columnHelper.accessor('presentValue', {
        header: 'Present Value',
        cell: ({ getValue, row }) => {
          if (row.getIsGrouped()) {
            const totalPresentValue = row.subRows.reduce((sum, subRow) => sum + subRow.original.presentValue, 0);
            return <div className="text-right font-semibold">{formatCurrency(totalPresentValue)}</div>;
          }
          return (
            <div className="text-right font-mono">
              {formatCurrency(getValue())}
            </div>
          );
        },
        aggregationFn: 'sum',
        enableGrouping: false,
      }),
      columnHelper.accessor('gainLoss', {
        header: 'Gain/Loss',
        cell: ({ getValue, row }) => {
          if (row.getIsGrouped()) {
            const totalGainLoss = row.subRows.reduce((sum, subRow) => sum + subRow.original.gainLoss, 0);
            return (
              <div className={`text-right font-semibold flex items-center justify-end gap-1 ${getGainLossColor(totalGainLoss)}`}>
                {formatCurrency(totalGainLoss)}
                {totalGainLoss > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              </div>
            );
          }
          const gainLoss = getValue();
          return (
            <div className={`text-right font-mono flex items-center justify-end gap-1 ${getGainLossColor(gainLoss)}`}>
              {formatCurrency(gainLoss)}
              {gainLoss > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            </div>
          );
        },
        aggregationFn: 'sum',
        enableGrouping: false,
      }),
      columnHelper.accessor('peRatio', {
        header: 'P/E Ratio',
        cell: ({ getValue, row }) => {
          if (row.getIsGrouped()) return null;
          const peRatio = getValue();
          return (
            <div className="text-right">
              {peRatio ? peRatio.toFixed(2) : 'N/A'}
            </div>
          );
        },
        enableGrouping: false,
      }),
      columnHelper.accessor('latestEarnings', {
        header: 'Latest Earnings',
        cell: ({ getValue, row }) => {
          if (row.getIsGrouped()) return null;
          return (
            <div className="text-sm text-gray-600 max-w-32 truncate" title={getValue()}>
              {getValue() || 'N/A'}
            </div>
          );
        },
        enableGrouping: false,
      }),
    ],
    []
  );

  const table = useReactTable({
    data: stocks,
    columns,
    state: {
      sorting,
      grouping,
      expanded,
    },
    onSortingChange: setSorting,
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    enableGrouping: true,
  });

  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-2">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() && (
                      <span className="text-blue-600">
                        {header.column.getIsSorted() === 'desc' ? '↓' : '↑'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${
                row.getIsGrouped() ? 'bg-blue-50 dark:bg-blue-900' : ''
              }`}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    row.getIsGrouped() ? 'font-medium' : ''
                  } text-black dark:text-white`}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
