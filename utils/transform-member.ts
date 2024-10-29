export default function (obj: any) {
  const getPronom = () => (obj.sex === 'female' ? 'Sie' : 'Er');
  const getRoles = () => {
    const roles: Array<string> = [];
    if (obj.roles?.includes('recruitment')) roles.push('Rekrutierung');
    if (obj.roles?.includes('marketing')) roles.push('Marketing & Presse');
    if (obj.roles?.includes('content_writer')) roles.push('Inhaltsersteller');
    if (obj.head_of_department) roles.push('Abteilungsleiter');

    return roles.sort();
  };
  const getPosition = () => {
    if (obj.position_level === 'candidate') return 'Anwärter';
    if (obj.position_level === 'freelancer') return 'Freier Mitarbeiter';
    if (obj.position_level === 'employee') return 'Mitarbeiter';
    if (obj.position_level === 'administration') return 'Verwaltung';
  };
  const getCitizenReason = () => {
    if (obj.citizenReason === 'military') return 'Militärdienst';
    else if (obj.citizenReason === 'education') return 'Besondere Bildung';
    else if (obj.citizenReason === 'social') return 'Soziales Engagement';
    else return null;
  };
  const getFullName = () =>
    (obj.title ? obj.title + ' ' : '') + obj.firstname + (obj.lastname ? ' ' + obj.lastname : '');

  const getDepartment: any = () => {
    if (obj.head_of_department) {
      return obj.head_department ? transformDepartment(obj.head_department[0]) : null;
    } else {
      return obj.department ? transformDepartment(obj.department) : null;
    }
  };
  const getBirthSystem = () => (obj.birthSystem ? transformStarsystem(obj.birthSystem) : null);
  const getCurrentSystem = () => (obj.currentResidenceSystem ? transformStarsystem(obj.currentResidenceSystem) : null);
  const getHangar = () => (obj.ships ? obj.ships.map((i) => transformHangarItem(i)) : null);

  return {
    id: obj.id,
    firstname: obj.firstname,
    lastname: obj.lastname,
    title: obj.title,
    fullName: getFullName(),
    slug: obj.slug,
    potrait: obj.member_potrait?.id || '8658f40d-77d9-44c4-8f0d-af820855a3bc',
    sex: obj.sex,
    pronom: getPronom(),
    roles: getRoles(),
    position: getPosition(),
    head_of_department: obj.head_of_department,
    department: getDepartment(),
    birthdate: obj.birthdate,
    birthsystem: getBirthSystem(),
    birthplace: obj.birthPlace,
    currentsystem: getCurrentSystem(),
    currentplace: obj.currentResidence,
    ueestate: obj.ueeState,
    citizenreason: getCitizenReason(),
    duty: {
      dutyperiod: obj.dutyPeriod,
      dutyreason: obj.dutyReason,
      dutyinfo: obj.dutyInfo,
    },
    education: {
      eduname: obj.educationName,
      eduperiod: obj.educationPeriod,
      eduplace: obj.educationPlace,
    },
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
    hangar: getHangar(),
    // account: getAccount(),
  };
}
