<script setup lang="ts">
interface Folder {
	id: string
	parent: string
	name: string
	children: Folder[]
}

defineEmits(['image-click'])

const { readFiles } = useDirectusFiles()

const props = defineProps<{ grid?: string, type?: 'image' | 'video' | 'audio' }>()

const { globals, url } = useDirectus()
const active_folder = useState<Folder | null>('active_folder')
const search = ref<string>('')
const search_input = ref<string>('')

const page = ref(1)
const pageCount = ref(48)
const pageTotal = ref(0)
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1)
const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value))

useSearch(search, search_input, { debounce: true })

const { data: folders } = await useAsyncData(() => globals.fetch(url.href + 'folders?fields=*&sort=name&limit=-1'), {
	watch: [active_folder],
	transform: (data) => {
		const folders = data?.data
		folders.forEach((folder: any, index: number) => {
			const childrenFolders = folders?.filter((e: any) => e.parent === folder.id)
			folder.children = childrenFolders
		})

		return folders
	},
})

// const { data: files_count } = await useAsyncData(
// 	() =>
// 		globals.fetch(
// 			url.href
// 			+ `files?fields=id&limit=-1&filter=${JSON.stringify(useDirectusSearch(unref(search), ['title', 'description', 'tags']))}${active_folder.value?.id !== 'all' ? `&filter[folder]${active_folder.value?.id ? `[_eq]=${active_folder.value?.id}` : '[_null]'}` : ''}${props.type ? `&filter[type][_istarts_with]=${props.type}` : ''}`,
// 		),
// 	{
// 		watch: [search, page, pageCount, active_folder],
// 		transform: (data: any) => data?.data,
// 	},
// )
// const search_filters = ref(useDirectusSearch(search.value, ['title', 'description'], { id: '_eq' }))
// watch(search, () => search_filters.value = useDirectusSearch(search.value, ['title', 'description'], { id: '_eq' }))
// watch(search, () => console.log(useDirectusSearch(search.value, ['title', 'description'], { id: '_eq' })))
// const { data: files_count } = await readAsyncFiles({
// 	query: {
// 		fields: ['id'],
// 		limit: -1,
// 		filter: {
// 			...search_filters,
// 			...(active_folder.value?.id !== 'all'
// 				? { folder:
// 				{
// 					...(active_folder.value?.id ? { _eq: active_folder.value?.id } : { _null: true }),
// 				} }
// 				: {}),
// 		},
// 	},
// 	watch: [search_filters, page, pageCount, active_folder],
// })
const { data: files_count } = await useAsyncData('files_count', async () => await readFiles({
	fields: ['id'],
	limit: -1,
	search: search.value,
	filter: {
		// ...search_filters.value,
		...(active_folder.value?.id !== 'all'
			? { folder:
				{
					...(active_folder.value?.id ? { _eq: active_folder.value?.id } : { _null: true }),
				} }
			: {}),
		...(props.type ? { type: { _istarts_with: props.type } } : {}),
	} },
), {
	watch: [search, page, pageCount, active_folder],
})

watch(
	[files_count],
	() => {
		if (files_count.value) {
			pageTotal.value = files_count.value.length
		}
	},
	{ immediate: true },
)

// const { data: files } = await useAsyncData(
// 	() =>
// 		globals.fetch(
// 			url.href
// 			+ `files?fields=*&limit=${pageCount.value}&page=${page.value}&filter=${JSON.stringify(useDirectusSearch(unref(search), ['title', 'description', 'tags']))}${active_folder.value?.id !== 'all' ? `&filter[folder]${active_folder.value?.id ? `[_eq]=${active_folder.value?.id}` : '[_null]'}` : ''}${props.type ? `&filter[type][_istarts_with]=${props.type}` : ''}`,
// 		),
// 	{
// 		watch: [search, files_count, active_folder],
// 		transform: (data: any) => data?.data,
// 	},
// )
// const { data: files } = await readAsyncFiles({
// 	query: {
// 		fields: ['*'],
// 		limit: pageCount.value,
// 		page: page.value,
// 		filter: {
// 			...unref(search_filters),
// 			...(active_folder.value?.id !== 'all'
// 				? { folder:
// 				{
// 					...(active_folder.value?.id ? { _eq: active_folder.value?.id } : { _null: true }),
// 				} }
// 				: {}),
// 		},
// 	},
// 	watch: [search_filters, page, pageCount, active_folder],
// })
const { data: files } = await useAsyncData('files', async () => await readFiles({
	fields: ['id', 'title', 'description', 'type', 'folder'],
	limit: pageCount.value,
	page: page.value,
	search: search.value,
	filter: {
		// ...search_filters.value,
		...(active_folder.value?.id !== 'all'
			? { folder:
				{
					...(active_folder.value?.id ? { _eq: active_folder.value?.id } : { _null: true }),
				} }
			: {}),
		...(props.type ? { type: { _istarts_with: props.type } } : {}),
	} },
), {
	watch: [search, page, pageCount, active_folder],
})

const open = ref(false)
</script>

<template>
	<div
		class="max-w-full grid-cols-3 my-auto border divide-y rounded size-full indic sm:divide-x sm:grid border-bsecondary divide-bsecondary grid-rows-[1fr_auto]"
	>
		<div class="px-1 pb-4 overflow-auto sm:pb-0 sm:max-h-[calc(100vh_-_8.5rem)] max-h-[calc(100vh_-_15.5rem)] pt-2">
			<ul class="pl-0 space-y-4 list-none">
				<li class="p-0">
					<div
						class="flex justify-between max-w-full p-2 rounded cursor-pointer hover:bg-black has-[.folder-label:active]:animate-link"
						:class="{ 'bg-black': active_folder === null }"
					>
						<div
							class="flex flex-grow my-auto space-x-1 w-fit folder-label"
							@click="active_folder = null"
						>
							<UIcon
								name="i-heroicons-folder"
								class="my-auto size-5"
							/>
							<p class="p-0">
								Dateien
							</p>
						</div>
						<div class="relative my-auto size-5 animate-link">
							<UIcon
								name="i-heroicons-chevron-down-20-solid"
								class="w-full h-full transition-transform duration-300"
								:class="{ '-rotate-90': !open }"
								@click="open = !open"
							/>
						</div>
					</div>
					<ul
						v-if="open"
						class="pt-2 space-y-1 list-none"
					>
						<FileLibraryFolderItem
							v-for="folder in folders.filter((e: any) => !e.parent)"
							:key="folder.id"
							:folder="folder"
							:folders="folders"
							:level="1"
						/>
					</ul>
				</li>
				<li class="p-0">
					<div
						class="flex justify-between max-w-full p-2 rounded cursor-pointer hover:bg-bsecondary has-[.folder-label:active]:animate-link"
						:class="{ 'bg-black': active_folder?.id === 'all' }"
					>
						<div
							class="flex flex-grow my-auto space-x-1 w-fit folder-label"
							@click="active_folder = { id: 'all', parent: '', name: 'Alle Dateien', children: [] }"
						>
							<UIcon
								name="i-heroicons-folder"
								class="my-auto size-5"
							/>
							<p class="p-0">
								Alle Dateien
							</p>
						</div>
					</div>
				</li>
			</ul>
		</div>
		<div
			class="w-auto col-span-2 p-4 mx-2 overflow-y-auto sm:mr-0 min-h-max sm:max-h-[calc(100vh_-_8.5rem)] max-h-[calc(100vh_-_15.5rem)] pt-2 sm:!border-t-0"
		>
			<UInput
				v-model="search_input"
				placeholder="Suche..."
				size="md"
				class="sticky top-0 w-full mt-2"
			/>
			<hr class="my-4 bg-bsecondary">
			<div
				class="grid gap-4"
				:style="{ gridTemplateColumns: `repeat(${grid ?? 6}, minmax(0, 1fr))` }"
			>
				<div
					v-for="file in files"
					:key="file.id"
					class="w-full relative h-auto aspect-[1/1] bg-bsecondary rounded-xl overflow-clip cursor-pointer animate-link"
					@click="() => $emit('image-click', file)"
				>
					<NuxtImg
						v-if="file.type?.startsWith('image')"
						height="150px"
						width="150px"
						:src="file.id"
						format="jpg"
						class="relative z-10 object-cover w-full h-full"
					/>
					<video
						v-else-if="file.type?.startsWith('video')"
						:src="$config.public.fileBase + file.id + '#t=1.1'"
						class="relative z-10 object-cover w-full h-full rounded-xl"
					/>
					<div
						v-else
						class="relative z-10 flex w-full h-full text-center bg-bsecondary"
					>
						<span class="m-auto">{{ file.title }}</span>
					</div>
					<USkeleton
						class="absolute top-0 bottom-0 left-0 right-0 z-0 m-auto size-full"
						:ui="{ rounded: 'rounded-xl' }"
					/>
				</div>
			</div>
		</div>
		<div class="col-span-3 py-2">
			<div class="mx-auto mb-2 text-center w-fit">
				<div class="flex justify-center">
					<UPagination
						v-model="page"
						:page-count="pageCount"
						:total="pageTotal"
					/>
				</div>
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
			</div>
		</div>
	</div>
</template>
