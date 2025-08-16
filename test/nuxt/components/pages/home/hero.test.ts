import { mount } from '@vue/test-utils'
import Hero from '~/components/pages/home/hero.vue'

describe('Komponenten > Pages > Home > Hero', () => {
  it('sollte korrekt rendern', () => {
    const wrapper = mount(Hero)
    expect(wrapper.find('div').exists()).toBe(true)
  })
})
