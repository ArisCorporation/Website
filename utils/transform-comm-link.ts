export default function (obj: any, array?: ICommLink[]) {
  const getAuthor = () => (obj.comm_link_author ? transformMember(obj.comm_link_author) : null);
  const getChannel = () => (obj.comm_link_channel ? transformCommLinkChannel(obj.comm_link_channel) : null);
  const getSize = () => {
    if (array) {
      for (let i = 0; i < array?.length; i += 10) {
        if (array[i].id === obj.id) return 3;

        if (i + 1 >= array.length) {
          break;
        }

        if (array[i + 1].id === obj.id) return 1;
        if (array[i + 2].id === obj.id) return 2;

        if (i + 3 >= array.length) {
          break;
        }

        if (array[i + 3].id === obj.id) return 1;
        if (array[i + 4].id === obj.id) return 1;
        if (array[i + 5].id === obj.id) return 1;

        if (i + 6 >= array.length) {
          break;
        }

        if (array[i + 6].id === obj.id) return 2;
        if (array[i + 7].id === obj.id) return 1;

        if (i + 8 >= array.length) {
          break;
        }

        if (array[i + 8].id === obj.id) return 1;
        if (array[i + 9].id === obj.id) return 2;
      }
    } else {
      return null;
    }
  };

  return {
    id: obj.id,
    title: obj.comm_link_titel,
    slug: obj.comm_link_slug,
    author: getAuthor(),
    storeImage: obj.comm_link_banner?.id,
    datePosted: obj.date_created,
    description: obj.comm_link_beschreibung,
    content: obj.comm_link,
    channel: getChannel(),
    size: getSize(),
  };
}
