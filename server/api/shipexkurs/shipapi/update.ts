import axios from 'axios';

interface Ship {
  id?: string;
  status?: string;
  name?: string | null;
  slug?: string | null;
  p4k_mode?: boolean;
  p4k_id?: string | null;
  p4k_name?: string | null;
  p4k_version?: string | null;
  manufacturer?: string;
  store_url?: string | null;
  sales_url?: string | null;
  erkul_id?: string | null;
  fl_id?: string | null;
  sm_id?: number | null;
  pledge_price?: number | null;
  price?: number | null;
  length?: number | null;
  beam?: number | null;
  height?: number | null;
  mass?: number | null;
  on_sale?: boolean;
  cargo?: number | null;
  production_note?: string | null;
  live_patch?: string | null;
  hydrogen_fuel_tanks?: number | null;
  quantum_fuel_tanks?: number | null;
  crew_min?: number | null;
  crew_max?: number | null;
  speed_max?: number | null;
  speed_scm?: number | null;
  zero_to_scm?: number | null;
  zero_to_max?: number | null;
  scm_to_zero?: number | null;
  max_to_zero?: number | null;
  pitch_max?: number | null;
  roll_max?: number | null;
  yaw_max?: number | null;
  axis_acceleration_x?: number | null;
  axis_acceleration_y?: number | null;
  axis_acceleration_z?: number | null;
  acceleration_main?: number | null;
  acceleration_retro?: number | null;
  acceleration_vtol?: number | null;
  acceleration_maneuvering?: number | null;
  brochure?: string | null;
  hologram?: string | null;
  loaners?: string[] | null;
  variants?: string[] | null;
  size?: number | null;
  size_label?: string | null;
  insurance_claim_time?: number | null;
  insurance_expedited_cost?: number | null;
  insurance_expedited_time?: number | null;
  store_image?: string | null;
  store_image_url?: string | null;
  commercial_video_id?: string | null;
  ground?: boolean;
  gravlev?: boolean;
  description?: string | null;
  history?: string | null;
  rating?: number | null;
  production_status?: string | null;
  field_overwrite?: string[] | null;
}

const sm_url = 'https://robertsspaceindustries.com/ship-matrix/index';
const fl_url = 'https://api.fleetyards.net/v1/';
const p4k_url = 'https://raw.githubusercontent.com/ArisCorporation/p4k/main/3.23.0/json/v2/';
const cms_url = 'https://cms.ariscorp.de/';

// Function to fetch the ship list from sm_url
async function fetchShipList(): Promise<any[]> {
  try {
    const response: any = await $fetch(sm_url);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching ship list: ' + error);
  }
}

// Function to fetch the P4K ship list from p4k_url
async function fetchP4kShipList(): Promise<any[]> {
  try {
    const response: any = await $fetch(p4k_url + 'ships.json');
    return JSON.parse(response as string);
  } catch (error) {
    throw new Error('Error fetching p4k ship list: ' + error);
  }
}

// Function to fetch the P4K ship ports from p4k_url
async function fetchP4kShipPorts(id: string): Promise<any> {
  try {
    const response: any = await $fetch(p4k_url + 'ships/' + id + '-ports.json');
    return JSON.parse(response as string);
  } catch (error) {
    throw new Error('Error fetching p4k ship ports: ' + error);
  }
}

// Function to fetch the Live ship list from sm_url
async function fetchLiveShipList(): Promise<any[]> {
  try {
    const response = $fetch(cms_url + 'items/ships?limit=-1').then((res: any) => res.data || []);
    return response;
  } catch (error) {
    throw new Error('Error fetching live ship list: ' + error);
  }
}

// Function to fetch the FL ship list from sm_url
async function fetchFlShipList(): Promise<any[]> {
  try {
    const perPage = 240;
    let page = 1;
    let allData: any[] = [];

    while (true) {
      const response: any[] = await $fetch(fl_url + `models?perPage=${perPage}&page=${page}`);

      if (response.length === 0) {
        break;
      }

      allData = allData.concat(response);
      page++;
    }

    return allData;
  } catch (error) {
    throw new Error('Error fetching FL ship list: ' + error);
  }
}

// Function to fetch the companies from cms_url
async function fetchCompanies(): Promise<any[]> {
  try {
    const response: any = await $fetch(cms_url + 'items/companies?limit=-1&fields=id,name,code');
    return response.data;
  } catch (error) {
    throw new Error('Error fetching companies: ' + error);
  }
}

// Function to create a ship object with paints
async function createShipObject(
  shipData: any,
  p4kShipList: any[],
  liveShipList: any[],
  flShipList: any[],
  companies: any[],
): Promise<Ship | null> {
  const skippedShips = [
    'Anvil Ballista Snowblind',
    'Anvil Ballista Dunestalker',
    'Carrack w/C8X',
    'Carrack Expedition w/C8X',
    'Cutlass Black Best In Show Edition',
    'Carrack Expedition',
    'Constellation Phoenix Emerald',
    'Caterpillar Pirate Edition',
    'Caterpillar Best In Show Edition',
    'Hammerhead Best In Show Edition',
    'Reclaimer Best In Show Edition',
    'Valkyrie Liberator Edition',
    'Argo Mole Carbon Edition',
    'Argo Mole Talus Edition',
    'Nautilus Solstice Edition',
    '',
  ];
  if (skippedShips.includes(shipData.name)) return null;

  const p4kId = `${shipData.manufacturer.code === 'MRAI' ? 'MISC' : shipData.manufacturer.code}_${shipData.name
    .trim()
    .replace(' Kore', '')
    .replace(' w/C8X', '')
    .replace(' MK I', '')
    .replace('Mercury', 'Star Runner')
    .replace('C1 Spirit', 'Spirit C1')
    .replace('E1 Spirit', 'Spirit E1')
    .replace('A1 Spirit', 'Spirit A1')
    .replace('890 Jump', '890Jump')
    .replace('Ursa', 'Ursa Rover')
    .replace('Ursa', 'Ursa Rover')
    .replace(/ /g, '_')}`;

  const getP4kData = () => p4kShipList.find((ship) => ship.ClassName === p4kId) || null;
  const getLiveData = () => liveShipList?.find((ship) => ship.sm_id === shipData.id) || {};
  const getFlData = () =>
    flShipList.find(
      (ship) => ship.scIdentifier === p4kId.toLowerCase() || ship.rsiId === shipData.id || ship.name === shipData.name,
    ) || {};

  const convertSize = (size: string) => {
    switch (size) {
      case 'S':
        return 1;
      case 'M':
        return 2;
      case 'L':
        return 3;
      case 'XL':
        return 4;
      default:
        return 0;
    }
  };

  const convertLongSizes = (size: string) => {
    switch (size) {
      case 'small':
        return 1;
      case 'medium':
        return 2;
      case 'large':
        return 3;
      case 'capital':
        return 4;
      default:
        return 0;
    }
  };

  const p4kData = getP4kData();
  const p4kPorts = p4kData ? await fetchP4kShipPorts(p4kId.toLowerCase()) : null;
  const liveData = getLiveData();
  const flData = getFlData();

  const ship: Ship = {
    ...(liveData && { id: liveData.id }),
    test: p4kId,
    status: 'published',
    name: shipData.name.trim(),
    p4k_mode: !!p4kData,
    p4k_id: p4kData ? p4kData.ClassName : p4kId,
    p4k_name: p4kData ? p4kData.Name : null,
    manufacturer:
      companies?.find(
        (e) =>
          e.code === shipData.manufacturer.code ||
          e.code?.startsWith(shipData.manufacturer.code) ||
          shipData.manufacturer.code?.startsWith(e.code) ||
          e.name === shipData.manufacturer.name ||
          e.code === p4kData?.Manufacturer?.Code,
      )?.id ?? null,
    store_url: shipData.url ? 'https://robertsspaceindustries.com' + shipData.url : null,
    sales_url: flData.links?.salesPageUrl ?? null,
    erkul_id: flData.erkulIdentifier,
    fl_id: flData.id,
    sm_id: shipData.id,
    pledge_price: flData.pledgePrice,
    price: flData.availability?.soldAt[0]?.prices.averageSellPrice ?? null,
    length: p4kData ? p4kData.Length : shipData.length,
    beam: p4kData ? p4kData.Width : shipData.beam,
    height: p4kData ? p4kData.Height : shipData.height,
    mass: p4kData ? p4kData.Mass : shipData.mass,
    on_sale: flData.onSale,
    cargo: p4kData ? Math.floor(p4kData.Inventory?.SCU) : Math.floor(shipData.cargocapacity),
    store_image_url: shipData.media[0].source_url.startsWith('https')
      ? shipData.media[0].source_url.replace('\\', '')
      : 'https://robertsspaceindustries.com' + shipData.media[0].source_url.replace('\\', ''),
    // ports: p4kPorts,
    hydrogen_fuel_tanks: p4kData
      ? p4kPorts?.HydrogenFuelTanks?.map((e: any) => ({
          size: e.InstalledItem?.Size,
          capacity: e.InstalledItem?.HydrogenFuelTank?.Capacity,
        }))
      : shipData.compiled.RSIPropulsion.fuel_tanks.map((e: any) => ({ size: convertSize(e.size), capacity: null })),
    quantum_fuel_tanks: p4kData
      ? p4kPorts?.QuantumFuelTanks?.map((e: any) => ({
          size: e.InstalledItem?.Size,
          capacity: e.InstalledItem?.QuantumFuelTank?.Capacity,
        }))
      : shipData.compiled.RSIPropulsion.quantum_fuel_tanks.map((e: any) => ({
          size: convertSize(e.size),
          capacity: null,
        })),
    // pilot_hardpoints: p4kData
    //   ? p4kPorts?.PilotHardpoints?.map((e: any) =>
    //       e.InstalledItem && !e?.InstalledItem?.Type?.toLowerCase()?.includes('turret')
    //         ? {
    //             size: e.InstalledItem?.Size,
    //             gimbaled: e.InstalledItem?.ClassName?.toLowerCase().includes('gimbal'),
    //             name: e.InstalledItem?.ClassName?.toLowerCase().includes('gimbal')
    //               ? e.InstalledItem?.Ports[0].InstalledItem?.Name
    //               : e.InstalledItem?.Name,
    //             class_name: e.InstalledItem?.ClassName?.toLowerCase().includes('gimbal')
    //               ? e.InstalledItem?.Ports[0].InstalledItem?.ClassName
    //               : e.InstalledItem?.ClassName,
    //             manufacturer: e.InstalledItem?.ClassName?.toLowerCase().includes('gimbal')
    //               ? companies?.find(
    //                   (i) =>
    //                     i.code === e.InstalledItem?.Ports[0].InstalledItem?.Manufacturer?.Code ||
    //                     i.code?.startsWith(e.InstalledItem?.Ports[0].InstalledItem?.Manufacturer?.Code) ||
    //                     e.InstalledItem?.Ports[0].InstalledItem?.Manufacturer?.Code?.startsWith(i.code) ||
    //                     i.name === e.InstalledItem?.Ports[0].InstalledItem?.Manufacturer?.Name,
    //                 )?.id
    //               : companies?.find(
    //                   (i) =>
    //                     i.code === e.InstalledItem?.Manufacturer?.Code ||
    //                     i.code?.startsWith(e.InstalledItem?.Manufacturer?.Code) ||
    //                     e.InstalledItem?.Manufacturer?.Code?.startsWith(i.code) ||
    //                     i.name === e.InstalledItem?.Manufacturer?.Name,
    //                 )?.id,
    //           }
    //         : e?.InstalledItem?.Type?.toLowerCase()?.includes('turret') &&
    //           e.InstalledItem.Ports?.map((i: any) => ({
    //             size: i.InstalledItem.Size,
    //             gimbaled: true,
    //             name: i.InstalledItem.Name,
    //             class_name: e.InstalledItem.ClassName,
    //             manufacturer: companies?.find(
    //               (c) =>
    //                 c.code === i.InstalledItem?.Manufacturer?.Code ||
    //                 c.code?.startsWith(i.InstalledItem?.Manufacturer?.Code) ||
    //                 i.InstalledItem?.Manufacturer?.Code?.startsWith(c.code) ||
    //                 c.name === i.InstalledItem?.Manufacturer?.Name,
    //             )?.id,
    //           })),
    //     ).flat()
    //   : shipData.compiled.RSIWeapon.weapons
    //       .map((e: any) =>
    //         Array.from(Array(Number(e.mounts)).keys()).map(
    //           (i: any) =>
    //             e.name && {
    //               size: Number(e.size),
    //               gimbaled: e.name.toLowerCase().includes('fixed') ? false : true,
    //               name: e.name.toLowerCase().includes('fixed')
    //                 ? e.name.replace('Fixed', '').trim().replace(/\s+/g, ' ')
    //                 : e.name,
    //               manufacturer: companies?.find((i) => i.name.includes(e.manufacturer))?.id,
    //             },
    //         ),
    //       )
    //       .flat(),
    crew_min: shipData.min_crew,
    crew_max: shipData.max_crew,
    speed_max: p4kData
      ? Math.round(p4kData.FlightCharacteristics?.MaxSpeed) ?? null
      : Math.round(shipData.afterburner_speed) ?? null,
    speed_scm: p4kData
      ? Math.round(p4kData.FlightCharacteristics?.ScmSpeed) ?? null
      : Math.round(shipData.scm_speed) ?? null,
    zero_to_scm: p4kData ? p4kData.FlightCharacteristics?.ZeroToScm ?? null : null,
    scm_to_zero: p4kData ? p4kData.FlightCharacteristics?.ScmToZero ?? null : null,
    zero_to_max: p4kData ? p4kData.FlightCharacteristics?.ZeroToMax ?? null : null,
    max_to_zero: p4kData ? p4kData.FlightCharacteristics?.MaxToZero ?? null : null,
    pitch: p4kData ? p4kData.FlightCharacteristics?.Pitch ?? null : null,
    roll: p4kData ? p4kData.FlightCharacteristics?.Roll ?? null : null,
    yaw: p4kData ? p4kData.FlightCharacteristics?.Yaw ?? null : null,
    acceleration_main: p4kData ? p4kData.FlightCharacteristics?.Acceleration.Main ?? null : null,
    acceleration_retro: p4kData ? p4kData.FlightCharacteristics?.Acceleration.Retro ?? null : null,
    acceleration_vtol: p4kData ? p4kData.FlightCharacteristics?.Acceleration.Vtol ?? null : null,
    acceleration_maneuvering: p4kData ? p4kData.FlightCharacteristics?.Acceleration.Maneuvering ?? null : null,
    size: p4kData ? p4kData.Size : convertLongSizes(shipData.size),
    insurance_claim_time: p4kData ? p4kData.Insurance?.StandardClaimTime : null,
    insurance_expedited_cost: p4kData ? p4kData.Insurance?.ExpeditedCost : null,
    insurance_expedited_time: p4kData ? p4kData.Insurance?.ExpeditedClaimTime : null,
    ground: p4kData ? p4kData.IsVehicle : null,
    gravlev: p4kData ? p4kData.IsGravlev : null,
    production_status: p4kData ? 'flight-ready' : flData.productionStatus,
    ...(liveData && { field_overwrite: liveData.field_overwrite }),
    loaners: flData.loaners
      ? flData.loaners
          .map((l: any) =>
            liveShipList.find((s: any) => s.fl_id === flShipList.find((e: any) => e.name === l.name).id)
              ? {
                  id: liveShipList.find((s: any) => s.fl_id === flShipList.find((e: any) => e.name === l.name).id)?.id,
                  name: liveShipList.find((s: any) => s.fl_id === flShipList.find((e: any) => e.name === l.name).id)
                    ?.name,
                }
              : null,
          )
          .filter((e: any) => e)
      : [],
  };

  return ship;
}

// Function to update or create ships on cms_url
async function updateOrCreateShips(ships: Ship[], shipList: any[]) {
  try {
    for (const ship of ships) {
      if (!ship) continue;
      // Check if ship already exists on cms_url
      const existingShip = await $fetch(`${cms_url}items/ships/${ship?.id}`).catch(() => null);

      if (existingShip) {
        // Get the field_overwrite for the existing ship
        const fieldOverwrite = existingShip.data.field_overwrite || [];

        // Update only the fields that are not in the field_overwrite array
        for (const field in ship as Ship) {
          if (!fieldOverwrite.includes(field) && ship[field]) {
            existingShip.data[field as keyof Ship] = ship[field];
          }
        }

        delete existingShip.data.description;

        // Update the ship on cms_url
        // await axios.patch(
        //   `${cms_url}items/ships/${existingShip.data.id}?access_token=-_XrBWIxuJyxZ-WhHgIFZAZs_7pxA0MY`,
        //   existingShip.data,
        // );
        try {
          await $fetch(`${cms_url}items/ships/${existingShip.data.id}?access_token=-_XrBWIxuJyxZ-WhHgIFZAZs_7pxA0MY`, {
            method: 'PATCH',
            body: existingShip.data,
          });
        } catch (error) {
          console.error('Error updating ship:', error);
          console.error(existingShip.data);
        }
      } else {
        // console.log(ship.store_image_url);
        const store_image_id = ship.store_image_url
          ? await importImage(ship.store_image_url, ship.name + '-store_image', '067e2715-7947-44db-971b-754760f8b0b1')
          : null;
        // ship.store_image = store_image_id;
        if (store_image_id) ship.store_image = await store_image_id;
        // Create the ship on cms_url
        await axios.post(`${cms_url}items/ships?access_token=-_XrBWIxuJyxZ-WhHgIFZAZs_7pxA0MY`, ship);
      }
    }
    return ships;
  } catch (error) {
    console.error('Error updating or creating ships:', error);
    return { status: 'error', message: 'Error updating or creating ships:' + error };
  }
}

async function importImage(image: string, title: string, folder: string): Promise<string> {
  const response = await axios.post(`${cms_url}files/import?access_token=-_XrBWIxuJyxZ-WhHgIFZAZs_7pxA0MY`, {
    url: image,
    data: {
      title,
      folder,
    },
  });

  return response.data.data.id;
}

// Main function to fetch ship list, fetch paints, create ship objects, and update or create ships on cms_url
export default defineEventHandler(async (event) => {
  try {
    // Fetch the ship list from sm_url
    const shipList = await fetchShipList();

    // Fetch the ship list from p4k_url
    const p4kShipList = await fetchP4kShipList();

    // Fetch the ship list from cms_url
    const liveShipList = await fetchLiveShipList();

    // Fetch the ship list from fl_url
    const flShipList = await fetchFlShipList();

    // Fetch the companies from cms_url
    const companies = await fetchCompanies();

    // Create ship objects with paints
    const ships = await Promise.all(
      shipList.map(
        async (shipData: any) => await createShipObject(shipData, p4kShipList, liveShipList, flShipList, companies),
      ),
    );

    // Update or create ships on cms_url
    if (event.method === 'POST') return await updateOrCreateShips(ships, shipList);

    // Return the ships
    return ships;
  } catch (error) {
    console.error('Error:', error);
  }
});
