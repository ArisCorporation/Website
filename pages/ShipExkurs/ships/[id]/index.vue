<script setup lang="ts">
import { computed, ref, toRefs, watch, watchEffect } from 'vue';
import { Spherical, Vector3 } from 'three';
import { readItems } from '@directus/sdk';

const userSettings = useUserSettingsStore();
const { se: settings } = storeToRefs(userSettings);

const { directus, readItem } = useCMS();
const { params } = useRoute();
const { copy, isSupported: clipboardIsSupported } = useClipboard();
const toast = useToast();
const store_image_view = ref(true);
const modalStore = useModalStore();

const selectedTab = ref(0);

// const { data } = await useAsyncData('SHIP:DATA', () =>
//   directus.request(
//     readItem('ship_variants', params.slug.toString(), {
//       fields: ['*.*'],
//     }),
//   ),
// );

const { data } = await useAsyncData(String(params.id), async () => {
  const arisData = await directus.request(
    readItem('ship_variants', String(params.id), {
      fields: [
        '*.*',
        'configurations.*.*.*',
        'configurations.hardpoints.*',
        'configurations.hardpoints.hardpoint.*',
        'configurations.hardpoints.hardpoint.item.*',
        'configurations.hardpoints.hardpoint.item.manufacturer.*',
        'configurations.hardpoints.item.*',
        'configurations.hardpoints.item.manufacturer.*',
        'configurations.hardpoints.hardpoint.DATA.*',
        'configurations.hardpoints.hardpoint.DATA.manufacturer.*',
        'ship_variant_configurations.*',
        'ship_variant_configurations.hardpoints.*',
        'ship_variant_configurations.hardpoints.item.*',
        'ship_variant_configurations.hardpoints.item.manufacturer.*',
        'ship_variant_configurations.hardpoints.hardpoint.*',
        'ship_variant_configurations.hardpoints.hardpoint.DATA.*',
        'ship_variant_configurations.hardpoints.hardpoint.DATA.manufacturer.*',
        'hull.manufacturer.*',
        'rating.*.*',
      ],
      sort: ['name'],
    }),
  );

  const buildData = await directus.request(
    readItems('builds', {
      limit: 1,
      sort: ['-date_created'],
    }),
  );

  const uexId = arisData?.external_refs?.find((ref: any) => ref.source === 'UEX')?.id;
  const rsiId = arisData?.external_refs?.find((ref: any) => ref.source === 'RSI')?.id;

  const [pledgeRaw, purchasesRaw, vehiclesRaw, rsiRaw] = await Promise.all([
    $fetch(`https://api.uexcorp.uk/2.0/vehicles_prices?id_vehicle=${uexId}`),
    $fetch(`https://api.uexcorp.uk/2.0/vehicles_purchases_prices?id_vehicle=${uexId}`),
    $fetch(`https://api.uexcorp.uk/2.0/vehicles`),
    $fetch('https://robertsspaceindustries.com/ship-matrix/index'),
  ]);

  const pledgeUSD = pledgeRaw?.data?.find((p: any) => p.currency === 'USD') ?? null;
  const purchases = purchasesRaw?.data?.[0] ?? null;
  const uexVehicleData = vehiclesRaw?.data?.find((v: any) => String(v.id) === String(uexId)) ?? null;

  const rsiData = rsiRaw.data?.find((v: any) => String(v.id) === String(rsiId)) ?? null;

  const score = arisData?.rating?.ratings?.reduce(
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
    ...arisData,
    build: buildData[0],
    prices: {
      price: purchases?.price_buy_avg ?? null,
      pledge_price: pledgeUSD?.price ?? null,
      warbond_price: pledgeUSD?.price_warbond ?? null,
      onSale: pledgeUSD?.on_sale ?? null,
    },
    uexData: uexVehicleData,
    stores: purchasesRaw?.data[0] ? purchasesRaw?.data : null,
    rsiData: rsiData ?? null,
    rating: arisData?.rating
      ? {
          ...arisData?.rating,
          ...(arisData?.rating?.user_created && { user_created: transformUser(arisData?.rating?.user_created) }),
          ...(arisData?.rating?.ratings && {
            ratings: arisData?.rating?.ratings?.map((rating: any) => ({
              category: rating?.category,
              reason: rating?.reason,
              grade: rating?.grade,
              grade_points:
                rating?.grade === 'bad'
                  ? 5
                  : rating?.grade === 'medium'
                    ? 10
                    : rating?.grade === 'good'
                      ? 15
                      : rating?.grade === 'very_good'
                        ? 20
                        : 0,
              grade_label:
                rating?.grade === 'bad'
                  ? 'Schlecht'
                  : rating?.grade === 'medium'
                    ? 'Mittel'
                    : rating?.grade === 'good'
                      ? 'Gut'
                      : rating?.grade === 'very_good'
                        ? 'Sehr Gut'
                        : 'Unbekannt',
            })),
            score,
          }),
        }
      : null,
  };
});

// if (!data?.value) {
//   throw createError({
//     statusCode: 404,
//     statusMessage: 'Daten konnten nicht aus der Schiffsdatenbank geladen werden.',
//     fatal: true,
//   });
// }

// const commercialSources = data?.value.commercials?.map((obj: { id: string; type: string }) => ({
//   type: obj.type,
//   src: config.public.fileBase + obj.id,
// }));

const storeCols: TableColumn<any>[] = [
  { key: 'terminal_name', label: 'Store' },
  { key: 'price_buy', label: 'Preis' },
];

const handleShare = () => {
  try {
    if (!clipboardIsSupported || !location?.href)
      throw new Error('clipboard is not supported or location.href is not set');
    copy(location.href);
    toast.add({ title: 'URL in Zwischenablage kopiert!' });
  } catch {
    toast.add({ title: 'Es konnte leider nichts in die Zwischenablage kopiert werden.', color: 'red' });
  }
};

const tablist = computed<any[]>(() => [
  { id: '1', header: 'Austattung' },
  ...(data?.value?.history ? [{ id: '2', header: 'Geschichte' }] : []),
  ...(Array.isArray(data?.value?.gallery) && data?.value.gallery.length ? [{ id: '3', header: 'Gallerie' }] : []),
  ...(data?.value?.commercial_video_id && Array.isArray(data?.value?.commercials) && data?.value.commercials.length
    ? [{ id: '4', header: 'Commercial' }]
    : []),
  ...(data?.value?.stores ? [{ id: '5', header: 'Kaufen' }] : []),
  ...(data?.value?.rating ? [{ id: '6', header: 'Bewertung' }] : []),
]);

const formatLabel = (key?: string | null) =>
  (key ?? '')
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const isPlainObject = (value: unknown): value is Record<string, any> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const normalizeTextValue = (value: unknown) => {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  if (!normalized.length) return null;
  if (normalized.toUpperCase() === 'UNDEFINED') return null;
  if (/placeholder/i.test(normalized)) return null;
  if (/^unknown manufacturer$/i.test(normalized)) return null;
  return normalized;
};

const hasRenderableValue = (value: unknown): boolean => {
  if (typeof value === 'number') return Number.isFinite(value) && Math.abs(value) < 1e20;
  if (typeof value === 'boolean') return true;
  if (typeof value === 'string') return Boolean(normalizeTextValue(value));
  if (Array.isArray(value)) return value.some(hasRenderableValue);
  if (isPlainObject(value)) return Object.values(value).some(hasRenderableValue);
  return false;
};

const formatDisplayValue = (value: unknown, maximumFractionDigits = 2): string | null => {
  if (!hasRenderableValue(value)) return null;

  if (typeof value === 'number') {
    if (value !== 0 && Math.abs(value) < 0.01) return value.toExponential(2);
    return Number.isInteger(value)
      ? value.toLocaleString('de-DE')
      : value.toLocaleString('de-DE', { maximumFractionDigits });
  }

  if (typeof value === 'boolean') return value ? 'Ja' : 'Nein';
  if (typeof value === 'string') return normalizeTextValue(value);

  if (Array.isArray(value)) {
    const entries = value.map((entry) => formatDisplayValue(entry, maximumFractionDigits)).filter(Boolean);
    return entries.length ? entries.join(', ') : null;
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value)
      .map(([key, entryValue]) => {
        const formatted = formatDisplayValue(entryValue, maximumFractionDigits);
        return formatted ? `${formatLabel(key)}: ${formatted}` : null;
      })
      .filter(Boolean);
    return entries.length ? entries.join(', ') : null;
  }

  return null;
};

const formatCategoryValue = (value: unknown) => {
  const normalized = normalizeTextValue(value);
  if (!normalized) return null;
  return formatLabel(/^[A-Z0-9_]+$/.test(normalized) ? normalized.toLowerCase() : normalized);
};

const formatCodeValue = (value: unknown) => {
  const normalized = normalizeTextValue(value);
  if (!normalized) return null;
  return formatLabel(normalized.replace(/^hardpoint_/i, ''));
};

const pickFirstValue = (...values: unknown[]) => values.find(hasRenderableValue);

const normalizeCategory = (value: unknown) =>
  String(value ?? '')
    .replace(/[\s_-]+/g, '')
    .toLowerCase();

type ComponentEntry = {
  id: string;
  name: string;
  size?: number | null;
  grade?: string | null;
  class?: string | null;
  manufacturer?: string | null;
  type?: string | null;
  subtype?: string | null;
  category?: string | null;
  code?: string | null;
  quantity?: number | null;
  stats?: Record<string, any> | null;
};

type HardpointComponent = ComponentEntry & {
  parentId: string | null;
  childIds: string[];
  categoryKey: string;
  categoryRaw?: string | null;
};

type HardpointTreeNode = HardpointComponent & { children?: HardpointTreeNode[]; depth?: number };

type DetailRow = {
  title: string;
  content: string;
  suffix?: string | null;
  prefix?: string | null;
  fullWidth?: boolean;
};

type DetailSection = {
  title: string;
  rows: DetailRow[];
};

type DetailRecord = Record<string, unknown>;

type DetailRowOptions = {
  suffix?: string;
  prefix?: string;
  fullWidth?: boolean;
  formatter?: (value: unknown) => string | null;
  maximumFractionDigits?: number;
};

type ManualGroupDefinition = {
  id: string;
  label: string;
  categories: string[];
  render?: 'list' | 'tree';
  fallback?: boolean;
};

const selectedComponentId = ref<string | null>(null);
const selectedComponent = computed<HardpointComponent | null>(
  () => components.value.find((c) => String(c.id) === selectedComponentId.value) ?? components.value[0] ?? null,
);
const filterTerm = ref('');
const componentDetailOpen = ref(false);

const configurations = computed(
  () =>
    data?.value?.ship_variant_configurations ?? data?.value?.ship_configurations ?? data?.value?.configurations ?? [],
);

const selectedConfigurationCode = ref<string | null>(
  configurations.value?.[0]?.code ?? configurations.value?.[0]?.id ?? null,
);

const selectedConfiguration = computed(
  () =>
    configurations.value.find((cfg: any) => cfg?.code === selectedConfigurationCode.value) ??
    configurations.value[0] ??
    null,
);

const configurationOptions = computed(() =>
  configurations.value.map((cfg: any) => ({
    label: cfg?.code ?? cfg?.name ?? 'Unbenannt',
    value: cfg?.code ?? cfg?.id,
  })),
);

watch(
  () => selectedConfigurationCode.value,
  () => {
    selectedComponentId.value = null;
    componentDetailOpen.value = false;
  },
);

watchEffect(() => {
  if (!selectedConfigurationCode.value && configurations.value.length) {
    selectedConfigurationCode.value = configurations.value[0]?.code ?? configurations.value[0]?.id ?? null;
  }
});

const normalizeHardpointNode = (hp: any, index: number, parentId: string | null): HardpointComponent => {
  const hardpointData = hp?.hardpoint ?? hp ?? {};
  const itemData = hp?.item ?? hardpointData?.item ?? hardpointData?.DATA ?? hardpointData?.data ?? {};
  const id = String(hardpointData?.id ?? hp?.id ?? itemData?.id ?? `hp-${index}`);
  const rawChilds = Array.isArray(hardpointData?.childs ?? hp?.childs) ? (hardpointData?.childs ?? hp?.childs) : [];
  const childIds = rawChilds
    .map((child: any) => {
      if (typeof child === 'object') return child?.id ?? child?.hardpoint?.id ?? child?.hardpoint ?? null;
      return child;
    })
    .filter(Boolean)
    .map((childId: any) => String(childId));

  const categoryRaw = hardpointData?.category ?? hp?.category ?? itemData?.category ?? null;
  const categoryKey = normalizeCategory(categoryRaw ?? itemData?.type ?? itemData?.subtype ?? itemData?.class);

  return {
    id,
    name: itemData?.name ?? hardpointData?.code ?? hardpointData?.path ?? 'Unbekannt',
    size: itemData?.size ?? hardpointData?.size ?? null,
    grade: itemData?.grade ?? null,
    class: itemData?.class ?? hardpointData?.class ?? null,
    manufacturer: itemData?.manufacturer?.name ?? hardpointData?.manufacturer?.name ?? itemData?.manufacturer ?? null,
    type: itemData?.type ?? hardpointData?.category ?? 'Komponente',
    subtype: itemData?.subtype ?? itemData?.type ?? null,
    category: categoryRaw ?? null,
    code: hardpointData?.code ?? null,
    quantity: hp?.quantity ?? hp?.item_quantity ?? hardpointData?.item_quantity ?? hardpointData?.meta?.quantity ?? 1,
    stats: itemData?.stats ?? hardpointData?.meta?.stats ?? null,
    parentId,
    childIds,
    categoryKey,
    categoryRaw,
  };
};

const flattenHardpoints = (hardpoints: any[] = [], parentId: string | null = null, acc: HardpointComponent[] = []) => {
  hardpoints.forEach((hp, index) => {
    const node = normalizeHardpointNode(hp, index, parentId);
    acc.push(node);

    const rawChilds = Array.isArray(hp?.hardpoint?.childs ?? hp?.childs) ? (hp?.hardpoint?.childs ?? hp?.childs) : [];
    const childObjects = rawChilds.filter((child: any) => typeof child === 'object');
    if (childObjects.length) flattenHardpoints(childObjects, node.id, acc);
  });
  return acc;
};

const hardpoints = computed<HardpointComponent[]>(() =>
  flattenHardpoints(selectedConfiguration.value?.hardpoints ?? []),
);

const components = computed<HardpointComponent[]>(() => hardpoints.value);

const hardpointMap = computed(() => {
  const map = new Map<string, HardpointComponent>();
  hardpoints.value.forEach((hp) => map.set(String(hp.id), hp));
  return map;
});

const GROUP_DEFINITIONS: ManualGroupDefinition[] = [
  {
    id: 'weapons',
    label: 'Waffen',
    categories: ['weapongun', 'weapondefensive', 'turret', 'turretbase', 'missile', 'missilerack', 'missilelauncher'],
    render: 'tree',
  },
  { id: 'shields', label: 'Schilde', categories: ['shield'] },
  { id: 'powerplants', label: 'Power Plant', categories: ['powerplant'] },
  { id: 'coolers', label: 'Kühler', categories: ['cooler'] },
  { id: 'quantum', label: 'Quantum Drive', categories: ['quantumdrive', 'jumpdrive'] },
  { id: 'quantumfuel', label: 'Quantum Treibstoff', categories: ['quantumfueltank'] },
  { id: 'fuel', label: 'Treibstoff', categories: ['fuelintake', 'fueltank'] },
  { id: 'thrusters_main', label: 'Haupttriebwerke', categories: ['mainthruster'] },
  { id: 'thrusters_maneuver', label: 'Manövertriebwerke', categories: ['manneuverthruster'] },
  { id: 'radar', label: 'Radar & Scanner', categories: ['radar'] },
  { id: 'life_support', label: 'Life Support', categories: ['lifesupportgenerator'] },
  { id: 'cargo', label: 'Cargo', categories: ['cargogrid'] },
  { id: 'docking', label: 'Docking', categories: ['dockingcollar'] },
  { id: 'armor', label: 'Panzerung', categories: ['armor'] },
  {
    id: 'controllers',
    label: 'Kontrollsysteme',
    categories: [
      'shieldcontroller',
      'coolercontroller',
      'weaponcontroller',
      'fuelcontroller',
      'commscontroller',
      'energycontroller',
      'flightcontroller',
      'capacitorassignmentcontroller',
      'relay',
    ],
  },
  { id: 'utility', label: 'Sonstige', categories: [], fallback: true },
];

const matchesGroup = (hp: HardpointComponent, def: ManualGroupDefinition) =>
  def.categories.length ? def.categories.includes(hp.categoryKey) : Boolean(def.fallback);

const flattenTreeWithDepth = (
  nodes: HardpointTreeNode[],
  depth = 0,
  acc: HardpointTreeNode[] = [],
): HardpointTreeNode[] => {
  nodes.forEach((node) => {
    const clone: HardpointTreeNode = { ...node, depth };
    acc.push(clone);
    if (node.children?.length) flattenTreeWithDepth(node.children, depth + 1, acc);
  });
  return acc;
};

const buildTreeForGroup = (allowedIds: Set<string>) => {
  const cache = new Map<string, HardpointTreeNode>();
  const cloneNode = (id: string): HardpointTreeNode | null => {
    if (!allowedIds.has(id)) return null;
    if (cache.has(id)) return cache.get(id) as HardpointTreeNode;
    const base = hardpointMap.value.get(id);
    if (!base) return null;
    const node: HardpointTreeNode = { ...base, children: [] };
    cache.set(id, node);
    node.children = (base.childIds ?? [])
      .map((childId) => cloneNode(String(childId)))
      .filter(Boolean) as HardpointTreeNode[];
    return node;
  };

  const roots = [...allowedIds]
    .map((id) => cloneNode(id))
    .filter((node): node is HardpointTreeNode => Boolean(node))
    .filter((node) => {
      const parentId = node.parentId ? String(node.parentId) : null;
      return !parentId || !allowedIds.has(parentId);
    });

  return { roots, flattened: flattenTreeWithDepth(roots) };
};

const filterTreeByTerm = (nodes: HardpointTreeNode[], predicate: (node: HardpointTreeNode) => boolean) =>
  nodes
    .map((node) => {
      const children = node.children ? filterTreeByTerm(node.children, predicate) : [];
      const selfMatches = predicate(node);
      if (selfMatches || children.length) {
        return { ...node, children };
      }
      return null;
    })
    .filter(Boolean) as HardpointTreeNode[];

const componentGroups = computed(() => {
  const assigned = new Set<string>();

  const groups = GROUP_DEFINITIONS.map((definition) => {
    const items = hardpoints.value.filter(
      (hp) => !assigned.has(hp.id) && (definition.fallback ? true : matchesGroup(hp, definition)),
    );

    if (!items.length) return null;

    items.forEach((hp) => assigned.add(hp.id));

    if (definition.render === 'tree') {
      const allowedIds = new Set(items.map((hp) => hp.id));
      const { roots, flattened } = buildTreeForGroup(allowedIds);
      return {
        ...definition,
        render: definition.render ?? 'list',
        tree: roots,
        items: flattened,
      };
    }

    return {
      ...definition,
      render: definition.render ?? 'list',
      items,
    };
  }).filter(Boolean) as Array<
    ManualGroupDefinition & { render: 'list' | 'tree'; items: HardpointTreeNode[]; tree?: HardpointTreeNode[] }
  >;

  return groups;
});

const filteredComponentGroups = computed(() => {
  const term = filterTerm.value.trim().toLowerCase();
  const predicate = (c: HardpointTreeNode) =>
    [c.name, c.type, c.subtype, c.manufacturer, c.grade, c.category, c.code]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(term));

  if (!term) return componentGroups.value;

  return componentGroups.value
    .map((group) => {
      if (group.render === 'tree') {
        const filteredTree = filterTreeByTerm(group.tree ?? [], predicate);
        return {
          ...group,
          tree: filteredTree,
          items: flattenTreeWithDepth(filteredTree),
        };
      }
      return {
        ...group,
        items: group.items.filter(predicate),
      };
    })
    .filter((group) => (group.render === 'tree' ? group.tree?.length : group.items.length));
});

const COMMON_STD_ITEM_KEYS = new Set([
  'ClassName',
  'Description',
  'DescriptionData',
  'DescriptionText',
  'DimensionOverrides',
  'Distortion',
  'Durability',
  'Grade',
  'HeatConnection',
  'Height',
  'Interactions',
  'Length',
  'Manufacturer',
  'Name',
  'Ports',
  'PowerConnection',
  'ResourceNetwork',
  'Size',
  'Tags',
  'Type',
  'UUID',
  'Width',
]);

const makeDetailRow = (title: string, value: unknown, options: DetailRowOptions = {}): DetailRow | null => {
  const content = options.formatter
    ? options.formatter(value)
    : formatDisplayValue(value, options.maximumFractionDigits ?? 2);

  if (!content) return null;

  return {
    title,
    content,
    suffix: options.suffix ?? null,
    prefix: options.prefix ?? null,
    fullWidth: options.fullWidth ?? false,
  };
};

const makeDetailSection = (title: string, rows: Array<DetailRow | null | false | undefined>) => {
  const filteredRows = rows.filter(Boolean) as DetailRow[];
  return filteredRows.length ? { title, rows: filteredRows } : null;
};

const compactSections = (sections: Array<DetailSection | null | undefined>) =>
  sections.filter(Boolean) as DetailSection[];

const getComponentStats = (component?: ComponentEntry | null) =>
  isPlainObject(component?.stats) ? component?.stats : {};

const getStdItem = (component?: ComponentEntry | null) => {
  const stats = getComponentStats(component);
  return isPlainObject(stats.stdItem) ? stats.stdItem : {};
};

const getDescriptionData = (stdItem: DetailRecord) =>
  isPlainObject(stdItem.DescriptionData) ? stdItem.DescriptionData : {};

const getPowerConnection = (stdItem: DetailRecord) =>
  isPlainObject(stdItem.PowerConnection) ? stdItem.PowerConnection : {};

const getHeatConnection = (stdItem: DetailRecord) =>
  isPlainObject(stdItem.HeatConnection) ? stdItem.HeatConnection : {};

const getResourceStates = (stdItem: DetailRecord) =>
  Array.isArray(stdItem.ResourceNetwork?.States) ? stdItem.ResourceNetwork.States : [];

const getSignature = (stdItem: DetailRecord) => {
  const stateWithSignature = getResourceStates(stdItem).find((state) => {
    const stateRecord = isPlainObject(state) ? state : {};
    return isPlainObject(stateRecord.Signature);
  });
  return isPlainObject(stateWithSignature) ? stateWithSignature.Signature : null;
};

const getResourceRate = (stdItem: DetailRecord, resource: string, type?: string) => {
  for (const state of getResourceStates(stdItem)) {
    const stateRecord = isPlainObject(state) ? state : {};
    const deltas = Array.isArray(stateRecord.Deltas) ? stateRecord.Deltas : [];
    for (const delta of deltas) {
      const deltaRecord = isPlainObject(delta) ? delta : {};
      const matchesResource = deltaRecord.Resource === resource || deltaRecord.GeneratedResource === resource;
      if (matchesResource && (!type || deltaRecord.Type === type)) {
        return pickFirstValue(deltaRecord.Rate, deltaRecord.GeneratedRate, deltaRecord.Discharge);
      }
    }
  }
  return null;
};

const getUniquePortSizes = (stdItem: DetailRecord) => {
  const ports = Array.isArray(stdItem.Ports) ? stdItem.Ports : [];
  const sizes = [...new Set(ports.map((port) => formatDisplayValue(isPlainObject(port) ? port.Size : null)).filter(Boolean))];
  return sizes.length ? sizes.map((size) => `S${size}`).join(', ') : null;
};

const getPortCount = (stdItem: DetailRecord) => {
  const ports = Array.isArray(stdItem.Ports) ? stdItem.Ports : [];
  return ports.length || null;
};

const getDamageRows = (damage: DetailRecord) =>
  Object.entries(damage)
    .map(([type, value]) => makeDetailRow(formatLabel(type), value))
    .filter(Boolean) as DetailRow[];

const getDamageTotal = (damage: DetailRecord) => {
  if (!isPlainObject(damage)) return null;
  const values = Object.values(damage).filter((value): value is number => typeof value === 'number' && value > 0);
  return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
};

const SCU_BOX_EDGE_LENGTH = 1.25;
const SCU_BOX_VOLUME = SCU_BOX_EDGE_LENGTH ** 3;

const cargoGridStats = computed<DetailRecord[]>(() =>
  Array.isArray(data?.value?.stats?.cargo_grids)
    ? data.value.stats.cargo_grids.filter((grid: unknown): grid is DetailRecord => isPlainObject(grid))
    : [],
);

const getCargoGridData = (component: HardpointComponent) => {
  const cargoComponents = components.value.filter((entry) => entry.categoryKey === 'cargogrid');
  const cargoIndex = cargoComponents.findIndex((entry) => entry.id === component.id);
  return cargoIndex >= 0 ? cargoGridStats.value[cargoIndex] ?? null : null;
};

const getCargoGridContainer = (component: HardpointComponent) => {
  const stdItem = getStdItem(component);
  if (isPlainObject(stdItem.InventoryContainer)) return stdItem.InventoryContainer;
  if (isPlainObject(stdItem.ResourceContainer)) return stdItem.ResourceContainer;
  return getCargoGridData(component);
};

const getCargoGridBoxSizeInScu = (size: unknown) => {
  if (!isPlainObject(size)) return null;
  const x = typeof size.x === 'number' ? size.x : null;
  const y = typeof size.y === 'number' ? size.y : null;
  const z = typeof size.z === 'number' ? size.z : null;
  if (![x, y, z].every((value): value is number => typeof value === 'number' && value > 0)) return null;
  return (x * y * z) / SCU_BOX_VOLUME;
};

const buildSupportSection = (stdItem: DetailRecord, title = 'Versorgung') => {
  const power = getPowerConnection(stdItem);
  const signature = getSignature(stdItem);

  return makeDetailSection(title, [
    makeDetailRow('Leistungsbedarf', pickFirstValue(power.PowerDraw, getResourceRate(stdItem, 'Power'))),
    makeDetailRow('Grundlast', power.PowerBase),
    makeDetailRow('EM', pickFirstValue(signature?.EM, power.PowerToEM)),
    makeDetailRow('IR', signature?.IR),
  ]);
};

const buildWeaponSections = (component: HardpointComponent) => {
  const stdItem = getStdItem(component);
  const weapon = isPlainObject(stdItem.Weapon) ? stdItem.Weapon : {};
  const ammunition = isPlainObject(weapon.Ammunition)
    ? weapon.Ammunition
    : isPlainObject(stdItem.Ammunition)
      ? stdItem.Ammunition
      : {};
  const mode = Array.isArray(weapon.Modes) ? weapon.Modes[0] ?? null : null;
  const consumption = isPlainObject(weapon.Consumption) ? weapon.Consumption : {};
  const damage = isPlainObject(ammunition.ImpactDamage) ? ammunition.ImpactDamage : {};

  return compactSections([
    makeDetailSection(component.categoryKey === 'weapondefensive' ? 'Gegenmaßnahmen' : 'Leistung', [
      makeDetailRow('Feuerart', pickFirstValue(mode?.Name, mode?.FireType), { formatter: formatCategoryValue }),
      makeDetailRow('Schuss / Min.', mode?.RoundsPerMinute),
      makeDetailRow('Reichweite', ammunition.Range, { suffix: 'm' }),
      makeDetailRow('Projektil', ammunition.Speed, { suffix: 'm/s' }),
    ]),
    makeDetailSection('Schaden', [
      makeDetailRow('Schaden / Schuss', pickFirstValue(mode?.DamagePerShot, getDamageTotal(damage))),
      makeDetailRow('DPS', mode?.DamagePerSecond),
      ...getDamageRows(damage),
    ]),
    makeDetailSection('Verbrauch', [
      makeDetailRow('Munition / Schuss', mode?.AmmoPerShot),
      makeDetailRow('Kapazität', ammunition.Capacity),
      makeDetailRow('Kosten / Schuss', consumption.CostPerBullet),
      makeDetailRow('Regen / s', consumption.RequestedRegenPerSec),
      makeDetailRow('Cooldown', consumption.Cooldown, { suffix: 's' }),
    ]),
    buildSupportSection(stdItem),
  ]);
};

const buildMissileSections = (component: HardpointComponent) => {
  const stdItem = getStdItem(component);
  const missile = isPlainObject(stdItem.Missile) ? stdItem.Missile : {};
  const damage = isPlainObject(missile.Damage) ? missile.Damage : {};
  const additionalRows = Object.entries(missile)
    .filter(([key]) => key !== 'Damage')
    .map(([key, value]) => makeDetailRow(formatLabel(key), value));

  return compactSections([
    makeDetailSection('Schaden', [
      makeDetailRow('Gesamtschaden', getDamageTotal(damage)),
      ...getDamageRows(damage),
    ]),
    makeDetailSection('Flugprofil', additionalRows),
  ]);
};

const buildMissileRackSections = (component: HardpointComponent) => {
  const stdItem = getStdItem(component);
  const missileRack = isPlainObject(stdItem.MissileRack) ? stdItem.MissileRack : {};

  return compactSections([
    makeDetailSection('Rack', [
      makeDetailRow('Kapazität', missileRack.Count),
      makeDetailRow('Slots', getPortCount(stdItem)),
      makeDetailRow('Kompatible Größe', getUniquePortSizes(stdItem)),
    ]),
    buildSupportSection(stdItem),
  ]);
};

const buildShieldSections = (component: HardpointComponent) => {
  const stdItem = getStdItem(component);
  const shield = isPlainObject(stdItem.Shield) ? stdItem.Shield : {};

  return compactSections([
    makeDetailSection('Kapazität', [
      makeDetailRow('Schildstärke', shield.MaxShieldHealth, { suffix: 'HP' }),
      makeDetailRow('Reservepool', shield.ReservePoolMaxHealthRatio),
      makeDetailRow('Drain-Faktor', shield.ReservePoolDrainRateRatio),
    ]),
    makeDetailSection('Regeneration', [
      makeDetailRow('Regen / s', shield.MaxShieldRegen, { suffix: 'HP/s' }),
      makeDetailRow('Delay nach Treffer', shield.DamagedDelay, { suffix: 's' }),
      makeDetailRow('Delay nach Ausfall', shield.DownedDelay, { suffix: 's' }),
      makeDetailRow('Decay', shield.DecayRatio),
    ]),
    buildSupportSection(stdItem, 'Signatur'),
  ]);
};

const buildCoolerSections = (component: HardpointComponent) => {
  const stdItem = getStdItem(component);
  const cooler = isPlainObject(stdItem.Cooler) ? stdItem.Cooler : {};
  const heat = getHeatConnection(stdItem);

  return compactSections([
    makeDetailSection('Kühlleistung', [
      makeDetailRow('Cooling Rate', cooler.CoolingRate),
      makeDetailRow('Max Cooling Rate', heat.MaxCoolingRate),
      makeDetailRow('Heat Suppression', cooler.SuppressionHeatFactor),
      makeDetailRow('IR Suppression', cooler.SuppressionIRFactor),
    ]),
    buildSupportSection(stdItem),
  ]);
};

const buildPowerPlantSections = (component: HardpointComponent) => {
  const stdItem = getStdItem(component);
  const powerPlant = isPlainObject(stdItem.PowerPlant) ? stdItem.PowerPlant : {};
  const heat = getHeatConnection(stdItem);

  return compactSections([
    makeDetailSection('Energie', [
      makeDetailRow('Output', powerPlant.Output),
      makeDetailRow('Leistungsbedarf', getPowerConnection(stdItem).PowerDraw),
      makeDetailRow('Netzleistung', getResourceRate(stdItem, 'Power')),
    ]),
    makeDetailSection('Thermik', [
      makeDetailRow('Max Cooling Rate', heat.MaxCoolingRate),
      makeDetailRow('Overheat', heat.OverheatTemperature),
      makeDetailRow('Start IR', heat.StartIRTemperature),
    ]),
    buildSupportSection(stdItem, 'Signatur'),
  ]);
};

const buildQuantumSections = (component: HardpointComponent) => {
  const stdItem = getStdItem(component);
  const quantumDrive = isPlainObject(stdItem.QuantumDrive) ? stdItem.QuantumDrive : {};

  return compactSections([
    makeDetailSection('Reise', [
      makeDetailRow('Fuel Rate', quantumDrive.FuelRate, { maximumFractionDigits: 6 }),
      makeDetailRow('Disconnect Range', quantumDrive.disconnectRange, { suffix: 'm' }),
      makeDetailRow('Flight Heat', quantumDrive.Heat?.inFlightThermalEnergyDraw),
    ]),
    buildSupportSection(stdItem),
  ]);
};

const buildTankSections = (component: HardpointComponent) => {
  const stdItem = getStdItem(component);
  const resourceContainer = isPlainObject(stdItem.ResourceContainer) ? stdItem.ResourceContainer : {};
  const capacity = isPlainObject(resourceContainer.Capacity) ? resourceContainer.Capacity : {};
  const unit = formatDisplayValue(capacity.UnitName) ?? null;
  const generatedResource =
    getResourceStates(stdItem)
      .flatMap((state) => {
        const stateRecord = isPlainObject(state) ? state : {};
        return Array.isArray(stateRecord.Deltas) ? stateRecord.Deltas : [];
      })
      .find((delta) => normalizeTextValue(isPlainObject(delta) ? delta.GeneratedResource : null));
  const generatedResourceLabel = isPlainObject(generatedResource) ? generatedResource.GeneratedResource : null;

  return compactSections([
    makeDetailSection('Tank', [
      makeDetailRow('Kapazität', pickFirstValue(capacity.Value, capacity.SCU), { suffix: unit }),
      makeDetailRow('Füllgrad', resourceContainer.DefaultFillFraction),
      makeDetailRow('Massenzuschlag', resourceContainer.Mass),
    ]),
    makeDetailSection('Netzwerk', [
      makeDetailRow('Ressource', generatedResourceLabel, { formatter: formatCategoryValue }),
      makeDetailRow('Rate', pickFirstValue(getResourceRate(stdItem, 'Fuel'), getResourceRate(stdItem, 'QuantumFuel'))),
    ]),
  ]);
};

const buildFuelIntakeSections = (component: HardpointComponent) => {
  const stdItem = getStdItem(component);
  const intake = isPlainObject(stdItem.FuelIntake) ? stdItem.FuelIntake : {};

  return compactSections([
    makeDetailSection('Aufnahme', [
      makeDetailRow('Min. Rate', intake.MinRate),
      makeDetailRow('Rate', intake.Rate),
    ]),
    buildSupportSection(stdItem),
  ]);
};

const buildThrusterSections = (component: HardpointComponent) => {
  const stdItem = getStdItem(component);
  const thruster = isPlainObject(stdItem.Thruster) ? stdItem.Thruster : {};

  return compactSections([
    makeDetailSection('Schub', [
      makeDetailRow('Schubkapazität', thruster.thrustCapacity),
      makeDetailRow('Thruster-Typ', thruster.thrusterType, { formatter: formatCategoryValue }),
      makeDetailRow('Atmosphären-Faktor', thruster.maxSupportedAtmosphericEfficiency),
      makeDetailRow('Nur in VTOL', thruster.onlyActiveInVTOL),
    ]),
    makeDetailSection('Verbrauch', [
      makeDetailRow('Fuel / 10kN', thruster.fuelBurnRatePer10KNewton, { maximumFractionDigits: 4 }),
      makeDetailRow('Netz-Fuelrate', getResourceRate(stdItem, 'Fuel')),
    ]),
    buildSupportSection(stdItem),
  ]);
};

const buildRadarSections = (component: HardpointComponent) => {
  const stdItem = getStdItem(component);
  const radar = isPlainObject(stdItem.Radar) ? stdItem.Radar : {};

  return compactSections([
    makeDetailSection('Erfassung', [
      makeDetailRow('Cooldown', radar.Cooldown, { suffix: 's' }),
      makeDetailRow('Sensitivität', radar.Sensitivity),
    ]),
    buildSupportSection(stdItem, 'Signatur'),
  ]);
};

const buildFlightControllerSections = (component: HardpointComponent) => {
  const stdItem = getStdItem(component);
  const ifcs = isPlainObject(stdItem.Ifcs) ? stdItem.Ifcs : {};
  const afterburner = isPlainObject(ifcs.Afterburner) ? ifcs.Afterburner : {};

  return compactSections([
    makeDetailSection('Flugprofil', [
      makeDetailRow('SCM Speed', ifcs.scmSpeed),
      makeDetailRow('Boost Forward', ifcs.boostSpeedForward),
      makeDetailRow('Boost Backward', ifcs.boostSpeedBackward),
      makeDetailRow('Max Speed', ifcs.maxSpeed),
    ]),
    makeDetailSection('Rotation', [
      makeDetailRow('Pitch', ifcs.Pitch),
      makeDetailRow('Yaw', ifcs.Yaw),
      makeDetailRow('Roll', ifcs.Roll),
    ]),
    makeDetailSection('Afterburner', [
      makeDetailRow('Capacitor Max', afterburner.CapacitorMax),
      makeDetailRow('Regen / s', afterburner.CapacitorRegenPerSec),
      makeDetailRow('Idle Cost', afterburner.CapacitorAfterburnerIdleCost),
    ]),
  ]);
};

const buildTurretSections = (component: HardpointComponent) => {
  const stdItem = getStdItem(component);

  return compactSections([
    makeDetailSection('Montage', [
      makeDetailRow('Waffenslots', getPortCount(stdItem)),
      makeDetailRow('Port-Größen', getUniquePortSizes(stdItem)),
      makeDetailRow('Typ', pickFirstValue(stdItem.Type, component.subtype), { formatter: formatCategoryValue }),
    ]),
    buildSupportSection(stdItem),
  ]);
};

const buildCargoSections = (component: HardpointComponent) => {
  const cargoContainer = getCargoGridContainer(component);
  const unit = formatDisplayValue(pickFirstValue(cargoContainer?.unitName, cargoContainer?.UnitName)) ?? 'SCU';
  const maxSize = pickFirstValue(cargoContainer?.maxSize, cargoContainer?.MaxSize);

  return compactSections([
    makeDetailSection('Cargo Grid', [
      makeDetailRow('Max. Boxgröße', getCargoGridBoxSizeInScu(maxSize), { suffix: 'SCU' }),
      makeDetailRow('Grid-Kapazität', cargoContainer?.SCU, { suffix: unit }),
    ]),
  ]);
};

const buildFallbackSections = (component: HardpointComponent) => {
  const stdItem = getStdItem(component);

  return compactSections(
    Object.entries(stdItem)
      .filter(([key]) => !COMMON_STD_ITEM_KEYS.has(key))
      .map(([key, value]) => {
        if (isPlainObject(value)) {
          return makeDetailSection(formatLabel(key), [
            ...Object.entries(value).map(([entryKey, entryValue]) =>
              makeDetailRow(formatLabel(entryKey), entryValue, {
                fullWidth: isPlainObject(entryValue) || Array.isArray(entryValue),
              }),
            ),
          ]);
        }

        return makeDetailSection('Systemwerte', [
          makeDetailRow(formatLabel(key), value, { fullWidth: true }),
        ]);
      }),
  );
};

const selectedComponentStdItem = computed(() => getStdItem(selectedComponent.value));
const selectedComponentDescription = computed(
  () =>
    normalizeTextValue(selectedComponentStdItem.value?.DescriptionText) ??
    normalizeTextValue(selectedComponentStdItem.value?.Description),
);

const selectedComponentDisplayName = computed(
  () =>
    normalizeTextValue(selectedComponent.value?.name) ??
    formatCodeValue(selectedComponent.value?.code) ??
    formatCategoryValue(selectedComponent.value?.category ?? selectedComponent.value?.type) ??
    'Komponente',
);

const selectedComponentDisplayType = computed(
  () => formatCategoryValue(selectedComponent.value?.category ?? selectedComponent.value?.type) ?? 'Komponente',
);

const selectedComponentDisplayManufacturer = computed(
  () =>
    normalizeTextValue(selectedComponent.value?.manufacturer) ??
    normalizeTextValue(selectedComponentStdItem.value?.Manufacturer?.Name),
);

const selectedComponentDisplayClass = computed(
  () =>
    normalizeTextValue(selectedComponent.value?.class) ??
    normalizeTextValue(getDescriptionData(selectedComponentStdItem.value).Class),
);

const selectedComponentDisplayGrade = computed(
  () =>
    normalizeTextValue(getDescriptionData(selectedComponentStdItem.value).Grade) ??
    formatDisplayValue(selectedComponent.value?.grade),
);

const selectedComponentDisplaySubtype = computed(() => {
  const subtype = formatCategoryValue(selectedComponent.value?.subtype);
  return subtype === selectedComponentDisplayType.value ? null : subtype;
});

const selectedComponentOverviewRows = computed<DetailRow[]>(() => {
  const component = selectedComponent.value;
  if (!component) return [];

  return [
    makeDetailRow('Hersteller', selectedComponentDisplayManufacturer.value),
    makeDetailRow('Typ', selectedComponentDisplayType.value),
    makeDetailRow('Subtyp', selectedComponentDisplaySubtype.value),
    makeDetailRow('Größe', component.size ? `S${component.size}` : null),
    makeDetailRow('Klasse', selectedComponentDisplayClass.value),
    makeDetailRow('Grade', selectedComponentDisplayGrade.value),
    makeDetailRow('Menge', formatDisplayValue(component.quantity)),
  ].filter(Boolean) as DetailRow[];
});

const selectedComponentDetailSections = computed<DetailSection[]>(() => {
  const component = selectedComponent.value;
  if (!component) return [];

  switch (component.categoryKey) {
    case 'weapongun':
    case 'weapondefensive':
      return buildWeaponSections(component);
    case 'missile':
      return buildMissileSections(component);
    case 'missilerack':
    case 'missilelauncher':
      return buildMissileRackSections(component);
    case 'shield':
      return buildShieldSections(component);
    case 'cooler':
      return buildCoolerSections(component);
    case 'powerplant':
      return buildPowerPlantSections(component);
    case 'quantumdrive':
    case 'jumpdrive':
      return buildQuantumSections(component);
    case 'quantumfueltank':
    case 'fueltank':
      return buildTankSections(component);
    case 'fuelintake':
      return buildFuelIntakeSections(component);
    case 'mainthruster':
    case 'manneuverthruster':
      return buildThrusterSections(component);
    case 'radar':
      return buildRadarSections(component);
    case 'flightcontroller':
      return buildFlightControllerSections(component);
    case 'turret':
    case 'turretbase':
      return buildTurretSections(component);
    case 'cargogrid':
      return buildCargoSections(component);
    default:
      return buildFallbackSections(component);
  }
});

const isComponentOpen = (id: string | number) => selectedComponentId.value === String(id);

const toggleComponent = (id: string | number) => {
  const stringId = String(id);
  const isSame = isComponentOpen(stringId);
  selectedComponentId.value = stringId;
  componentDetailOpen.value = true;
  if (isSame && componentDetailOpen.value) return;
};

watchEffect(() => {
  if (!selectedComponentId.value && components.value.length) {
    selectedComponentId.value = String(components.value[0].id);
    componentDetailOpen.value = true;
  }
});

watchEffect(() => {
  const allFiltered = filteredComponentGroups.value.flatMap((g) => g.items);
  if (!allFiltered.length) {
    selectedComponentId.value = null;
    componentDetailOpen.value = false;
    return;
  }
  if (!allFiltered.some((c) => String(c.id) === selectedComponentId.value)) {
    selectedComponentId.value = String(allFiltered[0].id);
    componentDetailOpen.value = true;
  }
});

function openModule(module: any) {
  modalStore.setData(module);
  modalStore.openModal(module.name, {
    type: 'module',
    hideCloseButton: true,
    hideXButton: true,
  });
}

const module_carousel_wrapper = ref();
const module_carousel = ref();
const { toggle: toggleModuleCarouselFS } = useFullscreen(module_carousel_wrapper);
const module_shortcuts_enabled = computed(() => modalStore.isModalOpen && modalStore.type === 'module');

const stars_props = {
  size: 0.1,
  sizeAttenuation: true,
  transparent: true,
  alphaTest: 0.01,
  alphaMap: null,
  count: 750,
  depth: 50,
  radius: 1000,
};

const stars_position = ref();
const stars_scale = ref();

const { radius: stars_radius, depth: stars_depth, count: stars_count } = toRefs(stars_props);

const setStars = () => {
  let circle = stars_radius.value + stars_depth.value;
  const increment = computed(() => stars_depth.value / stars_count.value);

  const positionArray: number[] = [];
  const scaleArray: number[] = Array.from({ length: stars_count.value }, () => (0.5 + 0.5 * Math.random()) * 4);

  const generateStars = (circle: number): Array<number> => {
    const starArray = new Vector3()
      .setFromSpherical(new Spherical(circle, Math.acos(1 - Math.random() * 2), Math.random() * 2 * Math.PI))
      .toArray();
    return starArray;
  };

  for (let i = 0; i < stars_count.value; i++) {
    circle -= increment.value * Math.random();
    positionArray.push(...generateStars(circle));
  }
  stars_position.value = new Float32Array(positionArray);
  stars_scale.value = new Float32Array(scaleArray);
};

watchEffect(() => {
  setStars();
});

defineShortcuts({
  f: () => module_shortcuts_enabled.value && toggleModuleCarouselFS(),
  arrowleft: () => module_shortcuts_enabled.value && module_carousel.value?.prev(),
  arrowright: () => module_shortcuts_enabled.value && module_carousel.value?.next(),
});

definePageMeta({
  layout: false,
});

useHead({
  title: data?.value?.name,
});
</script>

<template>
  <NuxtLayout name="ship-exkurs">
    <!--
    <template #modalContent>
      <div v-if="modalStore.type === 'module'">
        <DefaultPanel bg="bprimary" class="mx-auto mb-3 size-full">
          <div ref="module_carousel_wrapper" class="relative size-full">
            <UButton
              :icon="isModuleCarouselFS ? 'i-cil-fullscreen-exit' : 'i-cil-fullscreen'"
              color="gray"
              variant="ghost"
              class="absolute z-40 rotate-90 rounded-xl top-1 right-2"
              @click="isModuleCarouselFS ? exitModuleCarouselFS() : enterModuleCarouselFS()"
            />
            <UCarousel
              ref="module_carousel"
              :items="modalStore.data?.gallery"
              :ui="{
                item: `flex flex-none snap-center w-full ${isModuleCarouselFS ? 'max-h-screen' : 'aspect-[16/9]'}`,
                indicators: { wrapper: 'absolute flex items-center justify-center gap-3 bottom-4 inset-x-0 z-30' },
              }"
              class="relative w-auto"
              :class="[ship?
                isModuleCarouselFS
                  ? 'max-h-screen'
                  : 'max-h-[calc(100vh-4rem)] aspect-[16/9] border border-btertiary/75',
              ]"
              arrows
              indicators
            >
              <template #default="{ item }">
                <div class="relative flex size-full">
                  <NuxtImg :src="item" class="relative z-20 object-contain w-full h-auto m-auto" draggable="false" />
                  <NuxtImg
                    :src="item"
                    class="absolute z-10 object-cover w-full h-full m-auto blur"
                    :class="[isModuleCarouselFS ? 'brightness-0' : 'brightness-50']"
                    draggable="false"
                  />
                  <USkeleton class="absolute top-0 bottom-0 left-0 right-0 z-0 m-auto size-full" />
                </div>
              </template>

              <template #prev="{ onClick, disabled }">
                <UButton
                  color="gray"
                  class="absolute top-0 bottom-0 flex justify-center w-8 h-8 my-auto rounded-full p-1.5 left-4 group z-30"
                  :disabled="disabled"
                  @click="onClick"
                >
                  <UIcon
                    name="i-heroicons-chevron-left-20-solid"
                    class="flex-shrink-0 w-5 h-5 m-auto group-hover:text-aris-400"
                  />
                </UButton>
              </template>

              <template #next="{ onClick, disabled }">
                <UButton
                  color="gray"
                  class="absolute top-0 bottom-0 flex justify-center w-8 h-8 my-auto rounded-full p-1.5 right-4 group z-30"
                  :disabled="disabled"
                  @click="onClick"
                >
                  <UIcon
                    name="i-heroicons-chevron-right-20-solid"
                    class="flex-shrink-0 w-5 h-5 m-auto group-hover:text-aris-400"
                  />
                </UButton>
              </template>
            </UCarousel>
          </div>
        </DefaultPanel>
        <div>
          <TableParent
            title="Infobox"
            class="w-full mt-6 mb-8 xl:w-2/3"
            :class="[modalStore.data?.description ? 'float-right xl:ml-12' : 'ml-auto']"
          >
            <TableRow
              title="Hersteller"
              :content="modalStore.data?.manufacturer.name"
              :link="`/verseexkurs/companies/${modalStore.data?.manufacturer.slug}`"
              full-width
              @click="modalStore.data?.manufacturer.name && modalStore.closeModal()"
            />
            <TableRow title="Produktionsstatus" :content="modalStore.data?.production_status" full-width />
          </TableParent>
          <Editor :model-value="modalStore.data?.description" read-only />
        </div>
      </div>
    </template>
    -->
    <div class="flex flex-wrap justify-between">
      <div class="mt-auto">
        <h1 class="mb-0 text-industrial-400">
          <span class="text-tbase">{{ data?.hull?.manufacturer?.name }}</span> {{ data?.name }}
        </h1>
        <h4 class="mb-0 text-xs uppercase md:text-lg">
          <span class="text-dark-gray">Status: </span
          ><span class="italic text-light-gray">{{ data?.production_status }}</span>
        </h4>
      </div>
      <div class="ml-auto">
        <NuxtLink
          :to="`/verseexkurs/companies/${data?.hull?.manufacturer?.slug}`"
          class="aspect-[2/1] group w-40 md:w-64 h-auto relative block animate-link hover:scale-105 active:scale-95"
        >
          <DefaultPanel>
            <NuxtImg
              :src="data?.hull?.manufacturer?.logo"
              class="absolute top-0 bottom-0 left-0 right-0 z-10 h-24 m-auto pointer-events-none md:h-40 w-fit"
            />
            <video autoplay loop class="transition-opacity duration-500 opacity-0 size-full group-hover:opacity-100">
              <source :src="data?.hull?.manufacturer?.logo_background" type="video/webm" />
            </video>
          </DefaultPanel>
        </NuxtLink>
      </div>
    </div>
    <hr class="my-3" />
    <div class="grid grid-cols-3 gap-4">
      <div class="col-span-3 space-y-4 xl:col-span-2">
        <DefaultPanel bg="bprimary">
          <div class="h-[300px] lg:h-[600px] xl:h-[700px] w-full z-50 relative">
            <!-- <div v-if="data?.hologram" class="absolute z-40 rotate-10 top-1 right-2">
              <ButtonDefault :active="!store_image_view" @click="store_image_view = !store_image_view">
                3D
              </ButtonDefault>
            </div> -->
            <div v-if="!store_image_view" class="absolute z-40 space-x-2 rotate-10 bottom-1 right-2">
              <UTooltip :text="`Auto-Rotation ${settings.model_orbit ? 'deaktivieren' : 'aktivieren'}`">
                <ButtonDefault
                  :active="settings.model_orbit"
                  class="size-fit"
                  @click="settings.model_orbit = !settings.model_orbit"
                >
                  <UIcon name="i-lucide-orbit" class="flex size-5" />
                </ButtonDefault>
              </UTooltip>
              <UTooltip :text="`Zoom ${settings.model_zoom ? 'deaktivieren' : 'aktivieren'}`">
                <ButtonDefault
                  :active="settings.model_zoom"
                  class="size-fit"
                  @click="settings.model_zoom = !settings.model_zoom"
                >
                  <UIcon name="i-heroicons-magnifying-glass-16-solid" class="flex size-5" />
                </ButtonDefault>
              </UTooltip>
            </div>
            <NuxtImg
              v-if="store_image_view"
              :src="data?.thumbnail?.id"
              class="object-cover size-full"
              :style="{ 'object-position': data?.thumbnail.object_position }"
              loading="lazy"
            />
            <!-- <TresCanvas
              v-else-if="!store_image_view && data?.hologram"
              clear-color="#111"
              :tone-mapping-exposure="1"
              tone-mapping="ACESFilmicToneMapping"
              alpha
            >
              <TresPerspectiveCamera :position="[0, 20, 80]" />
              <TcientosOrbitControls
                ref="orbit_controls"
                :enable-zoom="settings.model_zoom"
                :auto-rotate="settings.model_orbit"
                :auto-rotate-speed="1"
                :max-distance="9999999"
                make-default
              />
              <TresPoints ref="starsRef">
                <TresBufferGeometry :position="[stars_position, 3]" :a-scale="[stars_scale, 1]" />
                <TresPointsMaterial
                  :size="stars_size"
                  :size-attenuation="stars_sizeAttenuation"
                  :transparent="stars_transparent"
                  :alpha-test="stars_alphaTest"
                  :alpha-map="stars_alphaMap"
                />
              </TresPoints>
              <Suspense>
                <TcientosUseGLTFComponent :path="$config.public.fileBase + data?.hologram" draco />
              </Suspense>

              <TresAmbientLight :intensity="1" />
              <TresDirectionalLight :position="[0, 100, 0]" :intensity="1.5" />
              <TresDirectionalLight :position="[0, -100, 0]" :intensity="1.5" />
            </TresCanvas> -->
          </div>
        </DefaultPanel>
        <DefaultPanel v-if="data?.description" bg="bprimary">
          <div class="p-4">
            <Editor :model-value="data?.description ?? ''" read-only />
          </div>
        </DefaultPanel>
      </div>
      <div class="col-span-3 space-y-4 xl:col-span-1">
        <TableParent title="Basis">
          <TableRow title="Länge" :content="data?.stats?.dimensions.length" suffix="M" third />
          <TableRow title="Breite" :content="data?.stats?.dimensions.width" suffix="M" third />
          <TableRow title="Höhe" :content="data?.stats?.dimensions.height" suffix="M" third />
          <TableHr />
          <TableRow
            title="Gewicht"
            :content="data?.stats?.mass && Math.round((data?.stats?.mass / 1000 + Number.EPSILON) * 100) / 100"
            suffix="T"
          />
          <TableRow title="Frachtkapazität" :content="data?.stats.cargo" suffix="SCU" />
          <TableHr />
          <TableRow title="Größe" :content="data?.stats?.size" full-width />
          <TableRow title="Karriere" :content="data?.stats?.career" />
          <TableRow title="Rolle" :content="data?.stats?.role" />
          <TableHr />
          <TableRow title="Min Crew" :content="data?.rsiData?.min_crew" />
          <TableRow title="Max Crew" :content="data?.stats.crew" />
          <TableHr />
          <TableRow title="Treibstoff" :content="data?.stats.propulsion.FuelCapacity" suffix="L" />
          <TableRow title="Quantum Treibstoff" :content="data?.stats.quantum.FuelCapacity" suffix="L" />
        </TableParent>
        <TableParent title="Kaufen">
          <TableRow title="Pledgewert" :content="data?.prices?.pledge_price" prefix="$" />
          <TableRow title="Kaufpreis" :content="data?.prices?.price" suffix="aUEC" />
          <!-- <TableHr />
          <TableRow title="Kaufbar bei" :content="null" /> -->
        </TableParent>
        <TableParent title="Geschwindigkeit">
          <TableRow title="SCM Geschwindigkeit" :content="data?.stats.flight.ScmSpeed" />
          <TableRow title="Afterburner Speed" :content="data?.stats.flight.BoostSpeedForward" />
          <TableHr />
          <TableRow
            title="Haupt-Triebwerk Beschl."
            :content="
              data?.stats.flight.Acceleration.Main &&
              Math.round((data?.stats.flight.Acceleration.Main + Number.EPSILON) * 100) / 100
            "
          />
          <TableRow
            title="Retro-Triebwerk Beschl."
            :content="
              data?.stats.flight.Acceleration.Retro &&
              Math.round((data?.stats.flight.Acceleration.Retro + Number.EPSILON) * 100) / 100
            "
          />
          <TableRow
            title="VTOL-Triebwerk Beschl."
            :content="
              data?.stats.flight.Acceleration.Vtol &&
              Math.round((data?.stats.flight.Acceleration.Vtol + Number.EPSILON) * 100) / 100
            "
          />
          <TableRow
            title="Manövrier-Triebwerk Beschl."
            :content="
              data?.stats.flight.Acceleration.Maneuvering &&
              Math.round((data?.stats.flight.Acceleration.Maneuvering + Number.EPSILON) * 100) / 100
            "
          />
        </TableParent>
        <TableParent title="Versicherung">
          <TableRow title="Zeit" :content="data?.stats.insurance.StandardClaimTime" suffix="Minuten" />
          <TableRow title="Besch. Zeit" :content="data?.stats.insurance.ExpeditedClaimTime" suffix="Minuten" />
          <TableRow title="Besch. Preis" :content="data?.stats.insurance.ExpeditedCost" suffix="aUEC" />
        </TableParent>
        <TableParent title="API Statistiken">
          <TableRow
            title="P4K-Daten Version"
            :content="`${data?.build?.game_version?.split('-')[0]} ${data?.build?.channel}`"
          />
          <TableRow
            title="Letztes Update der Daten"
            :content="data?.date_updated ? new Date(data?.date_updated).toLocaleDateString('de-DE') : null"
          />
        </TableParent>
        <div class="flex flex-wrap max-w-full gap-2">
          <NuxtLink :to="data?.uexData?.url_store" external target="_blank" class="flex-grow text-tbase">
            <ButtonDefault class="w-full text-sm">
              <p v-if="!data?.prices?.onSale" class="p-0">RSI Seite</p>
              <p v-else class="p-0">Aktuell zu verkaufen für: $ {{ data?.prices?.pledge_price || 'N/A' }}</p>
            </ButtonDefault>
          </NuxtLink>
          <ButtonDefault @click="handleShare">
            <UIcon name="i-heroicons-share" class="flex m-auto size-5" />
          </ButtonDefault>
          <UDropdown
            :items="[
              [
                ...(data?.uexData?.url_hotsite
                  ? [
                      {
                        label: 'RSI Promoseite',
                        icon: 'i-heroicons-presentation-chart-line',
                        to: data?.uexData?.url_hotsite,
                        external: true,
                        target: '_blank',
                      },
                    ]
                  : []),
                ...(data?.uexData?.url_brochure
                  ? [
                      {
                        label: 'Brochure',
                        icon: 'i-heroicons-book-open',
                        to: data?.uexData?.url_brochure,
                        external: true,
                        target: '_blank',
                      },
                    ]
                  : []),
                ...(!data?.uexData?.url_hotsite && !data?.uexData?.url_brochure
                  ? [
                      {
                        label: 'Keine Links vorhanden',
                        icon: 'i-heroicons-x-mark',
                        disabled: true,
                      },
                    ]
                  : []),
              ],
            ]"
            :popper="{ placement: 'bottom-start' }"
            :ui="{ width: 'w-56' }"
          >
            <ButtonDefault>
              <UIcon name="i-mdi-dots-vertical" class="flex m-auto size-5" />
            </ButtonDefault>
          </UDropdown>
        </div>
      </div>
    </div>
    <TabGroup v-if="tablist.length" :tablist="tablist" :store="selectedTab" :change="(i) => (selectedTab = i)" between>
      <template #tabcontent>
        <template v-if="selectedTab === tablist.findIndex((e) => e.id === '1')">
          <div class="flex flex-col gap-4 lg:flex-row">
            <DefaultPanel
              bg="bprimary"
              class="mb-3 transition-all duration-300 ease-in-out"
              :class="componentDetailOpen ? 'lg:w-[60%]' : 'lg:w-full'"
            >
              <div class="p-4 space-y-4">
                <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div class="flex flex-col w-full gap-3 sm:flex-row">
                    <UInput
                      v-model="filterTerm"
                      icon="i-heroicons-magnifying-glass-20-solid"
                      size="sm"
                      class="sm:w-1/2 relative"
                      placeholder="Komponenten filtern..."
                    />
                    <USelect
                      v-if="configurationOptions.length"
                      v-model="selectedConfigurationCode"
                      :options="configurationOptions"
                      option-attribute="label"
                      value-attribute="value"
                      size="sm"
                      class="sm:w-1/2"
                      placeholder="Configuration wählen (Code)"
                    />
                  </div>
                  <UButton
                    v-if="componentDetailOpen"
                    color="gray"
                    variant="ghost"
                    size="sm"
                    icon="i-heroicons-x-mark-20-solid"
                    class="self-end lg:self-auto"
                    @click="componentDetailOpen = false"
                  >
                    Detail schließen
                  </UButton>
                </div>

                <div v-if="componentGroups.length" class="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  <div
                    v-for="group in filteredComponentGroups"
                    :key="group.label"
                    class="bg-bsecondary/40 border border-btertiary rounded-lg p-3 space-y-2"
                  >
                    <div class="flex items-center gap-2">
                      <UIcon name="i-lucide-circuit-board" class="size-4 text-aris-400" />
                      <p class="p-0 text-xs uppercase text-secondary truncate">{{ group.label }}</p>
                      <span class="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-btertiary text-secondary">
                        {{ group.items.length }}
                      </span>
                    </div>
                    <div class="space-y-1">
                      <div
                        v-for="component in group.items"
                        :key="component.id"
                        class="bg-bsecondary border border-btertiary rounded px-3 py-2 cursor-pointer transition-colors flex items-center gap-2"
                        :class="[
                          isComponentOpen(component.id) ? 'border-aris-400/70 shadow-lg' : 'hover:border-aris-400/40',
                        ]"
                        :style="group.render === 'tree' ? { paddingLeft: `${(component.depth ?? 0) * 12}px` } : {}"
                        @click="toggleComponent(component.id)"
                      >
                        <p class="p-0 text-xs uppercase text-secondary truncate max-w-[40%]">
                          {{ component.type ?? 'Komponente' }}
                        </p>
                        <p class="p-0 text-sm font-semibold text-aris-300 truncate">
                          {{ component.name }}
                        </p>
                        <p class="p-0 ml-auto text-[11px] text-light-gray flex items-center gap-2">
                          <span v-if="component.size">S{{ component.size }}</span>
                          <span v-if="component.grade">{{ component.grade }}</span>
                          <span v-if="component.quantity">x{{ component.quantity }}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <p v-else class="text-sm text-light-gray">Für dieses Schiff sind keine Komponenten hinterlegt.</p>
              </div>
            </DefaultPanel>

            <Transition name="slideIn">
              <DefaultPanel
                v-if="componentDetailOpen && selectedComponent"
                bg="bprimary"
                class="mb-3 lg:w-[40%] w-full transition-all duration-300 ease-in-out shadow-inner"
              >
                <div class="p-4 space-y-4">
                  <div class="flex items-center gap-3">
                    <UIcon name="i-lucide-chip" class="text-aris-400 size-6" />
                    <div>
                      <p class="p-0 text-xs uppercase text-secondary">
                        {{ selectedComponentDisplayType }}
                      </p>
                      <h3 class="p-0 text-xl text-aris-200 font-semibold">
                        {{ selectedComponentDisplayName }}
                      </h3>
                      <p class="p-0 text-xs text-light-gray flex items-center gap-2">
                        <span v-if="selectedComponent.size">S{{ selectedComponent.size }}</span>
                        <span v-if="selectedComponentDisplayGrade">{{ selectedComponentDisplayGrade }}</span>
                        <span v-if="selectedComponent.quantity">x{{ selectedComponent.quantity }}</span>
                      </p>
                    </div>
                  </div>

                  <p v-if="selectedComponentDescription" class="text-sm leading-relaxed text-light-gray">
                    {{ selectedComponentDescription }}
                  </p>

                  <TableParent v-if="selectedComponentOverviewRows.length" :no-panel="true" title="Basisdaten" bg="bsecondary">
                    <TableRow
                      v-for="row in selectedComponentOverviewRows"
                      :key="row.title"
                      :title="row.title"
                      :content="row.content"
                      :suffix="row.suffix"
                      :prefix="row.prefix"
                      :full-width="row.fullWidth"
                      :third="!row.fullWidth"
                    />
                  </TableParent>

                  <div v-if="selectedComponentDetailSections.length" class="space-y-3">
                    <TableParent
                      v-for="section in selectedComponentDetailSections"
                      :key="section.title"
                      :no-panel="true"
                      :title="section.title"
                      bg="bsecondary"
                    >
                      <template v-if="section.rows.length">
                        <TableRow
                          v-for="row in section.rows"
                          :key="`${section.title}-${row.title}`"
                          :title="row.title"
                          :content="row.content"
                          :suffix="row.suffix"
                          :prefix="row.prefix"
                          :full-width="row.fullWidth"
                          :third="!row.fullWidth"
                        />
                      </template>
                      <p v-else class="col-span-6 text-sm text-light-gray">Keine Werte vorhanden.</p>
                    </TableParent>
                  </div>
                  <p v-else class="text-sm text-light-gray">Keine Detaildaten verfügbar.</p>
                </div>
              </DefaultPanel>
            </Transition>
          </div>
        </template>
        <template v-if="selectedTab === tablist.findIndex((e) => e.id === '2')">
          <DefaultPanel bg="bprimary" class="mb-3">
            <div class="px-8">
              <Editor v-if="data?.history" :model-value="data?.history" read-only />
            </div>
          </DefaultPanel>
        </template>
        <template v-if="selectedTab === tablist.findIndex((e) => e.id === '3')">
          <DefaultPanel bg="bprimary" class="mx-auto mb-3 w-fit h-fit">
            <UCarousel
              ref="carousel"
              :items="data?.gallery"
              :ui="{ item: 'flex flex-none snap-center w-full aspect-[16/9]' }"
              class="max-h-[calc(100vh-4rem)] aspect-[16/9] w-auto relative"
              arrows
              indicators
            >
              <template #default="{ item }">
                <NuxtImg :src="item" class="object-cover w-full h-auto" draggable="false" />
              </template>

              <template #prev="{ onClick, disabled }">
                <UButton
                  color="gray"
                  class="absolute top-0 bottom-0 flex justify-center w-8 h-8 my-auto rounded-full p-1.5 left-4 group"
                  :disabled="disabled"
                  @click="onClick"
                >
                  <UIcon
                    name="i-heroicons-chevron-left-20-solid"
                    class="flex-shrink-0 w-5 h-5 m-auto group-hover:text-aris-400"
                  />
                </UButton>
              </template>

              <template #next="{ onClick, disabled }">
                <UButton
                  color="gray"
                  class="absolute top-0 bottom-0 flex justify-center w-8 h-8 my-auto rounded-full p-1.5 right-4 group"
                  :disabled="disabled"
                  @click="onClick"
                >
                  <UIcon
                    name="i-heroicons-chevron-right-20-solid"
                    class="flex-shrink-0 w-5 h-5 m-auto group-hover:text-aris-400"
                  />
                </UButton>
              </template>
            </UCarousel>
          </DefaultPanel>
        </template>
        <template v-if="selectedTab === tablist.findIndex((e) => e.id === '4')">
          <div id="commercial_container" class="my-auto">
            <ArisCorpVideoplayer
              :src="commercialSources"
              :poster-url="`https://img.youtube.com/vi/${data?.commercial_video_id}/maxresdefault.jpg`"
            />
          </div>
        </template>
        <template v-if="selectedTab === tablist.findIndex((e) => e.id === '5')">
          <DefaultPanel bg="bprimary" class="mx-auto mb-3 w-fit h-fit">
            <UTable
              :rows="data.stores"
              :columns="storeCols"
              sort-asc-icon="i-heroicons-arrow-up"
              sort-desc-icon="i-heroicons-arrow-down"
              sort-mode="manual"
              class="w-full whitespace-nowrap"
            />
          </DefaultPanel>
        </template>
        <template v-if="selectedTab === tablist.findIndex((e) => e.id === '6')">
          <DefaultPanel bg="bprimary" class="mb-3">
            <div class="flex flex-wrap px-2 pb-2">
              <div class="flex-col basis-full md:basis-1/2">
                <h2 class="mt-4"><span class="text-aris-400">ArisCorp</span> Wertung</h2>
                <div class="flex pr-6 basis-full">
                  <div class="mx-auto">
                    <Editor :model-value="data?.rating.introduction" read-only />
                  </div>
                </div>
                <TableHr class="px-2 pb-2 my-4" />
                <ul>
                  <li
                    v-for="(item, index) in data?.rating.strengths_and_weaknesses"
                    :key="index"
                    class="pl-2"
                    :class="[
                      item.category === 'weakness'
                        ? `marker:text-red-600 marker:content-['-']`
                        : `marker:text-green-600 marker:content-['+']`,
                    ]"
                  >
                    {{ item.name }}
                  </li>
                </ul>
                <div class="flex items-center mx-auto mt-12 mb-4 w-fit">
                  <div class="mr-4">
                    <p class="p-0 text-xl text-white">
                      Die {{ data?.hull?.manufacturer.name }} <span class="font-bold">{{ data?.name }}</span>
                    </p>
                    <p class="p-0">Erreichte eine Wertung von:</p>
                  </div>

                  <ArcCounter
                    width="6rem"
                    height="6rem"
                    :text="data?.rating.score + '%'"
                    :dash-count="10"
                    :active-count="10 * (data?.rating.score / 100)"
                    :dash-spacing="0 / 4"
                  />
                </div>
              </div>
              <div class="basis-full md:basis-1/2">
                <h2 class="mt-4 text-aris-400">Unsere Einschätzung</h2>
                <div class="pl-2">
                  <p class="pt-0 pl-0 text-industrial-400">
                    Kampfpotenzial -
                    {{ data?.rating.ratings.find((e) => e.category === 'combat_potential').grade_label }}
                  </p>
                  <p class="py-0 pl-4">
                    {{ data?.rating.ratings.find((e) => e.category === 'combat_potential').reason }}
                  </p>
                  <p class="pl-0 text-industrial-400">
                    Wirtschaftliches Potenzial -
                    {{ data?.rating.ratings.find((e) => e.category === 'economic_potential')?.grade_label }}
                  </p>
                  <p class="py-0 pl-4">
                    {{ data?.rating.ratings.find((e) => e.category === 'economic_potential')?.reason }}
                  </p>
                  <p class="pl-0 text-industrial-400">
                    Benutzungspotenzial -
                    {{ data?.rating.ratings.find((e) => e.category === 'usage_potential')?.grade_label }}
                  </p>
                  <p class="py-0 pl-4">
                    {{ data?.rating.ratings.find((e) => e.category === 'usage_potential')?.reason }}
                  </p>
                  <p class="pl-0 text-industrial-400">
                    Preis-Leistungsverhältnis -
                    {{ data?.rating.ratings.find((e) => e.category === 'p-p_ratio')?.grade_label }}
                  </p>
                  <p class="py-0 pl-4">
                    {{ data?.rating.ratings.find((e) => e.category === 'p-p_ratio')?.reason }}
                  </p>
                  <p class="pl-0 text-industrial-400">
                    Schlussfolgerung - {{ data?.rating.ratings.find((e) => e.category === 'conclusion')?.grade_label }}
                  </p>
                  <p class="py-0 pl-4">
                    {{ data?.rating.ratings.find((e) => e.category === 'conclusion')?.reason }}
                  </p>
                </div>
              </div>
            </div>
          </DefaultPanel>
        </template>
      </template>
    </TabGroup>
    <hr />
    <div class="flex flex-nowrap">
      <div v-if="data?.variants" class="w-full px-2">
        <h3 class="text-industrial-400">Varianten</h3>
        <div>
          <ShipCard
            v-for="ship in data?.variants"
            :key="ship.id"
            :ship-data="ship"
            preload-images
            display-production-state
          />
        </div>
      </div>
      <div v-if="data?.all_loaners" class="w-full px-2">
        <h3 class="text-industrial-400">Leihschiffe- und Fahrzeuge</h3>
        <div>
          <ShipCard
            v-for="ship in data?.all_loaners"
            :key="ship.id"
            :ship-data="ship"
            preload-images
            display-production-state
          />
        </div>
      </div>
      <div v-if="data?.paints" class="w-full px-2">
        <h3 class="text-industrial-400">Lackierungen</h3>
        <div>
          <ShipCard
            v-for="paint in data?.paints"
            :key="paint.id"
            :ship-data="paint"
            preload-images
            display-production-state
            paint-view
          />
        </div>
      </div>
      <div v-if="data?.modules" class="w-full px-2">
        <h3 class="text-industrial-400">Module</h3>
        <div>
          <ShipCard
            v-for="module in data?.modules"
            :key="module.id"
            :ship-data="module"
            preload-images
            display-production-state
            module-view
            @module-open="openModule"
          />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped lang="postcss">
.slideIn-enter-active,
.slideIn-leave-active {
  @apply transition-all duration-300 ease-in-out;
}
.slideIn-enter-from,
.slideIn-leave-to {
  @apply translate-x-6 opacity-0;
}
</style>
