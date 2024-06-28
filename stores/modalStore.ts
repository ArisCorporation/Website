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
    big: false,
    locked: false,
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
        big?: boolean;
        locked?: boolean;
      },
    ) {
      const {
        type: propType = '',
        hideXButton: propHideXButton = false,
        hideCloseButton: propHideCloseButton = false,
        agreeAction: propAgreeAction = null,
        big: propBig = false,
        locked: propLocked = false,
      } = options;

      this.isModalOpen = true;
      this.title = modalTitle;
      this.type = propType;
      this.hideXButton = propHideXButton;
      this.hideCloseButton = propHideCloseButton;
      this.agreeAction = propAgreeAction;
      this.big = propBig;
      this.locked = propLocked;
    },
    openSlide(options: {
      type?: string;
      hideXButton?: boolean;
      hideCloseButton?: boolean;
      agreeAction?: any;
      big?: boolean;
    }) {
      const { type: propType = '', big: propBig = false } = options;

      this.isSlideOpen = true;
      this.type = propType;
      this.big = propBig;
    },
    closeModal() {
      if (!this.locked) {
        this.isModalOpen = false;
        setTimeout(() => {
          this.title = '';
          this.data = null;
          this.type = '';
          this.hideXButton = false;
          this.hideCloseButton = false;
          this.agreeAction = null;
          this.big = false;
          this.locked = false;
        }, 600);
      }
    },
    unlockModal() {
      this.locked = false;
    },
    closeSlide() {
      this.isSlideOpen = false;
      setTimeout(() => {
        this.data = null;
        this.type = '';
        this.big = false;
      }, 600);
    },
  },
});
