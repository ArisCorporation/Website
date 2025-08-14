<script setup lang="ts">
const { readAsyncItems, readItems } = useDirectusItems()
const { params } = useRoute()

const data = await readAsyncItems('ships', {
	query: {
		fields: [
			'id',
			'date_updated',
			'p4k_mode',
			'p4k_version',
			'name',
			'slug',
			'store_image',
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

const data2 = await readAsyncItems('ships', {
	query: {
		fields: [
			'id',
			'date_updated',
			'p4k_mode',
			'p4k_version',
			'name',
			'slug',
			'store_image',
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
})

const data3 = await readAsyncItems('ships', {
	query: {
		filter: {
			slug: { _eq: params.slug },
		},
	},
})

const data4 = await readAsyncItems('ships')

const data5 = await useAsyncData('ships5', await readItems('ships'))

const data6 = await useFetch('https://studio.ariscorp.de/items/ships')

console.log(data)
console.log(data2)
console.log(data3)
console.log(data4)
console.log(data5)
console.log(data6)

definePageMeta({
	layout: 'ship-exkurs',
})
</script>

<template>
	<div>
		<p>{{ params.slug }}</p>
	</div>
</template>
