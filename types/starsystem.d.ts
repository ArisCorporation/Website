export { Starsystem }

declare global {
  interface Starsystem {
    id: String
    banner: String
    name: String
    slug: String
    text: String
    isSystem: Boolean
    starType: String
    starClass: String
    size: number
    planets: number
    moons: number
    asteroidBelt: number
    jumppoints: number
    affiliation: String
    discoveryYear: String
    mainPlanet: String
    population: number
    economy: number
    dangerLevel: number
    companies: Array<Company>
  }
}
