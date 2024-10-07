import transformUtilStoreImage from './transform-util-store_image';
import transformAttachment from './transform-attachment';
import type { PersonalWeapons } from '@/types/cms-types';

export default function transformShip(obj: PersonalWeapons) {
  const getManufacturer = () => (obj.manufacturer ? transformCompany(obj.manufacturer) : null);
  const getClassificationLabel = () => {
    if (obj.classification === 'crossbow') return 'Armbrust';
    if (obj.classification === 'grenade_launcher') return 'Granatwerfer';
    if (obj.classification === 'hmg') return 'Schweres Maschinengewehr';
    if (obj.classification === 'lmg') return 'Leichtes Maschinengewehr';
    if (obj.classification === 'pistol') return 'Pistole';
    if (obj.classification === 'railgun') return 'Schienenkanone';
    if (obj.classification === 'rocket_launcher') return 'Raketenwerfer';
    if (obj.classification === 'sniper_rifle') return 'Scharfschützengewehr';
    if (obj.classification === 'shotgun') return 'Schrotflinte';
    if (obj.classification === 'smg') return 'Maschinenpistole';
    if (obj.classification === 'assault_rifle') return 'Sturmgewehr';
    if (obj.classification === 'taser') return 'Elektroschocker';
  };
  const getDamageType = () => {
    if (obj.damage_type === 'crossbow') return 'Armbrust';
    if (obj.damage_type === 'grenade_launcher') return 'Granatwerfer';
    if (obj.damage_type === 'hmg') return 'Schweres Maschinengewehr';
    if (obj.damage_type === 'lmg') return 'Leichtes Maschinengewehr';
    if (obj.damage_type === 'pistol') return 'Pistole';
    if (obj.damage_type === 'railgun') return 'Schienenkanone';
    if (obj.damage_type === 'rocket_launcher') return 'Raketenwerfer';
    if (obj.damage_type === 'sniper_rifle') return 'Scharfschützengewehr';
    if (obj.damage_type === 'shotgun') return 'Schrotflinte';
    if (obj.damage_type === 'smg') return 'Maschinenpistole';
    if (obj.damage_type === 'assault_rifle') return 'Sturmgewehr';
    if (obj.damage_type === 'taser') return 'Elektroschocker';
  };

  return {
    ...(obj.id && { id: obj.id }),
    ...(obj.date_created && { date_created: obj.date_created }),
    ...(obj.date_updated && { date_updated: obj.date_updated }),
    ...transformUtilStoreImage(obj, 'store_image'),
    ...(obj.name && { name: obj.name }),
    ...(obj.slug && { slug: obj.slug }),
    ...(obj.manufacturer && { manufacturer: getManufacturer() }),
    ...(obj.classification && {
      classification: obj.classification,
      classification_label: getClassificationLabel(),
    }),
    ...(obj.damage_type && {
      damage_type: obj.damage_type,
      damage_type_label: getDamageType(),
    }),
    ...(obj.fire_modes && {
      fire_modes: obj.damage_type,
    }),
    ...(obj.weight && { weight: obj.weight }),
    ...(obj.calibre && { calibre: obj.calibre }),
    ...(obj.statistics && { statistics: obj.statistics }),
    ...(obj.fire_rates && { fire_rates: obj.fire_rates }),
    ...(obj.muzzle_velocity && { muzzle_velocity: obj.muzzle_velocity }),
    ...(obj.locktime && { locktime: obj.locktime }),
    ...(obj.effective_range && { effective_range: obj.effective_range }),
    ...(obj.max_range && { max_range: obj.max_range }),
    ...(obj.sight && { sight: transformAttachment(obj.sight) }),
    ...(obj.magazine && { magazine: transformAttachment(obj.magazine) }),
    ...(obj.content && { content: obj.content }),
  };
}
