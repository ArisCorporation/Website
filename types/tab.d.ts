export { Tab };

declare global {
  interface Tab {
    id: string;
    header?: string;
    content?: any;
    component?: string;
    componentData?: any;
  }
}
