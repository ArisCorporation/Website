export { IShip };

declare global {
  interface IShip {
    date_created?: string | null;
    date_updated?: string | null;
    external_refs?: unknown | null;
    id: string;
    manufacturer?: string | Companies | null;
    name?: string | null;
    notes?: string | null;
    paints?: unknown | null;
    ship_variants: any[] | ShipVariant[];
    user_created?: string | DirectusUsers | null;
    user_updated?: string | DirectusUsers | null;
  }
}
