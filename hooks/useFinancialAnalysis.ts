import { useMemo } from 'react';
import type { InputData, YearlyData, AnalysisResults } from '../types';

export const useFinancialAnalysis = (inputs: InputData): AnalysisResults => {
  const results = useMemo(() => {
    const yearlyData: YearlyData[] = [];
    let cumulativeSavings = -inputs.systemCost;
    let cumulativeCosts = inputs.systemCost;
    let paybackPeriod: number | null = null;
    const salesTax = 12; // Hardcode VAT/IVA to 12%
    let totalLifetimeProduction = 0;
    let totalMaintenanceAndFixedCharges = 0;
    let totalGridEnergyCost = 0;

    for (let year = 1; year <= inputs.systemLifetime; year++) {
      const degradedProduction = inputs.annualProduction * Math.pow(1 - inputs.panelDegradation / 100, year - 1);
      totalLifetimeProduction += degradedProduction;

      const currentKwhPrice = inputs.kwhPrice * Math.pow(1 + inputs.electricityPriceIncrease / 100, year - 1);
      const energySavingsBase = degradedProduction * currentKwhPrice;
      const totalAnnualSavings = energySavingsBase * (1 + salesTax / 100 + inputs.municipalTaxRate / 100);

      // Calculate ongoing maintenance and fixed charges
      const currentMaintenanceCost = inputs.maintenanceCost * Math.pow(1 + inputs.inflationRate / 100, year - 1);
      const currentFixedCharge = inputs.fixedCharge * Math.pow(1 + inputs.inflationRate / 100, year - 1);
      const annualMaintenanceAndFixed = currentMaintenanceCost + (currentFixedCharge * 12);
      totalMaintenanceAndFixedCharges += annualMaintenanceAndFixed;
      
      // Calculate cost of energy still consumed from the grid
      const currentPowerCharge = inputs.powerCharge * Math.pow(1 + inputs.electricityPriceIncrease / 100, year - 1);
      const currentDistributionCharge = inputs.distributionCharge * Math.pow(1 + inputs.electricityPriceIncrease / 100, year - 1);
      const annualGridEnergyCostWithoutTax = (inputs.gridEnergyKwh * (currentPowerCharge + currentDistributionCharge)) * 12;
      const annualGridEnergyCost = annualGridEnergyCostWithoutTax * (1 + salesTax / 100);
      totalGridEnergyCost += annualGridEnergyCost;

      const totalAnnualCosts = annualMaintenanceAndFixed + annualGridEnergyCost;

      const netSavings = totalAnnualSavings - totalAnnualCosts;
      cumulativeSavings += netSavings;
      cumulativeCosts += totalAnnualCosts;

      yearlyData.push({
        year,
        annualSavings: totalAnnualSavings,
        annualCosts: totalAnnualCosts,
        netSavings,
        cumulativeSavings,
        cumulativeCosts,
      });

      if (paybackPeriod === null && cumulativeSavings >= 0) {
        paybackPeriod = year;
      }
    }

    const totalNetSavings = cumulativeSavings;
    const totalCost = cumulativeCosts;
    const roi = (totalNetSavings / inputs.systemCost) * 100;
    const lcoe = totalLifetimeProduction > 0 ? totalCost / totalLifetimeProduction : 0;

    return { yearlyData, paybackPeriod, totalNetSavings, totalCost, roi, lcoe, totalMaintenanceAndFixedCharges, totalGridEnergyCost };
  }, [inputs]);

  return results;
};