import { TiptapTable } from '../tiptapExt';

const getAlignClass = (textAlign) => {
  if (textAlign === 'right') return 'ml-auto';
  if (textAlign === 'center') return 'mx-auto';
};

export default TiptapTable.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      textAlign: { default: 'center' }, // Standardmäßig auf "center" setzen
    };
  },
  renderHTML({ HTMLAttributes }) {
    // Fügt die Ausrichtungs-Klasse direkt auf das <table>-Tag hinzu
    return ['table', { ...HTMLAttributes, class: getAlignClass(HTMLAttributes.textAlign) }, 0];
  },
});
