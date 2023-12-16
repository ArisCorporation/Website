export const useVeStore = defineStore('amsStore', () => {
  const MobileSidebar = ref(false);
  const ToggleMobileSidebar = () => {
    MobileSidebar.value = !MobileSidebar.value;
  };
  return { MobileSidebar, ToggleMobileSidebar };
});
