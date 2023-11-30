export { WeaponBarrel }

declare global {
  interface WeaponBarrel {
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
