<script setup lang="ts">
const { getItemById } = useDirectusItems();
const { params } = useRoute();

const { data } = await useAsyncData(
  'comm-link',
  () =>
    getItemById({
      collection: 'comm_links',
      id: params.id,
      params: {
        fields: [
          'comm_link_titel',
          'comm_link_banner.id',
          'comm_link',
          'date_created',
          'comm_link_author.firstname',
          'comm_link_author.lastname',
          'comm_link_author.title',
          'comm_link_author.member_potrait.id',
          'comm_link_author.slug',
        ],
      },
    }),
  {
    transform: (data) => transformCommLink(data),
  },
);

console.log(data.value);
</script>

<template>
  <div>
    <div>
      <h1 class="text-center">
        Comm-Link Übertragung:
        <span class="text-primary"> {{ data?.title }}</span>
      </h1>
      <DefaultPanel>
        <NuxtImg class="object-cover w-full mx-auto max-h-96" :src="data?.storeImage" />
      </DefaultPanel>
      <hr class="hr-short" />
      <div class="flex justify-between">
        <div
          class="relative flex max-w-full pr-4 w-fit sm:max-w-1/2 after:w-full after:h-2px after:bg-secondary after:absolute after:-bottom-2"
        >
          <NuxtImg :src="data?.author?.potrait" class="w-auto h-20 aspect-potrait sm:h-32" />
          <p class="mt-auto ml-2 italic uppercase">
            <span class="text-secondary">Author: </span
            ><NuxtLink class="text-tbase" :to="'/biography/' + data?.author?.slug">{{
              data?.author?.fullName
            }}</NuxtLink>
          </p>
        </div>
        <div
          class="relative flex max-w-full pl-2 w-fit sm:max-w-1/4 after:w-full after:h-2px after:bg-secondary after:absolute after:-bottom-2"
        >
          <p class="mt-auto ml-2 italic uppercase">
            <span class="text-secondary">Gepostet: </span>{{ $dayjs(data?.datePosted).format('DD. MMMM YYYY') }}
          </p>
        </div>
      </div>
    </div>
    <div v-html="data?.content" />
  </div>
</template>
