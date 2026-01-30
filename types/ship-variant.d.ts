export { IShipVariant };

declare global {
  interface IShipVariant {
    date_created?: string | null;
    date_updated?: string | null;
    external_refs?: unknown | null;
    hardpoints: any[] | Hardpoints[];
    id: string;
    name?: string | null;
    release_patch?: string | null;
    ship?: string | Ship | null;
    ship_configurations: any[] | ShipConfigurations[];
    stats?: unknown | null;
    thumbnail?: string | DirectusFiles | null;
    user_created?: string | DirectusUsers | null;
    user_updated?: string | DirectusUsers | null;
    variant_code?: string | null;
  }
}
