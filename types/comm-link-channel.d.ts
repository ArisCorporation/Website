export { ICommLinkChannel };

declare global {
  interface ICommLinkChannel {
    id: string;
    name: string;
    description: string;
    commLinks: Array<ICommLink>;
    unavailable: boolean;
  }
}
