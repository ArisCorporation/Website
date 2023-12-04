export { Technology };

declare global {
  interface Technology {
    id: String;
    name: String;
    title: String;
    content: String;
    category: String;
    categoryDesc: String;
    banner: String;
  }
}
