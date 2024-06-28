interface State {
	selectedArisTab: number
	selectedOurTab: number
	selectedOurFleetTab: number
	selectedOurDepartmentTab: number
}

export const useHomepageTabsStore = defineStore('homepageTabsStore', {
	state: (): State => ({
		selectedArisTab: 0,
		selectedOurTab: 0,
		selectedOurFleetTab: 0,
		selectedOurDepartmentTab: 0,
	}),
	actions: {
		setArisTab(index: number) {
			this.selectedArisTab = index
		},
		setOurTab(index: number) {
			this.selectedOurTab = index
		},
		setOurFleetTab(index: number) {
			this.selectedOurFleetTab = index
		},
		setOurDepartmentTab(index: number) {
			this.selectedOurDepartmentTab = index
		},
	},
})
