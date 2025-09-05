<script setup lang="ts">
import type { DirectusUser } from '~~/types'

const { data, refresh } = await useAsyncData<DirectusUser[]>(
  'ams:admin-employees',
  async () => {
    return (await useDirectus(
      readUsers({
        fields: [
          'id',
          'status',
          'first_name',
          'last_name',
          'middle_name',
          'title',
          'avatar',
          'head_of_department',
          { role: ['name', 'label'] },
          { primary_department: ['id', 'name', 'logo'] },
        ],
      })
    )) as DirectusUser[]
  }
)

console.log(data)
</script>

<template>
  <AMSPagesAdminEmployeeTable :data="data" @refresh-data="refresh" />
</template>
