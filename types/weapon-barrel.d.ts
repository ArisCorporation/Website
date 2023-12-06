export { IWeaponBarrel };

declare global {
  interface IWeaponBarrel {
    id: String;
    name: String;
    slug: String;
    storeImage: String;
    gallery: Array<String>;
    class: String;
    size: String;
    manufacturer: ICompany;
    weight: number;
    price: number;
    stats: Array;
    description: String;
  }
}
