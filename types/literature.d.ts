export { Literature }

declare global {
  interface Literature {
    id: String
    title: String
    series: LiteratureSeries
    chapter: number
    content: String
  }
}
