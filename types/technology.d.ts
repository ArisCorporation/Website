export { ITechnology };

declare global {
  interface ITechnology {
    id: string;
    name: string;
    slug: string;
    banner: string;
    description: string;
    content: string;
  }
}
