export default function (options: {
  type?: string;
  hideXButton?: boolean;
  hideCloseButton?: boolean;
  agreeAction?: any;
  big?: boolean;
}) {
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

  const { type: propType = '', big: propBig = false } = options;

  modalStore.value.isSlideOpen = true
  modalStore.value.type = propType
  modalStore.value.big = propBig
}
