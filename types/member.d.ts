export { IMember };

declare global {
  interface IMember {
    id: string;
    firstname: string;
    lastname: string;
    title: string;
    fullName: string;
    slug: string;
    potrait: string;
    arisEmail: string;
    contactEmail: string;
    discordName: string;
    rsiHandle: string;
    temporaryPassword: boolean;
    sex: string;
    pronom: string;
    roles: Array<string>;
    position: string;
    head_of_department: Boolean;
    department: IDepartment;
    birthdate: string;
    birthplace: ILandingZone;
    currentplace: ILandingZone;
    ueestate: string;
    citizenreason: string;
    dutyState: boolean,
    duty: {
      period: string;
      reason: string;
      info: string;
    };
    educationState: boolean
    education: {
      name: string;
      info: string;
      place: string;
    };
    haircolor: string;
    eyecolor: string;
    height: number;
    weight: number;
    hobbys: string;
    habits: string;
    talents: string;
    tics: string;
    activities: string;
    mysterious: string;
    character: string;
    fears: string;
    books: string;
    music: string;
    movies: string;
    colors: string;
    clothing: string;
    food: string;
    drink: string;
    alcohol: string;
    loves: string;
    hates: string;
    medicalinfo: string;
    hangarLink: string;
    biographyLink: string;
    biographyAmsLink: string;
    biography: string;
    account: Account;
    weapons: Array<IWeapon>;
    ships: Array<IHangarItem>;
    wishlist: Array<IShip>;
  }
}
