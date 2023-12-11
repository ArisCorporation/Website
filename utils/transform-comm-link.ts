export default function (obj: any) {
  const getAuthor = () => (obj.comm_link_author ? transformMember(obj.comm_link_author) : null);

  return {
    id: obj.id,
    title: obj.comm_link_titel,
    slug: obj.comm_link_slug,
    author: getAuthor(),
    storeImage: obj.comm_link_banner?.id,
    datePosted: obj.date_created,
    description: obj.comm_link_beschreibung,
    content: obj.comm_link,
    channel: obj.comm_link_channel?.channel,
  };
}
