import { mount } from '@vue/test-utils'
import MicrotechOs from '#layers/ams/app/components/ui/elements/microtech-os.vue'
import { version } from '../../../../../../../package.json'

describe('Komponenten > Layers > AMS > UI > Elements > MicrotechOs', () => {
  it('sollte die Versionsinformationen korrekt rendern', () => {
    const wrapper = mount(MicrotechOs, {
      global: {
        stubs: {
          AMSUiElementsMicrotechSystemLogo: true,
        },
      },
    })

    // Note: In the test environment, process.env.NUXT_PUBLIC_SOURCE_COMMIT and process.env.NUXT_PUBLIC_ENVIRONMENT are undefined.
    // The component falls back to 'DEV' and 'DEVELOPMENT'.
    const expectedVersion = `Version-${version.substring(1)}-DEV.DEVELOPMENT`
    expect(wrapper.text()).toContain(expectedVersion)
  })
})
