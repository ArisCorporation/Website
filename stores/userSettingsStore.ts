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
			this.ams.hangarDetailView = !this.ams.hangarDetailView
		},
		AMSToggleHangarLoanerView() {
			this.ams.hangarLoanerView = !this.ams.hangarLoanerView
		},
		AMSToggleFleetDetailView() {
			this.ams.fleetDetailView = !this.ams.fleetDetailView
		},
		AMSToggleFleetLoanerView() {
			this.ams.fleetLoanerView = !this.ams.fleetLoanerView
		},
		AMSAcceptAvatarConsent() {
			this.ams.avatarConsent = true
		},
		AMSAdministrationSetUserTableColumns(columns: tableColumns[]) {
			this.ams.administration.userTableColumns = columns
		},
		SEToggleShipDetailView() {
			this.se.shipDetailView = !this.se.shipDetailView
		},
	},
})
