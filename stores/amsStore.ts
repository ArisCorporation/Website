export const useVeStore = defineStore({
  id: 'amsStore',
  state: () => ({
    MobileSidebar: false as boolean,
  }),
  getters: {},
  actions: {
    ToggleMobileSidebar() {
      this.MobileSidebar = !this.MobileSidebar;
    },
  },
});
