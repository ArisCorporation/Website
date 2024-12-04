<script setup lang="ts">
useHead({
  title: 'Alienrassen',
});
definePageMeta({
  layout: 'verse-exkurs',
});
</script>

<template>
  <div class="grid grid-cols-2 px-6 mt-4 2xl:px-10 overflow-x-clip gap-x-4 gap-y-2 md:grid-cols-4">
    <NuxtLink to="/verseexkurs/aliens/banu" class="alien-item group">
      <DefaultPanel>
        <NuxtImg
          src="5c801a7b-89b5-481d-bce9-623b869c83ae"
          :placeholder="[16, 16, 1, 5]"
          class="object-cover object-top w-full h-fit aspect-potrait"
        />
      </DefaultPanel>
      <h1>Banu</h1>
    </NuxtLink>
    <NuxtLink to="/verseexkurs/aliens/tevarin" class="alien-item group">
      <DefaultPanel>
        <NuxtImg
          src="90e34d34-7b8a-4f74-90aa-62f6e220ed65"
          :placeholder="[16, 16, 1, 5]"
          class="object-cover object-top w-full h-fit aspect-potrait"
        />
      </DefaultPanel>
      <h1>Tevarin</h1>
    </NuxtLink>
    <NuxtLink to="/verseexkurs/aliens/vanduul" class="alien-item group">
      <DefaultPanel>
        <NuxtImg
          src="137383b7-5c18-4247-8b10-a575bce24cd5"
          :placeholder="[16, 16, 1, 5]"
          class="object-cover object-top w-full h-fit aspect-potrait"
        />
      </DefaultPanel>
      <h1>Vanduul</h1>
    </NuxtLink>
    <NuxtLink to="/verseexkurs/aliens/xian" class="alien-item group">
      <DefaultPanel>
        <NuxtImg
          src="58708a2f-ac13-438c-8df0-dc84dc628ce9"
          :placeholder="[16, 16, 1, 5]"
          class="object-cover object-top w-full h-fit aspect-potrait"
        />
      </DefaultPanel>
      <h1>Xi'An</h1>
    </NuxtLink>
    <NuxtLink to="/verseexkurs/aliens/fauna" class="col-span-full alien-item group">
      <DefaultPanel>
        <NuxtImg src="a1f0653a-65a2-45c6-964f-9c5b9cb3d4f0" :placeholder="[16, 16, 1, 5]" class="object-cover" />
      </DefaultPanel>
      <h1>Fauna</h1>
    </NuxtLink>
    <NuxtLink to="/verseexkurs/aliens/flora" class="col-span-full alien-item group">
      <DefaultPanel>
        <NuxtImg src="15c5cc03-b23d-4b73-ad27-d4e0b2eb9837" :placeholder="[16, 16, 1, 5]" class="object-cover" />
      </DefaultPanel>
      <h1>Flora</h1>
    </NuxtLink>
  </div>
</template>

<style scoped lang="postcss">
a {
  @apply hover:no-underline;
}

h1 {
  @apply text-center text-aris-400 transition-group group-hover:scale-110;
}

.alien-item {
  @apply transition hover:scale-105 active:scale-95;
}
</style>
