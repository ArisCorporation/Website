export { IWeaponBarrel };

declare global {
  interface IWeaponBarrel {
    id: string;
    name: string;
    slug: string;
    storeImage: string;
    gallery: Array<string>;
    class: string;
    size: string;
    manufacturer: ICompany;
    weight: number;
    price: number;
    stats: Array;
    description: string;
  }
}
