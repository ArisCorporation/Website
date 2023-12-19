export const useVeTabs = defineStore('veTabs', () => {
  const selectedUeeTab = ref(0);
  const selectedUeeHolidayTab = ref(0);
  const selectedCompaniesTab = ref(0);
  const setUeeTab = (index: number) => {
    selectedUeeTab.value = index;
  };
  const setUeeHolidayTab = (index: number) => {
    selectedUeeHolidayTab.value = index;
  };
  const setCompaniesTab = (index: number) => {
    selectedCompaniesTab.value = index;
  };

  return {
    selectedUeeTab,
    setUeeTab,
    selectedUeeHolidayTab,
    setUeeHolidayTab,
    selectedCompaniesTab,
    setCompaniesTab,
  };
});
