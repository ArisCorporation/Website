export default function (obj: any) {
  const getStarsystem = () => (obj.starSystem ? transformStarsystem(obj.starSystem) : null);
  const getMoons = () => (obj.moons ? obj.moons.map((item) => transformMoon(item)) : null);
  const getLandingZones = () => (obj.landingZones ? obj.landingZones.map((item) => transformLandingZone(item)) : null);

  return {
    id: obj.id,
    name: obj.name,
    slug: obj.slug,
    // astronomicalSlug: getAstronomicalSlug(),
    // astronomicalDesignation: getAstronomicalDesignation(),
    astronomicalDesignationNumber: obj.astronomicalDesignationNumber,
    storeImage: obj.storeImage?.id || obj.storeImage,
    description: obj.description,
    system: getStarsystem(),
    moons: getMoons(),
    landingZones: getLandingZones(),
    size: obj.size,
    age: obj.age,
    orbitalPeriod: obj.orbitalPeriod,
    distance: obj.distance,
    type: obj.type,
    habitable: obj.habitable,
    fairchanceact: obj.fairchanceact,
    population: obj.population,
    economy: obj.economy,
    dangerLevel: obj.dangerLevel,
  };
}
