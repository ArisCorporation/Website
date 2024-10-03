export { IHangarItem };

declare global {
  interface IHangarItem {
    id: string;
    ship: IShip;
    loaner?: boolean;
    sourceShip?: IShip;
    userData: {
      owner: IMember;
      name: string;
      showName: boolean;
      serial: string;
      group: string;
      visibility: string;
      planned: boolean;
      department: IDepartment;
      module: IShipModule;
    };
  }
}
