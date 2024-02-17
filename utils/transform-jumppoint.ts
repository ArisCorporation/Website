export default function (obj: any) {
  return {
    ...(obj.id && { id: obj.id }),
    ...(obj.size && { size: obj.size }),
    ...(obj.systems && { systems: obj.systems.map((item: any) => transformStarsystem(item)) }),
  };
}
