import { mount } from '@vue/test-utils'
import People from '~/components/ui/people.vue'

describe('Komponenten > UI > People', () => {
  it('sollte ein SVG-Element rendern', () => {
    const wrapper = mount(People)
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})
