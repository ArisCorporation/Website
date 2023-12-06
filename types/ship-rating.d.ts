export { IShipRating };

declare global {
  interface IShipRating {
    id: String;
    baseShip: String;
    ships: Array[IShip];
    introduction: String;
    ratings: Array<{ category: String; grade: number; reason: String }>;
    s_w: Array<{ name: String; category: String }>;
  }
}
