export { ICommLinkChannel };

declare global {
  interface ICommLinkChannel {
    id: String;
    name: String;
    description: String;
    commLinks: Array<ICommLink>;
    unavailable: Boolean;
  }
}
