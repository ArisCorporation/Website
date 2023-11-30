export { Account }

declare global {
  interface Account {
    id?: string
    first_name?: string
    last_name?: string
    character?: Array<Member>
  }
}
