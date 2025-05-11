import type { CalculatorSettings, Worker, Transfer, CalculatedPayout, OverallDistributionSummary } from '~~/types';

export default function calculateFairShareDistributionWithManager (
  incomes: Transfer[],
  expenses: Transfer[],
  workers: Worker[],
  settings: CalculatorSettings
): OverallDistributionSummary {
  const payouts: CalculatedPayout[] = []; // Wird jetzt Objekte vom Typ CalculatedPayout enthalten
  const managerId = settings.manager;
  const feeRate = settings.fee_enabled ? settings.fee_percentage / 100 : 0;

  let totalGrossRawIncome = 0;
  let totalIncomeConsolidationFees = 0;

  let totalEffectiveIncomeAtManager = 0;
  incomes.forEach(income => {
    let rawAmount = income.amount || 0;
    totalGrossRawIncome += rawAmount; // Hier die Gesamt-Brutto-Roheinnahmen summieren
    let currentEffectiveAmount = rawAmount;

    if (
      income.worker !== null &&
      income.worker !== managerId &&
      settings.fee_enabled &&
      feeRate > 0
    ) {
      const feeOnIncomeTransfer = rawAmount * feeRate;
      totalIncomeConsolidationFees += feeOnIncomeTransfer;
      currentEffectiveAmount -= feeOnIncomeTransfer;
    }
    totalEffectiveIncomeAtManager += currentEffectiveAmount;
  });

  const totalMissionExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

  const workerGrossReimbursements = new Map<number, number>();
  workers.forEach(w => workerGrossReimbursements.set(w.id, 0));
  expenses.forEach(expense => {
    if (expense.worker !== null && expense.amount !== null) {
      const currentReimbursement = workerGrossReimbursements.get(expense.worker) || 0;
      workerGrossReimbursements.set(expense.worker, currentReimbursement + expense.amount);
    }
  });

  const netOperatingProfit = totalEffectiveIncomeAtManager - totalMissionExpenses;

  let totalGrossReimbursementsSum = 0;
  workerGrossReimbursements.forEach(amount => totalGrossReimbursementsSum += amount);

  const grossProfitAllocatedForSharing = netOperatingProfit - totalGrossReimbursementsSum;

  const individualGrossProfitShares = new Map<number, number>();
  const N = workers.length;
  let calculatedTargetNetProfitSharePerWorker = 0;

  if (N > 0 && grossProfitAllocatedForSharing !== 0) {
    if (N === 1) {
      calculatedTargetNetProfitSharePerWorker = grossProfitAllocatedForSharing;
    } else {
      if (feeRate > 0) {
        calculatedTargetNetProfitSharePerWorker = grossProfitAllocatedForSharing * (1 - feeRate) / (N - feeRate);
      } else {
        calculatedTargetNetProfitSharePerWorker = grossProfitAllocatedForSharing / N;
      }
    }

    workers.forEach(worker => {
      if (worker.id === managerId) {
        individualGrossProfitShares.set(worker.id, calculatedTargetNetProfitSharePerWorker);
      } else {
        const grossShareForNonManager = (feeRate > 0 && (1 - feeRate) !== 0)
          ? calculatedTargetNetProfitSharePerWorker / (1 - feeRate)
          : calculatedTargetNetProfitSharePerWorker;
        individualGrossProfitShares.set(worker.id, grossShareForNonManager);
      }
    });
  } else {
    workers.forEach(worker => individualGrossProfitShares.set(worker.id, 0));
  }

  // Finale Auszahlungen (payouts Array) zusammenstellen und Prozentanteil berechnen
  workers.forEach(worker => {
    const workerId = worker.id;
    const isCurrentWorkerManager = workerId === managerId;
    const grossReimbursement = workerGrossReimbursements.get(workerId) || 0;
    const grossProfitShare = individualGrossProfitShares.get(workerId) || 0;
    const finalGrossPayout = grossReimbursement + grossProfitShare;

    // NEU: Prozentualen Anteil an den Gesamt-Brutto-Roheinnahmen berechnen
    const percentageOfTotalIncome = totalGrossRawIncome > 0 ? (finalGrossPayout / totalGrossRawIncome) * 100 : 0;

    payouts.push({
      workerId,
      isManager: isCurrentWorkerManager,
      grossReimbursement,
      grossProfitShare,
      finalGrossPayout,
      percentageOfTotalGrossRawIncome: percentageOfTotalIncome, // Hinzugefügt
    });
  });

  let totalFeesOnPayoutsToNonManagers = 0;
  if (settings.fee_enabled && feeRate > 0) {
    payouts.forEach(payout => {
      if (!payout.isManager) {
        totalFeesOnPayoutsToNonManagers += payout.finalGrossPayout * feeRate;
      }
    });
  }

  const totalAllTransactionFeesCalculated = totalIncomeConsolidationFees + totalFeesOnPayoutsToNonManagers;

  return {
    payouts, // Enthält jetzt den Prozentanteil für jeden Worker
    totalGrossRawIncome,
    totalIncomeConsolidationFees,
    totalMissionExpenses,
    netOperatingProfit,
    totalGrossReimbursements: totalGrossReimbursementsSum,
    totalGrossProfitAllocatedForSharing: grossProfitAllocatedForSharing,
    totalNetProfitEffectivelyReceivedByWorkers: (N > 0 && grossProfitAllocatedForSharing !== 0)
      ? N * calculatedTargetNetProfitSharePerWorker
      : 0,
    targetNetProfitShareForEachWorker: calculatedTargetNetProfitSharePerWorker,
    totalFeesOnPayoutsToNonManagers,
    totalAllTransactionFees: totalAllTransactionFeesCalculated,
  };

}

// --- Beispielhafte Anwendung (Ausgabe angepasst) ---
// const sampleSettingsWithTotalFees: Settings = {
//   name: "Total Fees Ops Summary",
//   fee_enabled: true,
//   fee_percentage: 10,
//   manager: 1,
// };

// const sampleWorkersWithTotalFees: Worker[] = [
//   { id: 1, crew: 1, internal_id: "ManagerPete", external: false, external_name: null },
//   { id: 2, crew: 1, internal_id: "MemberSue", external: false, external_name: null },
//   { id: 3, crew: 2, internal_id: "MemberBob", external: false, external_name: null },
// ];

// const sampleIncomesWithTotalFees: Transfer[] = [
//   { id: 1, name: "Sue's Find", amount: 100000, worker: 2 }, // 10k Gebühr bei Konsolidierung
//   { id: 2, name: "Pete's Haul", amount: 50000, worker: 1 },
// ]; // totalGrossRawIncome = 150k, totalIncomeConsolidationFees = 10k

// const sampleExpensesWithTotalFees: Transfer[] = [
//   { id: 3, name: "Pete's Fuel", amount: 2000, worker: 1 },
//   { id: 4, name: "Sue's Repairs", amount: 3000, worker: 2 },
//   { id: 5, name: "Bob's Ammo", amount: 1000, worker: 3 },
// ]; // totalMissionExpenses = 6k

// console.log("\n--- Finale Verteilung mit Gesamtübersicht inklusive aller Gebühren ---");
// const summaryWithTotalFees = calculateFairShareDistributionWithManager(
//   sampleIncomesWithTotalFees,
//   sampleExpensesWithTotalFees,
//   sampleWorkersWithTotalFees,
//   sampleSettingsWithTotalFees
// );

// console.log("Gesamte Bruttoeinnahmen (Roh):", summaryWithTotalFees.totalGrossRawIncome.toFixed(2));
// console.log("Gebühren für Einnahmen-Konsolidierung:", summaryWithTotalFees.totalIncomeConsolidationFees.toFixed(2));
// console.log("Gesamte Missionsausgaben:", summaryWithTotalFees.totalMissionExpenses.toFixed(2));
// console.log("Nettobetriebsgewinn (Manager-Topf nach Kosten):", summaryWithTotalFees.netOperatingProfit.toFixed(2));
// console.log("Summe Brutto-Auslagenerstattungen:", summaryWithTotalFees.totalGrossReimbursements.toFixed(2));
// console.log("Brutto-Topf für Gewinnanteile:", summaryWithTotalFees.totalGrossProfitAllocatedForSharing.toFixed(2));
// console.log("Netto-Zielanteil pro Worker aus Reingewinn:", summaryWithTotalFees.targetNetProfitShareForEachWorker.toFixed(2));
// console.log("Summe der Netto-Gewinnanteile aller Worker:", summaryWithTotalFees.totalNetProfitEffectivelyReceivedByWorkers.toFixed(2));
// console.log("Summe Gebühren auf Auszahlungen an Nicht-Manager:", summaryWithTotalFees.totalFeesOnPayoutsToNonManagers.toFixed(2));
// console.log("GESAMTSUMME ALLER GEBÜHREN:", summaryWithTotalFees.totalAllTransactionFees.toFixed(2));

// console.log("\nIndividuelle Auszahlungen:");
// summaryWithTotalFees.payouts.forEach(r => {
//   let netInfo = "";
//   if (sampleSettingsWithTotalFees.fee_enabled && !r.isManager) {
//     const netPayout = r.finalGrossPayout * (1 - sampleSettingsWithTotalFees.fee_percentage / 100);
//     netInfo = ` (Effektiv Netto ca.: ${netPayout.toFixed(2)})`;
//   } else if (sampleSettingsWithTotalFees.fee_enabled && r.isManager) {
//     netInfo = ` (Effektiv Netto: ${r.finalGrossPayout.toFixed(2)}, da Manager)`;
//   }
//   console.log(
//     `  Worker ID ${r.workerId}${r.isManager ? ' [M]' : ''}: ` +
//     `Erstattung Brutto: ${r.grossReimbursement.toFixed(2)}, ` +
//     `Gewinnanteil Brutto: ${r.grossProfitShare.toFixed(2)}, ` +
//     `Gesamt Brutto: ${r.finalGrossPayout.toFixed(2)}${netInfo}`
//   );
// });

/*
Manuelle Nachrechnung der Gebühren für das Beispiel:
totalIncomeConsolidationFees = 10000 (von Sue's 100k Einnahme)

Payouts:
ManagerPete (ID 1): finalGrossPayout = 41724.14 (keine Auszahlungsgebühr)
MemberSue (ID 2): finalGrossPayout = 47137.93. Auszahlungsgebühr = 47137.93 * 0.10 = 4713.79
MemberBob (ID 3): finalGrossPayout = 45137.93. Auszahlungsgebühr = 45137.93 * 0.10 = 4513.79

totalFeesOnPayoutsToNonManagers = 4713.79 (Sue) + 4513.79 (Bob) = 9227.58

totalAllTransactionFees = totalIncomeConsolidationFees + totalFeesOnPayoutsToNonManagers
                        = 10000 + 9227.58 = 19227.58
*/









// --- Beispielhafte Anwendung (angepasst an neue Logik) ---
// const sampleSettingsComplex: Settings = {
//   name: "Complex Ops",
//   fee_enabled: true,
//   fee_percentage: 10, // 10%
//   manager: 1, // WorkerA ist Manager
// };

// const sampleWorkersComplex: Worker[] = [
//   { id: 1, crew: 1, internal_id: "CmdrAlpha", external: false, external_name: null }, // Manager
//   { id: 2, crew: 1, internal_id: "CmdrBeta", external: false, external_name: null },
//   { id: 3, crew: 2, internal_id: "CmdrGamma", external: false, external_name: null },
// ];

// const sampleIncomesComplex: Transfer[] = [
//   { id: 1, name: "Bounty - CmdrBeta", amount: 100000, worker: 2 }, // CmdrBeta (Nicht-Manager) Einnahme
//   { id: 2, name: "Mining - CmdrAlpha", amount: 200000, worker: 1 }, // CmdrAlpha (Manager) Einnahme
//   { id: 3, name: "Org Bonus", amount: 50000, worker: null }, // Geht direkt in den Manager-Topf ohne Gebühr
// ];

// const sampleExpensesComplex: Transfer[] = [
//   { id: 4, name: "Fuel - CmdrAlpha", amount: 5000, worker: 1 },  // Manager hatte Auslagen
//   { id: 5, name: "Repairs - CmdrBeta", amount: 10000, worker: 2 },// Nicht-Manager hatte Auslagen
//   { id: 6, name: "Ammo - CmdrGamma", amount: 3000, worker: 3},
//   { id: 7, name: "Org Fee for Mission", amount: 2000, worker: null} // Allgemeine Missionsausgabe
// ];

// console.log("\n--- Komplexes Beispiel mit Manager & internen Gebühren ---");
// const complexResults = calculateShareDistributionAdvanced(
//   sampleIncomesComplex,
//   sampleExpensesComplex,
//   sampleWorkersComplex,
//   sampleSettingsComplex
// );

// complexResults.forEach(r => {
//   console.log(
//     `${r.workerCallsign} (ID ${r.workerId})${r.isManager ? ' [M]' : ''}: ` +
//     `Erstattung: ${r.grossReimbursement.toFixed(2)}, ` +
//     `Gewinnanteil: ${r.grossProfitShare.toFixed(2)}, ` +
//     `Gesamt Brutto: ${r.finalGrossPayout.toFixed(2)}`
//   );
// });

/*
Erwartete Logik für das komplexe Beispiel:
1. Einnahmen-Konsolidierung:
   - Bounty CmdrBeta (100k): 10k Gebühr, 90k gehen an Manager-Topf.
   - Mining CmdrAlpha (200k): Geht direkt in Manager-Topf (da Manager).
   - Org Bonus (50k): Geht direkt in Manager-Topf.
   - Total Effective Income at Manager: 90k + 200k + 50k = 340k.

2. Gesamte Missionsausgaben:
   - 5k (Alpha) + 10k (Beta) + 3k (Gamma) + 2k (Org) = 20k.

3. Brutto-Auslagenerstattungen:
   - Alpha: 5k
   - Beta: 10k
   - Gamma: 3k
   - Summe Erstattungen: 18k

4. Nettobetriebsgewinn (was Manager nach Abzug aller Missionskosten hat):
   - 340k (eff. Einnahmen) - 20k (ges. Ausgaben) = 320k.

5. Reiner Gewinnanteil-Topf (nachdem alle Erstattungen mental abgezogen wurden):
   - 320k (Nettobetriebsgewinn) - 18k (Summe Brutto-Erstattungen) = 302k.

6. Gewinnanteile & Finale Auszahlungen (Manager ist Alpha):
   - CmdrAlpha (Manager):
     - Brutto-Erstattung: 5k
     - Brutto-Gewinnanteil: 302k (bekommt den gesamten restlichen Topf)
     - Gesamt Brutto: 5k + 302k = 307k (keine Gebühr beim "Behalten")
   - CmdrBeta:
     - Brutto-Erstattung: 10k
     - Brutto-Gewinnanteil: 0k (da Manager alles bekommt)
     - Gesamt Brutto: 10k + 0k = 10k (Spielmechanik zieht 10% Gebühr bei Überweisung von Manager an Beta ab, Beta erhält 9k)
   - CmdrGamma:
     - Brutto-Erstattung: 3k
     - Brutto-Gewinnanteil: 0k
     - Gesamt Brutto: 3k + 0k = 3k (Spielmechanik zieht 10% Gebühr bei Überweisung von Manager an Gamma ab, Gamma erhält 2.7k)
*/
