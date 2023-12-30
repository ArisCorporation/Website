export default function (obj: any) {
  const getPronom = () => (obj.sex === 'female' ? 'Sie' : 'Er');
  const getAdminState = () => (obj.role === '767bb09e-a6fc-4ebb-8c5f-08b060ab0bdb' ? true : false);
  const getRoles = () => {
    const roles: Array<String> = [];
    if (obj.roles?.includes('recruitment')) roles.push('Rekrutierung');
    if (obj.roles?.includes('marketing')) roles.push('Marketing & Presse');
    if (obj.roles?.includes('contentWriter')) roles.push('Inhaltsersteller');
    if (obj.head_of_department) roles.push('Abteilungsleiter');

    return roles.sort();
  };
  const getBirthplace = () => (obj.birthplace ? transformLandingZone(obj.birthplace) : null);
  const getCurrentplace = () => (obj.currentResidence ? transformLandingZone(obj.currentResidence) : null);
  const getPosition = () => {
    if (obj.role === '030fee1b-0a1c-413c-a7c5-c1b2f10765ea') return 'Anwärter';
    if (obj.role === '175c81cc-7d77-4fe8-a115-c0092df766a0') return 'Freier Mitarbeiter';
    if (obj.role === '362f98a8-7be4-4b48-88bf-5ca35e4ac80e') return 'Mitarbeiter';
    if (obj.role === 'd55635b8-f203-4651-9a8a-8878044bc347') return 'Verwaltung';
    if (obj.role === '767bb09e-a6fc-4ebb-8c5f-08b060ab0bdb') return 'Verwaltung';
  };
  const getPermissionLevel = () => {
    if (obj.role === '030fee1b-0a1c-413c-a7c5-c1b2f10765ea') return 1;
    if (obj.role === '175c81cc-7d77-4fe8-a115-c0092df766a0') return 2;
    if (obj.role === '362f98a8-7be4-4b48-88bf-5ca35e4ac80e') return 3;
    if (obj.role === 'd55635b8-f203-4651-9a8a-8878044bc347') return 4;
    if (obj.role === '767bb09e-a6fc-4ebb-8c5f-08b060ab0bdb') return 5;
  };
  const getCitizenReason = () => {
    if (obj.citizenReason === 'military') return 'Militärischer Dienst';
    else if (obj.citizenReason === 'education') return 'Besondere Bildung';
    else if (obj.citizenReason === 'social') return 'Soziales Engagement';
    else return null;
  };
  const getFullName = () =>
    (obj.title ? obj.title + ' ' : '') + obj.first_name + (obj.last_name ? ' ' + obj.last_name : '');

  const getDepartment: any = () => {
    if (obj.head_of_department) {
      return obj.head_department ? transformDepartment(obj.head_department[0]) : null;
    } else {
      return obj.department ? transformDepartment(obj.department) : null;
    }
  };
  const getHangar = () => (obj.ships ? obj.ships.map((i) => transformHangarItem(i)) : null);

  return {
    id: obj.id,
    firstname: obj.first_name,
    lastname: obj.last_name,
    title: obj.title,
    fullName: getFullName(),
    slug: obj.slug,
    potrait: obj.avatar ? obj.avatar : '0b7eafde-0933-4d1a-a32f-b4f8dd5bb492',
    arisEmail: obj.email,
    contactEmail: obj.contactEmail,
    discordName: obj.discordName,
    rsiHandle: obj.rsiHandle,
    temporaryPassword: obj.temporaryPassword,
    sex: obj.sex,
    pronom: getPronom(),
    roles: getRoles(),
    position: getPosition(),
    admin: getAdminState(),
    permissionLevel: getPermissionLevel(),
    role: obj.role,
    head_of_department: obj.head_of_department,
    // department: getDepartment(),
    department: { id: '059e931c-1498-4348-9bc5-fae2449e0870' },
    birthdate: obj.birthdate,
    birthplace: getBirthplace(),
    currentplace: getCurrentplace(),
    ueestate: obj.citizen ? 'citizen' : 'civilian',
    citizenreason: getCitizenReason(),
    dutyState: obj.dutyState,
    duty: {
      period: obj.dutyPeriod,
      end: obj.dutyEnd,
    },
    educationState: obj.educationState,
    education: {
      name: obj.study,
      period: obj.studyPeriod,
      place: obj.studyPlace,
    },
    haircolor: obj.haircolor,
    eyecolor: obj.eyecolor,
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
    medicalinfo: obj.medicalInformations,
    hangarLink: '/ams/employees/hangar/' + obj.slug,
    biographyLink: '/biography/' + obj.slug,
    biographyAmsLink: '/ams/employees/biography/' + obj.slug,
    biography: obj.biography,
    // hangar: getHangar(),
    // account: getAccount(),
  };
}
