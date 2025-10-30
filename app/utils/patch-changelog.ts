import { LazyElementsChangelogModal } from '#components'

export default function patchChangelog () {
  if (import.meta.server) {
    return
  }

  // Check cookie for last seen version
  const cookie = useCookie<string>('last-patch')
  const lastSeenVersion = cookie.value

  // Get current version
  const currentVersion = useRuntimeConfig().public.VERSION

  // If no last seen version, set it and return
  if (!lastSeenVersion) {
    cookie.value = String(currentVersion)
    return
  }

  // If versions differ, show changelog modal
  if (lastSeenVersion !== String(currentVersion)) {
    const overlay = useOverlay()
    const changelogModal = overlay.create(LazyElementsChangelogModal)

    changelogModal.open()

    cookie.value = String(currentVersion)
  }
}
