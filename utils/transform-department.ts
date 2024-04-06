export default function (obj: any) {
  const getShips = () => obj.ships?.map((i: any) => transformHangarItem(i));
  // TODO: HoD FROM MEMBER TO USER
  const getTabId = () => {
    if (obj.name) {
      if (obj.name === 'Bergbau') return 0;
      if (obj.name === 'Bergung') return 1;
      if (obj.name === 'Betankung') return 2;
      if (obj.name === 'Datentransport') return 3;
      if (obj.name === 'Erkundung') return 4;
      if (obj.name === 'Konstruktion') return 5;
      if (obj.name === 'Logistik') return 6;
      if (obj.name === 'Medizin') return 7;
      if (obj.name === 'Personentransport') return 8;
      if (obj.name === 'Reparatur und Wartung') return 9;
      if (obj.name === 'Sicherheit') return 10;
      if (obj.name === 'Wissenschaft') return 11;
    } else {
      return null;
    }
  };

  return {
    ...(obj.id && { id: obj.id }),
    ...(obj.logo && { logo: obj.logo }),
    ...(obj.name && { name: obj.name }),
    ...(obj.gallery && { gallery: obj.gallery.map((image: any) => image.directus_files_id) }),
    ...(obj.description && { description: obj.description }),
    // ships: getShips(),
    ...(obj.employees && { employees: obj.employees.map((employee: any) => transformUser(employee)) }),
    ...(obj.head_of_department && {
      head_of_department: obj.head_of_department[0] ? transformUser(obj.head_of_department[0]) : null,
    }),
    tabId: getTabId(),
  };
}
