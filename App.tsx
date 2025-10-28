
import React, { useState, useCallback } from 'react';
import type { InputData } from './types';
import { InputPanel } from './components/InputPanel';
import { Dashboard } from './components/Dashboard';
import { useFinancialAnalysis } from './hooks/useFinancialAnalysis';
import { SunIcon } from './components/icons/IconComponents';

const App: React.FC = () => {
  const [inputs, setInputs] = useState({
    monthlyKwhConsumption: 245,
    annualSystemProduction: 3900,
    kwhPrice: 1.13,
    systemCost: 20000,
    systemLifetime: 15,
    maintenanceCost: 250,
    municipalTaxRate: 14,
    inflationRate: 1,
    electricityPriceIncrease: 1,
    panelDegradation: 1,
    fixedCharge: 14,
    powerCharge: 0.06,
    distributionCharge: 0.25,
    gridEnergyKwh: 100,
  });

  const handleInputChange = useCallback((name: string, value: number) => {
    setInputs(prevInputs => ({
      ...prevInputs,
      [name]: value,
    }));
  }, []);

  const { monthlyKwhConsumption, ...analysisRelatedInputs } = inputs;
  
  const analysisInputs: InputData = {
    ...analysisRelatedInputs,
    annualProduction: analysisRelatedInputs.annualSystemProduction,
  };

  const analysisResults = useFinancialAnalysis(analysisInputs);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <header className="bg-white dark:bg-slate-800 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <SunIcon className="h-8 w-8 text-amber-500 mr-3"/>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Solar ROI
          </h1>
        </div>
      </header>

      <main className="flex flex-col lg:flex-row" style={{ height: 'calc(100vh - 68px)' }}>
        <aside className="w-full lg:w-1/3 xl:w-1/4 lg:border-r border-slate-200 dark:border-slate-700">
          <InputPanel inputs={inputs} onInputChange={handleInputChange} />
        </aside>
        <section className="w-full lg:w-2/3 xl:w-3/4">
          <Dashboard results={analysisResults} inputs={inputs} />
        </section>
      </main>
    </div>
  );
};

export default App;
