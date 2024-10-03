export default function (obj: any) {
  return {
    ...(obj.id && { id: obj.id }),
    ...(obj.name && { name: obj.name }),
    ...(obj.slug && { slug: obj.slug }),
    ...(obj.banner && { banner: obj.banner }),
    ...(obj.content && { content: obj.content }),
    ...(obj.tabs && {
      tabs: obj.tabs.map((tab: any) => ({
        header: tab.title,
        content: tab.content,
      })),
    }),
    ...(obj.tabs && { tabs_value: obj.tabs }),
  };
}
