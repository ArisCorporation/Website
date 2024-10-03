<script setup lang="ts">
// https://regolith.rocks/workorder
const tabs = [
  { id: 0, header: 'Schiffs Bergbau', icon: 'game-icons:rock' },
  { id: 1, header: 'ROC/Hand Bergbau', icon: 'game-icons:diamond-hard' },
  { id: 2, header: 'Schrott Sammlung', icon: 'game-icons:ship-wreck' },
  { id: 3, header: 'aUEC Rechner', icon: 'mdi:square-inc-cash' },
];
const selectedTab = ref(0);
const changeTab = (index) => {
  selectedTab.value = index;
};

definePageMeta({
  middleware: 'auth',
  layout: false,
});

useHead({
  title: 'Anteilsrechner',
});
</script>

<template>
  <NuxtLayout name="ams">
    <div>
      <TabGroup :tablist="tabs" :store="selectedTab" :change="changeTab">
        <template #tablist>
          <div class="grid grid-cols-4 mx-auto w-fit">
            <button
              v-for="tab in tabs"
              @click="changeTab(tab.id)"
              class="w-32 h-32 transition border first:rounded-l last:rounded-r !outline-none"
              :class="[
                selectedTab === tab.id
                  ? 'shadow-[0_0px_30px_5px_rgba(228,134,50,0.3)] hover:shadow-[0_0px_50px_5px_rgba(228,134,50,0.3)] z-10 border-industrial-400 bg-industrial-400/50 hover:bg-industrial-400/25'
                  : 'border-btertiary hover:bg-bsecondary/75',
              ]"
            >
              <div
                class="flex flex-col m-auto text-white transition gap-y-4 w-fit h-fit"
                :class="{ 'opacity-50': selectedTab !== tab.id }"
              >
                <Icon :name="tab.icon" class="block w-12 h-12 mx-auto" />
                <p class="p-0 text-sm h-fit">{{ tab.header }}</p>
              </div>
            </button>
          </div>
        </template>
        <template #tabcontent>
          <template v-if="selectedTab === 0">
            <h2 class="m-0 text-center">Schiffs Bergbau</h2>
            <h3 class="italic text-center text-tbase/75">COMMING-SOON</h3>
          </template>
          <template v-if="selectedTab === 1">
            <h2 class="m-0 text-center">ROC/Hand Bergbau</h2>
            <h3 class="italic text-center text-tbase/75">COMMING-SOON</h3>
          </template>
          <template v-if="selectedTab === 2">
            <h2 class="m-0 text-center">Schrott Sammlung</h2>
            <div class="grid grid-cols-3 px-6 gap-x-4">
              <UCard>
                <template #header>
                  <p class="p-0 text-xl text-center">Einstellungen</p>
                </template>
              </UCard>
              <UCard>
                <template #header>
                  <p class="p-0 text-xl text-center">Materialien</p>
                </template>
              </UCard>
              <UCard>
                <template #header>
                  <p class="p-0 text-xl text-center">Verteilung</p>
                </template>
              </UCard>
            </div>
          </template>
          <template v-if="selectedTab === 3">
            <h2 class="m-0 text-center">aUEC Rechner</h2>
            <h3 class="italic text-center text-tbase/75">COMMING-SOON</h3>
          </template>
        </template>
      </TabGroup>
    </div>
  </NuxtLayout>
</template>
