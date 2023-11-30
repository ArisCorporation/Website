export { Company }

declare global {
  interface Company {
    id: String
    name: String
    code: String
    slug: String
    logo: String
    transLogo: String
    banner: String
    content: String
    category: String
    manufacturerCategory: String
    personelManufacturerCategory: String
    otherCategory: String
    medicalCategory: String
    handweapon: Boolean
    headquarter: String
    headquarterSystem: Starsystem
    currentCeo: String
    founding: String
    founder: String
    famousGoods: String
    weapons: Array<Weapon>
    ships: Array<Ship>
    modules: Array<ShipModule>
    optics: Array<WeaponOptic>
    barrels: Array<WeaponBarrel>
    underbarrels: Array<WeaponUnderbarrel>
    components: Array<ShipComponent>
  }
}
