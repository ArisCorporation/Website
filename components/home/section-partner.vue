<script setup lang="ts">
defineProps({
	data: {
		type: null,
		required: true,
	},
})
</script>

<template>
	<div class="mt-16">
		<div>
			<h1>Partner der <span class="text-primary-400">ArisCorp</span></h1>
			<hr>
			<p class="text-center">
				Die ArisCorp unterhält auch Partnerschaften mit anderen Star Citizen Organisationen. Für nähere Informationen
				klicke gern auf die jeweiligen Logos.
			</p>
			<div class="flex flex-wrap justify-center mt-8">
				<NuxtLink
					v-for="partner in data"
					:key="partner.id"
					:to="partner.website"
					class="items-center m-2 bg-bprimary hover:brightness-85 rounded-xl"
					target="_blank"
				>
					<NuxtImg
						:src="partner.logo"
						:placeholder="[16, 16, 1, 5]"
						:alt="'Logo von dem Partner ' + partner.name"
						class="mx-auto animate-link"
						width="225"
					/>
					<h3 class="text-center uppercase text-industrial-400 animate-link">
						{{ partner.name }}
					</h3>
				</NuxtLink>
			</div>
		</div>
	</div>
</template>
