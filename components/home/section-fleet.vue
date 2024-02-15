<script setup lang="ts">
const { copy, isSupported: clipboardIsSupported } = useClipboard();
const homepageTabsStore = useHomepageTabsStore();
const config = useRuntimeConfig();
const toast = useToast();
defineProps({
  data: {
    type: null,
    required: true,
  },
});

const handleCopy = () => {
  if (clipboardIsSupported && location?.href) {
    copy(config.public.url + '/?our=1&fleet=' + homepageTabsStore.selectedOurFleetTab + '#fleet');
    toast.add({ title: 'URL in Zwischenablage kopiert!' });
  } else {
    toast.add({ title: 'Es konnte leider nichts in die Zwischenablage kopiert werden.' });
  }
};
</script>
<template>
  <div>
    <div class="text-center">
      <h1 class="text-primary-400">Flotte der ArisCorp</h1>
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
              :placeholder="[16, 16, 1, 5]"
              height="160"
              :class="[selected ? 'scale-150' : 'scale-[1.2]']"
              class="relative w-20 h-auto mx-1 transition-all duration-300 ease-out border-solid cursor-pointer focus-visible:outline-0 border-1 hover:scale-[1.6]"
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
        <HeadlessTabPanel class="px-4">
          <h2 class="relative mx-auto my-4 text-center w-fit text-primary-400 group">
            Alle
            <Icon
              name="ion:ios-copy-outline"
              class="absolute top-0 w-4 h-4 opacity-0 cursor-pointer -right-4 group-hover:opacity-100"
              @click="handleCopy"
            />
          </h2>
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
          <h2 class="relative mx-auto my-4 text-center w-fit text-primary-400 group">
            {{ department.name }}
            <Icon
              name="ion:ios-copy-outline"
              class="absolute top-0 w-4 h-4 opacity-0 cursor-pointer -right-4 group-hover:opacity-100"
              @click="handleCopy"
            />
          </h2>
          <hr />
          <div class="flex flex-wrap">
            <ShipCard
              v-for="ship in data.fleetData.filter((e: IHangarItem) => e.userData.department?.name === department.name)"
              :key="ship.id"
              :ship-data="ship.ship"
              :hangar-data="ship"
              display-owner
              display-department
              :display-name="ship.userData.showName"
            />
            <h3
              v-if="!data.fleetData.filter((e: IHangarItem) => e.userData.department?.name === department.name)[0]"
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
