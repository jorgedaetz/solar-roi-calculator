import React from 'react';
import type { InputData } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface InputPanelProps {
  inputs: any;
  onInputChange: (name: string, value: number) => void;
}

const InputGroup: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md mb-6">
    <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">{title}</h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const InputField: React.FC<{ label: string, name: string, value: number, onChange: (name: string, value: number) => void, min: number, max: number, step: number, unit?: string, isCurrency?: boolean }> = ({ label, name, value, onChange, min, max, step, unit, isCurrency }) => {
  const displayValue = isCurrency ? formatCurrency(value) : `${formatNumber(value)}${unit || ''}`;

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-600 dark:text-slate-300 flex justify-between">
        <span>{label}</span>
        <span className="font-bold text-indigo-600 dark:text-indigo-400">{displayValue}</span>
      </label>
      <input
        type="range"
        id={name}
        name={name}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(name, parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 mt-1 accent-indigo-600"
      />
    </div>
  );
};

const DisplayField: React.FC<{ label: string, value: string }> = ({ label, value }) => (
    <div className="flex justify-between items-center text-sm py-2">
        <span className="font-medium text-slate-600 dark:text-slate-300">{label}</span>
        <span className="font-bold text-slate-800 dark:text-slate-100 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-md">{value}</span>
    </div>
);


export const InputPanel: React.FC<InputPanelProps> = ({ inputs, onInputChange }) => {
  const consumptionCost = inputs.monthlyKwhConsumption * inputs.kwhPrice;
  const estimatedMonthlyBill = (consumptionCost + inputs.fixedCharge) * 1.12 + (consumptionCost * (inputs.municipalTaxRate / 100));
  const postSolarGridCost = (inputs.gridEnergyKwh * (inputs.powerCharge + inputs.distributionCharge)) * 1.12;

  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto bg-slate-100 dark:bg-slate-900/50">
      <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Parámetros de Inversión</h2>
      
      <InputGroup title="Consumo y Producción">
        <InputField label="Consumo Mensual Promedio (kWh)" name="monthlyKwhConsumption" value={inputs.monthlyKwhConsumption} onChange={onInputChange} min={50} max={2000} step={10} unit=" kWh" />
        <InputField label="Precio Promedio por kWh (Sin IVA)" name="kwhPrice" value={inputs.kwhPrice} onChange={onInputChange} min={0.5} max={3} step={0.01} isCurrency />
        <InputField label="Cargo Fijo Mensual (Sin IVA)" name="fixedCharge" value={inputs.fixedCharge} onChange={onInputChange} min={0} max={100} step={1} isCurrency />
        <DisplayField label="Gasto Mensual Estimado (Pre-Solar)" value={formatCurrency(estimatedMonthlyBill)} />
        <hr className="border-slate-200 dark:border-slate-700 my-2" />
        <InputField label="Producción Anual del Sistema (kWh)" name="annualSystemProduction" value={inputs.annualSystemProduction} onChange={onInputChange} min={1000} max={30000} step={500} unit=" kWh" />
        <hr className="border-slate-200 dark:border-slate-700 my-2" />
        <h4 className="text-md font-semibold text-slate-700 dark:text-slate-200 mt-2">Costos Post-Solar de Red</h4>
        <InputField label="Cargo por Potencia (Q/kWh)" name="powerCharge" value={inputs.powerCharge} onChange={onInputChange} min={0.01} max={2} step={0.01} isCurrency />
        <InputField label="Cargo por Distribución (Q/kWh)" name="distributionCharge" value={inputs.distributionCharge} onChange={onInputChange} min={0.01} max={2} step={0.01} isCurrency />
        <InputField label="Energía recibida de EEGSA (kWh/mes)" name="gridEnergyKwh" value={inputs.gridEnergyKwh} onChange={onInputChange} min={0} max={1000} step={10} unit=" kWh" />
        <DisplayField label="Costo Mensual de Red (Post-Solar)" value={formatCurrency(postSolarGridCost)} />
      </InputGroup>

      <InputGroup title="Inversión en Sistema Solar">
        <InputField label="Costo del Sistema" name="systemCost" value={inputs.systemCost} onChange={onInputChange} min={1000} max={500000} step={1000} isCurrency />
        <InputField label="Mantenimiento Anual" name="maintenanceCost" value={inputs.maintenanceCost} onChange={onInputChange} min={0} max={10000} step={100} isCurrency />
        <InputField label="Duración del Sistema (Años)" name="systemLifetime" value={inputs.systemLifetime} onChange={onInputChange} min={10} max={30} step={1} unit=" años" />
        <InputField label="Degradación Anual del Panel (%)" name="panelDegradation" value={inputs.panelDegradation} onChange={onInputChange} min={0} max={2} step={0.1} unit="%" />
      </InputGroup>
      
      <InputGroup title="Ajustes Financieros Anuales">
        <InputField label="Tasa Municipal (%)" name="municipalTaxRate" value={inputs.municipalTaxRate} onChange={onInputChange} min={0} max={15} step={0.1} unit="%" />
        <InputField label="Inflación Anual (%)" name="inflationRate" value={inputs.inflationRate} onChange={onInputChange} min={0} max={10} step={0.1} unit="%" />
        <InputField label="Aumento de Tarifa Eléctrica (%)" name="electricityPriceIncrease" value={inputs.electricityPriceIncrease} onChange={onInputChange} min={0} max={10} step={0.1} unit="%" />
      </InputGroup>
    </div>
  );
};