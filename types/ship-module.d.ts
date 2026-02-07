export { IShipModule };

declare global {
  interface IShipModule {
    id: string;
    storeImage: string;
    name: string;
    slug: string;
    ship: Ship;
    pledgePrice: number;
    price: number;
    productionState: string;
    manufacturer: ICompany;
    description: string;
  }
}
