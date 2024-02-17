export default function (obj: any) {
  return {
    ...(obj.id && { id: obj.id }),
    ...(obj.name && { name: obj.name }),
    ...(obj.slug && { slug: obj.slug }),
    ...(obj.banner && { banner: obj.banner }),
    ...(obj.planet && { planet: transformPlanet(obj.planet) }),
    ...(obj.moon && { moon: transformMoon(obj.moon) }),
    ...(obj.companies && { companies: obj.companies.map((item: any) => transformCompany(item)) }),
  };
}
