export default function (obj: any) {
  const getShip = () => (obj.ship ? transformShip(obj.ship) : null);
  const getManufacturer = () => (obj.manufacturer ? transformMember(obj.manufacturer) : null);

  return {
    id: obj.id,
    storeImage: obj.storeImage?.id,
    name: obj.name,
    slug: obj.slug,
    ship: getShip(),
    pledgePrice: obj.pledgePrice,
    price: obj.price,
    productionState: obj.productionStatus,
    manufacturer: getManufacturer(),
    description: obj.description,
  };
}
