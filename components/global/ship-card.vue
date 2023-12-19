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
  internalBio: {
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
  preloadImages: {
    type: Boolean,
    required: false,
    default: false,
  },
  detailView: {
    type: Boolean,
    required: false,
    default: false,
  },
  hidden: {
    type: Boolean,
    required: false,
    default: false,
  },
});
</script>
<template>
  <Presence exit-before-enter>
    <Motion
      v-if="!hidden"
      :key="shipData.id"
      :initial="{ opacity: 0, y: -15 }"
      :animate="{ opacity: 1, y: 0 }"
      :exit="{ opacity: 0, y: -15 }"
      :transition="{ duration: 0.5 }"
      class="static block px-2 pb-3 basis-full md:basis-1/2 xl:basis-1/3 3xl:basis-1/4"
    >
      <DefaultPanel>
        <div class="relative h-fit">
          <NuxtLink
            :to="'/ShipExkurs/' + shipData.slug"
            class="block relative transition-all duration-500 ease h-[200px] bg-image group peer"
          >
            <NuxtImg :preload="preloadImages" class="absolute object-cover w-full h-full" :src="shipData.storeImage" />
            <div
              v-if="displayProductionState"
              class="absolute top-1 left-2 text-stroke"
              :class="{
                'text-primary-400': shipData.productionState == 'Flugfertig',
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
                :preload="preloadImages"
                class="relative w-16 h-16 peer/departmentLogo text-secondary"
                :src="hangarData.userData.department.logo"
              />
              <span
                class="px-1 my-auto mr-2 transition rounded opacity-0 cursor-pointer h-fit bg-bsecondary peer-hover/departmentLogo:opacity-100"
                >{{ hangarData.userData.department.name }}</span
              >
            </div>
          </NuxtLink>
          <div
            class="peer-hover:[&>a:nth-child(1)]:opacity-100 peer-hover:[&>p:nth-child(1)]:duration-300 absolute z-10 bottom-0 left-0 flex flex-wrap w-full min-h-[48px] px-4 py-1 bg-bsecondary/80 justify-between gap-x-4"
          >
            <NuxtLink
              :to="'/ShipExkurs/' + shipData.slug"
              class="m-0 transition hover:no-underline basis-full opacity-80 text-secondary hover:opacity-100"
            >
              {{ shipData.name }}
              <span v-if="displayName && hangarData.userData.name"> - &quot;{{ hangarData.userData.name }}&quot;</span>
            </NuxtLink>
            <NuxtLink
              :to="'/VerseExkurs/companies/' + shipData.manufacturer.slug"
              class="z-20 min-w-0 min-h-0 mt-auto text-xs text-white opacity-50 w-fit h-fit transition-group hover:no-underline hover:opacity-100"
              >{{ shipData.manufacturer.name }}
            </NuxtLink>
            <NuxtLink
              v-if="displayOwner"
              :to="(internalBio ? '/ams/' : '/') + 'biography/' + hangarData.userData.owner.slug"
              class="z-20 block mt-auto ml-auto text-xs text-white transition opacity-50 hover:no-underline hover:opacity-100"
            >
              <span>
                {{ hangarData.userData.planned ? 'Geplant' : 'Bereitgestell' }} von:
                {{ hangarData.userData.owner.fullName }}</span
              >
            </NuxtLink>
          </div>
        </div>
        <Presence :initial="!detailView" exit-before-enter>
          <Motion
            v-if="detailView"
            :key="shipData.id + '-table'"
            :initial="{ height: 0 }"
            :animate="{ height: '182px' }"
            :exit="{ height: 0 }"
            :transition="{ duration: 0.5 }"
            class="w-full px-1 overflow-hidden ease-in-out transition-default bg-bprimary"
          >
            <div class="grid grid-cols-6 px-4 py-2 uppercase">
              <TableRow title="Klassifizierung" :content="shipData.classification" />
              <TableRow title="Crew" :content="(shipData.minCrew || 'N/A') + ' - ' + (shipData.maxCrew || 'N/A')" />
              <TableRow title="Kaufpreis" :content="shipData.price && shipData.price + ' aUEC'" />
              <TableRow title="Fracht" :content="shipData.cargo" />
              <TableHr />
              <TableRow title="Länge" :content="shipData.length && shipData.length + ' M'" third />
              <TableRow title="Breite" :content="shipData.length && shipData.beam + ' M'" third />
              <TableRow title="Höhe" :content="shipData.length && shipData.height + ' M'" third />
            </div>
          </Motion>
        </Presence>
      </DefaultPanel>
    </Motion>
  </Presence>
</template>

<style scoped lang="postcss">
p {
  @apply p-0;
}
</style>
