export default function useFetchAMSMission(id: MaybeRef<string>) {
  return useAsyncData(
    `ams:mission:${unref(id)}`,
    async () => {
      return await useDirectus(
        readItem('ams_missions' as any, unref(id), {
          fields: [
            '*',
            { user_created: ['id', 'first_name', 'last_name', 'avatar'] },
            {
              teams: [
                '*',
                {
                  ships: [
                    '*',
                    {
                      hangar_id: [
                        'id',
                        'name',
                        'group',
                        { user: ['id', 'first_name', 'last_name', 'avatar'] },
                        {
                          ship: [
                            'id',
                            'name',
                            'variant_code',
                            { thumbnail: ['id'] },
                            {
                              hull: [
                                'id',
                                'name',
                                { manufacturer: ['name', 'code'] },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      positions: [
                        '*',
                        {
                          assigned_user: [
                            'id',
                            'first_name',
                            'last_name',
                            'avatar',
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              registrations: [
                '*',
                { user: ['id', 'first_name', 'last_name', 'avatar'] },
                { team: ['id', 'name'] },
                { position: ['id', 'role'] },
              ],
            },
          ] as any,
        }),
      )
    },
    { server: false },
  )
}
