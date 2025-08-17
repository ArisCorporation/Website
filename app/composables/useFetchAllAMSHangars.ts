import type { QueryFields } from '@directus/sdk'
import type { Schema, UserHangar } from '~~/types'

const ALL_USER_HANGAR_FIELDS: QueryFields<Schema, UserHangar> = [
  'user_id',
]

export default function useFetchAllAMSHangars () {
  return useAsyncData<UserHangar[]>(
    'ams:all-user-hangars',
    async () => {
      return await useDirectus(
        readItems('user_hangars', {
          filter: {
            deleted: { _eq: false }
          },
          fields: ALL_USER_HANGAR_FIELDS,
        })
      ) as UserHangar[]
    },
    {
      default: () => [] as UserHangar[],
    }
  )
}
