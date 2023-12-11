<script setup lang="ts">
const { data } = defineProps({
  data: {
    type: Object as PropType<IPartner[]>,
    required: true,
  },
});
</script>
<template>
  <div class="mt-16">
    <div>
      <h1>Partner der <span class="text-primary">ArisCorp</span></h1>
      <hr />
      <p class="text-center">
        Die ArisCorp unterhält auch Partnerschaften mit anderen Star Citizen Organisationen. Für nähere Informationen
        klicke gern auf die jeweiligen Logos.
      </p>
      <div class="flex flex-wrap justify-center mt-8">
        <NuxtLink
          v-for="partner in data"
          :key="partner.id"
          :to="partner.website"
          class="items-center m-2"
          target="_blank"
        >
          <NuxtImg class="mx-auto" width="225" :src="partner.logo" />
          <h3 class="text-center uppercase text-secondary">{{ partner.name }}</h3>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
