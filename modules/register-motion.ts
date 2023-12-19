import { addComponent, defineNuxtModule } from '@nuxt/kit';

export default defineNuxtModule({
  setup() {
    addComponent({
      name: 'Motion', // name of the component to be used in vue templates
      export: 'Motion', // (optional) if the component is a named (rather than default) export
      filePath: 'motion/vue',
    });
    addComponent({
      name: 'Presence', // name of the component to be used in vue templates
      export: 'Presence', // (optional) if the component is a named (rather than default) export
      filePath: 'motion/vue',
    });
  },
});
