export { ILiteratureSeries };

declare global {
  interface ILiteratureSeries {
    id: String;
    name: String;
    author: String;
    protagonist: String;
    cover: String;
    chapterCount: number;
    literature: ILiterature;
    singleChapter: Boolean;
    content: String;
  }
}
