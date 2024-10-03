export default function (obj: any) {
  return {
    ...(obj.id && { id: obj.id }),
    ...(obj.banner && { banner: obj.banner }),
    ...(obj.name && { name: obj.name }),
    ...(obj.slug && { slug: obj.slug }),
    ...(obj.content && { content: obj.content }),
  };
}
