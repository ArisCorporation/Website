export { ICompany };

declare global {
  interface ICompany {
    id: string;
    name: string;
    code: string;
    slug: string;
    logo: string;
    transLogo: string;
    banner: string;
    content: string;
    category: string;
    manufacturerCategory: string;
    personelManufacturerCategory: string;
    otherCategory: string;
    medicalCategory: string;
    handweapon: boolean;
    headquarter: string;
    headquarterSystem: IStarsystem;
    currentCeo: string;
    founding: string;
    founder: string;
    famousGoods: string;
    weapons: Array<IWeapon>;
    ships: Array<IShip>;
    modules: Array<IShipModule>;
    optics: Array<IWeaponOptic>;
    barrels: Array<IWeaponBarrel>;
    underbarrels: Array<IWeaponUnderbarrel>;
    components: Array<IShipComponent>;
  }
}
