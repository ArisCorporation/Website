import { mount } from '@vue/test-utils'
import Main from '~/components/ui/main.vue'

describe('Komponenten > UI > Main', () => {
  it('sollte den Slot-Inhalt korrekt rendern', () => {
    const wrapper = mount(Main, {
      slots: {
        default: '<div>Test Inhalt</div>',
      },
    })
    expect(wrapper.html()).toContain('<div>Test Inhalt</div>')
  })
})
