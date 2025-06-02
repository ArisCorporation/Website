import type { DirectusUser, Worker } from '~~/types'

export default function (worker: Worker | undefined, users: DirectusUser[]): string | null {
  if (!worker) return ''

  if (worker.external) {
    return String(worker.external_name)
  } else {
    const user = users.find((u) => u.id === worker.internal_id)
    return String(user?.label)
  }
}