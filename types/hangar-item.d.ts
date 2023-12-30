export { IHangarItem };

declare global {
  interface IHangarItem {
    id: String;
    ship: IShip;
    loaner?: boolean;
    sourceShip?: IShip;
    userData: {
      owner: IMember;
      name: String;
      publicName: Boolean;
      serial: String;
      group: String;
      visibility: String;
      planned: Boolean;
      department: IDepartment;
      active_module: IShipModule;
    };
  }
}
