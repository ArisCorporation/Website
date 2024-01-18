import markdownParser from '@nuxt/content/dist/runtime/transformers/markdown';

export default function (content: String) {
  if (markdownParser) {
    return markdownParser?.parse('custom.md', content, {});
  }
  return null;
}
