export { ITab };

declare global {
  interface ITab {
    id: string;
    header?: string;
    content?: any;
    component?: string;
    componentData?: any;
  }
}
