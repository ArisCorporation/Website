import { mount } from '@vue/test-utils'
import Page from '~/components/ui/page.vue'

describe('Komponenten > UI > Page', () => {
  it('sollte den Slot-Inhalt korrekt rendern', () => {
    const wrapper = mount(Page, {
      slots: {
        default: '<h1>Test Inhalt</h1>',
      },
    })
    expect(wrapper.html()).toContain('<h1>Test Inhalt</h1>')
  })
})
