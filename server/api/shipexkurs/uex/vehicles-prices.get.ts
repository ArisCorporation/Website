export default defineEventHandler(async (event) => {
  const { id_vehicle } = getQuery(event)
  return $fetch(`https://api.uexcorp.uk/2.0/vehicles_prices?id_vehicle=${id_vehicle}`)
})
