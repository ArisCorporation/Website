export default function (obj: any) {
  const getType = () => {
    const typeMap: { [key: string]: string } = {
      orbital_station: 'Orbital Station',
      lagrange: 'Lagrange Point',
    };

    return typeMap[obj.type] || '';
  };

  return {
    ...(obj.id && { id: obj.id }),
    ...(obj.name && { name: obj.name }),
    ...(obj.slug && { slug: obj.slug }),
    ...(obj.banner && { banner: obj.banner }),
    ...(obj.type && { type: getType() }),
    ...(obj.content && { content: obj.content }),
  };
}
