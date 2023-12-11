export { ICommLink };

declare global {
  interface ICommLink {
    id: String;
    title: String;
    slug: String;
    author: IMember;
    storeImage: String;
    datePosted: Date;
    description: String;
    content: String;
    channel: ICommLinkChannel;
  }
}
