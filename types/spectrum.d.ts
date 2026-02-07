export { ITechnology };

declare global {
  interface ITechnology {
    id: string;
    name: string;
    title: string;
    content: string;
    category: string;
    categoryDesc: string;
    banner: string;
  }
}
