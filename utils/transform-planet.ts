export default function (obj: any) {
  const getType = () => {
    const typeMap: { [key: string]: string } = {
      terrestrickRock: 'Terrestrischer Fels',
      superEarth: 'Super Erde',
      superJupiter: 'Super Jupiter',
      ironPlanet: 'Eisen Planet',
      smogPlanet: 'Smog Planet',
      desertPlanet: 'Wüsten Planet',
      oceanPlanet: 'Ozean Planet',
      lavaPlanet: 'Lava Planet',
      mesoplanet: 'Mesoplanet',
      protoplanet: 'Protoplanet',
      dwarfPlanet: 'Zwerg Planet',
      gasGiant: 'Gas Riese',
      gasDwarf: 'Gas Zwerg',
      iceGiant: 'Eis Riese',
      icePlanet: 'Eis Planet',
      planetoid: 'Planetoid',
      planetaryMoon: 'Planetarer Mond',
      corelessPlanet: 'Kernloser Planet',
      artificial: 'Künstlich',
      puffyPlanet: 'Geschwollener Planet',
      carbonPlanet: 'Kohlenstoff Planet',
      chthonianPlanet: 'Chthonischer Planet',
      roguePlanet: 'Schurkenplanet',
    };

    return typeMap[obj.type] || '';
  };

  return {
    ...(obj.id && { id: obj.id }),
    ...(obj.name && { name: obj.name }),
    ...(obj.slug && { slug: obj.slug }),
    ...(obj.banner && { banner: obj.banner }),
    ...(obj.astronomical_designation && {
      astronomical_designation: obj.astronomical_designation,
    }),
    ...(obj.content && { content: obj.content }),
    ...(obj.orbit && {
      orbit: obj.orbit,
      ...(obj.orbit.filter((e: any) => e.collection === 'moons') && {
        moons: obj.orbit.filter((e: any) => e.collection === 'moons').map((moon: any) => transformMoon(moon.object)),
      }),
      ...(obj.orbit.filter((e: any) => e.collection === 'planets') && {
        planets: obj.orbit
          .filter((e: any) => e.collection === 'planets')
          .map((planet: any) => transformPlanet(planet.object)),
      }),
      ...(obj.orbit.filter((e: any) => e.collection === 'space_stations') && {
        space_stations: obj.orbit
          .filter((e: any) => e.collection === 'space_stations')
          .map((station: any) => transformSpacestation(station.object)),
      }),
    }),
    ...(obj.landing_zones && { landing_zones: obj.landing_zones.map((item: any) => transformLandingZone(item)) }),
    ...(obj.size && { size: obj.size }),
    ...(obj.age && { age: obj.age }),
    ...(obj.orbital_period && { orbital_period: obj.orbital_period }),
    ...(obj.distance && { distance: obj.distance }),
    ...(obj.type && { type: getType(), type_value: obj.type }),
    ...(obj.habitable && { size: obj.habitable }),
    ...(obj.fairchanceact && { size: obj.fairchanceact }),
  };
}
