<script setup lang="ts">
defineProps({
	color: {
		type: String,
		required: false,
		default: 'primary-400',
	},
	noAnimation: {
		type: Boolean,
		required: false,
		default: false,
	},
	disabled: {
		type: Boolean,
		required: false,
		default: false,
	},
	size: {
		type: String,
		required: false,
		default: 'base',
	},
	to: {
		type: String,
		required: false,
		default: null,
	},
})
</script>

<template>
	<button
		v-if="!to"
		:disabled="disabled"
		:class="[
			{
				'animate-link': !noAnimation && !disabled,
				'p-0.5 rounded-[10px] border-2 after:h-0.5 before:h-0.5 before:-top-0.5 after:-bottom-0.5': size === 'base',
				'p-[2px] text-xs rounded-lg border after:h-px before:h-px before:-top-px after:-bottom-px': size === 'xs',
			},
			`relative inline-block cursor-pointer group/button after:absolute after:bg-bsecondary after:left-4 after:right-4 before:absolute before:bg-bsecondary before:box-border before:left-4 before:right-4 bg-bprimary text-inherit border-${color} disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed`,
		]"
	>
		<div
			class="box-border overflow-hidden text-center transition-all duration-200 group-hover/button:duration-300 whitespace-nowrap text-ellipsis"
			:class="[
				{
					'group-hover/button:bg-btertiary': !disabled,
					'p-2 rounded-md': size === 'base',
					'p-1 rounded-[5px]': size === 'xs',
				},
				'group-hover:text-' + color,
			]"
		>
			<p class="p-0">
				<slot />
			</p>
		</div>
	</button>
	<NuxtLink
		v-else
		:to="to"
		class="relative inline-block group/button after:absolute after:bg-bsecondary after:left-4 after:right-4 before:absolute before:bg-bsecondary before:box-border before:left-4 before:right-4 bg-bprimary text-inherit"
		:class="[
			{
				'animate-link': !noAnimation && !disabled,
				'p-0.5 rounded-[10px] border-2 after:h-0.5 before:h-0.5 before:-top-0.5 after:-bottom-0.5': size === 'base',
				'p-[2px] text-xs rounded-lg border after:h-px before:h-px before:-top-px after:-bottom-px': size === 'xs',
			},
			disabled ? 'grayscale opacity-50 cursor-not-allowed' : 'cursor-pointer border-' + color,,
		]"
	>
		<div
			class="box-border overflow-hidden text-center transition-all duration-200 group-hover/button:duration-300 whitespace-nowrap text-ellipsis"
			:class="[
				{
					'group-hover/button:bg-btertiary': !disabled,
					'p-2 rounded-md': size === 'base',
					'p-1 rounded-[5px]': size === 'xs',
				},
				'group-hover:text-' + color,
			]"
		>
			<p class="p-0">
				<slot />
			</p>
		</div>
	</NuxtLink>
</template>
<!-- text-industrial-400 -->
<!-- border-industrial-400 -->
<!-- text-aris-400 -->
<!-- border-aris-400 -->
