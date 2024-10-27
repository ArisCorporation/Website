export default function (obj: any) {
  const getShips = () => obj.ships?.map((i: any) => transformHangarItem(i));
  return {
    ...(obj.id && { id: obj.id }),
    ...(obj.logo && { logo: obj.logo }),
    ...(obj.name && { name: obj.name }),
    ...(obj.store_image && { store_image: obj.store_image.id ?? obj.store_image }),
    ...(obj.gallery && { gallery: obj.gallery.map((image: any) => image.directus_files_id) }),
    ...(obj.description && { description: obj.description }),
    // ships: getShips(),
    ...(obj.employees && { employees: obj.employees.map((employee: any) => transformUser(employee)) }),
    ...(obj.head_of_department && {
      head_of_department: obj.head_of_department[0] ? transformUser(obj.head_of_department[0]) : null,
    }),
    ...(obj.tab_id && { tab_id: obj.tab_id }),
  };
}
