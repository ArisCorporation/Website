<script setup lang="ts">
const props = defineProps({
  src: { type: null, required: true },
  posterUrl: { type: String, required: true },
  panelClass: { type: String, default: '' },
});

const commercialVideo = ref();
const commercialFullscreenState = ref(false);
const commercialShowPlayingOverlay = ref(false);
const commercialShowOverlay = computed(() => commercialShowPlayingOverlay.value || commercialWaiting.value);
const commercialOverlayIcon = ref('i-ic-round-play-arrow');

const {
  playing: commercialPlaying,
  currentTime: commercialCurrentTime,
  duration: commercialDuration,
  waiting: commercialWaiting,
  volume: commercialVolume,
  muted: commercialMuted,
} = useMediaControls(commercialVideo, {
  src: props.src,
});

function commercialFullscreenToggle() {
  const fullscreen = document.querySelector('#commercial_container');

  if (!commercialFullscreenState.value) fullscreen.requestFullscreen();
  else document.exitFullscreen();
}

function fullscreenchanged(event) {
  // document.fullscreenElement will point to the element that
  // is in fullscreen mode if there is one. If there isn't one,
  // the value of the property is null.
  if (document.fullscreenElement) {
    commercialFullscreenState.value = true;
  } else {
    commercialFullscreenState.value = false;
  }
}

function formatDuration(seconds: number) {
  return new Date(1000 * seconds).toISOString().slice(14, 19);
}

// watch(commercialPlaying, async () => {
//   commercialShowPlayingOverlay.value = true;
//   commercialOverlayIcon.value = commercialPlaying.value
//     ? 'i-ic-round-play-arrow'
//     : 'i-ic-round-pause';
//   await new Promise((resolve) => setTimeout(resolve, 400));
//   commercialShowPlayingOverlay.value = false;
// });

defineShortcuts({
  k: {
    handler: () => {
      toggleCommercialPlayback();
    },
  },
  ' ': {
    handler: () => {
      toggleCommercialPlayback();
    },
  },
  j: {
    handler: () => {
      seekCommercial(-10);
    },
  },
  l: {
    handler: () => {
      seekCommercial(10);
    },
  },
  m: {
    handler: () => {
      toggleCommercialMute();
    },
  },
  ',': {
    handler: () => {
      adjustCommercialVolume(-0.1);
    },
  },
  '.': {
    handler: () => {
      adjustCommercialVolume(0.1);
    },
  },
  arrowdown: {
    handler: () => {
      adjustCommercialVolume(-0.1);
    },
  },
  arrowup: {
    handler: () => {
      adjustCommercialVolume(0.1);
    },
  },
  arrowleft: {
    handler: () => {
      seekCommercial(-5);
    },
  },
  arrowright: {
    handler: () => {
      seekCommercial(5);
    },
  },
  f: {
    handler: () => {
      toggleCommercialFullscreen();
    },
  },
});

async function toggleCommercialPlayback() {
  commercialPlaying.value = !commercialPlaying.value;
  commercialOverlayIcon.value = commercialPlaying.value ? 'i-ic-round-play-arrow' : 'i-ic-round-pause';
  commercialShowPlayingOverlay.value = true;
  await new Promise((resolve) => setTimeout(resolve, 400));
  commercialShowPlayingOverlay.value = false;
  commercialOverlayIcon.value = 'i-ic-round-play-arrow';
}

async function seekCommercial(seconds: number) {
  commercialCurrentTime.value += seconds;
  if (seconds > 5) {
    commercialOverlayIcon.value = 'i-ic-baseline-forward-10';
  } else if (seconds > 0) {
    commercialOverlayIcon.value = 'i-ic-baseline-forward-5';
  } else if (seconds < -5) {
    commercialOverlayIcon.value = 'i-ic-baseline-replay-10';
  } else if (seconds < 0) {
    commercialOverlayIcon.value = 'i-ic-baseline-replay-5';
  }
  commercialShowPlayingOverlay.value = true;
  await new Promise((resolve) => setTimeout(resolve, 400));
  commercialShowPlayingOverlay.value = false;
  commercialOverlayIcon.value = 'i-ic-round-play-arrow';
}

async function toggleCommercialMute() {
  commercialMuted.value = !commercialMuted.value;
  commercialOverlayIcon.value = commercialMuted.value ? 'i-ic-round-volume-off' : 'i-ic-round-volume-up';
  commercialShowPlayingOverlay.value = true;
  await new Promise((resolve) => setTimeout(resolve, 400));
  commercialShowPlayingOverlay.value = false;
  commercialOverlayIcon.value = 'i-ic-round-play-arrow';
}

async function adjustCommercialVolume(amount: number) {
  commercialVolume.value = Math.max(0, Math.min(commercialVolume.value + amount, 1));
  amount > 0
    ? (commercialOverlayIcon.value = 'i-ic-round-volume-up')
    : (commercialOverlayIcon.value = 'i-ic-round-volume-down');
  commercialShowPlayingOverlay.value = true;
  await new Promise((resolve) => setTimeout(resolve, 400));
  commercialShowPlayingOverlay.value = false;
}

function toggleCommercialFullscreen() {
  const fullscreen = document.querySelector('#commercial_container');
  if (!commercialFullscreenState.value) {
    fullscreen.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', fullscreenchanged);
});
</script>

<template>
  <DefaultPanel bg="bprimary" class="mb-3" panel-classes="h-full" inner-classes="h-full">
    <div class="h-full flex flex-col">
      <div class="relative w-full h-fit" @click="toggleCommercialPlayback">
        <div
          class="absolute z-10 flex items-center justify-center w-full h-full transition-all duration-500 bg-black"
          :class="[commercialShowOverlay ? 'bg-opacity-75' : 'opacity-0']"
        >
          <Transition
            appear
            enter-active-class="transition-all duration-500"
            leave-active-class=""
            enter-from-class="scale-0 opacity-0"
            enter-to-class="scale-125 opacity-100"
            leave-from-class="scale-0 opacity-100"
            leave-to-class="scale-0 opacity-0"
          >
            <div v-if="commercialShowPlayingOverlay" class="absolute p-1.5 rounded-full bg-black/75 size-14">
              <UIcon :name="commercialOverlayIcon" class="opacity-50 size-full" />
            </div>
          </Transition>
          <Transition
            appear
            enter-active-class="transition-all duration-500"
            leave-active-class=""
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <UIcon
              v-if="commercialWaiting && !commercialShowPlayingOverlay"
              name="i-svg-spinners-90-ring-with-bg"
              class="w-14 h-auto aspect-[1/1] absolute"
            />
          </Transition>
        </div>
        <video
          ref="commercialVideo"
          :poster="posterUrl"
          class="w-full"
          :class="[commercialFullscreenState ? 'h-screen max-h-[calc(100vh-82px)]' : 'h-fit max-h-[calc(100vh-8rem)]']"
          :style="{
            aspectRatio: `${commercialVideo?.videoWidth} / ${commercialVideo?.videoHeight}`,
          }"
        />
      </div>
      <div class="w-full px-2 pb-2 space-y-2 my-auto">
        <URange
          v-model="commercialCurrentTime"
          :max="commercialDuration"
          :step="0.1"
          :animation="commercialWaiting && 'carousel'"
        />
        <div class="flex justify-between w-full h-full">
          <div class="flex items-center gap-x-2">
            <UButton color="inverted" @click="toggleCommercialPlayback">
              <Transition
                appear
                enter-active-class="transition-all duration-500"
                leave-active-class="absolute transition-all duration-500"
                enter-from-class="opacity-0"
                enter-to-class="opacity-100"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
              >
                <UIcon
                  v-if="!commercialPlaying"
                  :name="commercialPlaying ? 'i-heroicons-pause' : 'i-heroicons-play'"
                  class="w-5 aspect-[1/1] h-auto p-2"
                />
              </Transition>
              <Transition
                appear
                enter-active-class="transition-all duration-500"
                leave-active-class="absolute transition-all duration-500"
                enter-from-class="opacity-0"
                enter-to-class="opacity-100"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
              >
                <UIcon
                  v-if="commercialPlaying"
                  :name="commercialPlaying ? 'i-heroicons-pause' : 'i-heroicons-play'"
                  class="w-5 aspect-[1/1] h-auto"
                />
              </Transition>
            </UButton>
            <UButton
              color="inverted"
              :icon="commercialMuted ? 'i-heroicons-speaker-x-mark' : 'i-heroicons-speaker-wave'"
              @click="toggleCommercialMute"
            />
            <URange
              v-model="commercialVolume"
              :disabled="commercialMuted"
              :min="0"
              :max="1"
              :step="0.001"
              class="w-32"
            />
            <div>{{ formatDuration(commercialCurrentTime) }} / {{ formatDuration(commercialDuration) }}</div>
          </div>
          <div class="flex items-center gap-x-2">
            <UButton
              color="inverted"
              :icon="commercialFullscreenState ? 'i-mdi-fullscreen-exit' : 'i-mdi-fullscreen'"
              @click="() => commercialFullscreenToggle()"
            />
          </div>
        </div>
      </div>
    </div>
  </DefaultPanel>
</template>

<style>
#sentry-feedback {
  display: none !important;
}
</style>
