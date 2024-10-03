interface State {
	selectedUeeTab: number
	selectedUeeHolidayTab: number
	selectedCompaniesTab: number
}

export const useVeTabsStore = defineStore('veTabs', {
	state: (): State => ({
		selectedUeeTab: 0,
		selectedUeeHolidayTab: 0,
		selectedCompaniesTab: 0,
	}),
	actions: {
		setUeeTab(index: number) {
			this.selectedUeeTab = index
		},
		setUeeHolidayTab(index: number) {
			this.selectedUeeHolidayTab = index
		},
		setCompaniesTab(index: number) {
			this.selectedCompaniesTab = index
		},
	},
})
