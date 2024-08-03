<script setup lang="ts">
import { computed, ref, shallowRef, toRefs, watchEffect } from 'vue'
import { Spherical, Vector3 } from 'three'

const { readAsyncItems } = useDirectusItems()
const { params } = useRoute()
const { copy, isSupported: clipboardIsSupported } = useClipboard()
const toast = useToast()
const config = useRuntimeConfig()
const carousel = ref()
const store_image_view = ref(true)
const auto_rotate = ref(true)
const camera_zoom = ref(true)
const orbit_controls = ref()
const modalStore = useModalStore()

const selectedTab = ref(0)
const setTab = (index: number) => {
	selectedTab.value = index
}

const { data } = await readAsyncItems('ships', {
	query: {
		fields: [
			'id',
			'date_updated',
			'p4k_mode',
			'p4k_version',
			'name',
			'slug',
			'store_image.id',
			'store_image.width',
			'store_image.height',
			'store_image.focal_point_x',
			'store_image.focal_point_y',
			'production_status',
			'description',
			'history',
			'length',
			'beam',
			'height',
			'mass',
			'cargo',
			'classification',
			'size',
			'crew_min',
			'crew_max',
			'quantum_fuel_tanks',
			'hydrogen_fuel_tanks',
			'pledge_price',
			'price',
			'speed_scm',
			'speed_max',
			'acceleration_main',
			'acceleration_retro',
			'acceleration_vtol',
			'acceleration_maneuvering',
			'insurance_claim_time',
			'insurance_expedited_time',
			'insurance_expedited_cost',
			'manufacturer.name',
			'manufacturer.slug',
			'manufacturer.logo',
			'gallery.directus_files_id',
			'commercial_video_id',
			'commercials.commercial_id.id',
			'commercials.commercial_id.type',
			'brochure',
			'hologram',
			'store_url',
			'sales_url',
			'on_sale',
			'rating.user_created',
			'rating.introduction',
			'rating.ratings',
			'rating.strengths_and_weaknesses',
			'loaners.loaner_id.id',
			'loaners.loaner_id.name',
			'loaners.loaner_id.slug',
			'loaners.loaner_id.store_image',
			'loaners.loaner_id.manufacturer.name',
			'loaners.loaner_id.manufacturer.slug',
			'loaners.loaner_id.production_status',
			'variants.variant_id.id',
			'variants.variant_id.name',
			'variants.variant_id.slug',
			'variants.variant_id.store_image',
			'variants.variant_id.manufacturer.name',
			'variants.variant_id.manufacturer.slug',
			'variants.variant_id.production_status',
			'modules.id',
			'modules.name',
			'modules.slug',
			'modules.gallery.directus_file_id',
			'modules.manufacturer.name',
			'modules.manufacturer.slug',
			'modules.production_status',
		],
		filter: {
			slug: { _eq: params.slug },
		},
		deep: {
			rating: {
				_filter: {
					status: {
						_eq: 'published',
					},
				},
			},
		},
	},
	transform: (rawShips: any[]) => transformShip(rawShips[0]),
})
console.log(data.value)
if (!data.value) {
	throw createError({
		statusCode: 404,
		statusMessage: 'Daten konnten nicht aus der Schiffsdatenbank geladen werden.',
		fatal: true,
	})
}

const commercialSources = data.value.commercials?.map((obj: { id: string, type: string }) => ({
	type: obj.type,
	src: config.public.fileBase + obj.id,
}))

const handleShare = () => {
	try {
		if (!clipboardIsSupported || !location?.href)
			throw new Error('clipboard is not supported or location.href is not set')
		copy(location.href)
		toast.add({ title: 'URL in Zwischenablage kopiert!' })
	}
	catch {
		toast.add({ title: 'Es konnte leider nichts in die Zwischenablage kopiert werden.', color: 'red' })
	}
}

const tablist = computed<any[]>(() => [
	...(data.value?.nothing ? [{ id: '1', header: 'Austattung' }] : []),
	...(data.value.history ? [{ id: '2', header: 'Geschichte' }] : []),
	...(Array.isArray(data.value.gallery) && data.value.gallery.length ? [{ id: '3', header: 'Gallerie' }] : []),
	...(data.value.commercial_video_id && Array.isArray(data.value.commercials) && data.value.commercials.length
		? [{ id: '4', header: 'Commercial' }]
		: []),
	...(data.value.rating ? [{ id: '5', header: 'Wertung' }] : []),
])

function openModule(module: any) {
	modalStore.setData(module)
	modalStore.openModal(module.name, {
		type: 'module',
		hideCloseButton: true,
		hideXButton: true,
	})
}

const module_carousel_wrapper = ref()
const module_carousel = ref()
const { isFullscreen: isModuleCarouselFS, enter: enterModuleCarouselFS, exit: exitModuleCarouselFS, toggle: toggleModuleCarouselFS } = useFullscreen(module_carousel_wrapper)
const module_shortcuts_enabled = computed(() => modalStore.isModalOpen && modalStore.type === 'module')

const stars_props = {
	size: 0.1,
	sizeAttenuation: true,
	transparent: true,
	alphaTest: 0.01,
	alphaMap: null,
	count: 500,
	depth: 50,
	radius: 100,
}

const stars_position = ref()
const stars_scale = ref()

const { radius: stars_radius, depth: stars_depth, count: stars_count, size: stars_size, sizeAttenuation: stars_sizeAttenuation, transparent: stars_transparent, alphaMap: stars_alphaMap, alphaTest: stars_alphaTest } = toRefs(stars_props)

const setStars = () => {
	let circle = stars_radius.value + stars_depth.value
	const increment = computed(() => stars_depth.value / stars_count.value)

	const positionArray: number[] = []
	const scaleArray: number[] = Array.from(
		{ length: stars_count.value },
		() => (0.5 + 0.5 * Math.random()) * 4,
	)

	const generateStars = (circle: number): Array<number> => {
		const starArray = new Vector3()
			.setFromSpherical(new Spherical(circle, Math.acos(1 - Math.random() * 2), Math.random() * 2 * Math.PI))
			.toArray()
		return starArray
	}

	for (let i = 0; i < stars_count.value; i++) {
		circle -= increment.value * Math.random()
		positionArray.push(...generateStars(circle))
	}
	stars_position.value = new Float32Array(positionArray)
	stars_scale.value = new Float32Array(scaleArray)
}

watchEffect(() => {
	setStars()
})

const starsRef = shallowRef()

defineShortcuts({
	f: () => module_shortcuts_enabled.value && toggleModuleCarouselFS(),
	arrowleft: () => module_shortcuts_enabled.value && module_carousel.value?.prev(),
	arrowright: () => module_shortcuts_enabled.value && module_carousel.value?.next(),
})

definePageMeta({
	layout: false,
})

useHead({
	title: data.value?.name,
})
</script>

<template>
	<NuxtLayout name="ship-exkurs">
		<template #modalContent>
			<div v-if="modalStore.type === 'module'">
				<DefaultPanel
					bg="bprimary"
					class="mx-auto mb-3 size-full"
				>
					<div
						ref="module_carousel_wrapper"
						class="relative size-full"
					>
						<UButton
							:icon="isModuleCarouselFS ? 'i-cil-fullscreen-exit' : 'i-cil-fullscreen'"
							color="gray"
							variant="ghost"
							class="absolute z-40 rotate-90 rounded-xl top-1 right-2"
							@click="isModuleCarouselFS ? exitModuleCarouselFS() : enterModuleCarouselFS()"
						/>
						<UCarousel
							ref="module_carousel"
							:items="modalStore.data.gallery"
							:ui="{ item: `flex flex-none snap-center w-full ${isModuleCarouselFS ? 'max-h-screen' : 'aspect-[16/9]'}`, indicators: { wrapper: 'absolute flex items-center justify-center gap-3 bottom-4 inset-x-0 z-30' } }"
							class="relative w-auto "
							:class="[isModuleCarouselFS ? 'max-h-screen' : 'max-h-[calc(100vh-4rem)] aspect-[16/9]']"
							arrows
							indicators
						>
							<template #default="{ item }">
								<div class="relative flex size-full">
									<NuxtImg
										:src="item"
										class="relative z-20 object-contain w-full h-auto m-auto"
										:class="[isModuleCarouselFS ? 'border-0 max-h-screen' : 'border border-btertiary/75']"
										draggable="false"
									/>
									<NuxtImg
										:src="item"
										class="absolute z-10 object-cover w-full h-full m-auto blur"
										:class="[isModuleCarouselFS ? 'brightness-0' : 'brightness-50']"
										draggable="false"
									/>
									<USkeleton class="absolute top-0 bottom-0 left-0 right-0 z-0 m-auto size-full" />
								</div>
							</template>

							<template #prev="{ onClick, disabled }">
								<UButton
									color="gray"
									class="absolute top-0 bottom-0 flex justify-center w-8 h-8 my-auto rounded-full p-1.5 left-4 group z-30"
									:disabled="disabled"
									@click="onClick"
								>
									<UIcon
										name="i-heroicons-chevron-left-20-solid"
										class="flex-shrink-0 w-5 h-5 m-auto group-hover:text-aris-400"
									/>
								</UButton>
							</template>

							<template #next="{ onClick, disabled }">
								<UButton
									color="gray"
									class="absolute top-0 bottom-0 flex justify-center w-8 h-8 my-auto rounded-full p-1.5 right-4 group z-30"
									:disabled="disabled"
									@click="onClick"
								>
									<UIcon
										name="i-heroicons-chevron-right-20-solid"
										class="flex-shrink-0 w-5 h-5 m-auto group-hover:text-aris-400"
									/>
								</UButton>
							</template>
						</UCarousel>
					</div>
				</DefaultPanel>
				<div>
					<TableParent
						title="Infobox"
						class="w-full mt-6 mb-8 xl:w-2/3"
						:class="[modalStore.data.description ? 'float-right xl:ml-12' : 'ml-auto']"
					>
						<TableRow
							title="Hersteller"
							:content="modalStore.data.manufacturer.name"
							:link="`/verseexkurs/companies/${modalStore.data.manufacturer.slug}`"
							full-width
							@click="modalStore.data.manufacturer.name && modalStore.closeModal()"
						/>
						<TableRow
							title="Produktionsstatus"
							:content="modalStore.data.production_status"
							full-width
						/>
					</TableParent>
					<Editor
						:model-value="modalStore.data.description"
						read-only
					/>
				</div>
			</div>
		</template>
		<div class="flex flex-wrap-reverse justify-between">
			<div class="mt-auto">
				<h1 class="mb-0 text-industrial-400">
					<span class="text-tbase">{{ data.manufacturer.name }}</span> {{ data.name }}
				</h1>
				<h4 class="mb-0 text-xs uppercase md:text-lg">
					<span class="text-dark-gray">Status: </span><span class="italic text-light-gray">{{ data.production_status }}</span>
				</h4>
			</div>
			<div class="ml-auto">
				<NuxtLink :to="`/verseexkurs/companies/${data.manufacturer.slug}`">
					<NuxtImg
						:src="data.manufacturer.logo"
						class="h-20 md:h-40 w-fit"
					/>
				</NuxtLink>
			</div>
		</div>
		<hr class="my-3">
		<div class="grid grid-cols-3 gap-4">
			<div class="col-span-3 space-y-4 xl:col-span-2">
				<DefaultPanel bg="bprimary">
					<div class="h-[300px] lg:h-[600px] xl:h-[700px] w-full z-50 relative">
						<div
							v-if="data.hologram"
							class="absolute z-40 rotate-10 top-1 right-2"
						>
							<ButtonDefault
								:active="!store_image_view"
								@click="store_image_view = !store_image_view"
							>
								3D
							</ButtonDefault>
						</div>
						<div
							v-if="!store_image_view"
							class="absolute z-40 space-x-2 rotate-10 bottom-1 right-2"
						>
							<UTooltip :text="`Auto-Rotation ${camera_zoom ? 'deaktivieren' : 'aktivieren'}`">
								<ButtonDefault
									:active="auto_rotate"
									class="size-fit"
									@click="auto_rotate = !auto_rotate"
								>
									<UIcon
										name="i-lucide-orbit"
										class="flex size-5"
									/>
								</ButtonDefault>
							</UTooltip>
							<UTooltip :text="`Zoom ${camera_zoom ? 'deaktivieren' : 'aktivieren'}`">
								<ButtonDefault
									:active="camera_zoom"
									class="size-fit"
									@click="camera_zoom = !camera_zoom"
								>
									<UIcon
										name="i-heroicons-magnifying-glass-16-solid"
										class="flex size-5"
									/>
								</ButtonDefault>
							</UTooltip>
						</div>
						<NuxtImg
							v-if="store_image_view"
							:src="data.store_image"
							class="object-cover size-full"
							:style="{ 'object-position': data.store_image_properties.object_position }"
						/>
						<TresCanvas
							v-else-if="!store_image_view && data.hologram"
							clear-color="#111"
							:tone-mapping-exposure="1"
							tone-mapping="ACESFilmicToneMapping"
							alpha
						>
							<TresPerspectiveCamera
								:position="[0, 20, 80]"
							/>
							<TcientosOrbitControls
								ref="orbit_controls"
								:enable-zoom="camera_zoom"
								:auto-rotate="auto_rotate"
								:auto-rotate-speed="1"
								make-default
							/>
							<!-- <TcientosStars
								:radius="100"
								:count="500"
							/> -->
							<TresPoints ref="starsRef">
								<TresBufferGeometry
									:position="[stars_position, 3]"
									:a-scale="[stars_scale, 1]"
								/>
								<TresPointsMaterial
									:size="stars_size"
									:size-attenuation="stars_sizeAttenuation"
									:transparent="stars_transparent"
									:alpha-test="stars_alphaTest"
									:alpha-map="stars_alphaMap"
								/>
							</TresPoints>
							<Suspense>
								<TcientosUseGLTFComponent
									:path="$config.public.fileBase + data.hologram"
									draco
								/>
							</Suspense>

							<TresAmbientLight
								:intensity="1"
							/>
							<TresDirectionalLight
								:position="[0, 100, 0]"
								:intensity="1.5"
							/>
							<TresDirectionalLight
								:position="[0, -100, 0]"
								:intensity="1.5"
							/>
						</TresCanvas>
					</div>
				</DefaultPanel>
				<DefaultPanel v-if="data.description" bg="bprimary">
					<Editor
						v-model="data.description"
						read-only
					/>
				</DefaultPanel>
			</div>
			<div class="col-span-3 space-y-4 xl:col-span-1">
				<TableParent title="Basis">
					<TableRow
						title="Länge"
						:content="data.length"
						suffix="M"
						third
					/>
					<TableRow
						title="Breite"
						:content="data.beam"
						suffix="M"
						third
					/>
					<TableRow
						title="Höhe"
						:content="data.height"
						suffix="M"
						third
					/>
					<TableHr />
					<TableRow
						title="Gewicht"
						:content="data.mass && Math.round((data.mass / 1000 + Number.EPSILON) * 100) / 100"
						suffix="T"
					/>
					<TableRow
						title="Frachtkapazität"
						:content="data.cargo"
					/>
					<TableHr />
					<TableRow
						title="Klassifizierung"
						:content="null"
					/>
					<TableRow
						title="Größe"
						:content="null"
					/>
					<TableHr />
					<TableRow
						title="Min Crew"
						:content="data.crew_min"
					/>
					<TableRow
						title="Max Crew"
						:content="data.crew_max"
					/>
					<TableHr />
					<TableRow
						title="Treibstoff"
						:content="
							data.hydrogen_fuel_tanks
								&& data.hydrogen_fuel_tanks.reduce((partialSum: any, a: any) => partialSum + a.capacity, 0)
						"
						suffix="L"
					/>
					<TableRow
						title="Quantum Treibstoff"
						:content="
							data.quantum_fuel_tanks
								&& data.quantum_fuel_tanks.reduce((partialSum: any, a: any) => partialSum + a.capacity, 0)
						"
						suffix="L"
					/>
				</TableParent>
				<TableParent title="Kaufen">
					<TableRow
						title="Pledgewert"
						:content="data.pledge_price"
						prefix="$"
					/>
					<TableRow
						title="Kaufpreis"
						:content="data.price"
						suffix="aUEC"
					/>
					<!-- <TableHr />
          <TableRow title="Kaufbar bei" :content="null" /> -->
				</TableParent>
				<TableParent title="Geschwindigkeit">
					<TableRow
						title="SCM Geschwindigkeit"
						:content="data.speed_scm"
					/>
					<TableRow
						title="Afterburner Speed"
						:content="data.speed_max"
					/>
					<TableHr />
					<TableRow
						title="Haupt-Triebwerk Beschl."
						:content="data.acceleration_main && Math.round((data.acceleration_main + Number.EPSILON) * 100) / 100"
					/>
					<TableRow
						title="Retro-Triebwerk Beschl."
						:content="data.acceleration_retro && Math.round((data.acceleration_retro + Number.EPSILON) * 100) / 100"
					/>
					<TableRow
						title="VTOL-Triebwerk Beschl."
						:content="data.acceleration_vtol && Math.round((data.acceleration_vtol + Number.EPSILON) * 100) / 100"
					/>
					<TableRow
						title="Manövrier-Triebwerk Beschl."
						:content="
							data.acceleration_maneuvering && Math.round((data.acceleration_maneuvering + Number.EPSILON) * 100) / 100
						"
					/>
				</TableParent>
				<TableParent title="Versicherung">
					<TableRow
						title="Zeit"
						:content="data.insurance_claim_time"
						suffix="Minuten"
					/>
					<TableRow
						title="Besch. Zeit"
						:content="data.insurance_expedited_time"
						suffix="Minuten"
					/>
					<TableRow
						title="Besch. Preis"
						:content="data.insurance_expedited_cost"
						suffix="aUEC"
					/>
				</TableParent>
				<TableParent title="API Statistiken">
					<TableRow
						title="Letztes Update der Daten"
						:content="data.date_updated ? new Date(data.date_updated).toLocaleDateString('de-DE') : null"
						full-width
					/>
					<TableRow
						title="P4K-Daten"
						:content="data.p4k_mode === true ? 'Aktiviert' : data.p4k_mode === false ? 'Deaktiviert' : null"
					/>
					<TableRow
						title="P4K-Daten Version"
						:content="data.p4k_version"
					/>
				</TableParent>
				<div class="flex flex-wrap max-w-full gap-2">
					<NuxtLink
						:to="data.store_url"
						external
						class="flex-grow text-tbase"
					>
						<ButtonDefault class="w-full text-sm">
							<p
								v-if="!data.on_sale"
								class="p-0"
							>
								RSI Seite
							</p>
							<p
								v-else-if="data.on_sale"
								class="p-0"
							>
								Aktuell zu verkaufen für: $ {{ data.pledge_price || 'N/A' }}
							</p>
						</ButtonDefault>
					</NuxtLink>
					<ButtonDefault @click="handleShare">
						<UIcon
							name="i-heroicons-share"
							class="flex m-auto size-5"
						/>
					</ButtonDefault>
					<UDropdown
						:items="[
							[
								...(data.sales_url
									? [
										{
											label: 'RSI Promoseite',
											icon: 'i-heroicons-presentation-chart-line',
											to: data.sales_url,
											external: true,
											target: '_blank',
										},
									]
									: []),
								...(data.brochure
									? [
										{
											label: 'Brochure',
											icon: 'i-heroicons-book-open',
											to: $config.public.fileBase + data.brochure,
											external: true,
											target: '_blank',
										},
									]
									: []),
								...(!data.sales_url && !data.brochure
									? [
										{
											label: 'Keine Links vorhanden',
											icon: 'i-heroicons-x-mark',
											disabled: true,
										},
									]
									: []),
							],
						]"
						:popper="{ placement: 'bottom-start' }"
						:ui="{ width: 'w-56' }"
					>
						<ButtonDefault>
							<UIcon
								name="i-mdi-dots-vertical"
								class="flex m-auto size-5"
							/>
						</ButtonDefault>
					</UDropdown>
				</div>
			</div>
		</div>
		<TabGroup
			v-if="tablist.length"
			:tablist="tablist"
			:store="selectedTab"
			:change="(i) => (selectedTab = i)"
			between
		>
			<template #tabcontent>
				<template v-if="selectedTab === tablist.findIndex((e) => e.id === '1')">
					Austattung
				</template>
				<template v-if="selectedTab === tablist.findIndex((e) => e.id === '2')">
					<DefaultPanel
						bg="bprimary"
						class="mb-3"
					>
						<div class="px-8">
							<Editor
								v-if="data.history"
								v-model="data.history"
								read-only
							/>
						</div>
					</DefaultPanel>
				</template>
				<template v-if="selectedTab === tablist.findIndex((e) => e.id === '3')">
					<DefaultPanel
						bg="bprimary"
						class="mx-auto mb-3 w-fit h-fit"
					>
						<UCarousel
							ref="carousel"
							:items="data.gallery"
							:ui="{ item: 'flex flex-none snap-center w-full aspect-[16/9]' }"
							class="max-h-[calc(100vh-4rem)] aspect-[16/9] w-auto relative"
							arrows
							indicators
						>
							<template #default="{ item }">
								<NuxtImg
									:src="item"
									class="object-cover w-full h-auto"
									draggable="false"
								/>
							</template>

							<template #prev="{ onClick, disabled }">
								<UButton
									color="gray"
									class="absolute top-0 bottom-0 flex justify-center w-8 h-8 my-auto rounded-full p-1.5 left-4 group"
									:disabled="disabled"
									@click="onClick"
								>
									<UIcon
										name="i-heroicons-chevron-left-20-solid"
										class="flex-shrink-0 w-5 h-5 m-auto group-hover:text-aris-400"
									/>
								</UButton>
							</template>

							<template #next="{ onClick, disabled }">
								<UButton
									color="gray"
									class="absolute top-0 bottom-0 flex justify-center w-8 h-8 my-auto rounded-full p-1.5 right-4 group"
									:disabled="disabled"
									@click="onClick"
								>
									<UIcon
										name="i-heroicons-chevron-right-20-solid"
										class="flex-shrink-0 w-5 h-5 m-auto group-hover:text-aris-400"
									/>
								</UButton>
							</template>
						</UCarousel>
					</DefaultPanel>
				</template>
				<template v-if="selectedTab === tablist.findIndex((e) => e.id === '4')">
					<div
						id="commercial_container"
						class="my-auto"
					>
						<ArisCorpVideoplayer
							:src="commercialSources"
							:poster-url="`https://img.youtube.com/vi/${data.commercial_video_id}/maxresdefault.jpg`"
						/>
					</div>
				</template>
				<template v-if="selectedTab === tablist.findIndex((e) => e.id === '5')">
					<DefaultPanel
						bg="bprimary"
						class="mb-3"
					>
						<div class="flex flex-wrap px-2">
							<div class="flex flex-col basis-full md:basis-1/2">
								<h2 class="mt-4">
									<span class="text-aris-400">ArisCorp</span> Wertung
								</h2>
								<ul>
									<li
										v-for="(item, index) in data.rating.strengths_and_weaknesses"
										:key="index"
										class="pl-2"
										:class="[
											item.category === 'weakness'
												? `marker:text-red-600 marker:content-['-']`
												: `marker:text-green-600 marker:content-['+']`,
										]"
									>
										{{ item.name }}
									</li>
								</ul>
							</div>
							<div class="basis-full md:basis-1/2">
								<h2 class="mt-4 text-aris-400">
									Unsere Einschätzung
								</h2>
								<div class="pl-2">
									<p class="pt-0 pl-0 text-industrial-400">
										Kampfpotenzial -
										{{ data.rating.ratings.find((e) => e.category === 'combat_potential').grade_label }}
									</p>
									<p class="py-0 pl-4">
										{{ data.rating.ratings.find((e) => e.category === 'combat_potential').reason }}
									</p>
									<p class="pl-0 text-industrial-400">
										Wirtschaftliches Potenzial -
										{{ data.rating.ratings.find((e) => e.category === 'economic_potential')?.grade_label }}
									</p>
									<p class="py-0 pl-4">
										{{ data.rating.ratings.find((e) => e.category === 'economic_potential')?.reason }}
									</p>
									<p class="pl-0 text-industrial-400">
										Benutzungspotenzial -
										{{ data.rating.ratings.find((e) => e.category === 'usage_potential')?.grade_label }}
									</p>
									<p class="py-0 pl-4">
										{{ data.rating.ratings.find((e) => e.category === 'usage_potential')?.reason }}
									</p>
									<p class="pl-0 text-industrial-400">
										Preis-Leistungsverhältnis -
										{{ data.rating.ratings.find((e) => e.category === 'p-p_ratio')?.grade_label }}
									</p>
									<p class="py-0 pl-4">
										{{ data.rating.ratings.find((e) => e.category === 'p-p_ratio')?.reason }}
									</p>
									<p class="pl-0 text-industrial-400">
										Schlussfolgerung - {{ data.rating.ratings.find((e) => e.category === 'conclusion')?.grade_label }}
									</p>
									<p class="py-0 pl-4">
										{{ data.rating.ratings.find((e) => e.category === 'conclusion')?.reason }}
									</p>
								</div>
							</div>
							<div class="flex basis-full">
								<div class="flex items-center mx-auto mt-8 mb-4">
									<div class="mr-4">
										<p class="p-0 text-xl text-white fon-bold">
											{{ data.name }}
										</p>
										<p class="p-0">
											Erreichte eine Punktzahl von:
										</p>
									</div>

									<ArcCounter
										width="6rem"
										height="6rem"
										:text="data.rating.score + '%'"
										:dash-count="10"
										:active-count="10 * (data.rating.score / 100)"
										:dash-spacing="0 / 4"
									/>
								</div>
							</div>
							<hr class="mx-4 my-4">
							<div class="flex px-6 pb-2 basis-full">
								<div class="mx-auto">
									<Editor
										v-model="data.rating.introduction"
										read-only
									/>
								</div>
							</div>
						</div>
					</DefaultPanel>
				</template>
			</template>
		</TabGroup>
		<hr>
		<div class="flex flex-nowrap">
			<div
				v-if="data.variants"
				class="w-full px-2"
			>
				<h3 class="text-industrial-400">
					Varianten
				</h3>
				<div>
					<ShipCard
						v-for="ship in data.variants"
						:key="ship.id"
						:ship-data="ship"
						preload-images
						display-production-state
					/>
				</div>
			</div>
			<div
				v-if="data.all_loaners"
				class="w-full px-2"
			>
				<h3 class="text-industrial-400">
					Leihschiffe- und Fahrzeuge
				</h3>
				<div>
					<ShipCard
						v-for="ship in data.all_loaners"
						:key="ship.id"
						:ship-data="ship"
						preload-images
						display-production-state
					/>
				</div>
			</div>
			<div
				v-if="data.paints"
				class="w-full px-2"
			>
				<h3 class="text-industrial-400">
					Lackierungen
				</h3>
				<div>
					<ShipCard
						v-for="paint in data.paints"
						:key="paint.id"
						:ship-data="paint"
						preload-images
						display-production-state
						paint-view
					/>
				</div>
			</div>
			<div
				v-if="data.modules"
				class="w-full px-2"
			>
				<h3 class="text-industrial-400">
					Module
				</h3>
				<div>
					<ShipCard
						v-for="module in data.modules"
						:key="module.id"
						:ship-data="module"
						preload-images
						display-production-state
						module-view
						@module-open="openModule"
					/>
				</div>
			</div>
		</div>
	</NuxtLayout>
</template>
