export const useUserSettingsStore = defineStore(
  'userSettings',
  () => {
    const userSettings = ref({
      ams: {
        hangarDetailView: false,
        hangarLoanerView: false,
        fleetDetailView: false,
        fleetLoanerView: false,
        avatarConsent: false,
      },
      se: {
        shipDetailView: false,
      },
    });
    const AMSToggleHangarDetailView = () => {
      userSettings.value.ams.hangarDetailView = !userSettings.value.ams.hangarDetailView;
    };
    const AMSToggleHangarLoanerView = () => {
      userSettings.value.ams.hangarLoanerView = !userSettings.value.ams.hangarLoanerView;
    };
    const AMSToggleFleetDetailView = () => {
      userSettings.value.ams.fleetDetailView = !userSettings.value.ams.fleetDetailView;
    };
    const AMSToggleFleetLoanerView = () => {
      userSettings.value.ams.fleetLoanerView = !userSettings.value.ams.fleetLoanerView;
    };
    const AMSAcceptAvatarConsent = () => {
      userSettings.value.ams.avatarConsent = true;
    };
    const SEToggleShipDetailView = () => {
      userSettings.value.se.shipDetailView = !userSettings.value.se.shipDetailView;
    };
    return {
      userSettings,
      AMSToggleHangarDetailView,
      AMSToggleHangarLoanerView,
      AMSToggleFleetDetailView,
      AMSToggleFleetLoanerView,
      AMSAcceptAvatarConsent,
      SEToggleShipDetailView,
    };
  },
  {
    persist: {
      storage: persistedState.localStorage,
    },
  },
);
