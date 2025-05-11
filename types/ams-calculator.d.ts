export interface CalculatorSettings {
  name: string
  fee_enabled: boolean
  fee_percentage: number
  manager: number | null
}

export type Crew = {
  id: number
  name: string
  ship: string
}

export type Worker = {
  id: number
  crew: number | null
  internal_id: string
  external: boolean
  external_name: string | null
}

export type Transfer = {
  id: number
  name: string
  amount: number | null
  worker: number | null
}

export interface CalculatedPayout {
  workerId: number;
  isManager: boolean;
  grossReimbursement: number;
  grossProfitShare: number;
  finalGrossPayout: number;
  percentageOfTotalGrossRawIncome: number;
}

export interface OverallDistributionSummary {
  payouts: CalculatedPayout[];
  totalGrossRawIncome: number;
  totalIncomeConsolidationFees: number; // Gebühren bei Einnahmen-Konsolidierung
  totalMissionExpenses: number;
  netOperatingProfit: number;          // Einnahmen (nach internen Gebühren) - Ausgaben (Manager-Topf vor Payouts)
  totalGrossReimbursements: number;    // Summe aller Brutto-Auslagenerstattungen
  totalGrossProfitAllocatedForSharing: number; // Brutto-Topf für Gewinnanteile (vor Gebührenaufschlag für Nicht-Manager) -> war profitPotForSharing
  totalNetProfitEffectivelyReceivedByWorkers: number; // Summe der Netto-Gewinnanteile, die jeder Worker erhält/behält
  targetNetProfitShareForEachWorker: number;    // Netto-Zielanteil pro Worker aus dem Reingewinn
  totalFeesOnPayoutsToNonManagers: number; // NEU: Summe der Gebühren auf Auszahlungen an Nicht-Manager
  totalAllTransactionFees: number;      // NEU: Gesamtsumme aller Gebühren
}