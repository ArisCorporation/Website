export { IAlien };

declare global {
  interface IAlien {
    id: String;
    name: String;
    slug: String;
    banner: String;
    content: String;
    sections: Array;
  }
}
