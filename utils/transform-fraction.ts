export default function (obj: any) {
  return {
    ...(obj.id && { id: obj.id }),
    ...(obj.name && { name: obj.name }),
    ...(obj.slug && { slug: obj.slug }),
    ...(obj.logo && { logo: obj.logo }),
    ...(obj.banner && { banner: obj.banner }),
    ...(obj.content && { content: obj.content }),
    ...(obj.category && { category: { id: obj.category.id, name: obj.category.name } }),
  };
}
