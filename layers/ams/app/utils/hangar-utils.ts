export async function removeHangarItem (id: number) {
  const store = useAuthStore()
  const { currentUserId: userId } = storeToRefs(store)

  const { refresh } = await useFetchAMSHangar(userId)

  await useDirectus(deleteItem('user_hangars', id)).then(async () => refresh())
}