export default function (obj: any) {
  const getShips = () => obj.ships?.map((i: any) => transformHangarItem(i));
  const getHoD = () => {
    const hod = obj.primary_employees.find((emp) => emp.head_of_department == true)
    console.log(hod)
    if (!hod) {
      return null
    }

    return transformUser(hod)
  }

  return {
    ...(obj.id && { id: obj.id }),
    ...(obj.logo && { logo: obj.logo }),
    ...(obj.name && { name: obj.name }),
    ...(obj.store_image && { store_image: obj.store_image.id ?? obj.store_image }),
    ...(obj.gallery && { gallery: obj.gallery.map((image: any) => image.directus_files_id) }),
    ...(obj.description && { description: obj.description }),
    // ships: getShips(),
    ...(obj.primary_employees && { employees: [...obj.primary_employees.filter((emp) => emp.head_of_department == false), ...obj.secondary_employees].map((employee: any) => transformUser(employee)) }),
    ...(obj.primary_employees && { head_of_department: getHoD() }),
    ...(obj.tab_id && { tab_id: obj.tab_id }),
  };
}
