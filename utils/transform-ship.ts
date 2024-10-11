import transformUtilStoreImage from './transform-util-store_image';

interface IVariant {
  id: string;
  name: string;
  slug: string;
}
interface ILoaner {
  id: string;
  name: string;
  slug: string;
}

export default function transformShip(obj: any, shipList?: any) {
  // const getVariants = () => {
  //   if (!shipList) return;
  //   const variants: Array<IVariant> = [];
  //   obj.variants?.map((i: IVariant) => variants.push(transformShip(shipList?.find((e: IVariant) => e.id === i.id))));
  //   return variants;
  // };
  const getVariants = () => {
    return obj.variants.filter((e: any) => e?.variant_id).map((variant: any) => transformShip(variant.variant_id));
    // const loaners = [];
    // const loanerData = [];
    // obj.loaners.forEach((rawLoaner) => {
    //   if (!loaners.includes(rawLoaner.id)) {
    //     loaners.push(rawLoaner.id);
    //     loanerData.push(transformShip(shipList.find((e) => e.id === rawLoaner.id)));
    //   }
    // });
    // return loanerData;
  };
  const getLoaners = () => {
    if (!obj.loaners || obj.production_status === 'flight-ready') return;
    return obj.loaners.filter((e: any) => e?.loaner_id).map((loaner: any) => transformShip(loaner.loaner_id));
    // const loaners = [];
    // const loanerData = [];
    // obj.loaners.forEach((rawLoaner) => {
    //   if (!loaners.includes(rawLoaner.id)) {
    //     loaners.push(rawLoaner.id);
    //     loanerData.push(transformShip(shipList.find((e) => e.id === rawLoaner.id)));
    //   }
    // });
    // return loanerData;
  };
  const getAllLoaners = () => {
    if (!obj.loaners) return;
    return obj.loaners.filter((e: any) => e?.loaner_id).map((loaner: any) => transformShip(loaner.loaner_id));
    // const loaners = [];
    // const loanerData = [];
    // obj.loaners.forEach((rawLoaner) => {
    //   if (!loaners.includes(rawLoaner.id)) {
    //     loaners.push(rawLoaner.id);
    //     loanerData.push(transformShip(shipList.find((e) => e.id === rawLoaner.id)));
    //   }
    // });
    // return loanerData;
  };
  const getManufacturer = () => (obj.manufacturer ? transformCompany(obj.manufacturer) : null);
  const getProductionState = () => {
    if (obj.productionStatus === 'in-concept') return 'Im Konzept';
    if (obj.productionStatus === 'in-production') return 'In Produktion';
    if (obj.productionStatus === 'flight-ready') return 'Flugfertig';
  };
  const getSizeLabels: () => { size_label_short: string; size_label: string } | undefined = () => {
    switch (obj.size) {
      case 'v':
        return { size_label_short: 'V', size_label: 'Bodenfahrzeug' };
      case '1':
        return { size_label_short: 'XXS', size_label: 'Snub' };
      case '2':
        return { size_label_short: 'XS', size_label: 'Sehr Klein' };
      case '3':
        return { size_label_short: 'S', size_label: 'Klein' };
      case '4':
        return { size_label_short: 'M', size_label: 'Mittel' };
      case '5':
        return { size_label_short: 'L', size_label: 'Groß' };
      case '6':
        return { size_label_short: 'XL', size_label: 'Capital' };
      default:
        return { size_label_short: obj.size, size_label: obj.size };
    }
  };
  const getClassLabel: () => string | undefined = () => {
    switch (obj.classification) {
      case 'starter':
        return 'Starter';
      case 'exploration':
        return 'Erkundung';
      case 'cargo':
        return 'Fracht';
      case 'combat':
        return 'Kampf';
      case 'racing':
        return 'Rennen';
      case 'specialized':
        return 'Spezialisiert';
      case 'multi-role':
        return 'Mehrzweck';
      case 'personal_transport':
        return 'Personentransport';
      case 'support':
        return 'Unterstützung';
      case 'industrial':
        return 'Industriell';
      default:
        return obj.classification;
    }
  };
  const getFocusLabels: () => string | undefined = () => {
    return obj.focuses.map((focus: string) => {
      switch (focus) {
        case 'light_freight':
          return 'Leichte Fracht';
        case 'medium_freight':
          return 'Mittlere Fracht';
        case 'heavy_freight':
          return 'Schwere Fracht';
        case 'light_transport':
          return 'Leichter Transport';
        case 'medium_transport':
          return 'Mittlerer Transport';
        case 'heavy_transport':
          return 'Schwerer Transport';
        case 'military_transport':
          return 'Militärischer Transport';
        case 'light_data':
          return 'Leichte Daten';
        case 'medium_data':
          return 'Mittlere Daten';
        case 'heavy_data':
          return 'Schwere Daten';
        case 'light_refining':
          return 'Leichte Raffinierung';
        case 'medium_refining':
          return 'Mittlere Raffinierung';
        case 'heavy_refining':
          return 'Schwere Raffinierung';
        case 'light_salvage':
          return 'Leichte Bergung';
        case 'medium_salvage':
          return 'Mittlere Bergung';
        case 'heavy_salvage':
          return 'Schwere Bergung';
        case 'light_mining':
          return 'Leichter Bergbau';
        case 'medium_mining':
          return 'Mittlerer Bergbau';
        case 'heavy_mining':
          return 'Schwerer Bergbau';
        case 'light_repair':
          return 'Leichte Reparatur';
        case 'medium_repair':
          return 'Mittlere Reparatur';
        case 'heavy_repair':
          return 'Schwere Reparatur';
        case 'light_refueling':
          return 'Leichtes Betanken';
        case 'medium_refueling':
          return 'Mittleres Betanken';
        case 'heavy_refueling':
          return 'Schweres Betanken';
        case 'light_construction':
          return 'Leichte Konstruktion';
        case 'medium_construction':
          return 'Mittlere Konstruktion';
        case 'heavy_construction':
          return 'Schwere Konstruktion';
        case 'light_science':
          return 'Leichte Wissenschaft';
        case 'medium_science':
          return 'Mittlere Wissenschaft';
        case 'heavy_science':
          return 'Schwere Wissenschaft';
        case 'light_carrier':
          return 'Leichter Träger';
        case 'medium_carrier':
          return 'Mittlerer Träger';
        case 'heavy_carrier':
          return 'Schwerer Träger';
        case 'luxury':
          return 'Luxus';
        case 'modular':
          return 'Modular';
        case 'medical':
          return 'Medizinisch';
        case 'touring':
          return 'Touring';
        case 'expedition':
          return 'Expedition';
        case 'exploration':
          return 'Erkundung';
        case 'pathfinder':
          return 'Pfadfinder';
        case 'reporting':
          return 'Berichterstattung';
        case 'light_fighter':
          return 'Leichter Jäger';
        case 'medium_fighter':
          return 'Mittlerer Jäger';
        case 'heavy_fighter':
          return 'Schwerer Jäger';
        case 'light_gunship':
          return 'Leichtes Kanonenboot';
        case 'medium_gunship':
          return 'Mittleres Kanonenboot';
        case 'heavy_gunship':
          return 'Schweres Kanonenboot';
        case 'snub':
          return 'Snub';
        case 'frigate':
          return 'Fregatte';
        case 'destroyer':
          return 'Zerstörer';
        case 'corvette':
          return 'Korvette';
        case 'recon':
          return 'Aufklärung';
        case 'bomber':
          return 'Bomber';
        case 'interdiction':
          return 'Interdiction';
        case 'dropship':
          return 'Landungsschiff';
        case 'stealth':
          return 'Stealth';
        case 'minelayer':
          return 'Minelayer';
        case 'e-war':
          return 'E-War';
        case 'anti_air':
          return 'Luftabwehr';
        case 'ground_combat':
          return 'Bodenkampf';
        case 'tow_ship':
          return 'Abschleppschiff';
        default:
          return focus;
      }
    });
  };

  const getRating = () => {
    const score = obj.rating.ratings.reduce(
      (total: number, rating: any) =>
        total +
        (rating.grade === 'bad'
          ? 5
          : rating.grade === 'medium'
          ? 10
          : rating.grade === 'good'
          ? 15
          : rating.grade === 'very_good'
          ? 20
          : 0),
      0,
    );
    return {
      ...obj.rating,
      ...(obj.rating.user_created && { user_created: transformUser(obj.rating.user_created) }),
      ...(obj.rating.ratings && {
        ratings: obj.rating.ratings.map((rating: any) => ({
          category: rating.category,
          reason: rating.reason,
          grade: rating.grade,
          grade_points:
            rating.grade === 'bad'
              ? 5
              : rating.grade === 'medium'
              ? 10
              : rating.grade === 'good'
              ? 15
              : rating.grade === 'very_good'
              ? 20
              : 0,
          grade_label:
            rating.grade === 'bad'
              ? 'Schlecht'
              : rating.grade === 'medium'
              ? 'Mittel'
              : rating.grade === 'good'
              ? 'Gut'
              : rating.grade === 'very_good'
              ? 'Sehr Gut'
              : 'Unbekannt',
        })),
        score,
      }),
    };
  };

  return {
    ...(obj.id && { id: obj.id }),
    ...(obj.date_created && { date_created: obj.date_created }),
    ...(obj.date_updated && { date_updated: obj.date_updated }),
    ...(obj.erkul_id && { erkul_id: obj.erkul_id }),
    ...(obj.p4k_id && { p4k_id: obj.p4k_id }),
    ...(obj.fl_id && { fl_id: obj.fl_id }),
    ...(obj.sm_id && { sm_id: obj.sm_id }),
    ...(obj.name && { name: obj.name }),
    ...(obj.p4k_name && { p4k_name: obj.p4k_name }),
    ...(obj.slug && { slug: obj.slug }),
    ...(obj.p4k_mode && { p4k_mode: obj.p4k_mode }),
    ...(obj.p4k_version && { p4k_version: obj.p4k_version }),
    ...(obj.manufacturer && { manufacturer: getManufacturer() }),
    ...(obj.store_url && { store_url: obj.store_url }),
    ...(obj.sales_url && { sales_url: obj.sales_url }),
    ...(obj.length && { length: obj.length }),
    ...(obj.beam && { beam: obj.beam }),
    ...(obj.height && { height: obj.height }),
    ...(obj.mass && { mass: obj.mass }),
    ...(obj.cargo && { cargo: obj.cargo }),
    ...(obj.price && {
      price:
        obj.price
          .split('.')[0]
          ?.toString()
          .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.') +
        ',' +
        obj.price.split('.')[1].slice(0, 2),
    }),
    ...(obj.pledge_price && {
      pledge_price:
        obj.pledge_price
          .split('.')[0]
          ?.toString()
          .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.') +
        ',' +
        obj.pledge_price.split('.')[1].slice(0, 2),
    }),
    ...(obj.on_sale && { on_sale: obj.on_sale }),
    ...(obj.production_status && {
      production_status:
        obj.production_status === 'flight-ready'
          ? 'Flugfertig'
          : obj.production_status === 'in-production'
          ? 'In Produktion'
          : 'In Konzept',
      production_status_value: obj.production_status,
    }),
    ...(obj.live_patch && { live_patch: obj.live_patch }),
    ...(obj.production_note && { production_note: obj.production_note }),
    ...(obj.crew_min && { crew_min: obj.crew_min }),
    ...(obj.crew_max && { crew_max: obj.crew_max }),
    ...(obj.scm_speed && { scm_speed: obj.scm_speed }),
    ...(obj.max_speed && { max_speed: obj.max_speed }),
    ...(obj.zero_to_scm && { zero_to_scm: obj.zero_to_scm }),
    ...(obj.zero_to_max && { zero_to_max: obj.zero_to_max }),
    ...(obj.scm_to_zero && { scm_to_zero: obj.scm_to_zero }),
    ...(obj.max_to_zero && { max_to_zero: obj.max_to_zero }),
    ...(obj.quantum_fuel_tanks && { quantum_fuel_tanks: obj.quantum_fuel_tanks }),
    ...(obj.hydrogen_fuel_tanks && { hydrogen_fuel_tanks: obj.hydrogen_fuel_tanks }),
    ...(obj.pitch && { pitch: obj.pitch }),
    ...(obj.yaw && { yaw: obj.yaw }),
    ...(obj.roll && { roll: obj.roll }),
    ...(obj.acceleration_main && { acceleration_main: obj.acceleration_main }),
    ...(obj.acceleration_retro && { acceleration_retro: obj.acceleration_retro }),
    ...(obj.acceleration_vtol && { acceleration_vtol: obj.acceleration_vtol }),
    ...(obj.acceleration_maneuvering && { acceleration_maneuvering: obj.acceleration_maneuvering }),
    ...(obj.brochure && { brochure: obj.brochure }),
    ...(obj.hologram && { hologram: obj.hologram }),
    ...(obj.holoColored && { holoColored: obj.holoColored }),
    ...(obj.size && {
      size: obj.size,
      ...getSizeLabels(),
    }),
    // variants: getVariants(),
    ...(obj.loaners && obj.loaners[0] && { loaners: getLoaners() }),
    ...(obj.loaners && obj.loaners[0] && { all_loaners: getAllLoaners() }),
    ...(obj.variants && obj.variants[0] && { variants: getVariants() }),
    // loaners: shipList,
    // paints: obj.paints,
    // classification: obj.classification,
    ...(obj.classification && { classification: obj.classification, classification_label: getClassLabel() }),
    ...(obj.focuses && { focuses: obj.focuses, focus_labels: getFocusLabels() }),
    // focus: obj.focus,
    // lastUpdatedAt: obj.lastUpdatedAt,
    ...(obj.insurance_claim_time && {
      insurance_claim_time: parseFloat(obj.insurance_claim_time),
    }),
    ...(obj.insurance_expedited_time && { insurance_expedited_time: parseFloat(obj.insurance_expedited_time) }),
    ...(obj.insurance_expedited_cost && {
      insurance_expedited_cost:
        obj.insurance_expedited_cost
          .split('.')[0]
          ?.toString()
          .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.') +
        ',' +
        obj.insurance_expedited_cost.split('.')[1].slice(0, 2),
    }),
    ...transformUtilStoreImage(obj, 'store_image'),
    ...(obj.gallery && { gallery: obj.gallery.map((obj: any) => obj.directus_files_id) }),
    ...(obj.commercial_video_id && { commercial_video_id: obj.commercial_video_id }),
    ...(obj.commercials && typeof obj.commercials[0] === 'object' && obj.commercials[0].commercial_id
      ? { commercials: obj.commercials.map((obj) => ({ id: obj.commercial_id.id, type: obj.commercial_id.type })) }
      : {}),
    ...(obj.rating && typeof obj.rating === 'object' ? { rating: getRating() } : {}),
    // tags: obj.tags,
    // groundVehicle: getGroundVehicle(),
    // role: obj.role,
    ...(obj.description && { description: obj.description }),
    ...(obj.history && { history: obj.history }),
    // rating: getRating,
    // size: obj.size,
    // sortSize: obj.sortSize,
    ...(obj.modules && obj.modules[0] && { modules: obj.modules.map((module) => transformShipModule(module)) }),
  };
}
