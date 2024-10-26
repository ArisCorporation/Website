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
    if (obj.classification === 'smg') return 'Maschinenpistole';
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
    if (obj.damage_type === 'ballistic') return 'Ballistisch';
    if (obj.damage_type === 'explosive') return 'Explosiv';
    if (obj.damage_type === 'electrons') return 'Elektronen';
    if (obj.damage_type === 'laser') return 'Laser';
    if (obj.damage_type === 'plasma') return 'Plasma';
  };
  const getFireMode = (fm: string) => {
    if (fm === 'charge') return 'Aufladen';
    if (fm === 'fully_automatic') return 'Vollautomatisch';
    if (fm === 'single_shot' || fm === 'single') return 'Einzel';
    if (fm === 'burst_shot' || fm === 'burst') return 'Salve';
  };
  const getFireRates = (rates: { name: string; value: number }[]) => {
    return rates.map((rate) => ({
      name: rate.name,
      value: rate.value,
      label: getFireMode(rate.name),
    }));
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
      fire_modes: obj.fire_modes.map((fm: string) => getFireMode(fm)),
    }),
    ...(obj.weight && { weight: obj.weight }),
    ...(obj.calibre && { calibre: obj.calibre }),
    ...(obj.statistics && { statistics: obj.statistics }),
    ...(obj.fire_rates && { fire_rates: getFireRates(obj.fire_rates) }),
    ...(obj.muzzle_velocity && { muzzle_velocity: obj.muzzle_velocity }),
    ...(obj.locktime && { locktime: obj.locktime }),
    ...(obj.effective_range && { effective_range: obj.effective_range }),
    ...(obj.max_range && { max_range: obj.max_range }),
    ...(obj.sight && { sight: transformAttachment(obj.sight) }),
    ...(obj.magazine && { magazine: transformAttachment(obj.magazine) }),
    ...(obj.barrel && { barrel: transformAttachment(obj.barrel) }),
    ...(obj.underbarrel && { underbarrel: transformAttachment(obj.underbarrel) }),
    ...(obj.content && { content: obj.content }),
  };
}
