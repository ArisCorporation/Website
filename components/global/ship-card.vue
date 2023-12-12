<script setup lang="ts">
defineProps({
  shipData: {
    type: Object as PropType<IShip>,
    required: true,
  },
  hangarData: {
    type: Object as PropType<IHangarItem>,
    required: false,
    default: null,
  },
  displayOwner: {
    type: Boolean,
    required: false,
    default: false,
  },
  displayDepartment: {
    type: Boolean,
    required: false,
    default: false,
  },
  displayName: {
    type: Boolean,
    required: false,
    default: false,
  },
  displayProductionState: {
    type: Boolean,
    required: false,
    default: false,
  },
});
</script>
<template>
  <div class="px-2 pb-3 basis-full md:basis-1/2 xl:basis-1/3 3xl:basis-1/4">
    <DefaultPanel>
      <NuxtLink
        :to="'/ShipExkurs/' + shipData.slug"
        class="block relative transition-all duration-500 ease h-[200px] bg-image group"
      >
        <NuxtImg class="absolute object-cover w-full h-full" :src="shipData.storeImage" />
        <div
          v-if="displayProductionState"
          class="absolute top-1 left-2 text-stroke"
          :class="{
            'text-primary': shipData.productionState == 'Flugfertig',
            'text-secondary': shipData.productionState == 'In Produktion',
            'text-white': shipData.productionState == 'Im Konzept',
          }"
        >
          {{ shipData.productionState }}
        </div>
        <div
          v-if="displayDepartment && hangarData.userData.department"
          class="absolute z-10 flex flex-row-reverse h-16 right-2 top-1"
        >
          <NuxtImg
            class="relative w-16 h-16 peer/departmentLogo text-secondary"
            :src="hangarData.userData.department.logo"
          />
          <span
            class="px-1 my-auto mr-2 transition rounded opacity-0 cursor-pointer bg-bsecondary peer-hover/departmentLogo:opacity-100"
            >{{ hangarData.userData.department.name }}</span
          >
        </div>
        <div
          class="absolute z-10 bottom-0 left-0 flex flex-wrap w-full min-h-[48px] px-4 py-1 bg-bsecondary/80 justify-between space-x-4"
        >
          <div>
            <p class="m-0 transition opacity-80 text-secondary group-hover:opacity-100">
              {{ shipData.name }}
              <span v-if="displayName && hangarData.userData.publicName && hangarData.userData.name">
                - &quot;{{ hangarData.userData.name }}&quot;</span
              >
            </p>
            <NuxtLink
              class="z-20 block mt-auto text-xs text-white opacity-50 transition-group hover:no-underline hover:opacity-100"
              :to="'/VerseExkurs/companies/' + shipData.manufacturer.slug"
              >{{ shipData.manufacturer.name }}
            </NuxtLink>
          </div>
          <NuxtLink
            v-if="displayOwner"
            class="z-20 block mt-auto text-xs text-white transition opacity-50 hover:no-underline hover:opacity-100"
            :to="'/biography/' + hangarData.userData.owner.slug"
          >
            <span>Bereitgestell von: {{ hangarData.userData.owner.fullName }}</span>
          </NuxtLink>
        </div>
      </NuxtLink>
    </DefaultPanel>
  </div>
</template>
