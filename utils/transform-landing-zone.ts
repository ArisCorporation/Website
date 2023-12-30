export default function (obj: any) {
  const getPlanet = () => (obj.planet ? transformPlanet(obj.planet) : null);
  const getMoon = () => (obj.moon ? transformMoon(obj.moon) : null);
  const getCompanies = () => (obj.companies ? obj.companies.map((item) => transformCompany(item)) : null);

  return {
    id: obj.id,
    name: obj.name,
    slug: obj.slug,
    storeImage: obj.storeImage,
    planet: getPlanet(),
    moon: getMoon(),
    companies: getCompanies(),
  };
}
