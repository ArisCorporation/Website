export { IAlien };

declare global {
  interface IAlien {
    id: string;
    name: string;
    slug: string;
    banner: string;
    content: string;
    sections: Array;
  }
}
