export default function (obj: any) {
  return {
    id: obj.id,
    name: obj.partner_name,
    logo: obj.partner_logo?.id,
    website: obj.partner_website,
  };
}
