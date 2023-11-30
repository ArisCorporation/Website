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
    birthsystem: obj.birthSystem,
    birthplace: obj.birthPlace,
    currentsystem: obj.currentResidenceSystem,
    currentplace: obj.currentResidence,
    ueestate: obj.ueeState,
    citizenreason: obj.citizenReason,
    dutyperiod: obj.dutyPeriod,
    dutyreason: obj.dutyReason,
    dutyinfo: obj.dutyInfo,
    eduname: obj.educationName,
    eduperiod: obj.educationPeriod,
    eduplace: obj.educationPlace,
    haircolor: obj.hairColor,
    eyecolor: obj.eyeColor,
    height: obj.height,
    weight: obj.weight,
    hobbys: obj.hobbys,
    habits: obj.habits,
    talents: obj.talents,
    tics: obj.tics,
    activities: obj.activities,
    mysterious: obj.mysteriousThings,
    character: obj.characterTrait,
    fears: obj.fears,
    books: obj.books,
    music: obj.music,
    movies: obj.movies,
    colors: obj.colors,
    clothing: obj.clothing,
    food: obj.food,
    drink: obj.drink,
    alcohol: obj.alcohol,
    loves: obj.loves,
    hates: obj.hates,
    medicalinfo: obj.text,
    biography: obj.biography,
    account: obj.account,
  }
}
