<script setup lang="ts">
const homepageTabsStore = useHomepageTabsStore();
const props = defineProps({
  data: {
    type: Array<any>,
    required: true,
  },
});

console.log(props.data);
</script>
<template>
  <TabGroup
    no-margin
    :store="homepageTabsStore.selectedOurDepartmentTab"
    :change="homepageTabsStore.setOurDepartmentTab"
    hide-hr
  >
    <template #tablist>
      <div class="flex flex-wrap justify-center xl:grid xl:grid-flow-col xl:grid-rows-1">
        <HeadlessTab
          v-for="department in data"
          :key="department.id"
          v-slot="{ selected }"
          as="template"
          class="p-3 m-1 outline-none animate-link"
        >
          <div>
            <NuxtImg
              :src="department.logo"
              :placeholder="[16, 16, 1, 5]"
              height="160"
              :class="{ 'scale-125': selected }"
              class="relative w-20 h-auto mx-1 transition-all duration-300 ease-out border-solid cursor-pointer focus-visible:outline-0 border-1 hover:scale-150"
            />
          </div>
        </HeadlessTab>
      </div>
    </template>
    <template #tabcontent>
      <HeadlessTabPanel v-for="department in data" :key="department.name" class="px-10">
        <h1 class="text-center text-primary-400">{{ department.name }} Department</h1>
        <div class="flex gap-x-6">
          <div class="w-1/2">
            <DefaultPanel>
              <NuxtImg
                :src="department.store_image"
                :placeholder="[16, 16, 1, 5]"
                class="w-full aspect-[16/9] object-cover"
              />
            </DefaultPanel>
          </div>
          <div class="w-1/2">
            <div class="w-2/3 mx-auto">
              <DefaultPanel>
                <NuxtImg
                  :src="department.gallery[0]"
                  :placeholder="[16, 16, 1, 5]"
                  class="w-full aspect-[21/9] object-cover"
                />
              </DefaultPanel>
            </div>
            <Editor :model-value="department.description" read-only />
          </div>
        </div>
        <TableHr />
        <div class="flex gap-x-6">
          <div class="flex w-1/2 mb-4 lg:mb-0">
            <DefaultPanel>
              <div v-if="!department.head_of_department" class="absolute flex w-full h-full text-secondary">
                <span class="m-auto text-center">Diese Abteilungen hat noch keinen Abteilungsleiter gefunden</span>
              </div>
              <NuxtImg
                :src="department.head_of_department?.avatar || 'c46969b5-8414-49cd-ab90-cb71dd2a3e57'"
                :placeholder="[16, 16, 1, 5]"
                width="200"
                class="aspect-potrait"
              />
            </DefaultPanel>
            <div class="ml-4">
              <h2>Abteilungsleiter:</h2>
              <h3 class="text-primary-400">{{ department.head_of_department?.full_name || 'N/A' }}</h3>
            </div>
          </div>
          <div class="w-1/2 mx-auto text-center 2xl:w-1/3">
            <h2 class="text-left lg:text-center">Abteilungsmitarbeiter:</h2>
            <ul class="flex flex-wrap justify-between list-disc list-inside">
              <li
                v-for="employee in department.employees"
                :key="employee.id"
                :class="[department.employees.length > 1 ? 'basis-1/2' : 'basis-full']"
              >
                {{ employee.full_name }}
              </li>
            </ul>
          </div>
        </div>
        <!-- <div class="flex flex-wrap justify-center max-w-full mx-auto mt-4">
          <div class="py-3 md:px-3 basis-full md:max-w-xl md:basis-1/2">
            <DefaultPanel>
              <NuxtImg
                :src="department.gallery[0] || department.logo"
                :placeholder="[16, 16, 1, 5]"
                class="w-full aspect-[21/9]"
                :class="department.gallery[0] ? 'object-cover' : 'object-contain'"
              />
            </DefaultPanel>
          </div>
          <div class="py-3 md:px-3 basis-full md:max-w-xl md:basis-1/2">
            <DefaultPanel>
              <NuxtImg
                :src="department.gallery[1] || department.logo"
                :placeholder="[16, 16, 1, 5]"
                class="w-full aspect-[21/9]"
                :class="department.gallery[1] ? 'object-cover' : 'object-contain'"
              />
            </DefaultPanel>
          </div>
        </div> -->
      </HeadlessTabPanel>
    </template>
  </TabGroup>
</template>
