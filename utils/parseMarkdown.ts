import markdownParser from '@nuxt/content/transformers/markdown'

export default function (content: String) {
  return markdownParser.parse(null, content)
}
