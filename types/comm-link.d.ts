export { ICommLink };

declare global {
  interface ICommLink {
    id: String;
    title: String;
    slug: String;
    author: IMember;
    banner: String;
    content: String;
    channel: ICommLinkChannel;
  }
}
