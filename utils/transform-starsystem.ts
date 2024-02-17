export default function (obj: any) {
  return {
    ...(obj.id && { id: obj.id }),
    ...(obj.banner && { banner: obj.banner }),
    ...(obj.name && { name: obj.name }),
    ...(obj.slug && { slug: obj.slug }),
    ...(obj.content && { content: obj.content }),
    ...(obj.size && { size: obj.size }),
    ...(obj.orbit && {
      orbit: obj.orbit,
      ...(obj.orbit.filter((e) => e.collection === 'stars') && {
        stars: obj.orbit.filter((e) => e.collection === 'stars').map((star: any) => transformStar(star.object)),
      }),
      ...(obj.orbit.filter((e) => e.collection === 'planets') && {
        planets: obj.orbit
          .filter((e) => e.collection === 'planets')
          .map((planet: any) => transformPlanet(planet.object)),
      }),
      ...(obj.orbit.filter((e) => e.collection === 'jumppoints') && {
        jumppoints: obj.orbit
          .filter((e) => e.collection === 'jumppoints')
          .map((jumppoint: any) => ({
            size: jumppoint.object.size,
            systems: jumppoint.object.systems.map((item: any) => item.systems_id),
          })),
      }),
      ...(obj.orbit.filter((e) => e.collection === 'asteroid_belts') && {
        asteroid_belts: obj.orbit
          .filter((e) => e.collection === 'asteroid_belts')
          .map((asteroid_belt: any) => transformAsteroidbelt(asteroid_belt.object)),
      }),
    }),
    ...(obj.affiliation && {
      affiliation: obj.affiliation
        ? obj.affiliation === 'uee'
          ? 'UEE'
          : obj.affiliation === 'in_development'
            ? 'In Entwicklung'
            : obj.affiliation === 'unclaimed'
              ? 'Nicht Beansprucht'
              : obj.affiliation === 'banu'
                ? 'Banu'
                : obj.affiliation === 'xian'
                  ? `Xi'An`
                  : obj.affiliation === 'vanduul' && 'Vanduul'
        : null,
      affiliation_value: obj.affiliation,
    }),
    ...(obj.discovery_year && { discovery_year: obj.discovery_year }),
    ...(obj.population && { population: obj.population }),
    ...(obj.economy && { economy: obj.economy }),
    ...(obj.danger_level && { danger_level: obj.danger_level }),
  };
}
