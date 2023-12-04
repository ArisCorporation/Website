export { Member };

declare global {
  interface Member {
    id: String;
    name: String;
    serial: String;
    group: String;
    visibility: String;
    department: Department;
    planned: Boolean;
    active_module: ShipModule;
    member: Member;
    ship: Ship;
  }
}
