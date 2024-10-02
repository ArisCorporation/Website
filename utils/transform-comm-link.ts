export default function (obj: any, array?: any) {
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
    ...(obj.id && { id: obj.id }),
    ...(obj.name && { title: obj.name }),
    ...(obj.slug && { slug: obj.slug }),
    ...(obj.user_created && { author: getAuthor() }),
    ...(obj.banner && { banner: obj.banner }),
    ...(obj.date_created && { date_posted: obj.date_created }),
    ...(obj.description && { description: obj.description }),
    ...(obj.content && { content: obj.content }),
    ...(obj.channel && { channel: getChannel() }),
    ...(obj.id && { size: getSize() }),
  };
}
