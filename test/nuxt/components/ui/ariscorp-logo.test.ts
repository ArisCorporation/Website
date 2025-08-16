import { mountSuspended } from '@nuxt/test-utils/runtime'
import AriscorpLogo from '~/components/ui/ariscorp-logo.vue'

describe('Komponenten > UI > AriscorpLogo', () => {
  it('sollte ohne Fehler rendern und ein SVG-Element enthalten', async () => {
    const wrapper = await mountSuspended(AriscorpLogo)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('sollte die Hover-Klasse anwenden, wenn die Prop übergeben wird', async () => {
    const wrapper = await mountSuspended(AriscorpLogo, {
      props: {
        hover: true,
      },
    })
    expect(wrapper.find('svg').classes()).toContain('group')
  })
})
