<script setup>
const modalOpen = ref(false);
const { copy } = useClipboard();
const toast = useToast();

function handleShare() {
  copy('https://trailer.ariscorp.de');
  toast.add({ title: 'URL in Zwischenablage kopiert!' });
}
</script>

<template>
  <div>
    <HomeTheNavbar />
    <div v-if="$route.path == '/'" id="hero" class="relative">
      <div class="absolute top-0 bottom-0 left-0 right-0 z-10 flex items-center justify-center">
        <div class="absolute w-full h-full bg-black opacity-60" />
        <div class="relative text-center mt-14 sm:mt-10 md:mt-0">
          <h1 class="mb-0 text-lg text-white md:mb-6 sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl">
            Willkommen <span class="text-secondary">bei der</span>
          </h1>
          <NuxtImg
            src="62eb0e48-6a0e-432f-b90d-fbd6aca6eaac"
            preload
            sizes="200px sm:300px md:400px lg:600px xl:750px 2xl:850px"
            class="mx-auto"
            alt="ArisCorp Banner"
          />
          <UModal v-model="modalOpen" fullscreen :ui="{ background: 'backdrop-blur-sm bg-black/80' }">
            <div class="h-full relative flex">
              <UButton
                variant="outline"
                class="absolute top-2 right-2 p-2 rounded-full z-[999]"
                icon="i-heroicons-x-mark-16-solid"
                @click="modalOpen = false"
              />
              <div class="aspect-[16/9] flex w-full">
                <video
                  id="fullscreen-trailer"
                  controls
                  autoplay
                  preload="auto"
                  class="mx-auto"
                  :src="$config.public.fileBase + '893966c7-3541-4605-a00f-633f5234ddd4'"
                />
              </div>
            </div>
          </UModal>
        </div>

        <div class="absolute bottom-12 right-0 left-0 mx-auto w-fit flex justify-between space-x-6">
          <UButton
            class="w-fit"
            variant="outline"
            icon="i-mdi-fullscreen"
            label="Trailer abspielen"
            size="2xl"
            @click="modalOpen = true"
          />
          <UButton
            class="w-fit"
            variant="outline"
            icon="i-heroicons-share"
            label="Teilen"
            size="2xl"
            @click="handleShare"
          />
        </div>
      </div>
      <video
        class="w-full h-full"
        autoplay
        muted
        preload="auto"
        controlslist="nofullscreen nodownload"
        loop
        :src="$config.public.fileBase + '893966c7-3541-4605-a00f-633f5234ddd4'"
      />
    </div>
    <div class="container px-4 mx-auto" :class="{ 'mt-24': $route.path != '/' }">
      <slot />
    </div>
    <Footer />
  </div>
</template>
