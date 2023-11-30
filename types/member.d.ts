export { Member }

declare global {
  interface Member {
    id: string
    firstname: string
    lastname: string
    title: string
    slug: string
    potrait: string
    sex: string
    roles: Array<String>
    position: String
    head_of_department: Boolean
    department: Department
    birthdate: String
    birthsystem: Starsystem
    currentplace: String
    currentsystem: Starsystem
    birthplace: String
    currentsystem: Starsystem
    currentplace: String
    ueestate: String
    citizenreason: String
    dutyperiod: String
    dutyreason: String
    dutyinfo: String
    eduname: String
    eduinfo: String
    eduplace: String
    haircolor: String
    eyecolor: String
    height: number
    weight: number
    hobbys: String
    habits: String
    talents: String
    tics: String
    activities: String
    mysterious: String
    character: String
    fears: String
    books: String
    music: String
    movies: String
    colors: String
    clothing: String
    food: String
    drink: String
    alcohol: String
    loves: String
    hates: String
    medicalinfo: String
    biography: String
    account: Account
    weapons: Array<Weapon>
    ships: Array<HangarItem>
    wishlist: Array<Ship>
  }
}
