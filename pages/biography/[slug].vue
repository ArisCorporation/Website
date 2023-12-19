<script setup lang="ts">
const { getItems } = useDirectusItems();
const { params } = useRoute();
const { copy, isSupported: clipboardIsSupported } = useClipboard();
const toast = useToast();
const homepageTabsStore = useHomepageTabsStore();

const { data } = await useAsyncData(
  'member',
  () =>
    getItems({
      collection: 'member',
      params: {
        fields: [
          'firstname',
          'lastname',
          'title',
          'member_potrait.id',
          'roles',
          'position_level',
          'head_of_department',
          'head_department',
          'department',
          'sex',
          'birthdate',
          'birthPlace',
          'birthSystem.name',
          'birthSystem.slug',
          'currentResidence',
          'currentResidenceSystem.name',
          'currentResidenceSystem.slug',
          'ueeState',
          'citizenReason',
          'dutyPeriod',
          'dutyReason',
          'dutyInfo',
          'educationName',
          'educationPeriod',
          'educationPlace',
          'hairColor',
          'eyeColor',
          'height',
          'weight',
          'hobbys',
          'habits',
          'talents',
          'tics',
          'activities',
          'mysteriousThings',
          'characterTrait',
          'fears',
          'books',
          'music',
          'movies',
          'colors',
          'clothing',
          'food',
          'drink',
          'alcohol',
          'loves',
          'hates',
          'text',
          'biography',
          'department.gameplay_name',
          'head_department.gameplay_name',
          'ships.id',
          'ships.department.gameplay_name',
          'ships.department.gameplay_logo.id',
          'ships.ships_id.name',
          'ships.ships_id.slug',
          'ships.ships_id.storeImage.id',
          'ships.ships_id.manufacturer.firmen_name',
          'ships.ships_id.manufacturer.slug',
        ],
        filter: {
          slug: { _eq: params.slug },
        },
      },
    }),
  {
    transform: (data) => transformMember(data[0]),
  },
);

if (!data.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Daten konnten nicht von der UEE empfangen werden, eventuell sind sie unter Verschluss!',
    fatal: true,
  });
}

const handleShare = () => {
  if (clipboardIsSupported && location?.href) {
    copy(location.href);
    toast.add({ title: 'URL in Zwischenablage kopiert!' });
  } else {
    toast.add({ title: 'Es konnte leider nichts in die Zwischenablage kopiert werden.' });
  }
};
const handleDepartmentLink = () => {
  homepageTabsStore.setOurTab(2);
  homepageTabsStore.setOurDepartmentTab(data.value?.department.tabId);
};

definePageMeta({
  layout: 'default',
});
useHead({
  title: data.value?.fullName,
});
</script>

<template>
  <div>
    <div class="flex justify-between">
      <div>
        <h1 class="mb-auto italic text-white">{{ data?.fullName }}</h1>
        <p v-if="data?.roles[0]" class="text-white uppercase">
          <span class="text-btertiary">Rollen:</span> {{ data?.roles.join(', ') }}
        </p>
      </div>
      <NuxtLink class="mt-auto w-fit h-fit" to="/VerseExkurs/companies/ariscorp">
        <Icon name="IconsLogosAriscorp" class="w-24 h-fit" />
      </NuxtLink>
    </div>
    <hr class="mt-0" />
    <div class="grid xl:grid-cols-3 gap-y-4 gap-x-2">
      <div class="space-y-4 uppercase xl:col-span-1">
        <DefaultPanel>
          <NuxtImg class="max-h-96 aspect-potrait object-cover w-full xl:h-[498px] xl:max-h-fit" :src="data?.potrait" />
        </DefaultPanel>
        <ButtonDefault class="w-full" @click="handleShare">
          <Icon name="material-symbols:ios-share-rounded" />
        </ButtonDefault>
        <TableParent title="ArisCorp">
          <TableRow
            v-if="data?.head_of_department"
            title="Abteilungsleiter in folgender Abteilung"
            :content="data?.department.name"
            full-width
            link="/#our"
            @click="handleDepartmentLink"
          />
          <TableRow
            v-else-if="data?.department"
            title="Arbeitet in folgender Abteilung"
            :content="data?.department.name"
            full-width
            link="/#our"
            @click="handleDepartmentLink"
          />
          <TableRow title="Position" :content="data?.position" full-width />
          <TableRow title="Rollen innerhalb der ArisCorp" :content="data?.roles.join(', ')" full-width />
        </TableParent>
      </div>
      <div class="space-y-4 uppercase xl:col-span-2">
        <TableParent title="Basis">
          <TableRow title="Bürgerlicher Name" :content="data?.fullName" full-width />
          <TableHr />
          <TableRow title="Geburtsdatum" :content="data?.birthdate" />
          <TableRow
            title="Alter"
            :content="data?.birthdate ? $dayjs().add(930, 'years').to(data?.birthdate, true) : null"
          />
          <TableRow title="Geburtsort" :content="data?.birthplace" />
          <TableRow
            title="Geburtssystem"
            :content="data?.birthsystem?.name"
            :link="'/VerseExkurs/systems/' + data?.birthsystem?.slug"
          />
          <TableRow title="Aktueller Wohnort" :content="data?.currentplace" />
          <TableRow
            title="Geburtssystem"
            :content="data?.currentsystem?.name"
            :link="'/VerseExkurs/systems/' + data?.currentsystem?.slug"
          />
          <TableHr />
          <TableRow title="Körpergrösse" :content="data?.height ? data?.height + ' cm' : null" />
          <TableRow title="Körpergewicht" :content="data?.weight ? data?.weight + ' kg' : null" />
          <TableRow title="Haarfarbe" :content="data?.haircolor" />
          <TableRow title="Augenfarbe" :content="data?.eyecolor" />
          <TableHr />
          <TableRow title="Bürgerstatus" :content="data?.ueestate" />
          <TableRow
            title="Bürgerschaftsverdienst"
            :content="data?.ueestate?.toLowerCase() === 'citizen' ? data?.citizenreason : null"
          />
          <template
            v-if="data?.ueestate?.toLowerCase() === 'citizen' && data?.citizenreason?.toLowerCase() === 'militärdienst'"
          >
            <TableRow title="Dienstzeit" :content="data?.duty.dutyperiod" />
            <TableRow title="Dienstende" :content="data?.duty.dutyreason" />
          </template>
          <template
            v-if="
              data?.ueestate?.toLowerCase() === 'citizen' && data?.citizenreason?.toLowerCase() === 'besondere bildung'
            "
          >
            <TableRow title="Studiengang" :content="data?.education.eduname" />
            <TableRow title="Studiumszeitraum" :content="data?.education.eduperiod" />
            <TableRow title="Studiumsort" :content="data?.education.eduplace" full-width />
          </template>
        </TableParent>
        <TableParent title="Spezifisch">
          <TableRow title="Hobbys" :content="data?.hobbys" is-list />
          <TableRow title="Angewohnheiten" :content="data?.habits" is-list />
          <TableRow title="Talente" :content="data?.talents" is-list />
          <TableRow title="Tics & Marotten" :content="data?.tics" is-list />
          <TableRow title="Freizeitgestaltung" :content="data?.activities" is-list />
          <TableRow title="Rätselhafte Züge" :content="data?.mysterious" is-list />
          <TableRow title="Hervorstechender Charakterzug" :content="data?.character" is-list />
          <TableRow title="Ängste" :content="data?.fears" is-list />
        </TableParent>
        <TableParent title="Geschmack">
          <TableRow title="Bücher" :content="data?.books" third is-list />
          <TableRow title="Musik" :content="data?.music" third is-list />
          <TableRow title="Filme" :content="data?.movies" third is-list />
          <TableHr />
          <TableRow title="Typische Kleidung" :content="data?.clothing" is-list />
          <TableRow title="Lieblingsfarben" :content="data?.colors" is-list />
          <TableHr />
          <TableRow title="Lieblingsgericht" :content="data?.food" third is-list />
          <TableRow title="Lieblingsgetränk" :content="data?.drink" third is-list />
          <TableRow title="Lieblingsalkohol" :content="data?.alcohol" third is-list />
          <TableHr />
          <TableRow :title="data?.pronom + ' Liebt...'" :content="data?.loves" is-list />
          <TableRow :title="data?.pronom + ' Hasst...'" :content="data?.hates" is-list />
        </TableParent>
      </div>
    </div>
    <hr />
    <DefaultPanel bg="bprimary">
      <template v-if="data?.biography">
        <h1 class="p-4 pt-6 m-0 text-primary-400">Bigorafie:</h1>
        <div class="mx-auto max-w-[95%]" v-html="data?.biography" />
      </template>
      <h1 v-else class="py-4 m-0 text-center redacted" data-text="[ REDACTED ]">[ REDACTED ]</h1>
    </DefaultPanel>
    <hr />
    <Disclosure v-if="data?.hangar[0]">
      <template #title>
        Schiffe von <span class="text-primary-400">{{ data?.fullName }}</span>
      </template>
      <div class="flex flex-wrap">
        <ShipCard
          v-for="ship in data?.hangar"
          :key="ship.id"
          :ship-data="ship.ship"
          :hangar-data="ship"
          display-department
          preload-images
        />
      </div>
    </Disclosure>
  </div>
</template>
