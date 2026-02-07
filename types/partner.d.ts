export { IPartner };

declare global {
  interface IPartner {
    id: string;
    name: string;
    logo: string;
    website: string;
  }
}
