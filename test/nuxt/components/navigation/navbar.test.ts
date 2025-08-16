import { mount } from '@vue/test-utils'
import Navbar from '~/components/navigation/navbar.vue'
import UiAriscorpLogo from '~/components/ui/ariscorp-logo.vue'
import UiPeople from '~/components/ui/people.vue'

describe('Komponenten > Navigation > Navbar', () => {
  it('sollte korrekt rendern und die Kind-Komponenten enthalten', () => {
    const wrapper = mount(Navbar, {
      global: {
        components: {
          UiAriscorpLogo,
          UiPeople,
        },
      },
    })

    expect(wrapper.findComponent(UiAriscorpLogo).exists()).toBe(true)
    expect(wrapper.findAllComponents(UiPeople).length).toBe(6)
  })
})
