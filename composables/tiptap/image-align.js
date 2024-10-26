const getAlignClass = (textAlign) => {
  if (textAlign === 'right') return 'ml-auto';
  if (textAlign === 'center') return 'mx-auto';
};

export default TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      textAlign: { default: 'center' }, // Standardmäßig auf center
    };
  },
  renderHTML({ HTMLAttributes }) {
    return ['img', { ...HTMLAttributes, class: `${getAlignClass(HTMLAttributes.textAlign)}` }];
  },
});
