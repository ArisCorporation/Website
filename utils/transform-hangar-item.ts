export default function (obj: any) {
  const getShip = () => (obj.ships_id ? transformShip(obj.ships_id) : null);
  const getDepartment = () => (obj.department ? transformDepartment(obj.department) : null);
  const getOwner = () => (obj.member_id ? transformMember(obj.member_id) : null);

  return {
    id: obj.id,
    ship: getShip(),
    userData: {
      owner: getOwner(),
      name: obj.name,
      serial: obj.serial,
      group: obj.group,
      visibility: obj.visibility,
      planned: obj.planned,
      department: getDepartment(),
      // active_module: transformShipModule(obj.active_module),
    },
  };
}
