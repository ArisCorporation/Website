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

   modalStore.value.locked = false
}
