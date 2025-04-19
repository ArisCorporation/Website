import transformStarsystem from './transform-starsystem';
import transformPlanet from './transform-planet';
import transformStar from './transform-star';
import transformJumppoint from './transform-jumppoint';
import transformAsteroidbelt from './transform-asteroidbelt';

export default function (obj: any) {
  return {
    ...(obj.id && { id: obj.id }),
    ...(obj.status && { status: obj.status }),
    ...(obj.live_status && { live_status: obj.live_status }),
    ...(obj.banner && { banner: obj.banner }),
    ...(obj.overview_image && { overview_image: obj.overview_image }),
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
          .map((jumppoint: any) => transformJumppoint(jumppoint.object)),
      }),
      // ...(obj.orbit.filter((e) => e.collection === 'jumppoints') && {
      //   jumppoints: obj.orbit
      //     .filter((e) => e.collection === 'jumppoints')
      //     .map((jumppoint: any) => ({
      //       size: jumppoint.object.size,
      //       systems: jumppoint.object.systems?.map((system: any) => transformStarsystem(system)),
      //     })),
      // }),
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
    ...(obj.hasOwnProperty('danger_level') && { danger_level: obj.danger_level }),
    ...(obj.star_type && {
      star_type: obj.star_type === 'single' ? 'Einzel' : obj.star_type === 'binary' ? 'Binär' : '',
    }),
    ...(obj.star_class && { star_class: obj.star_class }),
  };
}
