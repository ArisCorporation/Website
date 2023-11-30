export { WeaponUnderbarrel }

declare global {
  interface WeaponUnderbarrel {
    id: String
    name: String
    slug: String
    storeImage: String
    gallery: Array<String>
    class: String
    size: String
    manufacturer: Company
    weight: number
    price: number
    stats: Array
    description: String
  }
}
