<script setup lang="ts">
const { readSingleton } = useDirectusItems();
const VeTabs = useVeTabsStore();

const dataRes = await readSingleton('uee', {
  fields: ['banner', 'content', 'tabs', 'holidays'],
});
const data = computed(() => ({
  banner: dataRes.banner,
  content: dataRes.content,
  tablist: dataRes.tabs.map((obj: any) => ({
    header: obj.title,
    content: obj.content,
  })),
  holidayTablist: dataRes.holidays.map((obj: any) => ({
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
  <VerseExkursBaseArticle>
    <template #title>
      Alles über das <span class="text-aris-400">United Empire of Earth</span>
      <NuxtImg :src="data?.banner" :placeholder="[16, 16, 1, 5]" class="mx-auto" />
    </template>
    <Editor :model-value="data?.content" read-only />
    <TabGroup :tablist="data?.tablist" small-header :store="VeTabs.selectedUeeTab" :change="VeTabs.setUeeTab">
      <template #tabcontent>
        <div>
          <Editor
            v-if="data?.tablist[VeTabs.selectedUeeTab].header !== 'Feiertage & Events'"
            :model-value="data?.tablist[VeTabs.selectedUeeTab]?.content"
            read-only
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
  </VerseExkursBaseArticle>
</template>
