export { Department }

declare global {
  interface Department {
    id: String
    logo: String
    name: String
    pic1: String
    pic2: String
    text: String
    ships: Array<Ship>
    members: Array<Member>
    head_of_department: Member
  }
}
