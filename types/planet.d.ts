export { IPlanet };

declare global {
  interface IPlanet {
    id: string;
    name: string;
    slug: string;
    astronomicalSlug: string;
    astronomicalDesignation: string;
    astronomicalDesignationNumber: number;
    storeImage: string;
    description: string;
    system: IStarsystem;
    moons: IMoon[];
    landingZones: ILandingZone[];
    size: number;
    age: number;
    orbitalPeriod: number;
    distance: number;
    type: string;
    habitable: boolean;
    fairchanceact: boolean;
    population: number;
    economy: number;
    dangerLevel: number;
  }
}
