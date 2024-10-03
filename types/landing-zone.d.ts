export { ILandingZone };

declare global {
  interface ILandingZone {
    id: string;
    name: string;
    slug: string;
    storeImage: string;
    planet: IPlanet;
    moon: IMoon;
    companies: ICompanies[];
  }
}
