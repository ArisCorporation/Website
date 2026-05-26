export default defineEventHandler(async () => {
  return $fetch('https://api.uexcorp.uk/2.0/vehicles')
})
