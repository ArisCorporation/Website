export const useHomepageTabsStore = defineStore('homepageTabs', () => {
  const selectedArisTab = ref(0);
  const selectedOurTab = ref(0);
  const setArisTab = (index: number) => {
    selectedArisTab.value = index;
  };
  const setOurTab = (index: number) => {
    selectedOurTab.value = index;
  };

  return { selectedArisTab, setArisTab, selectedOurTab, setOurTab };
});
