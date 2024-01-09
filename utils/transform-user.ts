export default function (obj: any) {
  const roleMapping: { [key: string]: { id: string; position: string; permissionLevel: number } } = {
    '030fee1b-0a1c-413c-a7c5-c1b2f10765ea': {
      id: '030fee1b-0a1c-413c-a7c5-c1b2f10765ea',
      position: 'Anwärter',
      permissionLevel: 1,
    },
    '175c81cc-7d77-4fe8-a115-c0092df766a0': {
      id: '175c81cc-7d77-4fe8-a115-c0092df766a0',
      position: 'Freier Mitarbeiter',
      permissionLevel: 2,
    },
    '362f98a8-7be4-4b48-88bf-5ca35e4ac80e': {
      id: '362f98a8-7be4-4b48-88bf-5ca35e4ac80e',
      position: 'Mitarbeiter',
      permissionLevel: 3,
    },
    'd55635b8-f203-4651-9a8a-8878044bc347': {
      id: 'd55635b8-f203-4651-9a8a-8878044bc347',
      position: 'Verwaltung',
      permissionLevel: 4,
    },
    '767bb09e-a6fc-4ebb-8c5f-08b060ab0bdb': {
      id: '767bb09e-a6fc-4ebb-8c5f-08b060ab0bdb',
      position: 'Verwaltung',
      permissionLevel: 5,
    },
  };

  const roles = [
    obj.head_of_department ? 'Abteilungsleiter' : null,
    obj.roles?.includes('recruitment') ? 'Rekrutierung' : null,
    obj.roles?.includes('marketing') ? 'Marketing & Presse' : null,
    obj.roles?.includes('contentWriter') ? 'Inhaltsersteller' : null,
  ]
    .filter(Boolean)
    .sort();
  const positionInfo = roleMapping[obj.role] || { position: null, permissionLevel: null };

  return {
    id: obj.id,
    firstname: obj.first_name,
    lastname: obj.last_name,
    title: obj.title,
    temporaryPassword: obj.temporaryPassword,
    fullName: `${obj.title ? obj.title + ' ' : ''}${obj.first_name}${obj.last_name ? ' ' + obj.last_name : ''}`,
    slug: obj.slug,
    arisEmail: obj.email,
    contactEmail: obj.contactEmail,
    discordName: obj.discordName,
    rsiHandle: obj.rsiHandle,
    potrait: obj.avatar ? obj.avatar : '0b7eafde-0933-4d1a-a32f-b4f8dd5bb492',
    sex: obj.sex,
    pronom: obj.sex === 'female' ? 'Sie' : 'Er',
    roles: roles.length > 0 ? roles : null,
    position: positionInfo,
    admin: obj.role === '767bb09e-a6fc-4ebb-8c5f-08b060ab0bdb',
    headOfDepartment: obj.head_of_department,
    // department: obj.head_of_department
    //   ? transformDepartment(obj.head_department?.[0])
    //   : transformDepartment(obj.department),
    birthplace: obj.birthplace ? transformLandingZone(obj.birthplace) : null,
    birthdate: obj.birthdate,
    currentplace: obj.currentResidence ? transformLandingZone(obj.currentResidence) : null,
    ueeState: obj.citizen ? 'citizen' : 'civilian',
    citizenReason:
      obj.citizenReason === 'military'
        ? 'Militärischer Dienst'
        : obj.citizenReason === 'education'
          ? 'Besondere Bildung'
          : obj.citizenReason === 'social'
            ? 'Soziales Engagement'
            : null,
    dutyState: obj.dutyState,
    duty: {
      period: obj.dutyPeriod,
      end: obj.dutyEnd,
      division:
        obj.dutyDivision === 'army'
          ? 'UEE Arme'
          : obj.dutyDivision === 'navy'
            ? 'UEE Marine'
            : obj.dutyDivision === 'marine'
              ? 'UEE Luftwaffe'
              : null,
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
    hobbies: obj.hobbies,
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
    biography: obj.biography,
    hangarLink: `/ams/employees/hangar/${obj.slug}`,
    biographyLink: `/biography/${obj.slug}`,
    biographyAmsLink: `/ams/employees/biography/${obj.slug}`,
    // hangar: obj.ships?.map(transformHangarItem),
  };
}
