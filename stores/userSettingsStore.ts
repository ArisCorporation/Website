interface State {
	ams: {
		hangarDetailView: boolean
		hangarLoanerView: boolean
		fleetDetailView: boolean
		fleetLoanerView: boolean
		avatarConsent: boolean
		administration: {
			userTableColumns: tableColumns[] | null
		}
	}
	se: {
		shipDetailView: boolean
	}
}

type tableColumns = { key: string, label?: string, sortable?: boolean }

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
		},
	}),
	actions: {
		AMSToggleHangarDetailView() {
			this.userSettings.ams.hangarDetailView = !this.userSettings.ams.hangarDetailView
		},
		AMSToggleHangarLoanerView() {
			this.userSettings.ams.hangarLoanerView = !this.userSettings.ams.hangarLoanerView
		},
		AMSToggleFleetDetailView() {
			this.userSettings.ams.fleetDetailView = !this.userSettings.ams.fleetDetailView
		},
		AMSToggleFleetLoanerView() {
			this.userSettings.ams.fleetLoanerView = !this.userSettings.ams.fleetLoanerView
		},
		AMSAcceptAvatarConsent() {
			this.userSettings.ams.avatarConsent = true
		},
		AMSAdministrationSetUserTableColumns(columns: tableColumns[]) {
			this.userSettings.ams.administration.userTableColumns = columns
		},
		SEToggleShipDetailView() {
			this.userSettings.se.shipDetailView = !this.userSettings.se.shipDetailView
		},
	},
})
