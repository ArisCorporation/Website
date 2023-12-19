<script setup lang="ts">
const { getSingletonItem } = useDirectusItems();
const VeTabs = useVeTabs();

const { data } = await useAsyncData(
  'getUEE',
  () =>
    getSingletonItem({
      collection: 'united_empire_of_earth',
      params: {
        fields: ['title', 'image.id', 'text', 'sections', 'feiertage'],
      },
    }),
  {
    transform: (data) => ({
      title: data.title,
      banner: data.image?.id,
      content: data.text,
      tablist: data.sections.map((obj) => ({
        header: obj.title,
        content: obj.content,
      })),
      holidayTablist: data.feiertage.map((obj) => ({
        header: obj.name,
        date: obj.datum,
        content: obj.beschreibung,
      })),
      sections: data.sections,
      holidays: data.feiertage,
    }),
  },
);

definePageMeta({
  layout: 'verse-exkurs',
});
</script>

<template>
  <div>
    <div>
      <h1>{{ data?.title }}</h1>
      <hr />
      <NuxtImg :src="data?.banner" class="mx-auto" />
    </div>
    <div>
      <h2>VersExkurs: United Empire of Earth</h2>
      <hr class="hr-short" />
      <div v-html="data?.content" />
      <TabGroup :tablist="data?.tablist" small-header :store="VeTabs.selectedUeeTab" :change="VeTabs.setUeeTab">
        <template #tabcontent>
          <div>
            <div
              v-if="data?.tablist[VeTabs.selectedUeeTab].header !== 'Feiertage & Events'"
              v-html="data?.tablist[VeTabs.selectedUeeTab]?.content"
            />
            <div v-else>
              <TabGroupVertical
                :tablist="data?.holidayTablist"
                :store="VeTabs.selectedUeeHolidayTab"
                :change="VeTabs.setUeeHolidayTab"
              />
            </div>
          </div>
        </template>
      </TabGroup>
    </div>
  </div>
</template>
