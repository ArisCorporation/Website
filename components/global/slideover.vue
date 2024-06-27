<script setup lang="ts">
const state = defineModel<boolean>()
const modalStore = useModalStore()

const props = defineProps<{ modelValue: any, big?: boolean }>()
const hasVModel = computed(() => props.modelValue !== undefined)

const open = computed<boolean>({
	get(): boolean {
		return hasVModel?.value ? state?.value : modalStore.isSlideOpen
	},
	set(value: boolean) {
		if (hasVModel?.value) {
			state.value = value
		}
		else {
			modalStore.isSlideOpen = value
		}
	},
})
</script>

<template>
	<USlideover
		v-model="open"
		:ui="{
			strategy: 'override',
			width:
				'w-screen ' + (modalStore.big || big ? 'max-w-full md:max-w-3xl 2xl:max-w-4xl' : 'max-w-[532px] xl:max-w-xl'),
		}"
	>
		<!-- <div class="flex-1 p-4 scrollbar-gray-thin"> -->
		<slot name="slideCard">
			<div class="flex-1 overflow-y-scroll">
				<UCard
					class="flex flex-col flex-1 h-full overflow-y-scroll scrollbar-gray-thin"
					:ui="{
						body: { base: 'flex-1' },
						background: 'bg-bprimary',
						ring: '',
						divide: 'divide-y divide-btertiary',
					}"
				>
					<template
						v-if="$slots.slideHeader"
						#header
					>
						<!-- TODO: Styling -->
						<!-- <button
              class="absolute flex items-center w-8 h-8 cursor-pointer focus:outline-none"
              @click="modalStore.closeSlide"
            >
              <Icon
                name="heroicons:x-circle"
                class="w-full h-full transition rounded-full bg-black/75 hover:bg-black text-tbase hover:text-white"
              />
            </button> -->
						<slot name="slideHeader" />
					</template>
					<slot name="slideContent" />
					<template
						v-if="$slots.slideFooter"
						#footer
					>
						<slot name="slideFooter" />
					</template>
				</UCard>
			</div>
		</slot>
	</USlideover>
</template>
