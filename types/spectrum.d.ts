export { ITechnology };

declare global {
  interface ITechnology {
    id: String;
    name: String;
    title: String;
    content: String;
    category: String;
    categoryDesc: String;
    banner: String;
  }
}
