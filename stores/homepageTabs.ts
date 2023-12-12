export const useHomepageTabsStore = defineStore('homepageTabs', () => {
  const selectedArisTab = ref(0);
  const selectedOurTab = ref(0);
  const selectedOurFleetTab = ref(0);
  const selectedOurDepartmentTab = ref(0);
  const setArisTab = (index: number) => {
    selectedArisTab.value = index;
  };
  const setOurTab = (index: number) => {
    selectedOurTab.value = index;
  };
  const setOurFleetTab = (index: number) => {
    selectedOurFleetTab.value = index;
  };
  const setOurDepartmentTab = (index: number) => {
    selectedOurDepartmentTab.value = index;
  };

  return {
    selectedArisTab,
    setArisTab,
    selectedOurTab,
    setOurTab,
    selectedOurFleetTab,
    setOurFleetTab,
    selectedOurDepartmentTab,
    setOurDepartmentTab,
  };
});
