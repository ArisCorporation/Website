<script setup lang="ts">
const { readAsyncItem, readAsyncItems } = useDirectusItems();
const route = useRoute();
const user = transformUser(await useDirectusAuth().readMe());
console.log(user);
console.log(await useDirectusAuth().readMe());

const cropperFile = ref('');
// const cropper = ref();

// const { data: landing_zone_res } = await readAsyncItem('landing_zones', user?.current_residence, {
//   query: {
//     fields: ['id', 'name', 'slug', 'planet.id', 'planet.name', 'planet.slug', 'planet.astronomical_designation'],
//     filter: {
//       status: { _eq: 'published' },
//     },
//     limit: -1,
//   },
//   transform: (landing_zone: any[]) => transformLandingZone(landing_zone),
// });
// const { data: planets } = await readAsyncItems('planets', {
//   query: {
//     fields: ['id', 'name', 'astronomical_designation', 'slug'],
//     filter: {
//       status: { _eq: 'published' },
//     },
//     limit: -1,
//   },
//   transform: (planets: any[]) => planets.map((planet: any) => transformPlanet(planet)),
// });
// const { data: systems } = await readAsyncItems('systems', {
//   query: {
//     fields: ['id', 'name', 'slug', 'orbit.collection', 'orbit.object:planets.id', 'orbit.object:planets.name'],
//     filter: {
//       status: { _eq: 'published' },
//     },
//     limit: -1,
//   },
//   transform: (systems: any[]) => systems.map((system: any) => transformStarsystem(system)),
// });

const links = [
  [
    {
      label: 'Profil',
      avatar: {
        src: user.avatar_url,
      },
      to: '/ams/profile',
      exact: true,
    },
    {
      label: 'Mitteilungen',
      icon: 'i-heroicons-bell',
      to: '/ams/profile/notifications',
    },
    {
      label: 'Privatsphäre',
      icon: 'i-mdi-account-lock-outline',
      to: '/ams/profile/privacy',
    },
  ],
  [
    {
      label: 'Hilfe',
      icon: 'i-heroicons-book-open',
      to: '/ams/profile/help',
    },
  ],
];

function setCropperImage(e: any) {
  const file = e.target.files[0];
  if (typeof FileReader === 'function') {
    const res = readAsDataURL(file);
    res.then((res: any) => {
      // const originImage = new Image();
      // originImage.src = res;
      // this.selectedFile = originImage.outerHTML;
      cropperFile.value = res;
      // this.$refs.cropper.replace(this.selectedFile);
    });
  } else {
    console.error('Sorry, FileReader API not supported');
  }
}

function readAsDataURL(file: any) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = reject;
    fr.onload = function (event) {
      resolve(fr.result);
    };
    fr.readAsDataURL(file);
  });
}

definePageMeta({
  middleware: 'auth',
  layout: false,
});
</script>

<template>
  <NuxtLayout name="ams">
    <template #modalContent> </template>
    <div class="flex flex-col w-full divide-y divide-bsecondary">
      <!-- <div class="h-20">
      <p>Profil</p>
    </div> -->
      <div class="relative flex items-center p-5 mb-5 rounded-lg bg-bsecondary">
        <!-- TODO: ADD LOADING STATE TO AVATAR -->
        <div
          class="flex mr-6 relative overflow-hidden border-4 sm:border-[6px] border-primary rounded-full h-20 w-20 sm:h-36 sm:w-36 focus:outline-none group bg-white/5"
        >
          <NuxtImg :src="user?.avatar" :placeholder="[16, 16, 1, 5]" class="z-10 object-cover w-full h-full" />
          <div class="absolute top-0 bottom-0 left-0 right-0 m-auto w-fit h-fit">
            <LoadingBasic class="w-10 h-10 text-white" />
          </div>
        </div>
        <div class="flex-1 overflow-hidden outline-none">
          <p class="p-0 text-sm font-bold text-white sm:text-base whitespace-nowrap">
            {{ user?.full_name }}
          </p>
          <p class="flex items-center p-0 space-x-1 text-sm sm:text-base text-btertiary">
            <Icon name="heroicons:at-symbol-16-solid" class="relative inline-block w-[18px] h-[18px] my-auto" />
            <span class="my-auto">{{ user?.login_email }}</span>
          </p>
          <!-- <p class="flex items-center p-0 space-x-1 text-btertiary">
          <template v-if="user?.current_residencee">
            <Icon name="heroicons:map-pin-16-solid" class="relative inline-block w-[18px] h-[18px] my-auto" />
            <span class="my-auto">
              <NuxtLink
                :to="'/verseexkurs/starmap/' + user?.currentplace?.planet?.system?.slug"
                class="my-auto transition opacity-75 decoration-transparent hover:opacity-100"
              >
                {{ user?.currentplace?.planet?.system?.name }}
              </NuxtLink>
              /
              <NuxtLink
                :to="
                  '/verseexkurs/starmap/' +
                  user?.currentplace?.planet?.system?.slug +
                  '/' +
                  user?.currentplace.planet?.slug
                "
                class="my-auto transition opacity-75 decoration-transparent hover:opacity-100"
              >
                {{ user?.currentplace.planet?.name }}
              </NuxtLink>
              /
              <NuxtLink
                :to="
                  '/verseexkurs/starmap/' +
                  user?.currentplace?.planet?.system?.slug +
                  '/' +
                  user?.currentplace.planet?.slug +
                  '/' +
                  user?.currentplace?.slug
                "
                class="my-auto transition opacity-75 decoration-transparent hover:opacity-100"
              >
                {{ user?.currentplace?.name }}
              </NuxtLink>
            </span>
          </template>
        </p> -->
          <p class="text-[#444] items-center flex space-x-1 text-sm sm:text-base absolute bottom-4 p-0">
            <Icon name="ph:address-book-bold" class="relative inline-block w-[18px] h-[18px] my-auto" />
            <NuxtLink
              :to="user?.biographyAmsLink"
              class="my-auto transition opacity-75 decoration-transparent hover:opacity-100 text-primary animate-link"
            >
              Biografie
            </NuxtLink>
          </p>
        </div>
      </div>
      <UHorizontalNavigation
        :links="links"
        class="relative flex flex-wrap items-center justify-between w-full no-list"
      />
      <vue-cropper
        v-if="cropperFile"
        ref="cropper"
        :src="cropperFile"
        :view-mode="1"
        :aspect-ratio="0.6"
        alt="Avatar Image"
      />
      <NuxtPage @cropperInput="setCropperImage" />
    </div>
  </NuxtLayout>
</template>

<style lang="postcss">
.no-list ul {
  @apply list-none pl-0;
}

.no-list li {
  @apply marker:hidden pb-0;
}
</style>
