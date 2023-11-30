export { Fraction }

declare global {
  interface Fraction {
    id: String
    name: String
    slug: String
    logo: String
    banner: String
    content: String
    category: String
    politicalCategory: String
    hostileCategory: String
    otherCategory: String
  }
}
