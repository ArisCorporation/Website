<script setup>
const { setFooterLang, userSettings } = useUserSettingsStore();
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
    <div class="container px-4 pt-4 pb-2 mx-auto sm:px-0">
      <div class="flex">
        <h4>//Disclaimer</h4>
        <div class="flex ml-4 space-x-2">
          <button
            title="Disclaimer Deutsch"
            :class="{ grayscale: userSettings.footerLang != 'de' }"
            @click="setFooterLang('de')"
          >
            <Icon name="flagpack:de" class="rounded" size="1.5rem" />
          </button>
          <button
            title="Disclaimer English"
            :class="{ grayscale: userSettings.footerLang != 'en' }"
            @click="setFooterLang('en')"
          >
            <Icon name="flagpack:us" class="rounded" size="1.5rem" />
          </button>
        </div>
      </div>
      <template v-if="footer">
        <p v-if="userSettings.footerLang == 'de'">
          <ContentRenderer :value="de" />
        </p>
        <p v-if="userSettings.footerLang == 'en'">
          <ContentRenderer :value="en" />
        </p>
      </template>
      <p v-else>FEHLER: DISCLAIMER KONNTE NICHT GELADEN WERDEN...</p>
      <div class="flex justify-between w-full">
        <p>
          <span>&copy; ArisCorp - </span>
          <span><NuxtLink to="/credits">Credits</NuxtLink> - </span>
          <span><NuxtLink to="/bug-report">Bug-Report Tool</NuxtLink></span>
        </p>
        <div class="flex space-x-2 w-fit">
          <div class="w-12 h-12">
            <NuxtLink
              aria-label="Die Website von dem Spiel Star Citizen"
              to="https://robertsspaceindustries.com/star-citizen"
              target="_blank"
            >
              <Icon name="IconsLogosStarcitizen" class="w-full h-full" hover-effect />
            </NuxtLink>
          </div>
          <div class="w-12 h-12">
            <NuxtLink
              aria-label="Die Website von dem Spiel Squadron42"
              to="https://robertsspaceindustries.com/squadron42"
              target="_blank"
            >
              <Icon name="IconsLogosSquadron42" class="w-full h-full" hover-effect />
            </NuxtLink>
          </div>
          <div class="w-12 h-12">
            <NuxtLink aria-label="Die Website von RSI" to="https://robertsspaceindustries.com/" target="_blank">
              <Icon name="IconsLogosRsi" class="w-full h-full" hover-effect />
            </NuxtLink>
          </div>
          <div class="w-12 h-12">
            <NuxtLink aria-label="Die Website von CIG" to="https://cloudimperiumgames.com/" target="_blank">
              <Icon name="IconsLogosCig" class="w-full h-full" hover-effect />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
