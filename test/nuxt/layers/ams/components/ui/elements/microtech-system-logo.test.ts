import { mount } from '@vue/test-utils'
import MicrotechSystemLogo from '#layers/ams/app/components/ui/elements/microtech-system-logo.vue'

describe('Komponenten > Layers > AMS > UI > Elements > MicrotechSystemLogo', () => {
  it('sollte ein SVG-Element rendern', () => {
    const wrapper = mount(MicrotechSystemLogo)
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})
