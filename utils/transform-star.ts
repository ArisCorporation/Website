export default function (obj: any) {
  const getSize = () => {
    const sizeMap: { [key: string]: string } = {
      main_sequence: 'Hauptreihe',
      Hypergiant: 'Hyperriese',
      supergiant: 'Überriese',
      bright_giant: 'Heller Riese',
      giant: 'Riese',
      subgiant: 'Unterriese',
      dwarf: 'Zwerg',
      subdwarf: 'Unterzwerg',
    };

    return sizeMap[obj.size] || '';
  };

  const getType = () => {
    const typeMap: { [key: string]: string } = {
      black_hole: 'Schwarzes Loch',
      neutron_star: 'Neutronenstern',
      o: 'O',
      b: 'B',
      a: 'A',
      f: 'F',
      g: 'G',
      k: 'K',
      m: 'M',
      l: 'L',
      t: 'T',
      y: 'Y',
      r: 'R',
      n: 'N',
      s: 'S',
    };

    return typeMap[obj.type] || '';
  };

  return {
    ...(obj.id && { id: obj.id }),
    ...(obj.banner && { banner: obj.banner }),
    ...(obj.name && { name: obj.name }),
    ...(obj.slug && { slug: obj.slug }),
    ...(obj.size && { size: getSize(), size_value: obj.size }),
    ...(obj.type && { type: getType(), type_value: obj.type }),
    ...(obj.content && { content: obj.content }),
  };
}
