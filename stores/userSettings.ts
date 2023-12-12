export const useUserSettingsStore = defineStore(
  'userSettings',
  () => {
    const userSettings = ref({
      footerLang: 'de',
    });
    const setFooterLang = (lang: string) => {
      userSettings.value.footerLang = lang;
    };
    return { userSettings, setFooterLang };
  },
  {
    persist: {
      storage: persistedState.localStorage,
    },
  },
);
