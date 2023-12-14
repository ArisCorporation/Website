export default function (obj: any) {
  return {
    name: obj?.channel,
    description: obj?.beschreibung,
  };
}
