import React from 'react';
import type { YearlyData } from '../types';
import { formatCurrency } from '../utils/formatters';

interface YearlyBreakdownTableProps {
  data: YearlyData[];
}

export const YearlyBreakdownTable: React.FC<YearlyBreakdownTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-slate-500 dark:text-slate-400">No data available.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
        <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300 sticky top-0">
          <tr>
            <th scope="col" className="px-6 py-3 rounded-tl-lg">Año</th>
            <th scope="col" className="px-6 py-3 text-right">Ahorro Anual</th>
            <th scope="col" className="px-6 py-3 text-right">Costo Anual</th>
            <th scope="col" className="px-6 py-3 text-right">Ahorro Neto</th>
            <th scope="col" className="px-6 py-3 text-right rounded-tr-lg">Ahorro Acumulado</th>
          </tr>
        </thead>
        <tbody>
          {data.map((yearData) => (
            <tr key={yearData.year} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
              <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap dark:text-white">
                {yearData.year}
              </td>
              <td className="px-6 py-4 text-right text-green-600 dark:text-green-500">{formatCurrency(yearData.annualSavings)}</td>
              <td className="px-6 py-4 text-right text-red-600 dark:text-red-500">{formatCurrency(yearData.annualCosts)}</td>
              <td className="px-6 py-4 text-right font-semibold">{formatCurrency(yearData.netSavings)}</td>
              <td className={`px-6 py-4 text-right font-bold ${yearData.cumulativeSavings < 0 ? 'text-red-500' : 'text-green-500'}`}>
                {formatCurrency(yearData.cumulativeSavings)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
