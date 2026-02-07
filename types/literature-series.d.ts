export { ILiteratureSeries };

declare global {
  interface ILiteratureSeries {
    id: string;
    name: string;
    author: string;
    protagonist: string;
    cover: string;
    chapterCount: number;
    literature: ILiterature;
    singleChapter: boolean;
    content: string;
  }
}
