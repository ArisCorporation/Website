export { ShipRating };

declare global {
  interface ShipRating {
    id: String;
    baseShip: String;
    ships: Array[Ship];
    introduction: String;
    ratings: Array<{ category: String; grade: number; reason: String }>;
    s_w: Array<{ name: String; category: String }>;
  }
}
