<script setup lang="ts">
import type { DirectusUser } from '~~/types'

const sorting = ref<{ id: string; desc: boolean }[]>([])

const EMPLOYEE_SORT_MAP: Record<string, string> = {
  name: 'first_name',
  status: 'status',
  role: 'role.name',
  department: 'primary_department.name',
  head_of_department: 'head_of_department',
}
const employeeSort = computed<string[]>(() =>
  sorting.value.length
    ? sorting.value.map(
        ({ id, desc }) => `${desc ? '-' : ''}${EMPLOYEE_SORT_MAP[id] ?? id}`,
      )
    : ['first_name'],
)

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
          'discord_id',
          'head_of_department',
          { role: ['name', 'label'] },
          { primary_department: ['id', 'name', 'logo'] },
        ],
        limit: -1,
        sort: employeeSort.value as any,
      })
    )) as DirectusUser[]
  }
)

watch(sorting, () => refresh())
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
    <AMSPagesAdminEmployeeTable
      :data="data"
      v-model:sorting="sorting"
      @refresh-data="refresh"
    />
  </div>
</template>
