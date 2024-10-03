export default function (obj: any) {
  return {
    ...(obj.id && { id: obj.id }),
    ...(obj.name && { name: obj.name }),
    ...(obj.description && { description: obj.description }),
  };
}
