// layers/ams/composables/useUserHangarData.ts
import type { QueryFields } from '@directus/sdk'
import { type Ref, computed } from 'vue'
import type { Schema, UserHangar } from '~~/types'

// Definiere die Felder-Struktur für bessere Lesbarkeit und Wartbarkeit
export const USER_HANGAR_FIELDS: QueryFields<Schema, UserHangar> = [
  '*',
  { department: ['id', 'name', 'logo'] },
  { active_module: ['id', 'name'] },
  {
    user_id: [
      'id',
      'title',
      'first_name',
      'middle_name',
      'last_name',
      'avatar',
    ],
  },
  {
    ship_id: [
      'id',
      'name',
      'slug',
      'classification',
      'focuses',
      'crew_min',
      'crew_max',
      'length',
      'beam',
      'height',
      'mass',
      'description',
      { store_image: ['id'] },
      { manufacturer: ['name', 'code', 'slug'] },
      {
        modules: [
          'id',
          'name',
          'slug',
          { manufacturer: ['name', 'code'] },
          { gallery: ['directus_file_id'] },
        ],
      },
    ],
  },
]

export default function useFetchAMSHangar (userId: Ref<string | number | undefined>) {
  // Rufe useAsyncData mit dem reaktiven Key und der fetchData-Funktion auf.
  // Das zurückgegebene Objekt enthält data, pending, error, refresh usw.
  // und ist "awaitable", d.h. `await useUserHangarData(userId)` in der Komponente funktioniert.
  return useAsyncData<UserHangar[]>(
    computed(() => `ams:user-hangar-${userId.value}`), // Der ComputedRef für den Key
    async () => {
      return await useDirectus(
        readItems('user_hangars', {
          filter: {
            user_id: { _eq: userId.value },
            deleted: { _eq: false }
          },
          fields: USER_HANGAR_FIELDS,
          sort: ['ship_id.name']
        })
      ) as UserHangar[]
    },
    {
      default: () => [] as UserHangar[], // Standardwert, während die Daten geladen werden oder bei einem Fehler
      // Beobachte die userId. Wenn sie sich ändert, wird fetchData erneut ausgeführt.
      // Dies ist technisch durch den reaktiven `asyncDataKey` abgedeckt,
      // aber eine explizite `watch`-Option kann die Abhängigkeiten klarer machen.
      watch: [userId],
    }
  )
}
