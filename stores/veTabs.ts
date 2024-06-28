export const useVeTabsStore = defineStore({
  id: 'veTabs',
  state: () => ({
    selectedUeeTab: 0,
    selectedUeeHolidayTab: 0,
    selectedCompaniesTab: 0,
  }),
  actions: {
    setUeeTab(index: number) {
      this.selectedUeeTab = index;
    },
    setUeeHolidayTab(index: number) {
      this.selectedUeeHolidayTab = index;
    },
    setCompaniesTab(index: number) {
      this.selectedCompaniesTab = index;
    },
  },
});
