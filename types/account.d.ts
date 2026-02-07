export { IAccount };

declare global {
  interface IAccount {
    id: string;
    first_name: string;
    last_name: string;
    title: string;
    email: string;
    password: string;
    avatar: string;
    location: string;
    description: string;
    tags: string;
    language: string;
    appearance: string;
    status: string;
    role: string;
    token: string;
    id: string;
    betaAccess: string;
    passwordMustChange: string;
    character: IMember;
  }
}
