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

export default function (obj: any, shipList?: any) {
  const getVariants = () => {
    if (!shipList) return;
    const variants: Array<IVariant> = [];
    obj.variants?.map((i: IVariant) => variants.push(transformShip(shipList?.find((e: IVariant) => e.id === i.id))));
    return variants;
  };
  const getLoaners = () => {
    if (!shipList) return;
    const loaners: Array<ILoaner> = [];
    obj.loaners?.map((i: ILoaner) => loaners.push(transformShip(shipList?.find((e: ILoaner) => e.id === i.id))));
    return loaners;
  };
  const getManufacturer = () => (obj.manufacturer ? transformCompany(obj.manufacturer) : null);
  const getProductionState = () => {
    if (obj.productionStatus === 'in-concept') return 'Im Konzept';
    if (obj.productionStatus === 'in-production') return 'In Produktion';
    if (obj.productionStatus === 'flight-ready') return 'Flugfertig';
  };

  return {
    id: obj.id,
    erkulId: obj.erkulIdentifier,
    smId: obj.smIdentifier,
    flId: obj.flIdentifier,
    scId: obj.scIdentifier,
    apiId: obj.apiid,
    rsiId: obj.rsiId,
    name: obj.name,
    p4kName: obj.p4kname,
    rsiName: obj.rsiName,
    slug: obj.slug,
    flSlug: obj.flSlug,
    rsiSlug: obj.rsiSlug,
    p4kMode: obj.p4kMode,
    p4kId: obj.p4kId,
    p4kVersion: obj.p4kVersion,
    manufacturer: getManufacturer(),
    storePage: obj.storeUrl,
    salesPage: obj.salesPageUrl,
    length: obj.length,
    beam: obj.beam,
    height: obj.height,
    mass: obj.mass,
    cargo: obj.cargo,
    price: obj.price,
    pledgePrice: obj.pledgePrice,
    onSale: obj.onSale,
    productionState: getProductionState(),
    readyPatch: obj.readyPatch,
    career: obj.career,
    hydrogenTank: obj.hydrogenTank,
    quantumTank: obj.quantumTank,
    minCrew: obj.minCrew,
    maxCrew: obj.maxCrew,
    scmSpeed: obj.scmSpeed,
    maxSpeed: obj.maxSpeed,
    maxGroundSpeed: obj.maxGroundSpeed,
    zeroToScm: obj.zeroToScm,
    zeroToMax: obj.zeroToMax,
    scmToZero: obj.scmToZero,
    maxToZero: obj.maxToZero,
    pitchMax: obj.pitchMax,
    yawMax: obj.yawMax,
    rollMax: obj.rollMax,
    xaxisAcceleration: obj.xaxisAcceleration,
    yaxisAcceleration: obj.yaxisAcceleration,
    zaxisAcceleration: obj.zaxisAcceleration,
    brochure: obj.brochure?.id,
    holo: obj.holo?.id,
    holoColored: obj.holoColored,
    hardpoints: obj.hardoints,
    weaponHardpoints: obj.weaponHardpoints,
    variants: getVariants(),
    loaners: getLoaners(),
    paints: obj.paints,
    classification: obj.classification,
    focus: obj.focus,
    lastUpdatedAt: obj.lastUpdatedAt,
    insuranceClaimTime: obj.insuranceClaimTime,
    insuranceExpeditedClaimTime: obj.insuranceExpeditedClaimTime,
    insuranceExpeditedCost: obj.insuranceExpeditedCost,
    storeImage: obj.storeImage?.id,
    // gallery: getGallery(),
    commercialVideo: obj.commercialVideoId,
    tags: obj.tags,
    // groundVehicle: getGroundVehicle(),
    role: obj.role,
    description: obj.description,
    history: obj.history,
    // rating: getRating,
    size: obj.size,
    sortSize: obj.sortSize,
    // modules: getModules(),
  };
}
