export { IStarsystem };

declare global {
  interface IStarsystem {
    id: string;
    banner: string;
    name: string;
    slug: string;
    text: string;
    isSystem: boolean;
    starType: string;
    starClass: string;
    size: number;
    affiliation: string;
    discoveryYear: string;
    population: number;
    economy: number;
    dangerLevel: number;
    mainPlanet: IPlanet;
    companies: ICompany[];
    asteroidBelt: IAsteroidBelt[];
    jumppoints: IJumppoints[];
    planets: IPlanet[];
    moons: IMoon[];
  }
}
