export { LiteratureSeries };

declare global {
  interface LiteratureSeries {
    id: String;
    name: String;
    author: String;
    protagonist: String;
    cover: String;
    chapterCount: number;
    literature: Literature;
    singleChapter: Boolean;
    content: String;
  }
}
