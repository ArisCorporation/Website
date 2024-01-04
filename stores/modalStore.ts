export const useModalStore = defineStore({
  id: 'modalStore',
  state: () => ({
    isModalOpen: false,
    isSlideOpen: false,
    title: '',
    data: null,
    type: '',
    hideXButton: false,
    hideCloseButton: false,
    agreeAction: null,
  }),
  actions: {
    setData(newData: any) {
      this.data = newData;
    },
    openModal(
      modalTitle: string,
      options: {
        type?: string;
        hideXButton?: boolean;
        hideCloseButton?: boolean;
        agreeAction?: any;
      },
    ) {
      const {
        type: propType = '',
        hideXButton: propHideXButton = false,
        hideCloseButton: propHideCloseButton = false,
        agreeAction: propAgreeAction = null,
      } = options;

      this.isModalOpen = true;
      this.title = modalTitle;
      this.type = propType;
      this.hideXButton = propHideXButton;
      this.hideCloseButton = propHideCloseButton;
      this.agreeAction = propAgreeAction;
    },
    openSlide(options: { type?: string; hideXButton?: boolean; hideCloseButton?: boolean; agreeAction?: any }) {
      const { type: propType = '' } = options;

      this.isSlideOpen = true;
      this.type = propType;
    },
    closeModal() {
      this.isModalOpen = false;
      setTimeout(() => {
        this.title = '';
        this.data = null;
        this.type = '';
        this.hideXButton = false;
        this.hideCloseButton = false;
        this.agreeAction = null;
      }, 600);
    },
    closeSlide() {
      this.isSlideOpen = false;
      setTimeout(() => {
        this.data = null;
        this.type = '';
      }, 600);
    },
  },
});
