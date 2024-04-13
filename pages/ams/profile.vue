<script setup lang="ts">
import VueCropper from 'vue-cropperjs';
import 'cropperjs/dist/cropper.css';

const { readAsyncItem, readAsyncItems } = useDirectusItems();
const modalStore = useModalStore();
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

// function setCropperImage(e: any) {
//   const file = e.target.files[0];
//   if (typeof FileReader === 'function') {
//     const res = readAsDataURL(file);
//     res.then((res: any) => {
//       // const originImage = new Image();
//       // originImage.src = res;
//       // this.selectedFile = originImage.outerHTML;
//       cropperFile.value = res;
//       // this.$refs.cropper.replace(this.selectedFile);
//     });
//   } else {
//     console.error('Sorry, FileReader API not supported');
//   }
// }

const cropper = ref();

function setCropperImage(e: any) {
  const file = e.target.files[0];
  console.log(cropper);

  if (file.type.indexOf('image/') === -1) {
    alert('Please select an valid image file');
    return;
  }

  if (typeof FileReader === 'function') {
    modalStore.openModal('Avatar ändern', { type: 'avatar-cropper', hideCloseButton: true });
    const reader = new FileReader();

    reader.onload = (event: any) => {
      cropper.value.replace(event.target.result);
    };

    reader.readAsDataURL(file);
  } else {
    alert('Sorry, FileReader API not supported');
  }
}

async function saveAvatar() {}

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
    <template #modalContent>
      <template v-if="modalStore.type === 'avatar-cropper'">
        <div>
          <div class="divide-y-2 divide-btertiary">
            <!-- <UCard> -->
            <div class="pb-4">
              <DefaultPanel class="mx-auto w-fit">
                <VueCropper
                  ref="cropper"
                  class="overflow-hidden aspect-[270/320] w-[270px] h-[320px]"
                  :src="$config.public.fileBase + 'fb3b70b1-fce4-4131-bed7-11ed9c08c4d1'"
                  :aspect-ratio="270 / 320"
                  :toggle-drag-mode-on-dblclick="false"
                  drag-mode="move"
                  :highlight="false"
                  :min-crop-box-width="270"
                  :min-crop-box-height="320"
                  :min-container-width="270"
                  :min-container-height="320"
                  :check-orientation="false"
                  :crop-box-resizable="false"
                >
                </VueCropper>
              </DefaultPanel>
            </div>
            <!-- <template #footer> -->
            <div class="flex flex-wrap justify-center w-full pt-4 my-auto gap-x-[5.5rem]">
              <ButtonDefault type="button" @click="modalStore.closeModal" class="w-1/3" color="danger">
                Schließen
              </ButtonDefault>
              <ButtonDefault @click="saveAvatar" class="w-1/3" color="success"> Speichern </ButtonDefault>
            </div>
            <!-- </template> -->
            <!-- </UCard> -->
          </div>
        </div>
      </template>
    </template>
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
