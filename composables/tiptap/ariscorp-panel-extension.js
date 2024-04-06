import { EditorComponentPanel } from '#components';
import { mergeAttributes } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';

export default TiptapNode.create({
  name: 'Panel',

  group: 'block',
  content: 'block+',

  parseHTML() {
    return [
      {
        // tag: 'panel',
        tag: 'div[data-type="panel"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // return ['panel', mergeAttributes(HTMLAttributes), 0];
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'panel' }), 0];
  },

  addNodeView() {
    return VueNodeViewRenderer(EditorComponentPanel);
  },
});
