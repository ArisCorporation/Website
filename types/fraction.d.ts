export { IFraction };

declare global {
  interface IFraction {
    id: string;
    name: string;
    slug: string;
    logo: string;
    banner: string;
    content: string;
    category: string;
    politicalCategory: string;
    hostileCategory: string;
    otherCategory: string;
  }
}
