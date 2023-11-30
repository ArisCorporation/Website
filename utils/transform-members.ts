export default function (obj: any) {
  const getRoles = () => {
    const roles: Array<String> = []
    if (obj.roles.includes('recruitment')) roles.push('Rekrutierung')
    if (obj.roles.includes('marketing')) roles.push('Marketing & Presse')
    if (obj.roles.includes('content_writer')) roles.push('Inhaltsersteller')
    if (obj.head_of_department) roles.push('Abteilungsleiter')

    return roles.sort()
  }
  const getPosition = () => {
    if (obj.position_level == 'candidate') return 'Anwärter'
    if (obj.position_level == 'freelancer') return 'Freier Mitarbeiter'
    if (obj.position_level == 'employee') return 'Mitarbeiter'
    if (obj.position_level == 'administration') return 'Verwaltung'
  }

  return {
    id: obj.id,
    firstname: obj.firstname,
    lastname: obj.lastname,
    title: obj.title,
    slug: obj.slug,
    potrait: obj.member_potrait?.id,
    sex: obj.sex,
    roles: getRoles(),
    position: getPosition(),
    head_of_department: obj.head_of_department,
    department: obj.head_of_department ? obj.head_department : obj.department,
    birthdate: obj.birthdate,
    birthsystem: obj.birthsystem,
    birthplace: obj.birthplace,
    currentsystem: obj.currentsystem,
    currentplace: obj.currentplace,
    ueestate: obj.ueestate,
    citizenreason: obj.citizenreason,
    dutyperiod: obj.dutyperiod,
    dutyinfo: obj.dutyinfo,
    dutyend: obj.dutyend,
  }
}
