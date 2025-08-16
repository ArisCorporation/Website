import { mount } from '@vue/test-utils'
import Section from '~/components/ui/section.vue'

describe('Komponenten > UI > Section', () => {
  it('sollte den Slot-Inhalt korrekt rendern', () => {
    const wrapper = mount(Section, {
      slots: {
        default: '<span>Test</span>',
      },
    })
    expect(wrapper.html()).toContain('<span>Test</span>')
  })
})
