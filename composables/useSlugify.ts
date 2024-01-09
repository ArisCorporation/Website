export const useSlugify = (string: string, dotMode?: boolean) => {
  return string
    .toLowerCase()
    .replace(/ /g, dotMode === true ? '.' : '-')
    .replace(dotMode ? /[^\w.]+/g : /[^\w-]+/g, '');
};
