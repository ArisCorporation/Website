interface State {
  ams: {
    hangarDetailView: boolean;
    hangarLoanerView: boolean;
    fleetDetailView: boolean;
    fleetLoanerView: boolean;
    avatarConsent: boolean;
    administration: {
      userTableColumns: tableColumns[] | null;
    };
  };
  se: {
    shipDetailView: boolean;
    pageCount: number;
  };
  ve: {
    tech_weaponsPageCount: number;
    tech_attachmentsPageCount: number;
  };
}

type tableColumns = { key: string; label?: string; sortable?: boolean };

export const useUserSettingsStore = defineStore('userSettings', {
  state: (): State => ({
    ams: {
      hangarDetailView: false,
      hangarLoanerView: false,
      fleetDetailView: false,
      fleetLoanerView: false,
      avatarConsent: false,
      administration: {
        userTableColumns: null,
      },
    },
    se: {
      shipDetailView: false,
      pageCount: 12,
    },
    ve: {
      tech_weaponsPageCount: 12,
      tech_attachmentsPageCount: 12,
    },
  }),
  actions: {
    AMSToggleHangarDetailView() {
      this.ams.hangarDetailView = !this.ams.hangarDetailView;
    },
    AMSToggleHangarLoanerView() {
      this.ams.hangarLoanerView = !this.ams.hangarLoanerView;
    },
    AMSToggleFleetDetailView() {
      this.ams.fleetDetailView = !this.ams.fleetDetailView;
    },
    AMSToggleFleetLoanerView() {
      this.ams.fleetLoanerView = !this.ams.fleetLoanerView;
    },
    AMSAcceptAvatarConsent() {
      this.ams.avatarConsent = true;
    },
    AMSAdministrationSetUserTableColumns(columns: tableColumns[]) {
      this.ams.administration.userTableColumns = columns;
    },
    SEToggleShipDetailView() {
      this.se.shipDetailView = !this.se.shipDetailView;
    },
  },
  persist: true,
});
