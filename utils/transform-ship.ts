interface IVariant {
  id: String;
  name: String;
  slug: String;
}
interface ILoaner {
  id: String;
  name: String;
  slug: String;
}

export default function transformShip(obj: any, shipList?: any) {
  const getVariants = () => {
    if (!shipList) return;
    const variants: Array<IVariant> = [];
    obj.variants?.map((i: IVariant) => variants.push(transformShip(shipList?.find((e: IVariant) => e.id === i.id))));
    return variants;
  };
  const getLoaners = () => {
    if (!shipList || !obj.loaners || obj.production_status === 'flight-ready') return;
    const loaners = [];
    const loanerData = [];
    obj.loaners.forEach((rawLoaner) => {
      if (!loaners.includes(rawLoaner.id)) {
        loaners.push(rawLoaner.id);
        loanerData.push(transformShip(shipList.find((e) => e.id === rawLoaner.id)));
      }
    });
    return loanerData;
  };
  const getManufacturer = () => (obj.manufacturer ? transformCompany(obj.manufacturer) : null);
  const getProductionState = () => {
    if (obj.productionStatus === 'in-concept') return 'Im Konzept';
    if (obj.productionStatus === 'in-production') return 'In Produktion';
    if (obj.productionStatus === 'flight-ready') return 'Flugfertig';
  };

  return {
    ...(obj.id && { id: obj.id }),
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
    ...(obj.pledgePrice && {
      pledgePrice:
        obj.pledgePrice
          .split('.')[0]
          ?.toString()
          .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.') +
        ',' +
        obj.pledgePrice.split('.')[1].slice(0, 2),
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
    ...(obj.holo && { holo: obj.holo }),
    ...(obj.holoColored && { holoColored: obj.holoColored }),
    // variants: getVariants(),
    ...(obj.loaners && { loaners: getLoaners() }),
    // loaners: shipList,
    // paints: obj.paints,
    // classification: obj.classification,
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
    ...(obj.store_image && { store_image: obj.store_image }),
    ...(obj.gallery && { gallery: obj.gallery.map((obj: any) => obj.directus_files_id) }),
    ...(obj.commercial_video_id && { commercial_video_id: obj.commercial_video_id }),
    ...(obj.commercial && { commercial: obj.commercial }),
    // tags: obj.tags,
    // groundVehicle: getGroundVehicle(),
    // role: obj.role,
    ...(obj.description && { description: obj.description }),
    ...(obj.history && { history: obj.history }),
    // rating: getRating,
    // size: obj.size,
    // sortSize: obj.sortSize,
    // modules: obj.modules ? obj.modules.map((module) => transformShipModule(module)) : null,
  };
}
