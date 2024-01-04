export const useVeStore = defineStore({
  id: 'amsStore',
  state: () => ({
    MobileSidebar: false,
  }),
  getters: {},
  actions: {
    ToggleMobileSidebar() {
      this.MobileSidebar = !this.MobileSidebar;
    },
  },
});
