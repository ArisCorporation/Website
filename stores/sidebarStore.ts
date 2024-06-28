export const useSidebarStore = defineStore({
  id: 'sidebarStore',
  state: () => ({
    MobileSidebar: false,
  }),
  actions: {
    toggleMobileSidebar() {
      this.MobileSidebar = !this.MobileSidebar;
    },
    mobileSidebarOff() {
      this.MobileSidebar = false;
    },
  },
});
