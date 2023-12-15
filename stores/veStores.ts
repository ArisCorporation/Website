export const useVeStore = defineStore('veStore', () => {
  const MobileSidebar = ref(false);
  const ToggleMobileSidebar = () => {
    MobileSidebar.value = !MobileSidebar.value;
  };
  return { MobileSidebar, ToggleMobileSidebar };
});
