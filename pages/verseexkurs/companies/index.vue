<script setup lang="ts">
const { directus, readItems } = useCMS();
const selectedMainTab = ref(0);
const selectedSubTab = ref(0);

const {data: categories} = await useAsyncData('COMPANIES:CATEGORIES', () =>
  directus.request(
    readItems('company_categories', {
      fields: ['name', 'sub_categories.name', 'sub_categories.sub_categories.name'],
      filter: { superior_category: { _null: true } },
      sort: ['sort'],
    }),
  ),
);

const {data: companies} = await useAsyncData('COMPANIES', () =>
  directus.request(
    readItems('companies', {
      fields: ['name', 'slug', 'logo', 'category.name'],
      filter: { status: { _eq: 'published' } },
      sort: ['name'],
      limit: -1,
    }),
  ),
);

if (!categories.value || !companies.value) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Die Übertragung konnte nicht vollständig empfangen werden!',
    fatal: true,
  });
}

const mainCategory = computed(() => categories.value[selectedMainTab.value]);
const subCategories = computed(() => categories.value[selectedMainTab.value].sub_categories);
const subSubCategories = computed(
  () => categories.value[selectedMainTab.value].sub_categories[selectedSubTab.value].sub_categories,
);

const subTabs = computed(() =>
  categories.value[selectedMainTab.value].sub_categories.map((obj) => ({
    header: obj.name,
  })),
);

const changeMainTab = async (index: number) => {
  selectedSubTab.value = 0;
  selectedMainTab.value = index;
};

useHead({
  title: 'Firmen',
});
definePageMeta({
  layout: 'verse-exkurs',
});
</script>

<template>
  <div>
    <TabGroup
      :tablist="
        categories.map((obj) => ({
          header: obj.name,
        }))
      "
      between
      :store="selectedMainTab"
      :change="changeMainTab"
    >
      <template #tabcontent>
        <TabGroup
          v-if="subCategories[0]"
          :tablist="subTabs"
          hide-hr
          small-header
          between
          no-margin
          :store="selectedSubTab"
          :change="(index: number) => (selectedSubTab = index)"
        >
          <template #tabcontent>
            <div v-for="category in subSubCategories" v-if="subSubCategories[0]" :key="category.name">
              <TableHr
                v-if="
                  companies.filter(
                    (obj: any) => obj.category.name === subSubCategories.find((obj) => obj.name === category.name).name,
                  )[0]
                "
              >
                {{ category.name }}
              </TableHr>
              <div class="company-grid">
                <NuxtLink
                  v-for="company in companies
                    .filter(
                      (obj: any) =>
                        obj.category.name === subSubCategories.find((obj) => obj.name === category.name).name,
                    )
                    .sort((a, b) => a.name.localeCompare(b.name))"
                  :key="company.slug"
                  :to="'/verseexkurs/companies/' + company.slug"
                  class="w-full h-full transition opacity-50 hover:opacity-100 animate-link"
                >
                  <ImageHoverEffect :src="company.logo" :alt="'Logo von ' + company.name" class="w-full h-full" />
                </NuxtLink>
              </div>
            </div>
            <div v-else class="company-grid">
              <NuxtLink
                v-for="company in companies
                  .filter((obj: any) => obj.category.name === subCategories[selectedSubTab].name)
                  .sort((a, b) => a.name.localeCompare(b.name))"
                :key="company.slug"
                :to="'/verseexkurs/companies/' + company.slug"
                class="w-full h-full transition opacity-50 hover:opacity-100 animate-link"
              >
                <ImageHoverEffect :src="company.logo" :alt="'Logo von ' + company.name" class="w-full h-full" />
              </NuxtLink>
            </div>
          </template>
        </TabGroup>
        <template v-else>
          <div class="company-grid">
            <NuxtLink
              v-for="company in companies
                .filter((obj: any) => obj.category.name === mainCategory.name)
                .sort((a, b) => a.name.localeCompare(b.name))"
              :key="company.slug"
              :to="'/verseexkurs/companies/' + company.slug"
              class="w-full h-full transition opacity-50 hover:opacity-100 animate-link"
            >
              <ImageHoverEffect :src="company.logo" :alt="'Logo von ' + company.name" class="w-full h-full" />
            </NuxtLink>
          </div>
        </template>
      </template>
    </TabGroup>
  </div>
</template>

<style scoped lang="postcss">
.company-grid {
  @apply grid w-full grid-cols-4 gap-8;
}
</style>
