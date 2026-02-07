export { IDepartment };

declare global {
  interface IDepartment {
    id: string;
    logo: string;
    name: string;
    pic1: string;
    pic2: string;
    text: string;
    ships: Array<IShip>;
    members: Array<IMember>;
    head_of_department: IMember;
    tabdId: number;
  }
}
