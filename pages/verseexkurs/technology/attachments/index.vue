<script setup lang="ts">
const { readAsyncItems } = useDirectusItems()
const route = useRoute()
const { replace } = useRouter()

const search_input = ref<string>('')
const search = ref<string>('')

// const type = ref<string | null>('')
// const size = ref<string | null>('')
// const manufacturer = ref<string | null>('')
const queryVars = reactive({
	type: route.query.type || '',
	size: route.query.size || '',
	manufacturer: route.query.manufacturer || '',
})
const { type, size, manufacturer } = toRefs(queryVars)

useSearch(search, search_input, { debounce: true, query: true })

watch(queryVars, (newQuery) => {
	const query = {}
	if (newQuery.hasOwnProperty('type')) {
		query.type = queryVars.type ? queryVars.type : undefined
	}
	if (newQuery.hasOwnProperty('size')) {
		query.size = queryVars.size ? queryVars.size : undefined
	}
	if (newQuery.hasOwnProperty('manufacturer')) {
		query.manufacturer = queryVars.manufacturer ? queryVars.manufacturer : undefined
	}
	console.log(query)
	console.log(newQuery)

	replace({
		query: { ...route.query, ...query },
	})
}, { deep: true })

// if (route.query?.type) {
// 	type.value = route.query.type as string
// }
// if (route.query?.size) {
// 	size.value = route.query.size as string
// }
// if (route.query?.manufacturer) {
// 	manufacturer.value = route.query.manufacturer as string
// }

// watch(type, () => {
// 	replace({
// 		query: type.value ? ({ ...route.query, type: type.value }) : { ...route.query, type: undefined },
// 	})
// })
// watch(size, () => {
// 	replace({
// 		query: size.value ? ({ ...route.query, size: size.value }) : { ...route.query, size: undefined },
// 	})
// })
// watch(manufacturer, () => {
// 	replace({
// 		query: manufacturer.value ? ({ ...route.query, manufacturer: manufacturer.value }) : { ...route.query, manufacturer: undefined },
// 	})
// })

function clearFilters() {
	// replace({
	// 	query: { ...route.query, type: undefined, size: undefined, manufacturer: undefined },
	// })
	type.value = ''
	size.value = ''
	manufacturer.value = ''
}

definePageMeta({
	layout: 'verse-exkurs',
})
useHead({
	title: 'Waffenaufsätze',
})
</script>

<template>
	<VerseExkursBaseArticle banner="fbd2c23c-74bc-4142-a145-f2f43dbfdc77">
		<template #title>
			Waffenaufsätze
		</template>
		<template #default>
			<div>
				<div class="mx-auto lg:w-1/3">
					<UInput
						v-model="search_input"
						placeholder="Suche..."
						size="md"
						class="sticky top-0 w-full mt-2"
					/>
				</div>
				<div class="flex mx-auto w-fit gap-x-5">
					<button
						class="flex flex-wrap w-24 mb-auto h-fit animate-link"
						@click="clearFilters"
					>
						<NuxtImg
							src="1638095c-c0f3-49bf-b8c9-6e1a52a44333"
							height="96px"
							width="96px"
						/>
						<span class="mx-auto">Alle anzeigen</span>
					</button>
					<div class="flex mx-auto w-fit gap-x-2">
						<button
							class="flex flex-wrap w-24 mb-auto h-fit animate-link"
							@click="type = 'optic'"
						>
							<NuxtImg
								src="df440c84-f2d7-4c16-9f4e-352dcf4b1170"
								height="96px"
								width="96px"
							/>
							<span class="mx-auto white">Optik Aufsätze</span>
						</button>
						<button
							class="flex flex-wrap w-24 mb-auto h-fit animate-link"
							@click="type = 'barrel'"
						>
							<NuxtImg
								src="61233634-b820-4805-8213-304b524c5c3f"
								height="96px"
								width="96px"
							/>
							<span class="mx-auto">Lauf Aufsätze</span>
						</button>
						<button
							class="flex flex-wrap w-24 mb-auto h-fit animate-link"
							@click="type = 'underbarrel'"
						>
							<NuxtImg
								src="e3c26a21-2e95-49ff-80ba-0ecf814b34ba"
								height="96px"
								width="96px"
							/>
							<span class="mx-auto">Unterlauf Aufsätze</span>
						</button>
					</div>
					<div class="flex mx-auto w-fit gap-x-2">
						<button
							class="flex flex-wrap w-24 mb-auto h-fit animate-link"
							@click="size = '1'"
						>
							<NuxtImg
								src="5c1bf1df-956f-45dd-af99-2163d1018153"
								height="96px"
								width="96px"
							/>
							<span class="mx-auto">Größe 1</span>
						</button>
						<button
							class="flex flex-wrap w-24 mb-auto h-fit animate-link"
							@click="size = '2'"
						>
							<NuxtImg
								src="7027368d-f856-4c47-afb6-300b63fb32d2"
								height="96px"
								width="96px"
							/>
							<span class="mx-auto">Größe 2</span>
						</button>
						<button
							class="flex flex-wrap w-24 mb-auto h-fit animate-link"
							@click="size = '3'"
						>
							<NuxtImg
								src="6d01f3b8-3b03-4e39-832b-b52d4a59933f"
								height="96px"
								width="96px"
							/>
							<span class="mx-auto">Größe 3</span>
						</button>
					</div>
					<button class="flex flex-wrap w-24 mb-auto h-fit animate-link">
						<NuxtImg
							src="314cc998-245d-4487-97cd-fb86342eaf8d"
							height="96px"
							width="96px"
						/>
						<span class="mx-auto">Hersteller</span>
					</button>
				</div>
			</div>
		</template>
	</VerseExkursBaseArticle>
</template>
