export default function (obj: any) {
  return {
    ...(obj.id && { id: obj.id }),
    ...(obj.name && { name: obj.name }),
    ...(obj.slug && { slug: obj.slug }),
    ...(obj.banner && { banner: obj.banner }),
    ...(obj.astronomical_designation && { astronomical_designation: obj.astronomical_designation }),
    ...(obj.content && { content: obj.content }),
    ...(obj.landing_zones && { landing_zones: obj.landing_zones.map((item: any) => transformLandingZone(item)) }),
    ...(obj.size && { size: obj.size }),
    ...(obj.age && { age: obj.age }),
    ...(obj.orbital_period && { orbital_period: obj.orbital_period }),
    ...(obj.distance && { distance: obj.distance }),
    ...(obj.habitable && { habitable: obj.habitable }),
    ...(obj.fairchanceact && { fairchanceact: obj.fairchanceact }),
    ...(obj.population && { population: obj.population }),
    ...(obj.economy && { economy: obj.economy }),
    ...(obj.danger_level && { danger_level: obj.danger_level }),
  };
}
