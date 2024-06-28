<template>
  <div>
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
        </div>
      </div>
      <video
        class="w-full h-full"
        autoplay
        muted
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
