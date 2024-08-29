<script setup lang="ts">
const { directus, readItem } = useCMS();
const { params } = useRoute();

const { data } = await useAsyncData(
  'COMM-LINKS_TRANSMISSION:' + params.id,
  () =>
    directus.request(
      readItem('comm_links', params.id, {
        fields: [
          'id',
          'title',
          'banner',
          'content',
          'date_created',
          'user_created.first_name',
          'user_created.last_name',
          'user_created.title',
          'user_created.avatar',
          'user_created.slug',
        ],
      }),
    ),
  {
    transform: (rawCommLink: any) => transformCommLink(rawCommLink),
  },
);

if (!data.value) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Die Übertragung konnte nicht vollständig empfangen werden!',
    fatal: true,
  });
}

definePageMeta({
  layout: 'default',
});
useHead({
  title: 'Comm-Link Übertragung: ' + data.value?.title,
});
</script>

<template>
  <div>
    <div class="mb-3">
      <h1 class="text-center">
        Comm-Link Übertragung:
        <span class="text-primary"> {{ data?.title }} </span>
      </h1>
      <DefaultPanel>
        <NuxtImg :src="data?.banner" :placeholder="[16, 16, 1, 5]" class="object-cover w-full mx-auto max-h-96" />
      </DefaultPanel>
      <hr class="mb-2 hr-short" >
      <div class="flex flex-wrap justify-between space-y-4">
        <div
          class="relative flex max-w-full pr-4 w-fit sm:max-w-1/2 after:w-full after:h-2px after:bg-secondary after:absolute after:-bottom-2"
        >
          <NuxtImg
            :src="data?.author?.avatar"
            :placeholder="[16, 16, 1, 5]"
            class="w-auto h-20 aspect-potrait sm:h-32"
          />
          <p class="mt-auto ml-2 italic uppercase">
            <span class="text-secondary">Author: </span
            ><NuxtLink class="text-tbase" :to="'/biography/' + data?.author?.slug">{{
              data?.author?.full_name
            }}</NuxtLink>
          </p>
        </div>
        <div
          class="relative flex max-w-full pl-2 mt-4 ml-auto w-fit sm:max-w-1/4 after:w-full after:h-2px after:bg-secondary after:absolute after:-bottom-2"
        >
          <p class="mt-auto ml-2 italic uppercase">
            <!-- :TEMP:DAYJS: -->
            <!-- <span class="text-secondary">Gepostet: </span>{{ $dayjs(data?.date_posted).format('DD. MMMM YYYY') }} -->
          </p>
        </div>
      </div>
    </div>
    <Editor v-model="data.content" read-only />
  </div>
</template>
