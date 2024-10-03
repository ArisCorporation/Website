import { EditorComponentPanelWithBg } from '#components';
import { mergeAttributes } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';

export default TiptapNode.create({
  name: 'Panel with Background',

  group: 'block',
  content: 'block+',

  parseHTML() {
    return [
      {
        // tag: 'panel',
        tag: 'div[data-type="panel-with-bg"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'panel-with-bg' }), 0];
  },

  addNodeView() {
    return VueNodeViewRenderer(EditorComponentPanelWithBg);
  },
});
