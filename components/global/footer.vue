<script setup>
const footerLang = useState('footerLang', () => 'de');
const { getItems } = useDirectusItems();

const { data: footer } = await useAsyncData(
  'footer',
  () =>
    getItems({
      collection: 'footer',
      params: {
        fields: ['footer_text_titel', 'footer_text'],
        filter: {
          _or: [{ footer_text_titel: 'de' }, { footer_text_titel: 'en' }],
        },
      },
    }),
  {
    transform: (data) => {
      return data.map((footer) => ({
        title: footer.footer_text_titel,
        content: footer.footer_text,
      }));
    },
  },
);

const de = await parseMarkdown(footer.value?.find((e) => e.title === 'de').content);
const en = await parseMarkdown(footer.value?.find((e) => e.title === 'en').content);
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
      <div class="flex flex-wrap justify-center lg:justify-between lg:flex-nowrap">
        <div class="flex flex-col justify-between w-full lg:w-2/3">
          <div class="">
            <template v-if="footer">
              <p v-if="footerLang == 'de'">
                <ContentRenderer :value="de" />
              </p>
              <p v-if="footerLang == 'en'">
                <ContentRenderer :value="en" />
              </p>
            </template>
            <p v-else>FEHLER: DISCLAIMER KONNTE NICHT GELADEN WERDEN...</p>
          </div>
          <p>
            <span>&copy; ArisCorp - V{{ $config.public.appVersion }} - </span>
            <span><NuxtLink to="/credits">Credits</NuxtLink> - </span>
            <span><NuxtLink to="/bug-report">Bug-Report Tool</NuxtLink> - </span>
            <span><NuxtLink to="/ams">A.M.S.</NuxtLink> - </span>
            <span><NuxtLink target="_blank" to="https://releases.ariscorp.de">Release-Notes</NuxtLink></span>
          </p>
        </div>
        <div class="flex flex-col justify-between w-full lg:w-1/3">
          <NuxtImg
            class="w-1/3 max-w-[125px] mx-auto my-4 lg:w-1/2 lg:m-auto"
            src="2983446c-d4a8-4df4-b63d-aa46f0f8eabe"
          />
          <div class="flex mx-auto mt-auto space-x-2 lg:mt-4 w-fit">
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
