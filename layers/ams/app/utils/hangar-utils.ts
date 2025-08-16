export async function removeHangarItem (id: number, fleetMode: boolean) {
  const store = useAuthStore()
  const { currentUserId: userId } = storeToRefs(store)

  const { refresh: refreshHangar } = await useFetchAMSHangar(userId)
  const { refresh: refreshFleet } = await useFetchAMSFleet()

  await useDirectus(updateItem('user_hangars', id, {
    deleted: true
  })).then(async () => fleetMode ? refreshFleet() : refreshHangar())
}