<script setup lang="ts">
const { directus, readItems } = useCMS();
const selectedMainTab = ref(0);
const selectedSubTab = ref(0);

const { data: categories } = await useAsyncData('FRACTIONS:CATEGORIES', () =>
  directus.request(
    readItems('fraction_categories', {
      fields: ['name', 'sub_categories.name', 'sub_categories.sub_categories.name'],
      filter: { superior_category: { _null: true } },
      sort: ['sort'],
    }),
  ),
);

const { data: fractions } = await useAsyncData('FRACTIONS', () =>
  directus.request(
    readItems('fractions', {
      fields: ['name', 'slug', 'logo', 'category.name'],
      filter: { status: { _eq: 'published' } },
      sort: ['name'],
      limit: -1,
    }),
  ),
);

if (!categories.value || !fractions.value) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Die Übertragung konnte nicht vollständig empfangen werden!',
    fatal: true,
  });
}

const mainCategory = computed(() => categories[selectedMainTab.value]);
const subCategories = computed(() => categories[selectedMainTab.value].sub_categories);
const subSubCategories = computed(
  () => categories[selectedMainTab.value].sub_categories[selectedSubTab.value].sub_categories,
);

const subTabs = computed(() =>
  categories[selectedMainTab.value].sub_categories.map((obj) => ({
    header: obj.name,
  })),
);

const changeMainTab = async (index: number) => {
  selectedSubTab.value = 0;
  selectedMainTab.value = index;
};

useHead({
  title: 'Fraktionen',
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
									fractions.filter(
										(obj: any) => obj.category.name === subSubCategories.find((obj) => obj.name === category.name).name,
									)[0]
								"
              >
                {{ category.name }}
              </TableHr>
              <div class="fraction-grid">
                <NuxtLink
                  v-for="fraction in fractions
										.filter(
											(obj: any) =>
												obj.category.name === subSubCategories.find((obj) => obj.name === category.name).name,
										)
										.sort((a, b) => a.name.localeCompare(b.name))"
                  :key="fraction.slug"
                  :to="'/verseexkurs/fractions/' + fraction.slug"
                  class="w-full h-full transition opacity-50 hover:opacity-100 animate-link"
                >
                  <ImageHoverEffect :src="fraction.logo" class="w-full h-full" />
                </NuxtLink>
              </div>
            </div>
            <div v-else class="fraction-grid">
              <NuxtLink
                v-for="fraction in fractions
									.filter((obj: any) => obj.category.name === subCategories[selectedSubTab].name)
									.sort((a, b) => a.name.localeCompare(b.name))"
                :key="fraction.slug"
                :to="'/verseexkurs/fractions/' + fraction.slug"
                class="w-full h-full transition opacity-50 hover:opacity-100 animate-link"
              >
                <ImageHoverEffect :src="fraction.logo" class="w-full h-full" />
              </NuxtLink>
            </div>
          </template>
        </TabGroup>
        <template v-else>
          <div class="fraction-grid">
            <NuxtLink
              v-for="fraction in fractions
								.filter((obj: any) => obj.category.name === mainCategory.name)
								.sort((a, b) => a.name.localeCompare(b.name))"
              :key="fraction.slug"
              :to="'/verseexkurs/fractions/' + fraction.slug"
              class="w-full h-full transition opacity-50 hover:opacity-100 animate-link"
            >
              <ImageHoverEffect :src="fraction.logo" class="w-full h-full" />
            </NuxtLink>
          </div>
        </template>
      </template>
    </TabGroup>
  </div>
</template>

<style scoped lang="postcss">
.fraction-grid {
  @apply grid w-full grid-cols-4 gap-8;
}
</style>
