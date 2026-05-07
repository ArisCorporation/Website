export default function useFetchAMSMissions() {
  return useAsyncData(
    'ams:missions',
    async () => {
      return await useDirectus(
        readItems('ams_missions' as any, {
          filter: { status: { _neq: 'archived' } },
          fields: [
            'id',
            'status',
            'mission_type',
            'title',
            'planned_date',
            'duration',
            'date_created',
            { user_created: ['id', 'first_name', 'last_name', 'avatar'] },
            { registrations: ['id', 'status', 'type'] },
            {
              teams: [
                'id',
                'name',
                { ships: ['id', { positions: ['id', 'status'] }] },
              ],
            },
          ] as any,
          sort: ['planned_date'] as any,
          limit: -1,
        }),
      )
    },
    { default: () => [] as any[], server: false },
  )
}
