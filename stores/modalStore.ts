export const useModalStore = defineStore('modalStore', () => {
  const isOpen = ref(false);
  const title = ref('');
  const data = ref(null);
  const type = ref('');
  const hideXButton = ref(false);
  const hideCloseButton = ref(false);
  const agreeAction = ref(null);

  function setData(data: any) {
    data.value = data;
  }

  function openModal(
    modalTitle: string,
    options: {
      type?: string;
      hideXButton?: boolean;
      hideCloseButton?: boolean;
      agreeAction?: any;
    },
  ) {
    const {
      type: propType,
      hideXButton: propHideXButton,
      hideCloseButton: propHideCloseButton,
      agreeAction: propAgreeAction,
    } = options;

    isOpen.value = true;
    title.value = modalTitle;
    type.value = propType || '';
    hideXButton.value = propHideXButton || false;
    hideCloseButton.value = propHideCloseButton || false;
    agreeAction.value = propAgreeAction || null;
  }

  function closeModal() {
    isOpen.value = false;
    setTimeout(() => {
      title.value = '';
      type.value = '';
      hideXButton.value = false;
      hideCloseButton.value = true;
      agreeAction.value = null;
    }, 500);
  }
  return {
    isOpen,
    title,
    type,
    hideXButton,
    hideCloseButton,
    agreeAction,
    data,
    setData,
    openModal,
    closeModal,
  };
});
