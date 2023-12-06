export { IDepartment };

declare global {
  interface IDepartment {
    id: String;
    logo: String;
    name: String;
    pic1: String;
    pic2: String;
    text: String;
    ships: Array<IShip>;
    members: Array<IMember>;
    head_of_department: IMember;
  }
}
