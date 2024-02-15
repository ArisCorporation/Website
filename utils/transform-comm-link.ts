export default function (obj: any, array?: ICommLink[]) {
  // TODO: AUTHOR FROM MEMBER TO USER
  const getAuthor = () => (obj.user_created ? transformUser(obj.user_created) : null);
  const getChannel = () => (obj.channel ? transformCommLinkChannel(obj.channel) : null);
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
    title: obj.titel,
    slug: obj.slug,
    author: getAuthor(),
    banner: obj.banner,
    date_posted: obj.date_created,
    description: obj.description,
    content: obj.content,
    channel: getChannel(),
    size: getSize(),
  };
}
