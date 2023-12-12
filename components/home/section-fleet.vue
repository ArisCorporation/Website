<script setup lang="ts">
const homepageTabsStore = useHomepageTabsStore();
const { data } = defineProps({
  data: {
    type: null,
    required: true,
  },
});
</script>
<template>
  <div>
    <div class="text-center">
      <h1 class="text-primary">Flotte der ArisCorp</h1>
      <p>
        Die Flotte der ArisCorp stellt sich aus den Schiffen zusammen, die von Mitarbeiter der ArisCorp zur verfügung
        gestellt werden.
      </p>
    </div>
    <TabGroup :store="homepageTabsStore.selectedOurFleetTab" :change="homepageTabsStore.setOurFleetTab" hide-hr>
      <template #tablist>
        <HeadlessTab v-slot="{ selected }" as="template" class="flex justify-center w-full p-3 my-1 outline-none">
          <div>
            <NuxtImg
              src="a3495a27-dc35-4ba9-a37b-a5752db473ee"
              height="160"
              class="relative w-20 h-auto mx-1 transition-all duration-300 ease-out border-solid cursor-pointer focus-visible:outline-0 border-1 hover:scale-[1.6]"
              :class="[selected ? 'scale-150' : 'scale-[1.2]']"
            />
          </div>
        </HeadlessTab>
        <div class="flex flex-wrap justify-center xl:grid xl:grid-flow-col xl:grid-rows-1">
          <HeadlessTab
            v-for="department in data.departmentData"
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
        <HeadlessTabPanel class="px-4">
          <h2 class="my-4 text-center text-primary">Alle</h2>
          <div class="flex flex-wrap">
            <ShipCard
              v-for="ship in data.fleetData"
              :key="ship.id"
              :ship-data="ship.ship"
              :hangar-data="ship"
              display-owner
              display-department
            />
          </div>
        </HeadlessTabPanel>
        <HeadlessTabPanel v-for="department in data.departmentData" :key="department.id" class="px-4">
          <h2 class="my-4 text-center text-primary">{{ department.name }}</h2>
          <hr />
          <div class="flex flex-wrap">
            <ShipCard
              v-for="ship in data.fleetData.filter((e) => e.userData.department?.name === department.name)"
              :key="ship.id"
              :ship-data="ship.ship"
              :hangar-data="ship"
              display-owner
              display-department
            />
            <h3
              v-if="!data.fleetData.filter((e) => e.userData.department?.name === department.name)[0]"
              class="mx-auto"
            >
              Diese Abteilung hat noch keine zugewiesenen Schiffe.
            </h3>
          </div>
        </HeadlessTabPanel>
        <hr />
      </template>
    </TabGroup>
  </div>
</template>
