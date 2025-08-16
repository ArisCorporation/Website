import { mountSuspended } from '@nuxt/test-utils/runtime'
import Verseexkurs from '~/components/ui/verseexkurs.vue'

describe('Komponenten > UI > Verseexkurs', () => {
  it('sollte ohne Fehler rendern und ein SVG-Element enthalten', async () => {
    const wrapper = await mountSuspended(Verseexkurs)
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})
