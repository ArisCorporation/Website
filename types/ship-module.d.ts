export { IShipModule };

declare global {
  interface IShipModule {
    id: String;
    storeImage: String;
    name: String;
    slug: String;
    ship: Ship;
    pledgePrice: number;
    price: number;
    productionState: String;
    manufacturer: ICompany;
    description: String;
  }
}
