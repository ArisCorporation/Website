interface State {
	MobileSidebar: boolean
}

export const useSidebarStore = defineStore('sidebarStore', {
	state: (): State => ({
		MobileSidebar: false,
	}),
	actions: {
		toggleMobileSidebar() {
			this.MobileSidebar = !this.MobileSidebar
		},
		mobileSidebarOff() {
			this.MobileSidebar = false
		},
	},
})
