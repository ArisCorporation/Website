export const useModalStore = defineStore('modalStore', () => {
  const open = ref(false);
  const type = ref(null);

  const ModalToggle = () => {
    open.value = !open.value;
  };
  const ModalSetType = (type: string) => {
    type.value = type;
  };
  return { open, ModalToggle, type, ModalSetType };
});
