<script setup>
const footerLang = useState('footerLang', () => 'de')
const { getItems } = useDirectusItems()

const {
  data: footer,
  pending,
  error,
  refresh,
} = await useAsyncData(
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
      alias: {
        footer_text_titel: 'title',
        footer_text: 'content',
      },
    }),
  {
    transform: (data) => {
      return data.map((footer) => ({
        title: footer.footer_text_titel,
        content: footer.footer_text,
      }))
    },
  }
)

const de = await parseMarkdown(
  footer.value.find((e) => e.title == 'de').content
)
const en = await parseMarkdown(
  footer.value.find((e) => e.title == 'en').content
)
</script>

<template>
  <footer
    class="w-full bg-black border-t border-t-1 border-secondary print:hidden"
  >
    <div class="container mx-auto pb-2 pt-4">
      <div class="flex">
        <h4>//Disclaimer</h4>
        <div class="flex space-x-2 ml-4">
          <button
            @click="footerLang = 'de'"
            :class="{ grayscale: footerLang != 'de' }"
          >
            <Icon name="flagpack:de" class="rounded" size="1.5rem" />
          </button>
          <button
            @click="footerLang = 'en'"
            :class="{ grayscale: footerLang != 'en' }"
          >
            <Icon name="flagpack:us" class="rounded" size="1.5rem" />
          </button>
        </div>
      </div>
      <p v-if="footerLang == 'de'">
        <ContentRenderer :value="de" />
      </p>
      <p v-if="footerLang == 'en'">
        <ContentRenderer :value="en" />
      </p>
      <div class="w-full flex justify-between">
        <p>
          <span>C ArisCorp - </span>
          <span><NuxtLink to="/credits">Credits</NuxtLink> - </span>
          <span><NuxtLink to="/bug-report">Bug-Report Tool</NuxtLink> - </span>
          <span><NuxtLink to="/ams">A.M.S.</NuxtLink></span>
        </p>
        <div class="flex space-x-2 w-fit">
          <div class="w-12 h-12">
            <Icon
              name="IconsLogosStarcitizen"
              class="w-full h-full"
              hoverEffect
            />
          </div>
          <div class="w-12 h-12">
            <Icon
              name="IconsLogosSquadron42"
              class="w-full h-full"
              hoverEffect
            />
          </div>
          <div class="w-12 h-12">
            <Icon name="IconsLogosRsi" class="w-full h-full" hoverEffect />
          </div>
          <div class="w-12 h-12">
            <Icon name="IconsLogosCig" class="w-full h-full" hoverEffect />
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
