export default function (obj: any, shipList?: any) {
  const getShip = () => (obj.ships_id ? transformShip(obj.ships_id, shipList ? shipList : null) : null);
  const getDepartment = () => (obj.department ? transformDepartment(obj.department) : null);
  const getOwner = () => (obj.member_id ? transformMember(obj.member_id) : null);
  const getModule = () => (obj.active_module ? transformShipModule(obj.active_module) : null);

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
      module: getModule(),
    },
  };
}
