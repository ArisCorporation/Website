export { IMember };

declare global {
  interface IMember {
    id: string;
    firstname: string;
    lastname: string;
    title: string;
    fullName: String;
    slug: string;
    potrait: string;
    sex: string;
    pronom: string;
    roles: Array<String>;
    position: String;
    head_of_department: Boolean;
    department: IDepartment;
    birthdate: String;
    birthsystem: IStarsystem;
    currentplace: String;
    currentsystem: IStarsystem;
    birthplace: String;
    currentsystem: IStarsystem;
    currentplace: String;
    ueestate: String;
    citizenreason: String;
    duty: {
      dutyperiod: String;
      dutyreason: String;
      dutyinfo: String;
    };
    education: {
      eduname: String;
      eduinfo: String;
      eduplace: String;
    };
    haircolor: String;
    eyecolor: String;
    height: number;
    weight: number;
    hobbys: String;
    habits: String;
    talents: String;
    tics: String;
    activities: String;
    mysterious: String;
    character: String;
    fears: String;
    books: String;
    music: String;
    movies: String;
    colors: String;
    clothing: String;
    food: String;
    drink: String;
    alcohol: String;
    loves: String;
    hates: String;
    medicalinfo: String;
    biography: String;
    account: Account;
    weapons: Array<IWeapon>;
    ships: Array<IHangarItem>;
    wishlist: Array<IShip>;
  }
}
