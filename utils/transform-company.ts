export default function (obj: any) {
  return {
    ...(obj.id && { id: obj.id }),
    ...(obj.name && { name: obj.name }),
    ...(obj.code && { code: obj.code }),
    ...(obj.slug && { slug: obj.slug }),
    ...(obj.logo && { logo: obj.logo }),
    ...(obj.banner && { banner: obj.banner }),
    ...(obj.content && { content: obj.content }),
    ...(obj.category && { category: { id: obj.category.id, name: obj.category.name } }),
    ...(obj.headquarter &&
      obj.headquarter[0] && {
        headquarter: {
          collection: obj.headquarter[0].collection,
          ...(obj.headquarter[0].collection === 'planets' && {
            planet: transformPlanet(obj.headquarter[0].headquarter),
          }),
          ...(obj.headquarter[0].collection === 'moons' && { moon: transformMoon(obj.headquarter[0].headquarter) }),
          ...(obj.headquarter[0].collection === 'landing_zones' &&
            transformLandingZone(obj.headquarter[0].headquarter)),
          // ...(obj.headquarter[0].collection === 'landing_zones' && obj.headquarter[0].headquarter.planet
          //   ? {
          //       name: obj.headquarter[0].headquarter.name,
          //       slug: obj.headquarter[0].headquarter.slug,
          //       planet: {
          //         name: obj.headquarter[0].headquarter.planet.name,
          //         slug: obj.headquarter[0].headquarter.planet.slug,
          //       },
          //     }
          //   : {}),
          // ...(obj.headquarter[0].collection === 'landing_zones' && obj.headquarter[0].headquarter.moon
          //   ? {
          //       name: obj.headquarter[0].headquarter.name,
          //       slug: obj.headquarter[0].headquarter.slug,
          //       moon: { name: obj.headquarter[0].headquarter.moon.name, slug: obj.headquarter[0].headquarter.moon.slug },
          //     }
          //   : {}),
        },
      }),
    ...(obj.current_ceo && { current_ceo: obj.current_ceo }),
    ...(obj.founded && { founded: obj.founded }),
    ...(obj.founder && { founder: obj.founder }),
    ...(obj.famous_goods && { famous_goods: obj.famous_goods }),
    ...(obj.ships && { ships: obj.ships.map((ship: any) => transformShip(ship)) }),
    // weapons: getWeapons(),
    // ships: getShips(),
    // modules: getModules(),
    // optics: getOptics(),
    // barrels: getBarrels(),
    // underbarrels: getUnderbarrels(),
    // components: getComponents(),
  };
}
