<script setup lang="ts">
const { readSingleton } = useDirectusItems();
const VeTabs = useVeTabsStore();

const dataRes = await readSingleton('uee', {
  fields: ['banner', 'content', 'tabs', 'holidays'],
});
const data = computed(() => ({
  banner: dataRes.banner,
  content: dataRes.content,
  tablist: dataRes.tabs.map((obj) => ({
    header: obj.title,
    content: obj.content,
  })),
  holidayTablist: dataRes.holidays.map((obj) => ({
    header: obj.name,
    date: obj.date,
    content: obj.content,
  })),
  sections: dataRes.tabs,
  holidays: data.holidays,
}));

if (!data) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Die Übertragung konnte nicht vollständig empfangen werden!',
    fatal: true,
  });
}

useHead({
  title: 'UEE',
});
definePageMeta({
  layout: 'verse-exkurs',
});
</script>

<template>
  <VeBaseArticle>
    <template #title>
      Alles über das <span class="text-aris-400">United Empire of Earth</span>
      <NuxtImg :src="data?.banner" :placeholder="[16, 16, 1, 5]" class="mx-auto" />
    </template>
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
  </VeBaseArticle>
</template>
