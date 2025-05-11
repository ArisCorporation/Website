import type { CalculatorSettings, Crew, OverallDistributionSummary, Transfer, Worker } from '@@/types/ams-calculator'

interface State {
  settings: CalculatorSettings
  crews: Crew[]
  workers: Worker[]
  incomes: Transfer[]
  expenses: Transfer[]
  distribution: OverallDistributionSummary | null
}



export const useAMSCalculatorStore = defineStore('ams-calculator', {
  state: (): State => ({
    settings: {
      name: '',
      fee_enabled: true,
      fee_percentage: 2.5,
      manager: 1
    },
    crews: [
      {
        id: 1,
        name: 'Cargo',
        ship: 'Vulcan'
      },
      {
        id: 2,
        name: 'Salvage',
        ship: 'Vulcan'
      },
    ],
    workers: [
      {
        id: 1,
        crew: 1,
        external: false,
        external_name: '',
        internal_id: '052a2c25-b063-4a82-90cb-110d7f809cae',
      },
      {
        id: 2,
        crew: 1,
        external: false,
        external_name: '',
        internal_id: '54ee43a5-d877-4c11-aa61-31b1fea7d1a7',
      },
    ],
    incomes: [
      {
        id: 1,
        name: 'Quantanium',
        amount: 10000,
        worker: 1
      }
    ],
    expenses: [],
    distribution: null
  }),
  getters: {
    // Helfer-Getter, um die nächste ID zu bekommen (optional, aber sauber)
    getNextCrewId: (state) => {
      // Finde die höchste existierende ID und addiere 1
      // Wenn keine Crews vorhanden sind, starte mit 1
      const maxId = state.crews.reduce((max, crew) => crew.id > max ? crew.id : max, 0);
      return maxId + 1;
    },
    getNextWorkerId: (state) => {
      const maxId = state.workers.reduce((max, worker) => worker.id > max ? worker.id : max, 0);
      return maxId + 1;
    },
    getNextIncomeId: (state) => {
      const maxId = state.incomes.reduce((max, income) => income.id > max ? income.id : max, 0);
      return maxId + 1;
    },
    getNextExpenseId: (state) => {
      const maxId = state.expenses.reduce((max, expense) => expense.id > max ? expense.id : max, 0);
      return maxId + 1;
    },
  },
  actions: {
    addCrew () {
      const newId = this.getNextCrewId; // Getter verwenden
      this.crews.push({
        id: newId,
        name: `Crew ${newId}`,
        ship: ''
      });
    },
    removeCrew (id: number) {
      this.crews = this.crews.filter(crew => crew.id !== id);

      this.workers.filter(worker => worker.crew === id).forEach((worker) => worker.crew = null);
    },
    addWorker () {
      const newId = this.getNextWorkerId;
      this.workers.push({
        id: newId,
        crew: this.crews[0]?.id ?? 1,
        external: false,
        external_name: '',
        internal_id: crypto.randomUUID(),
      });
    },
    removeWorker (id: number) {
      this.workers = this.workers.filter(worker => worker.id !== id);
      if (this.settings.manager === id) this.settings.manager = null
    },
    addIncome () {
      const newId = this.getNextIncomeId;
      this.incomes.push({
        id: newId,
        name: '',
        amount: null,
        worker: null
      });
    },
    removeIncome (id: number) {
      this.incomes = this.incomes.filter(income => income.id !== id);
    },
    addExpense () {
      const newId = this.getNextExpenseId;
      this.expenses.push({
        id: newId,
        name: '',
        amount: null,
        worker: null
      });
    },
    removeExpense (id: number) {
      this.expenses = this.expenses.filter(expense => expense.id !== id);
    }
  }
})