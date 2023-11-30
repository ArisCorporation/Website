export { ShipModule }

declare global {
  interface ShipModule {
    id: String
    storeImage: String
    name: String
    slug: String
    ship: Ship
    pledgePrice: number
    price: number
    productionState: String
    manufacturer: Company
    description: String
  }
}
