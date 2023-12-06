export { IAccount };

declare global {
  interface IAccount {
    id: String;
    first_name: String;
    last_name: String;
    title: String;
    email: String;
    password: String;
    avatar: String;
    location: String;
    description: String;
    tags: String;
    language: String;
    appearance: String;
    status: String;
    role: String;
    token: String;
    id: String;
    betaAccess: String;
    passwordMustChange: String;
    character: IMember;
  }
}
