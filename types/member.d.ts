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
    birthplace: String
    currentsystem: Starsystem
    currentplace: String
    ueestate: String
    citizenreason: String
    dutyperiod: String
    dutyinfo: String
    dutyend: String
    // TODO
    account: Account
  }
}
