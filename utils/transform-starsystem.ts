export default function (obj: any) {
  return {
    id: obj.id,
    banner: obj.banner?.id,
    name: obj.name,
    slug: obj.slug,
    text: obj.text,
    isSystem: obj.is_system,
    starType: obj.star_type,
    starClass: obj.star_class,
    size: obj.size,
    // planets: getPlanets(),
    // moons: getMoons(),
    // asteroidBelt: getAsteroidBelt(),
    // jumppoints: getJumppoints(),
    affiliation: obj.affiliation,
    discoveryYear: obj.discovery_year,
    // mainPlanet: getMainPlanet(),
    population: obj.population,
    economy: obj.economy,
    dangerLevel: obj.danger_level,
    // companies: getCompanies(),
  };
}
