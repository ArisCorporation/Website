export default function (obj: any, shipList?: any) {
  const getShip = () => {
    const ship = obj.ship ?? obj.ship_id;
    return ship
  };
  const getDepartment = () => (obj.department ? transformDepartment(obj.department) : null);
  const getModule = () => (obj.active_module ? transformShipModule(obj.active_module) : null);
  const owner = obj.user ?? obj.user_id;

  return {
    id: obj.id,
    date_created: obj.date_created,
    ship: getShip(),
    userData: {
      owner: owner ? transformUser(owner) : null,
      name: obj.name,
      show_name: obj.name_public,
      serial: obj.serial,
      group: obj.group,
      visibility: obj.visibility,
      planned: obj.planned,
      department: getDepartment(),
      module: getModule(),
    },
  };
}
