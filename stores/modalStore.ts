export const useModalStore = defineStore('modalStore', () => {
  const isOpen = ref(false);
  const title = ref(null);
  const data = ref(null);
  const settings: { type: string; hideXButton: boolean; hideCloseButton: boolean; agreeAction: Function } = ref({
    type: null,
    hideXButton: false,
    hideCloseButton: false,
    agreeAction: null,
  });

  function setData(data: any) {
    data.value = data;
  }

  function openModal(
    title: string,
    {
      type,
      hideXButton,
      hideCloseButton,
      agreeAction,
    }: { type?: string; hideXButton?: boolean; hideCloseButton?: boolean; agreeAction?: Function },
  ) {
    const modalStore = useModalStore();

    modalStore.isOpen = true;
    modalStore.title = title;
    modalStore.settings = {
      type: type || null,
      hideXButton: hideXButton || false,
      hideCloseButton: hideCloseButton || false,
      agreeAction: agreeAction || null,
    };
  }

  function closeModal() {
    isOpen.value = false;
    setTimeout(() => {
      title.value = null;
      settings.value = {
        type: null,
        hideXButton: false,
        hideCloseButton: false,
        agreeAction: null,
      };
    }, 100);
  }
  return {
    isOpen,
    title,
    settings,
    data,
    setData,
    openModal,
    closeModal,
  };
});
