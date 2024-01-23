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
  layout: 'ams',
});

useHead({
  title: 'Anteilsrechner',
});
</script>
<template>
  <div>
    <div>
      <h1>COMMING-SOON</h1>
      <NuxtLink to="/ams/toolbox/calculator">Calculator</NuxtLink>
    </div>
  </div>
</template>
