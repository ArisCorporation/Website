<script lang="ts" setup>
interface IShip {
	id: number
	name: string
	slug: string
	store_image: string
	store_image_properties: {
		width: number
		height: number
		focal_point_x: number
		focal_point_y: number
	}
	length: number
	height: number
	beam: number
	manufacturer: {
		name: string
		code: string
		slug: string
	}
}

const { readAsyncItems } = useDirectusItems()
const router = useRouter()
const route = useRoute()
const selectedShips = ref<IShip[]>([])

const { data: ships } = await readAsyncItems('ships', {
	query: {
		fields: [
			'id',
			'name',
			'slug',
			'store_image.id',
			'store_image.width',
			'store_image.height',
			'store_image.focal_point_x',
			'store_image.focal_point_y',
			'length',
			'height',
			'beam',
			'manufacturer.name',
			'manufacturer.code',
			'manufacturer.slug',
		],
		filter: {
			status: 'published',
		},
		sort: 'name',
		limit: -1
	},
	transform: (rawShips: any[]) => rawShips.map((rawShip: any) => transformShip(rawShip)),
})
const sortedShips = computed<IShip[]>({
	get() {
		const sortedShips = [...ships.value]
		const selectedShipSlugs = selectedShips.value.map((ship: IShip) => ship.name)
		sortedShips.sort((a, b) => {
			if (selectedShipSlugs.includes(a.name) && !selectedShipSlugs.includes(b.name)) {
				return -1
			}
			else if (!selectedShipSlugs.includes(a.name) && selectedShipSlugs.includes(b.name)) {
				return 1
			}
			else {
				return 0
			}
		})
		return sortedShips
	},
})

console.log(ships)
if (route.query.ships) {
	const selectedShipSlugs = route.query.ships as string[]
	selectedShips.value = ships.value.filter((ship: IShip) => selectedShipSlugs.includes(ship.slug))
}
watch(selectedShips, () => {
	router.replace({
		query: {
			...route.query,
			ships: selectedShips.value.map((ship: IShip) => ship.slug),
		},
	})
})

useHead({
	title: 'Schiffsvergleich',
})
definePageMeta({
	layout: 'ship-exkurs',
})
</script>

<template>
	<div>
		<div class="flex">
			<div class="max-w-[20%] min-w-[300px] w-[300px] mr-6">
				<ArisSelectMenu
					v-model="selectedShips"
					:options="sortedShips"
					:option-label="(option: IShip) => option.name"
					selected-label="Schiffe auswählen"
					no-selected-label="Keine Schiffe ausgewählt"
					:no-icons="true"
					multiple
					searchable
					:search-attributes="['name', 'slug', 'manufacturer.name', 'manufacturer.slug', 'manufacturer.code']"
					searchable-placeholder="Suche..."
					clear-search-on-close
				/>
			</div>
			<div class="flex space-x-4">
				<div
					v-for="ship in selectedShips"
					:key="ship.id"
					class="relative flex w-[400px]"
				>
					<NuxtLink
						:to="`/shipexkurs/ships/${ship.slug}`"
						class="text-white animate-link peer"
					>
						<DefaultPanel>
							<NuxtImg
								:src="ship.store_image"
								class="object-cover size-full h-auto aspect-[21/9]"
								:style="{ 'object-position': ship.store_image_properties.object_position }"
							/>
						</DefaultPanel>
					</NuxtLink>
					<div
						class="peer-active:hidden absolute z-10 top-[7px] right-[7px] border-t-bsecondary border-r-bsecondary border-t-[20px] border-r-[20px] border-solid border-b-[20px] border-l-[20px] border-b-transparent border-l-transparent rounded-tr-2xl cursor-pointer"
					>
						<UTooltip
							text="Schiff entfernen"
							class="size-5 absolute m-auto left-[-2.5px] top-[-17px]"
						>
							<button
								class="flex size-full i-heroicons-x-mark-20-solid"
								@click="() => selectedShips = selectedShips.filter((e) => e.id !== ship.id)"
							>
								<UIcon name="i-heroicons-x-mark-20-solid" />
							</button>
						</UTooltip>
					</div>
				</div>
			</div>
		</div>
		<div
			v-if="selectedShips[0]"
			class="flex mt-2"
		>
			<div class="max-w-[20%] min-w-[300px] w-[300px] flex mr-6 sticky left-0">
				<div class="my-auto font-bold h-fit">
					Name:
				</div>
			</div>
			<div class="flex space-x-4">
				<NuxtLink
					v-for="ship in selectedShips"
					:key="ship.id"
					:to="`/shipexkurs/ships/${ship.slug}`"
					class="w-[400px] text-tbase animate-link"
				>
					<div class="py-2 mx-1 text-center rounded bg-bsecondary">
						{{ ship.name }}
					</div>
				</NuxtLink>
			</div>
		</div>
		<div
			v-if="selectedShips[0]"
			class="flex mt-2"
		>
			<div class="max-w-[20%] min-w-[300px] w-[300px] flex mr-6 sticky left-0">
				<div class="my-auto h-fit">
					Länge:
				</div>
			</div>
			<div class="flex space-x-4">
				<div
					v-for="ship in selectedShips"
					:key="ship.id"
					class="w-[400px] text-tbase animate-link"
				>
					<div class="py-2 mx-1 text-center rounded bg-bsecondary">
						{{ ship.length }} M
					</div>
				</div>
			</div>
		</div>
		<div
			v-if="selectedShips[0]"
			class="flex mt-2"
		>
			<div class="max-w-[20%] min-w-[300px] w-[300px] flex mr-6 sticky left-0">
				<div class="my-auto h-fit">
					Höhe:
				</div>
			</div>
			<div class="flex space-x-4">
				<div
					v-for="ship in selectedShips"
					:key="ship.id"
					class="w-[400px] text-tbase animate-link"
				>
					<div class="py-2 mx-1 text-center rounded bg-bsecondary">
						{{ ship.height }} M
					</div>
				</div>
			</div>
		</div>
		<div
			v-if="selectedShips[0]"
			class="flex mt-2"
		>
			<div class="max-w-[20%] min-w-[300px] w-[300px] flex mr-6 sticky left-0">
				<div class="my-auto h-fit">
					Breite:
				</div>
			</div>
			<div class="flex space-x-4">
				<div
					v-for="ship in selectedShips"
					:key="ship.id"
					class="w-[400px] text-tbase animate-link"
				>
					<div class="py-2 mx-1 text-center rounded bg-bsecondary">
						{{ ship.beam }} M
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style>
.t1 {
  position: absolute;
  /* top: 0;
  right: 0; */
  /* width: 0; */
  /* height: 0; */
  border-top: 20px solid #222;
  border-right: 20px solid #222;
  border-bottom: 20px solid transparent;
  border-left: 20px solid transparent;
  /* border-top-right-radius: 4px; */
  cursor: pointer;
}

.t2 {
  position: absolute;
  top: -15px;
  right: -15px;
  color: #fff;
}
</style>
