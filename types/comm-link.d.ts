export { ICommLink };

declare global {
  interface ICommLink {
    id: string;
    name: string;
    slug: string;
    author: IMember;
    storeImage: string;
    datePosted: Date;
    description: string;
    content: string;
    channel: ICommLinkChannel;
    size: number;
  }
}
