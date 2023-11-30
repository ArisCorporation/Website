export { CommLink }

declare global {
  interface CommLink {
    id: String
    title: String
    slug: String
    author: Member
    banner: String
    content: String
    channel: CommLinkChannel
  }
}
