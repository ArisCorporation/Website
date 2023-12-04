export { Alien };

declare global {
  interface Alien {
    id: String;
    name: String;
    slug: String;
    banner: String;
    content: String;
    sections: Array;
  }
}
