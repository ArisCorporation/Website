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

  if(!modalStore.value.locked){
    modalStore.value.isModalOpen = false
    setTimeout(() => {
      modalStore.value.title = ''
      modalStore.value.data = null
      modalStore.value.type = ''
      modalStore.value.hideXButton = false
      modalStore.value.hideCloseButton = false
      modalStore.value.agreeAction = null
      modalStore.value.big = false
      modalStore.value.locked = false
    }, 600);
  }
}
