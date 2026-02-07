export { IWeaponOptic };

declare global {
  interface IWeaponOptic {
    id: string;
    name: string;
    slug: string;
    storeImage: string;
    gallery: Array<string>;
    class: string;
    size: string;
    manufacturer: Company;
    weight: number;
    price: number;
    zoomLevel: string;
    zeroing: boolean;
    autoZeroing: boolean;
    zeroingRange: number;
    rangefinder: boolean;
    description: string;
  }
}
