type ExternalShipData = {
  prices: {
    price: number | null;
    pledge_price: number | null;
    warbond_price: number | null;
    onSale: boolean | null;
  };
  stores: Record<string, unknown>[] | null;
  uexData: Record<string, unknown> | null;
  rsiData: Record<string, unknown> | null;
};

const emptyExternalShipData = (): ExternalShipData => ({
  prices: {
    price: null,
    pledge_price: null,
    warbond_price: null,
    onSale: null,
  },
  stores: null,
  uexData: null,
  rsiData: null,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const getResponseData = <T extends Record<string, unknown>>(payload: unknown): T[] =>
  isRecord(payload) && Array.isArray(payload.data)
    ? payload.data.filter((entry): entry is T => isRecord(entry))
    : [];

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const uexId = typeof query.uexId === 'string' && query.uexId.trim() ? query.uexId.trim() : null;
  const rsiId = typeof query.rsiId === 'string' && query.rsiId.trim() ? query.rsiId.trim() : null;

  if (!uexId && !rsiId) {
    return emptyExternalShipData();
  }

  const [pledgeResult, purchasesResult, vehiclesResult, rsiResult] = await Promise.allSettled([
    uexId ? $fetch(`https://api.uexcorp.uk/2.0/vehicles_prices?id_vehicle=${encodeURIComponent(uexId)}`) : null,
    uexId ? $fetch(`https://api.uexcorp.uk/2.0/vehicles_purchases_prices?id_vehicle=${encodeURIComponent(uexId)}`) : null,
    uexId ? $fetch('https://api.uexcorp.uk/2.0/vehicles') : null,
    rsiId ? $fetch('https://robertsspaceindustries.com/ship-matrix/index') : null,
  ]);

  const result = emptyExternalShipData();

  const pledgeRaw = pledgeResult.status === 'fulfilled' ? pledgeResult.value : null;
  const purchasesRaw = purchasesResult.status === 'fulfilled' ? purchasesResult.value : null;
  const vehiclesRaw = vehiclesResult.status === 'fulfilled' ? vehiclesResult.value : null;
  const rsiRaw = rsiResult.status === 'fulfilled' ? rsiResult.value : null;

  const pledgeData = getResponseData<Record<string, unknown>>(pledgeRaw);
  const purchasesData = getResponseData<Record<string, unknown>>(purchasesRaw);
  const vehiclesData = getResponseData<Record<string, unknown>>(vehiclesRaw);
  const rsiData = getResponseData<Record<string, unknown>>(rsiRaw);

  const pledgeUsd =
    pledgeData.find((price) => String(price.currency ?? '').toUpperCase() === 'USD') ?? null;
  const purchase = purchasesData[0] ?? null;

  result.prices = {
    price: typeof purchase?.price_buy_avg === 'number' ? purchase.price_buy_avg : null,
    pledge_price: typeof pledgeUsd?.price === 'number' ? pledgeUsd.price : null,
    warbond_price: typeof pledgeUsd?.price_warbond === 'number' ? pledgeUsd.price_warbond : null,
    onSale: typeof pledgeUsd?.on_sale === 'boolean' ? pledgeUsd.on_sale : null,
  };
  result.stores = purchasesData.length ? purchasesData : null;
  result.uexData = vehiclesData.find((vehicle) => String(vehicle.id ?? '') === String(uexId)) ?? null;
  result.rsiData = rsiData.find((vehicle) => String(vehicle.id ?? '') === String(rsiId)) ?? null;

  return result;
});
