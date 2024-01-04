export default function (obj: any, shipList?: any) {
  const getShip = () => (obj.ship_id ? transformShip(obj.ship_id, shipList ? shipList : null) : null);
  const getDepartment = () => (obj.department ? transformDepartment(obj.department) : null);
  // TODO: OWNER FROM MEMBER TO USER
  const getModule = () => (obj.active_module ? transformShipModule(obj.active_module) : null);

  return {
    id: obj.id,
    ship: getShip(),
    userData: {
      owner: obj.user_id ? transformUser(obj.user_id) : null,
      name: obj.name,
      showName: obj.namePublic,
      serial: obj.serial,
      group: obj.group,
      visibility: obj.visibility,
      planned: obj.planned,
      department: getDepartment(),
      module: getModule(),
    },
  };
}
