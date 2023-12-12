export const useUserSettingsStore = defineStore(
  'userSettings',
  () => {
    const userSettings = ref({
      seSidebarCollapsed: false,
      veSidebarCollapsed: false,
      amsSidebarCollapsed: false,
    });
    const veToggleSidebar = () => {
      userSettings.value.veSidebarCollapsed = !userSettings.value.veSidebarCollapsed;
    };
    return { userSettings, veToggleSidebar };
  },
  {
    persist: {
      storage: persistedState.localStorage,
    },
  },
);
