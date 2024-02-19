<script setup>
const footerLang = useState('footerLang', () => 'de');
const { readSingleton } = useDirectusItems();

const footerRes = await readSingleton('footer', {
  fields: ['translations.languages_code', 'translations.content'],
  status: { _eq: 'published' },
});
const footer = computed(() => footerRes?.translations?.map((e) => ({ code: e.languages_code, content: e.content })));

const de = footer.value?.find((e) => e.code === 'de-DE').content;
const en = footer.value?.find((e) => e.code === 'en-EN').content;
</script>

<template>
  <footer class="w-full bg-black border-t border-t-1 border-secondary print:hidden">
    <div class="container px-4 pt-4 pb-2 mx-auto">
      <div class="flex">
        <h4>//Disclaimer</h4>
        <div class="flex ml-4 space-x-2">
          <button title="Disclaimer Deutsch" :class="{ grayscale: footerLang != 'de' }" @click="footerLang = 'de'">
            <Icon name="flagpack:de" class="rounded" size="1.5rem" />
          </button>
          <button title="Disclaimer English" :class="{ grayscale: footerLang != 'en' }" @click="footerLang = 'en'">
            <Icon name="flagpack:us" class="rounded" size="1.5rem" />
          </button>
        </div>
      </div>
      <div class="flex flex-wrap justify-center xl:justify-between xl:flex-nowrap">
        <div class="flex flex-col justify-between w-full xl:w-2/3">
          <div class="">
            <template v-if="footer">
              <p v-if="footerLang == 'de'">
                <NuxtMarkdown :source="de" />
              </p>
              <p v-if="footerLang == 'en'">
                <NuxtMarkdown :source="en" />
              </p>
            </template>
            <template v-else>
              <p>FEHLER: DISCLAIMER KONNTE NICHT GELADEN WERDEN...</p>
              <p>ERROR: CANNOT LOAD DISCLAIMER...</p>
            </template>
          </div>
          <p>
            <span>&copy; ArisCorp - V{{ $config.public.appVersion }} - </span>
            <span><NuxtLink to="/credits">Credits</NuxtLink> - </span>
            <span><NuxtLink to="/bug-report">Bug-Report Tool</NuxtLink> - </span>
            <span><NuxtLink to="/ams">A.M.S.</NuxtLink> - </span>
            <span><NuxtLink target="_blank" to="https://releases.ariscorp.de">Release-Notes</NuxtLink></span>
          </p>
        </div>
        <div class="flex flex-col justify-between w-full xl:w-1/3">
          <NuxtImg
            src="2983446c-d4a8-4df4-b63d-aa46f0f8eabe"
            :placeholder="[16, 16, 1, 5]"
            alt="Made by the Community-Logo"
            class="w-1/3 max-w-[125px] mx-auto my-4 xl:w-1/2 xl:m-auto"
          />
          <div class="flex mx-auto mt-auto space-x-2 xl:mt-4 w-fit">
            <div class="footer-icon">
              <NuxtLink
                aria-label="Die Website von dem Spiel Star Citizen"
                to="https://robertsspaceindustries.com/star-citizen"
                target="_blank"
              >
                <Icon name="IconsLogosStarcitizen" class="w-full h-full" hover-effect />
              </NuxtLink>
            </div>
            <div class="footer-icon">
              <NuxtLink
                aria-label="Die Website von dem Spiel Squadron42"
                to="https://robertsspaceindustries.com/squadron42"
                target="_blank"
              >
                <Icon name="IconsLogosSquadron42" class="w-full h-full" hover-effect />
              </NuxtLink>
            </div>
            <div class="footer-icon">
              <NuxtLink aria-label="Die Website von RSI" to="https://robertsspaceindustries.com/" target="_blank">
                <Icon name="IconsLogosRsi" class="w-full h-full" hover-effect />
              </NuxtLink>
            </div>
            <div class="footer-icon">
              <NuxtLink aria-label="Die Website von CIG" to="https://cloudimperiumgames.com/" target="_blank">
                <Icon name="IconsLogosCig" class="w-full h-full" hover-effect />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="postcss">
.footer-icon {
  @apply w-16 h-16;
}
</style>
