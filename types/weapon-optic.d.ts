export { WeaponOptic };

declare global {
  interface WeaponOptic {
    id: String;
    name: String;
    slug: String;
    storeImage: String;
    gallery: Array<String>;
    class: String;
    size: String;
    manufacturer: Company;
    weight: number;
    price: number;
    zoomLevel: String;
    zeroing: Boolean;
    autoZeroing: Boolean;
    zeroingRange: number;
    rangefinder: Boolean;
    description: String;
  }
}
