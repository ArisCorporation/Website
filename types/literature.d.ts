export { ILiterature };

declare global {
  interface ILiterature {
    id: string;
    title: string;
    series: ILiteratureSeries;
    chapter: number;
    content: string;
  }
}
