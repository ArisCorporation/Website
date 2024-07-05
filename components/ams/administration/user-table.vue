<script setup lang="ts">
const { readUsers, readAsyncUsers } = useDirectusUsers()
const userSettingsStore = useUserSettingsStore()
const userSettings = storeToRefs(userSettingsStore)
const emit = defineEmits(['create', 'lock', 'unlock', 'archive', 'delete', 'edit:profile', 'edit:notification', 'edit:avatar', 'edit:roles'])

// TODO
const { data: baseItemCount } = await readAsyncUsers({
	query: {
		limit: -1,
		fields: ['id'],
		filter: {
			hidden: { _eq: false },
		},
	},
})
// const { data: baseItemCount } = await useAsyncData('get-administration-data', async () =>
//   readUsers({
//     params: {
//       limit: -1,
//       fields: ['id'],
//     },
//   }),
// );

// USER - Selected Rows
const selectedRows = ref([])
function select(row: any) {
	const index = selectedRows.value.findIndex(item => item.id === row.id)
	if (index === -1) {
		selectedRows.value.push(row)
	}
	else {
		selectedRows.value.splice(index, 1)
	}
}

// USER - Columns
// TODO: ADD DEPARTMENT AND AVATAR
// { key: 'department.gameplay_name', label: 'Abteilung', sortable: true },
// { key: 'potrait' },
const columns = [
	{ key: 'id', label: 'Id' },
	{ key: 'status', label: 'Status' },
	{ key: 'title', label: 'Titel', sortable: true },
	{ key: 'first_name', label: 'Vorname', sortable: true },
	{ key: 'last_name', label: 'Nachname', sortable: true },
	{ key: 'discord_name', label: 'Discord Benutzername' },
	{ key: 'contact_email', label: 'Kontakt Email' },
]
const columnsTable = computed(() =>
	columns.filter(column =>
		JSON.stringify(userSettings.ams.value.administration.userTableColumns).includes(column.key),
	),
)
const itemOptions = computed(() => [
	[
		{
			slot: 'avatar',
		},
	],
	[
		{
			label: 'Profil Editieren',
			icon: 'i-heroicons-pencil',
			disabled: selectedRows.value.length !== 1,
			click: () => emit('edit:profile', selectedRows.value[0]),
		},
		{
			label: 'Mitt. Editieren',
			icon: 'i-heroicons-pencil',
			disabled: selectedRows.value.length !== 1,
			click: () => emit('edit:notifications', selectedRows.value[0]),
		},
		{
			label: 'Avatar ändern',
			icon: 'i-heroicons-pencil',
			disabled: selectedRows.value.length !== 1,
			click: () => emit('edit:avatar', selectedRows.value[0]),
		},
		{
			label: 'Org. Editieren',
			icon: 'i-heroicons-pencil',
			disabled: selectedRows.value.length !== 1,
			click: () => emit('edit:roles', selectedRows.value[0]),
		},
	],
	[
		{
			label: 'Freischalten',
			icon: 'i-heroicons-lock-open',
			disabled:
        selectedRows.value.length > 0 && selectedRows.value.every(row => row.statusValue !== 'active') ? false : true,
			click: () => emit('unlock', selectedRows),
		},
		{
			label: 'Sperren',
			icon: 'i-heroicons-lock-closed',
			disabled:
        selectedRows.value.length > 0 && selectedRows.value.every(row => row.statusValue === 'active') ? false : true,
			click: () => emit('lock', selectedRows),
		},
		{
			label: 'Archivieren',
			icon: 'i-heroicons-archive-box-arrow-down',
			disabled:
        selectedRows.value.length > 0 && selectedRows.value.every(row => row.statusValue !== 'archived')
        	? false
        	: true,
			click: () => emit('archive', selectedRows),
		},
		{
			label: 'Löschen',
			icon: 'i-heroicons-trash',
			disabled: selectedRows.value.length < 1,
			click: () => emit('delete', selectedRows.value),
		},
	],
])

// USER - Actions

// USER - Filters
interface IStatusOption {
	key: string
	label: string
	value: string
}
const statusOptions: IStatusOption[] = [
	{
		key: 'draft',
		label: 'Entwurf',
		value: 'draft',
	},
	{
		key: 'invited',
		label: 'Eingeladen',
		value: 'invited',
	},
	{
		key: 'active',
		label: 'Aktiv',
		value: 'active',
	},
	{
		key: 'suspended',
		label: 'Gesperrt',
		value: 'suspended',
	},
	{
		key: 'archived',
		label: 'Archiviert',
		value: 'archived',
	},
]
const search = ref('')
const search_input = ref()
const selectedStatus = ref([])

// USER - Pagination
const sort = ref({ column: 'first_name', direction: 'asc' as const })
const page = ref(1)
const pageCount = ref(10)
const pageTotal = ref(baseItemCount.value?.length) // This value should be dynamic coming from the API
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1)
const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value))

// USER - Data
const { data, pending, refresh } = await useLazyAsyncData(
	'ut_users',
	async () => {
		const [itemCount, items] = await Promise.all([
			readUsers({
				limit: -1,
				fields: ['id', 'email'],
				filter: {
					_or: [
						...(search.value && [
							{ title: { _icontains: search.value } },
							{ first_name: { _icontains: search.value } },
							{ last_name: { _icontains: search.value } },
							{ discord_name: { _icontains: search.value } },
							{ rsi_handle: { _icontains: search.value } },
						]),
						...(selectedStatus.value[0]
							? [
									{
										status: {
											_in: selectedStatus.value.map((obj: IStatusOption) => obj.value),
										},
									},
								]
							: []),
						// TODO: ADD DEPARTMENT
						// { department: { gameplay_name: { _icontains: search.value } } },
					],
					hidden: { _eq: false },
				},
			}),
			readUsers({
				limit: pageCount.value,
				page: page.value,
				sort: [sort.value.column],
				filter: {
					_or: [
						...(search.value && [
							{ title: { _icontains: search.value } },
							{ first_name: { _icontains: search.value } },
							{ last_name: { _icontains: search.value } },
							{ discord_name: { _icontains: search.value } },
							{ rsi_handle: { _icontains: search.value } },
						]),
						...(selectedStatus.value[0]
							? [
									{
										status: {
											_in: selectedStatus.value.map((obj: IStatusOption) => obj.value),
										},
									},
								]
							: []),
						// TODO: ADD DEPARTMENT
						// { department: { gameplay_name: { _icontains: search.value } } },
					],
					hidden: { _eq: false },
				},
				fields: [
					'*',
				],
			}),
		])

		pageTotal.value = itemCount.length

		return {
			items: items.map((obj: IRawUser) => ({
				...obj,
				statusValue: obj.status,
				status:
          obj.status === 'draft'
          	? 'Entwurf'
          	: obj.status === 'invited'
          		? 'Eingeladen'
          		: obj.status === 'active'
          			? 'Freigeschalten'
          			: obj.status === 'suspended'
          				? 'Gesperrt'
          				: obj.status === 'archived' && 'Archiviert',
			})),
			allItems: itemCount.map((obj: IRawUser) => ({ ...obj })),
		}
	},
	{
		default: () => [],
		watch: [page, search, pageCount, sort, selectedStatus],
	},
)

defineShortcuts({
	s: {
		handler: () => {
			search_input.value?.input.focus()
		},
	},
})

defineExpose({
	refresh,
	selectedRows,
	items: data.value.allItems,
})

onMounted(() => {
	if (!userSettings.ams.value.administration.userTableColumns) {
		userSettingsStore.AMSAdministrationSetUserTableColumns(columns)
	}
})
</script>

<template>
	<UCard
		:ui="{
			body: { padding: 'p-0' },
			header: { padding: 'pt-4' },
		}"
	>
		<!-- Header and Filters -->
		<template #header>
			<div class="w-full divide-y divide-btertiary">
				<!-- Header -->
				<h2 class="mt-0 mb-4 ml-6">
					Mitgliederübersicht
				</h2>
				<!-- Filters -->
				<!-- TODO: ADD FILTER FOR STATE (ACTIVE, ARCHIVED, ETC) -->
				<div class="w-full divide-y divide-btertiary">
					<div class="flex flex-wrap items-center justify-between w-full px-4 py-4 lg:flex-nowrap gap-y-2">
						<div class="relative w-full lg:w-1/4">
							<UInput
								ref="search_input"
								v-model="search"
								size="md"
								placeholder="Vorname, Nachname, Abteilung, ..."
							/>
							<button
								v-if="search !== ''"
								type="button"
								class="absolute top-0 bottom-0 z-20 flex my-auto right-3 h-fit"
								@click="search = ''"
							>
								<UIcon
									name="i-heroicons-x-mark-16-solid"
									class="my-auto transition opacity-75 hover:opacity-100"
								/>
							</button>
						</div>
						<div class="relative w-full lg:w-1/4">
							<USelectMenu
								v-model="selectedStatus"
								:options="statusOptions"
								multiple
								size="md"
								placeholder="Status"
								:ui="{
									leading: {
										padding: {
											xl: 'ps-10',
										},
									},
								}"
							>
								<template
									v-if="selectedStatus[0]"
									#leading
								/>
							</USelectMenu>
							<button
								v-if="selectedStatus[0]"
								class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
								@click="selectedStatus = []"
							>
								<UIcon
									name="i-heroicons-x-mark-16-solid"
									class="my-auto transition opacity-75 hover:opacity-100"
								/>
							</button>
						</div>
					</div>
					<div class="flex flex-wrap items-center justify-between w-full px-4 py-4 gap-y-1.5">
						<div class="w-fit flex gap-1.5 items-center">
							<span class="text-sm leading-5">Einträge pro Seite:</span>

							<USelectMenu
								v-model="pageCount"
								:options="[3, 5, 10, 20, 30, 40, 100]"
								size="sm"
							/>
						</div>
						<div class="w-fit flex flex-wrap text-center gap-1.5 items-center ml-auto">
							<ButtonDefault
								v-if="selectedRows.length < 1"
								:disabled="selectedRows.length > 0"
								color="success"
								class="w-fit"
								size="xs"
								@click="!(selectedRows.length > 0) && $emit('create')"
							>
								<span class="flex items-center gap-1.5"><UIcon name="i-heroicons-plus" />Erstellen</span>
							</ButtonDefault>
							<UDropdown
								v-else
								mode="hover"
								:items="itemOptions"
								:popper="{ placement: 'bottom-start' }"
								:disabled="selectedRows.length < 1"
							>
								<ButtonDefault
									:disabled="selectedRows.length < 1"
									size="xs"
									color="industrial-400"
								>
									<div class="flex items-center my-auto gap-x-1.5">
										Optionen
										<UIcon
											name="i-heroicons-chevron-down-20-solid"
											class="w-4 h-4 transition"
										/>
									</div>
								</ButtonDefault>
								<template #avatar>
									<UAvatarGroup
										size="xs"
										:max="8"
									>
										<UAvatar
											v-for="item in selectedRows"
											v-if="selectedRows.length > 1"
											:key="item.id"
											:label="item.first_name"
											:src="$config.public.fileBase + (item.avatar ?? '0b7eafde-0933-4d1a-a32f-b4f8dd5bb492')"
											:size="32"
										/>
										<NuxtLink
											v-else-if="selectedRows.length === 1"
											:to="'/ams/employees/biography/' + selectedRows[0].slug"
											target="_blank"
											class="transition opacity-80 ring-0 group-hover:opacity-100 hover:no-underline"
										>
											<div class="flex items-center my-auto gap-x-2">
												<UAvatar
													size="xs"
													:label="selectedRows[0].first_name"
													:src="
														$config.public.fileBase + (selectedRows[0].avatar ?? '0b7eafde-0933-4d1a-a32f-b4f8dd5bb492')
													"
													:size="32"
												/>
												<span class="text-primary"> Biografie </span>
											</div>
										</NuxtLink>
										<UAvatar
											v-else
											label="'None'"
											:src="$config.public.fileBase + '0b7eafde-0933-4d1a-a32f-b4f8dd5bb492'"
											:size="32"
										/>
									</UAvatarGroup>
								</template>
							</UDropdown>
							<USelectMenu
								:model-value="
									userSettings.ams.value.administration.userTableColumns?.map((column) =>
										columns.find((e) => e.key === column.key),
									)
								"
								:options="columns"
								multiple
								placeholder="Columns"
								size="md"
								@update:model-value="userSettingsStore.AMSAdministrationSetUserTableColumns($event)"
							>
								<UButton
									icon="i-heroicons-view-columns"
									class="ml-auto"
								>
									Spalten
								</UButton>
							</USelectMenu>
						</div>
						<!-- <div class="w-fit flex flex-wrap text-center gap-1.5 items-center ml-auto">
              <ButtonDefault
                :disabled="!(selectedRows.length > 0 && selectedRows.every((e) => e.statusValue !== 'active'))"
                @click="
                  !(selectedRows.length > 0 && selectedRows.every((e) => e.status !== 'active')) &&
                    $emit('unlock', selectedRows)
                "
                color="success"
                class="w-fit"
                size="xs"
              >
                <span class="flex items-center gap-1.5"><UIcon name="i-heroicons-lock-open" />Freischalten</span>
              </ButtonDefault>
              <ButtonDefault
                :disabled="!(selectedRows.length > 0 && selectedRows.every((e) => e.statusValue === 'active'))"
                @click="
                  !(selectedRows.length > 0 && selectedRows.every((e) => e.status === 'active')) &&
                    $emit('lock', selectedRows)
                "
                color="danger"
                class="w-fit"
                size="xs"
              >
                <span class="flex items-center gap-1.5"><UIcon name="i-heroicons-lock-closed" />Sperren</span>
              </ButtonDefault>
              <ButtonDefault
                @click="!selectedRows.length < 1 && $emit('archive', selectedRows)"
                :disabled="selectedRows.length < 1"
                color="danger"
                class="w-fit"
                size="xs"
              >
                <span class="flex items-center gap-1.5"><UIcon name="i-heroicons-archive" />Archivieren</span>
              </ButtonDefault>
                <ButtonDefault @click="!selectedRows.length < 1 && $emit('delete', selectedRows)" :disabled="selectedRows.length < 1" color="danger" class="w-fit" size="xs">
                  <span class="flex items-center gap-1.5"><UIcon name="i-heroicons-trash" />Löschen</span>
                </ButtonDefault>
              <ButtonDefault
                @click="selectedRows.length === 1 && $emit('edit', selectedRows[0])"
                :disabled="selectedRows.length !== 1"
                color="secondary"
                class="w-fit"
                size="xs"
              >
                <span class="flex items-center gap-1.5"><UIcon name="i-heroicons-pencil" />Editieren</span>
              </ButtonDefault>
              <ButtonDefault
                @click="!selectedRows.length > 0 && $emit('create')"
                :disabled="selectedRows.length > 0"
                color="success"
                class="w-fit"
                size="xs"
              >
                <span class="flex items-center gap-1.5"><UIcon name="i-heroicons-plus" />Erstellen</span>
              </ButtonDefault>
              <USelectMenu
                :model-value="
                  userSettings.ams.administration.userTableColumns?.map((column) =>
                    columns.find((e) => e.key === column.key),
                  )
                "
                @update:model-value="userSettingsStore.AMSAdministrationSetUserTableColumns($event)"
                :options="columns"
                multiple
                placeholder="Columns"
                size="md"
              >
                <UButton icon="i-heroicons-view-columns" class="ml-auto"> Spalten </UButton>
              </USelectMenu>
            </div> -->
					</div>
				</div>
			</div>
		</template>

		<!-- Table -->
		<div>
			<UTable
				v-model="selectedRows"
				v-model:sort="sort"
				:rows="data.items"
				:columns="columnsTable"
				:loading="pending"
				sort-asc-icon="i-heroicons-arrow-up"
				sort-desc-icon="i-heroicons-arrow-down"
				sort-mode="manual"
				class="w-full whitespace-nowrap"
				@select="select"
			/>
		</div>

		<!-- Number of rows & Pagination -->
		<template #footer>
			<div class="flex flex-wrap items-center justify-between">
				<div>
					<span class="text-sm leading-5">
						Zeigt
						<span class="font-medium">{{ pageFrom }}</span>
						bis
						<span class="font-medium">{{ pageTo }}</span>
						von
						<span class="font-medium">{{ pageTotal }}</span>
						Ergebnissen
					</span>
				</div>

				<UPagination
					v-model="page"
					:page-count="pageCount"
					:total="pageTotal"
				/>
			</div>
		</template>
	</UCard>
</template>
