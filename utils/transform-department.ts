export default function (obj: any) {
  const getShips = () => obj.ships?.map((i: any) => transformHangarItem(i));
  // TODO: MEMBER FROM MEMBER TO USER
  const getMembers = () => obj.members?.map((i: any) => transformMember(i));
  // TODO: HoD FROM MEMBER TO USER
  const getHoD = () => (obj.head_of_department ? transformMember(obj.head_of_department) : null);
  const getTabId = () => {
    if (obj.gameplay_name) {
      if (obj.gameplay_name === 'Bergbau') return 0;
      if (obj.gameplay_name === 'Bergung') return 1;
      if (obj.gameplay_name === 'Betankung') return 2;
      if (obj.gameplay_name === 'Datentransport') return 3;
      if (obj.gameplay_name === 'Erkundung') return 4;
      if (obj.gameplay_name === 'Konstruktion') return 5;
      if (obj.gameplay_name === 'Logistik') return 6;
      if (obj.gameplay_name === 'Medizin') return 7;
      if (obj.gameplay_name === 'Personentransport') return 8;
      if (obj.gameplay_name === 'Reparatur und Wartung') return 9;
      if (obj.gameplay_name === 'Sicherheit') return 10;
      if (obj.gameplay_name === 'Wissenschaft') return 11;
    } else {
      return null;
    }
  };

  return {
    id: obj.id,
    logo: obj.gameplay_logo?.id,
    name: obj.gameplay_name,
    pic1: obj.gameplay_bild_links?.id,
    pic2: obj.gameplay_bild_rechts?.id,
    text: obj.text,
    ships: getShips(),
    employees: getMembers(),
    head_of_department: getHoD(),
    tabId: getTabId(),
  };
}
