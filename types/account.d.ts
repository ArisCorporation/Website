export { Account }

declare global {
  interface Account {
    id: string
    first_name: string
    last_name: string
    title: String
    email: String
    password: String
    avatar: String
    location: String
    description: String
    tags: String
    language: String
    appearance: String
    status: String
    role: String
    token: String
    id: String
    betaAccess: String
    passwordMustChange: String
    character: Member
  }
}
