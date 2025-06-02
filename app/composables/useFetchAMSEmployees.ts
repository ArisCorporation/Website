// layers/ams/composables/useUserHangarData.ts
import type { QueryFields } from '@directus/sdk'
import { type Ref, computed } from 'vue'
import type { DirectusUser, Schema } from '~~/types'

// Definiere die Felder-Struktur für bessere Lesbarkeit und Wartbarkeit
const EMPLOYEE_FIELDS: QueryFields<Schema, DirectusUser> = [
  '*',
  { department: ['name', 'logo'] },
  { leading_department: ['name', 'logo'] },
  { role: ['name', 'label'] },
]

export default function useFetchAMSFleet () {
  // Rufe useAsyncData mit dem reaktiven Key und der fetchData-Funktion auf.
  // Das zurückgegebene Objekt enthält data, pending, error, refresh usw.
  // und ist "awaitable", d.h. `await useUserHangarData(userId)` in der Komponente funktioniert.
  return useAsyncData<DirectusUser[]>(
    computed(() => `ams:employees`), // Der ComputedRef für den Key
    async () => {
      return await useDirectus(
        readUsers({
          filter: {
            status: { _eq: 'active' },
            api_account: { _eq: false },
          },
          // @ts-ignore
          fields: EMPLOYEE_FIELDS,
          sort: ['first_name']
        })
      ) as DirectusUser[]
    }
  )
}
