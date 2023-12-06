export { ITechnology };

declare global {
  interface ITechnology {
    id: String;
    name: String;
    slug: String;
    banner: String;
    description: String;
    content: String;
  }
}
