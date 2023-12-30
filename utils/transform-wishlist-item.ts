export default function (obj: any) {
  const getShip = () => (obj.ships_id ? transformShip(obj.ships_id) : null);
  const getOwner = () => (obj.member_id ? transformMember(obj.member_id) : null);

  return {
    id: obj.id,
    ship: getShip(),
    owner: getOwner(),
  };
}
