import type { Department } from '~~/types'

export default function useSimpleDepartments () {
  return useAsyncData<Department[]>(
    'global:simple_departments',
    () =>
      useDirectus(
        readItems('departments', {
          limit: -1,
          fields: ['id', 'name'],
          sort: ['name'],
        })
      ) as Promise<Department[]>,
    {
      default: () => [],
    }
  )
}
