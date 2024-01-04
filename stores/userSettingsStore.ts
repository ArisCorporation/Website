export const useUserSettingsStore = defineStore({
  id: 'userSettings',
  persist: true,
  state: () => ({
    userSettings: {
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
    },
  }),
  actions: {
    AMSToggleHangarDetailView() {
      this.userSettings.ams.hangarDetailView = !this.userSettings.ams.hangarDetailView;
    },
    AMSToggleHangarLoanerView() {
      this.userSettings.ams.hangarLoanerView = !this.userSettings.ams.hangarLoanerView;
    },
    AMSToggleFleetDetailView() {
      this.userSettings.ams.fleetDetailView = !this.userSettings.ams.fleetDetailView;
    },
    AMSToggleFleetLoanerView() {
      this.userSettings.ams.fleetLoanerView = !this.userSettings.ams.fleetLoanerView;
    },
    AMSAcceptAvatarConsent() {
      this.userSettings.ams.avatarConsent = true;
    },
    SEToggleShipDetailView() {
      this.userSettings.se.shipDetailView = !this.userSettings.se.shipDetailView;
    },
  },
});
