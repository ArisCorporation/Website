export { IShipRating };

declare global {
  interface IShipRating {
    id: string;
    baseShip: string;
    ships: Array[IShip];
    introduction: string;
    ratings: Array<{ category: string; grade: number; reason: string }>;
    s_w: Array<{ name: string; category: string }>;
  }
}
