export { ICompany };

declare global {
  interface ICompany {
    id: String;
    name: String;
    code: String;
    slug: String;
    logo: String;
    transLogo: String;
    banner: String;
    content: String;
    category: String;
    manufacturerCategory: String;
    personelManufacturerCategory: String;
    otherCategory: String;
    medicalCategory: String;
    handweapon: Boolean;
    headquarter: String;
    headquarterSystem: IStarsystem;
    currentCeo: String;
    founding: String;
    founder: String;
    famousGoods: String;
    weapons: Array<IWeapon>;
    ships: Array<IShip>;
    modules: Array<IShipModule>;
    optics: Array<IWeaponOptic>;
    barrels: Array<IWeaponBarrel>;
    underbarrels: Array<IWeaponUnderbarrel>;
    components: Array<IShipComponent>;
  }
}
