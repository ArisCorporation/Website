import transformUtilStoreImage from './transform-util-store_image';
import type { PersonalWeaponAttachments } from '@/types/cms-types';

export default function transformShip(obj: PersonalWeaponAttachments) {
  const getManufacturer = () => (obj.manufacturer ? transformCompany(obj.manufacturer) : null);

  return {
    ...(obj.id && { id: obj.id }),
    ...(obj.date_created && { date_created: obj.date_created }),
    ...(obj.date_updated && { date_updated: obj.date_updated }),
    ...transformUtilStoreImage(obj, 'store_image'),
    ...(obj.name && { name: obj.name }),
    ...(obj.slug && { slug: obj.slug }),
    ...(obj.gallery && { gallery: obj.gallery.map((obj: any) => obj.directus_files_id) }),
    ...(obj.manufacturer && { manufacturer: getManufacturer() }),
    ...(obj.category && { category: obj.category }),
    ...(obj.classification && { classification: obj.classification }),
    ...(obj.size && { size: obj.size }),
    ...(obj.weight && { weight: obj.weight }),
    ...(obj.price && { price: obj.price }),
    ...(obj.zoom_level && { zoom_level: obj.zoom_level }),
    ...(obj.auto_zeroing && { auto_zeroing: obj.auto_zeroing }),
    ...(obj.zeroing_range && { zeroing_range: obj.zeroing_range }),
    ...(obj.rangefinder && { rangefinder: obj.rangefinder }),
    ...(obj.statistic && { statistic: obj.statistic }),
    ...(obj.max_rounds && { max_rounds: obj.max_rounds }),
    ...(obj.content && { content: obj.content }),
  };
}
