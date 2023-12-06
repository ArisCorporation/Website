export { ILiterature };

declare global {
  interface ILiterature {
    id: String;
    title: String;
    series: ILiteratureSeries;
    chapter: number;
    content: String;
  }
}
