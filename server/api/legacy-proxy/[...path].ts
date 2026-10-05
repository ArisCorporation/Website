export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const path = event.path.replace('/api/legacy-proxy', '')
  return proxyRequest(event, `${config.directusUrl}${path}`)
})
