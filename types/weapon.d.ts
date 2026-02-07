export { IWeapon };

declare global {
  interface IWeapon {
    id: string;
    name: string;
    slug: string;
    storeImage: string;
    price: string;
    manufacturer: Company;
    class: string;
    weight: number;
    calibre: string;
    damageType: string;
    firemodes: string;
    firerateSingle: number;
    firerateBurst: number;
    firerateFullauto: number;
    firerateLoaded: number;
    mag: string;
    optic: IWeaponOptic;
    weaponMuzzleVelocity: number;
    locktime: number;
    description: string;
    maxRange: number;
    effectiveRange: number;
    table: Array;
    owner: IMember;
  }
}
