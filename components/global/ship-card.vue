<script setup lang="ts">
const removePopover = ref(false);
const emit = defineEmits(['edit', 'removeOpen', 'removeConfirm']);
const props = defineProps({
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
  displayPlannedState: {
    type: Boolean,
    required: false,
    default: false,
  },
  displayCrud: {
    type: Boolean,
    required: false,
    default: false,
  },
  hideEdit: {
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
  displayLoanerState: {
    type: Boolean,
    required: false,
    default: false,
  },
  displayHiddenState: {
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
  color: {
    type: String,
    required: false,
    default: 'primary',
  },
});

const handleEdit = () => {
  const title = `Bearbeiten: ${props.hangarData.userData.name ? props.hangarData.userData.name + ' - ' : ''}${
    props.hangarData.ship.manufacturer.code
  } ${props.hangarData.ship.name}`;

  emit('edit', title, props.hangarData);
};

// border-danger text-danger border-success text-success
</script>
<template>
  <div class="static block px-2 pb-3 basis-full md:basis-1/2 xl:basis-1/3 3xl:basis-1/4">
    <DefaultPanel :color="color">
      <div class="relative h-fit">
        <NuxtLink
          :to="'/shipexkurs/ships/' + shipData.slug"
          class="block relative transition-all duration-500 ease h-[200px] bg-image group peer"
        >
          <NuxtImg
            :src="shipData.store_image"
            :placeholder="[16, 16, 1, 5]"
            :preload="preloadImages"
            height="500"
            class="absolute object-cover w-full h-full"
          />
          <div
            v-if="displayProductionState || displayLoanerState"
            class="absolute top-1 left-2 text-stroke"
            :class="{
              'text-primary-400': shipData.production_status_value == 'flight-ready',
              'text-secondary': shipData.production_status_value == 'in-production',
              'text-white': shipData.production_status_value == 'in-concept',
            }"
          >
            <p v-if="displayProductionState" class="block p-0">{{ shipData.production_status }}</p>
            <p v-if="displayLoanerState && hangarData.loaner" class="block p-0 text-secondary">Loaner</p>
            <p
              v-if="displayHiddenState && hangarData.userData.visibility === 'hidden'"
              class="block p-0 text-secondary"
            >
              Versteckt
            </p>
          </div>
          <div
            v-if="displayDepartment && hangarData.userData.department && hangarData.userData.department.logo"
            class="absolute z-10 flex flex-row-reverse h-16 right-2 top-1"
          >
            <NuxtImg
              :src="hangarData.userData.department.logo"
              :placeholder="[16, 16, 1, 5]"
              :preload="preloadImages"
              class="relative w-16 h-16 peer/departmentLogo text-secondary"
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
          <div
            v-if="displayPlannedState && hangarData.userData.planned"
            class="absolute -top-6 right-2 text-stroke text-secondary"
          >
            Geplant
          </div>
          <NuxtLink
            :to="'/shipexkurs/' + shipData.slug"
            class="m-0 transition hover:no-underline basis-full opacity-80 text-secondary hover:opacity-100"
          >
            {{ shipData.name }}
            <span v-if="displayName && hangarData.userData.name"> - &quot;{{ hangarData.userData.name }}&quot;</span>
          </NuxtLink>
          <NuxtLink
            :to="'/verseexkurs/companies/' + shipData.manufacturer.slug"
            class="z-20 min-w-0 min-h-0 mt-auto text-xs text-white opacity-50 w-fit h-fit transition-group hover:no-underline hover:opacity-100"
            :class="{ 'max-w-[calc(100%_-_60px)]': displayCrud }"
            >{{ shipData.manufacturer.name }}
          </NuxtLink>
          <NuxtLink
            v-if="displayOwner"
            :to="(internalBio ? '/ams/employees/' : '/') + 'biography/' + hangarData.userData.owner.slug"
            class="z-20 block mt-auto ml-auto text-xs text-white transition opacity-50 hover:no-underline hover:opacity-100"
          >
            <span>
              <span :class="{ 'text-secondary': hangarData.userData.planned }">{{
                hangarData.userData.planned ? 'Geplant' : 'Bereitgestell'
              }}</span>
              von: {{ hangarData.userData.owner.full_name }}</span
            >
          </NuxtLink>
          <div v-if="displayCrud" class="absolute z-20 block h-full mt-auto ml-auto right-4">
            <div class="flex h-full pb-1 space-x-4 text-white/50">
              <Icon
                v-if="!hideEdit"
                @click="handleEdit"
                name="heroicons:pencil"
                class="w-5 h-5 my-auto transition cursor-pointer hover:text-primary"
              />
              <UPopover :popper="{ placement: 'top-end' }" v-model:open="removePopover" class="w-5 h-5 my-auto">
                <Icon
                  @click="$emit('removeOpen')"
                  name="heroicons:trash"
                  class="w-full h-full transition cursor-pointer hover:text-danger"
                />
                <template #panel>
                  <div class="p-4 text-xs">
                    <p>Wollen sie das Schiff wirklich entfernen?</p>
                    <div class="flex mx-auto mt-2 gap-x-4 w-fit">
                      <ButtonDefault
                        color="danger"
                        @click="
                          removePopover = false;
                          $emit('removeConfirm', hangarData);
                        "
                      >
                        <div class="flex gap-x-1">
                          <Icon name="heroicons:trash" class="w-4 h-4 my-auto" />
                          <span class="my-auto">Ja</span>
                        </div>
                      </ButtonDefault>
                      <ButtonDefault @click="removePopover = false" color="success">
                        <div class="flex">
                          <span class="my-auto">Nein</span>
                        </div>
                      </ButtonDefault>
                    </div>
                  </div>
                </template>
              </UPopover>
            </div>
          </div>
        </div>
      </div>
      <Transition
        enter-active-class="transition-all duration-500"
        leave-active-class="transition-all duration-500"
        enter-from-class="h-0"
        :enter-to-class="hangarData ? 'h-[212px]' : 'h-[162px]'"
        :leave-from-class="hangarData ? 'h-[212px]' : 'h-[162px]'"
        leave-to-class="h-0"
      >
        <div
          v-if="detailView"
          :key="hangarData ? hangarData.id + '-table' : shipData.id + '-table'"
          class="w-full px-1 ease-in-out overflow-clip transition-default bg-bprimary"
        >
          <div class="grid grid-cols-6 px-4 py-2 text-xs uppercase">
            <TableRow title="Klassifizierung" :content="shipData.classification" />
            <TableRow title="Crew" :content="(shipData.minCrew || 'N/A') + ' - ' + (shipData.maxCrew || 'N/A')" />
            <TableRow title="Kaufpreis" :content="shipData.price && shipData.price + ' aUEC'" />
            <TableRow title="Fracht" :content="shipData.cargo" />
            <TableHr />
            <TableRow title="Länge" :content="shipData.length && shipData.length + ' M'" third />
            <TableRow title="Breite" :content="shipData.beam && shipData.beam + ' M'" third />
            <TableRow title="Höhe" :content="shipData.height && shipData.height + ' M'" third />
            <template v-if="hangarData">
              <TableHr />
              <TableRow title="Aktives Modul" :content="hangarData.userData.module?.name" full-width />
            </template>
          </div>
        </div>
      </Transition>
    </DefaultPanel>
  </div>
</template>

<style scoped lang="postcss">
p {
  @apply p-0;
}
</style>
