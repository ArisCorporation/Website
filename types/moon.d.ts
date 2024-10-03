export { IMoon };

declare global {
  interface IMoon {
    id: string;
    name: string;
    slug: string;
    astronomicalSlug: string;
    astronomicalDesignation: string;
    astronomicalDesignationLetter: number;
    storeImage: string;
    description: string;
    planet: IPlanet;
    landingZones: ILandingZone[];
    size: number;
    age: number;
    orbitalPeriod: number;
    distance: number;
    habitable: boolean;
    fairchanceact: boolean;
    population: number;
    economy: number;
    dangerLevel: number;
  }
}
