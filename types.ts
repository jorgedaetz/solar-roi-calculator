
export interface InputData {
  systemCost: number;
  annualProduction: number;
  kwhPrice: number;
  systemLifetime: number;
  maintenanceCost: number;
  municipalTaxRate: number;
  inflationRate: number;
  electricityPriceIncrease: number;
  panelDegradation: number;
  fixedCharge: number;
  powerCharge: number;
  distributionCharge: number;
  gridEnergyKwh: number;
}

export interface YearlyData {
  year: number;
  annualSavings: number;
  annualCosts: number;
  netSavings: number;
  cumulativeSavings: number;
  cumulativeCosts: number;
}

export interface AnalysisResults {
  yearlyData: YearlyData[];
  paybackPeriod: number | null;
  totalNetSavings: number;
  totalCost: number;
  roi: number;
  lcoe: number;
  totalMaintenanceAndFixedCharges: number;
  totalGridEnergyCost: number;
}