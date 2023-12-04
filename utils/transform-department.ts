import transformMember from './transform-member';

export default function (obj: any) {
  // const getShips = () => obj.ships.map((i) => transformShip(i))
  const getMembers = () => obj.members?.map((i) => transformMember(i));

  return {
    id: obj.id,
    logo: obj.gameplay_logo?.id,
    name: obj.gameplay_name,
    pic1: obj.gameplay_bild_links?.id,
    pic2: obj.gameplay_bild_rechts?.id,
    text: obj.text,
    // ships: getShips(),
    employees: getMembers(),
    head_of_department: obj.head_of_department ? transformMember(obj.head_of_department) : null,
  };
}
