<script setup lang="ts">
defineProps<{
	initialState?: string | object | null
	optionLabel?: string | Function
	selectedLabel?: string
	emptyLabel?: string
	noSelectedLabel: string
	size?: string
	noIcons?: boolean
}>()
const model = defineModel<string | object | null>()
</script>

<template>
	<div class="relative">
		<USelectMenu
			v-model="model"
			:ui="
				model || initialState
					? {
						leading: {
							padding: {
								xl: 'ps-10',
							},
						},
					}
					: { leading: { padding: { xl: 'hidden' } } }
			"
			:icon="noIcons === true ? null
				: model || initialState
					? model === initialState
						? 'i-heroicons-x-mark-16-solid'
						: 'i-heroicons-arrow-uturn-left'
					: ''
			"
			:size="size || 'md'"
			v-bind="$attrs"
		>
			<template
				v-if="noIcons === true ? false : model || initialState"
				#leading
			/>
			<template #label>
				<span v-if="model">{{ selectedLabel ? selectedLabel : model }}</span>
				<span v-else>{{ noSelectedLabel }}</span>
			</template>
			<template #option="{ option }">
				<span v-if="option">{{ optionLabel ? typeof optionLabel === 'function' ? optionLabel(option) : optionLabel : option }}</span>
				<span v-else>{{ emptyLabel }}</span>
			</template>
		</USelectMenu>
		<template v-if="noIcons === true ? false : model || initialState">
			<button
				v-if="model === initialState"
				class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
				@click="model = ''"
			>
				<UIcon
					name="i-heroicons-x-mark-16-solid"
					class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
				/>
			</button>
			<button
				v-else
				class="absolute top-0 bottom-0 z-20 flex my-auto left-3 h-fit"
				@click="model = initialState"
			>
				<UIcon
					name="i-heroicons-arrow-uturn-left"
					class="w-5 h-5 my-auto transition opacity-75 hover:opacity-100"
				/>
			</button>
		</template>
	</div>
</template>
