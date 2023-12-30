export default function (obj: any) {
  const getPlanet = () => (obj.planet ? transformPlanet(obj.planet) : null);
  const getLandingZones = () => (obj.landingZones ? obj.landingZones.map((item) => transformLandingZone(item)) : null);

  return {
    id: obj.id,
    name: obj.name,
    slug: obj.slug,
    // astronomicalSlug: getAstronomicalSlug(),
    // astronomicalDesignation: getAstronomicalDesignation(),
    astronomicalDesignationLetter: obj.astronomicalDesignationLetter,
    storeImage: obj.storeImage?.id,
    description: obj.description,
    planet: getPlanet(),
    landingZones: getLandingZones(),
    size: obj.size,
    age: obj.age,
    orbitalPeriod: obj.orbitalPeriod,
    distance: obj.distance,
    habitable: obj.habitable,
    fairchanceact: obj.fairchanceact,
    population: obj.population,
    economy: obj.economy,
    dangerLevel: obj.dangerLevel,
  };
}
