export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const path = event.path.replace('/api/proxy', '')
  return proxyRequest(event, `${config.public.backendUrl}${path}`)
})
