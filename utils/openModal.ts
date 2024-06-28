export default function (modalTitle: string,
  options: {
    type?: string;
    hideXButton?: boolean;
    hideCloseButton?: boolean;
    agreeAction?: any;
    big?: boolean;
    locked?: boolean;
  },) {
  const modalStore = useState<{
    isModalOpen: boolean
      isSlideOpen: boolean
      title: string
      data: any
      type: string
      hideXButton: boolean
      hideCloseButton: boolean
      agreeAction: any
      big: boolean
      locked: boolean
  }>('modalStore')

  const {
    type: propType = '',
    hideXButton: propHideXButton = false,
    hideCloseButton: propHideCloseButton = false,
    agreeAction: propAgreeAction = null,
    big: propBig = false,
    locked: propLocked = false,
  } = options;

  modalStore.value.isModalOpen = true
  modalStore.value.title = modalTitle
  modalStore.value.type = propType
  modalStore.value.hideXButton = propHideXButton
  modalStore.value.hideCloseButton = propHideCloseButton
  modalStore.value.agreeAction = propAgreeAction
  modalStore.value.big = propBig
  modalStore.value.locked = propLocked
}
