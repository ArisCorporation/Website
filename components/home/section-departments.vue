<script setup>
const homepageTabsStore = useHomepageTabsStore();
defineProps({
  data: {
    type: Array,
    required: true,
  },
});
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
          class="p-3 m-1 outline-none"
        >
          <div>
            <NuxtImg
              :src="department.logo"
              height="160"
              class="relative w-20 h-auto mx-1 transition-all duration-300 ease-out border-solid cursor-pointer focus-visible:outline-0 border-1 hover:scale-150"
              :class="{ 'scale-125': selected }"
            />
          </div>
        </HeadlessTab>
      </div>
    </template>
    <template #tabcontent>
      <HeadlessTabPanel v-for="department in data" :key="department.name" class="px-4">
        <h2 class="text-center text-primary-400">{{ department.name }}</h2>
        <div class="flex flex-wrap justify-center max-w-full mx-auto mt-4">
          <div class="py-3 md:px-3 basis-full md:max-w-xl md:basis-1/2">
            <DefaultPanel>
              <NuxtImg :src="department.pic1" class="w-full" />
            </DefaultPanel>
          </div>
          <div class="py-3 md:px-3 basis-full md:max-w-xl md:basis-1/2">
            <DefaultPanel>
              <NuxtImg :src="department.pic2" class="w-full" />
            </DefaultPanel>
          </div>
        </div>
        <div class="mt-4 text-center" v-html="department.text" />
        <hr />
        <div class="justify-between w-full lg:flex">
          <div class="flex mb-4 lg:mb-0">
            <DefaultPanel>
              <div v-if="!department.head_of_department" class="absolute flex w-full h-full text-secondary">
                <span class="m-auto text-center">Diese Abteilungen hat noch keinen Abteilungsleiter gefunden</span>
              </div>
              <NuxtImg
                :src="department.head_of_department?.potrait || '0b7eafde-0933-4d1a-a32f-b4f8dd5bb492'"
                width="200"
                class="aspect-potrait"
              />
            </DefaultPanel>
            <div class="ml-4">
              <h2>Abteilungsleiter:</h2>
              <h3 class="text-primary-400">{{ department.head_of_department?.fullName || 'N/A' }}</h3>
            </div>
          </div>
          <div class="w-full text-center lg:w-1/2 2xl:w-1/3">
            <h2 class="text-left lg:text-center">Abteilungsmitarbeiter:</h2>
            <ul class="flex flex-wrap justify-between list-disc list-inside">
              <li
                v-for="employee in department.employees"
                :key="employee.id"
                :class="[department.employees.length > 1 ? 'basis-1/2' : 'basis-full']"
              >
                {{ employee.fullName }}
              </li>
            </ul>
          </div>
        </div>
      </HeadlessTabPanel>
    </template>
  </TabGroup>
</template>
