



import React from 'react';
// FIX: Removed unused TooltipProps import.
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import type { AnalysisResults } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { SunIcon, MoneyIcon, CalendarIcon, CalculatorIcon, PercentageIcon, DownloadIcon } from './icons/IconComponents';
import { YearlyBreakdownTable } from './YearlyBreakdownTable';

interface DashboardProps {
  results: AnalysisResults;
  inputs: any;
}

const SummaryCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string; subtitle?: string; }> = ({ title, value, icon, color, subtitle }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex items-center space-x-4 h-full">
    <div className={`rounded-full p-3 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
      {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>}
    </div>
  </div>
);

const InteractiveROICard: React.FC<{ totalNetSavings: number; initialSystemCost: number; roi: number; }> = ({ totalNetSavings, initialSystemCost, roi }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md lg:col-span-2">
    <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Cálculo del Retorno de Inversión (ROI)</h3>
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MoneyIcon className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Ahorro Neto Total</p>
          </div>
          <p className="font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(totalNetSavings)}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CalculatorIcon className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Costo del Sistema</p>
          </div>
          <p className="font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(initialSystemCost)}</p>
        </div>
        <hr className="border-slate-200 dark:border-slate-700" />
        <p className="text-xs text-center text-slate-500 dark:text-slate-400 italic">Fórmula: (Ahorro Neto / Costo del Sistema) x 100</p>
      </div>
      <div className="flex flex-col items-center justify-center bg-indigo-50 dark:bg-indigo-900/50 p-4 rounded-lg text-center">
        <div className="bg-indigo-500 rounded-full p-3 mb-2">
          <PercentageIcon className="h-6 w-6 text-white" />
        </div>
        <p className="text-sm text-indigo-600 dark:text-indigo-300">Retorno de Inversión</p>
        <p className="text-4xl font-bold text-indigo-700 dark:text-indigo-400">{roi.toFixed(1)}%</p>
      </div>
    </div>
  </div>
);

// FIX: Corrected props type for recharts custom tooltip. `TooltipProps` is for the component, not the content renderer.
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string | number }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
        <p className="font-bold text-slate-800 dark:text-white">{`Año ${label}`}</p>
        {payload.map((pld, index) => (
          <p key={index} style={{ color: pld.color }} className="text-sm">
            {`${pld.name}: ${formatCurrency(pld.value || 0)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const COLORS = ['#4f46e5', '#ef4444', '#f59e0b', '#10b981'];

export const Dashboard: React.FC<DashboardProps> = ({ results, inputs }) => {
  const { yearlyData, paybackPeriod, totalNetSavings, totalCost, roi, lcoe, totalMaintenanceAndFixedCharges, totalGridEnergyCost } = results;
  const { systemLifetime, municipalTaxRate } = inputs;

  const initialSystemCost = totalCost - totalMaintenanceAndFixedCharges - totalGridEnergyCost;
  const costBreakdownData = [ { name: 'Costo Inicial', value: initialSystemCost }, { name: 'Mantenimiento y Cargos Fijos', value: totalMaintenanceAndFixedCharges }, { name: 'Costo Energía de Red', value: totalGridEnergyCost }].filter(d => d.value > 0);
  const firstYear = yearlyData[0];
  const salesTax = 12;
  const totalTaxMultiplier = 1 + salesTax / 100 + municipalTaxRate / 100;
  const firstYearBaseSavings = firstYear ? firstYear.annualSavings / totalTaxMultiplier : 0;
  const firstYearIvaSavings = firstYearBaseSavings * (salesTax / 100);
  const firstYearMunicipalTaxSavings = firstYearBaseSavings * (municipalTaxRate / 100);
  const firstYearSavingsData = firstYear ? [ { name: 'Ahorro Energía', value: firstYearBaseSavings }, { name: 'Ahorro IVA', value: firstYearIvaSavings }, { name: 'Ahorro Tasa Municipal', value: firstYearMunicipalTaxSavings } ] : [];
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.1) return null;
    return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-semibold">{formatCurrency(value)}</text>;
  };

  const handleDownloadCsv = () => {
    if (!yearlyData || yearlyData.length === 0) {
      alert("No hay datos para descargar.");
      return;
    }
  
    const headers = [
      "Año",
      "Ahorro Anual (GTQ)",
      "Costo Anual (GTQ)",
      "Ahorro Neto (GTQ)",
      "Ahorro Acumulado (GTQ)"
    ];
  
    const rows = yearlyData.map(row => [
      row.year,
      row.annualSavings.toFixed(2),
      row.annualCosts.toFixed(2),
      row.netSavings.toFixed(2),
      row.cumulativeSavings.toFixed(2)
    ].join(','));
  
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");

    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "analisis_solar_roi.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto bg-slate-50 dark:bg-slate-900">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Análisis Financiero</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <InteractiveROICard totalNetSavings={totalNetSavings} initialSystemCost={initialSystemCost} roi={roi} />
        <SummaryCard title="Ahorro Neto Total" value={formatCurrency(totalNetSavings)} icon={<MoneyIcon className="h-6 w-6 text-white" />} color="bg-green-500" />
        <SummaryCard title="Período de Recuperación" value={paybackPeriod ? `${paybackPeriod} Años` : 'N/A'} icon={<CalendarIcon className="h-6 w-6 text-white" />} color="bg-amber-500" />
        <SummaryCard title="Costo Nivelado (LCOE)" value={`${formatCurrency(lcoe)} / kWh`} subtitle={`en ${systemLifetime} años`} icon={<SunIcon className="h-6 w-6 text-white" />} color="bg-sky-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div id="cumulative-chart-container" className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Ahorros Acumulados vs. Costos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={yearlyData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="year" tick={{ fill: 'currentColor', fontSize: 12 }} />
              <YAxis tickFormatter={(value) => formatCurrency(Number(value))} tick={{ fill: 'currentColor', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" name="Ahorro Acumulado" dataKey="cumulativeSavings" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" name="Costo Acumulado" dataKey="cumulativeCosts" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div id="annual-chart-container" className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Ahorros vs. Costos Anuales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearlyData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="year" tick={{ fill: 'currentColor', fontSize: 12 }}/>
              <YAxis tickFormatter={(value) => formatCurrency(Number(value))} tick={{ fill: 'currentColor', fontSize: 12 }}/>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar name="Ahorro Anual" dataKey="annualSavings" fill="#10b981" />
              <Bar name="Costo Anual" dataKey="annualCosts" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div id="cost-breakdown-container" className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Desglose de Costos Totales</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{`en ${systemLifetime} años`}</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={costBreakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" labelLine={false} label={renderCustomizedLabel}>
                {costBreakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div id="savings-breakdown-container" className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Desglose Ahorro Primer Año</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={firstYearSavingsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" labelLine={false} label={renderCustomizedLabel}>
                   {firstYearSavingsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
           <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Desglose Anual: Ahorros vs. Costos</h3>
             <button 
              onClick={handleDownloadCsv}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-150 ease-in-out"
              aria-label="Descargar datos como CSV"
            >
              <DownloadIcon className="h-4 w-4" />
              <span>Descargar CSV</span>
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto relative">
             <YearlyBreakdownTable data={yearlyData} />
          </div>
        </div>
      </div>
    </div>
  );
};