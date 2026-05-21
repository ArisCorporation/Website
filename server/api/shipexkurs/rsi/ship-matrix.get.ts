export default defineEventHandler(async () => {
  return $fetch('https://robertsspaceindustries.com/ship-matrix/index')
})
