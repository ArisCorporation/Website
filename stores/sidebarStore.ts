export const useSidebarStore = defineStore('sidebarStore', () => {
  const MobileSidebar = ref(false);
  const ToggleMobileSidebar = () => {
    MobileSidebar.value = !MobileSidebar.value;
  };
  return { MobileSidebar, ToggleMobileSidebar };
});
