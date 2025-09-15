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
        limit: -1,
      })
    )) as DirectusUser[]
  }
)

console.log(data)
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-end">
      <AMSPagesAdminAddMemberSlideover @added="refresh">
        <template #default="{ openSlideover }">
          <UButton
            @click="openSlideover"
            label="Mitglied hinzufügen"
            icon="i-lucide-user-plus"
            variant="subtle"
          />
        </template>
      </AMSPagesAdminAddMemberSlideover>
    </div>
    <AMSPagesAdminEmployeeTable :data="data" @refresh-data="refresh" />
  </div>
</template>
