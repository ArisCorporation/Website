export { CommLinkChannel };

declare global {
  interface CommLinkChannel {
    id: String;
    name: String;
    description: String;
    commLinks: Array<CommLink>;
    unavailable: Boolean;
  }
}
