const germanFocusMap: Record<string, string> = {
  "light_freight": "Light Fracht",
  "medium_freight": "Medium Fracht",
  "heavy_freight": "Heavy Fracht",
  "light_transport": "Light Transport",
  "medium_transport": "Medium Transport",
  "heavy_transport": "Heavy Transport",
  "military_transport": "Military Transport",
  "light_data": "Light Daten",
  "medium_data": "Medium Daten",
  "heavy_data": "Heavy Daten",
  "light_refining": "Light Raffinerie",
  "medium_refining": "Medium Raffinerie",
  "heavy_refining": "Heavy Raffinerie",
  "light_salvage": "Light Salvage",
  "medium_salvage": "Medium Salvage",
  "heavy_salvage": "Heavy Salvage",
  "light_mining": "Light Mining",
  "medium_mining": "Medium Mining",
  "heavy_mining": "Heavy Mining",
  "light_repair": "Light Reparatur",
  "medium_repair": "Medium Reparatur",
  "heavy_repair": "Heavy Reparatur",
  "light_refueling": "Light Refueling",
  "medium_refueling": "Medium Refueling",
  "heavy_refueling": "Heavy Refueling",
  "light_construction": "Light Construction",
  "medium_construction": "Medium Construction",
  "heavy_construction": "Heavy Construction",
  "light_science": "Light Wissenschaft",
  "medium_science": "Medium Wissenschaft",
  "heavy_science": "Heavy Wissenschaft",
  "light_carrier": "Light Träger",
  "medium_carrier": "Medium Träger",
  "heavy_carrier": "Heavy Träger",
  "luxury": "Luxus",
  "modular": "Modular",
  "medical": "Medizinisch",
  "touring": "Touring",
  "expedition": "Expedition",
  "exploration": "Exploration",
  "pathfinder": "Pathfinder",
  "reporting": "Reporting",
  "light_fighter": "Light Fighter",
  "medium_fighter": "Medium Fighter",
  "heavy_fighter": "Heavy Fighter",
  "light_gunship": "Light Gunship",
  "medium_gunship": "Medium Gunship",
  "heavy_gunship": "Heavy Gunship",
  "snub": "Snub",
  "frigate": "Frigate",
  "destroyer": "Zerstörer",
  "corvette": "Corvette",
  "recon": "Recon",
  "bomber": "Bomber",
  "interdicion": "Interdiction", // Beachte: 'interdicion' im value, 'Interdiction' im text.
  "dropship": "Dropship",
  "stealth": "Stealth",
  "minelayer": "Mienenleger",
  "e-war": "E-War",
  "anti_air": "Luftabwehr",
  "ground_combat": "Bodenkampf",
  "tow_ship": "Abschleppschiff"
};

export function getFocusLabels (focusses: string[]): string[] {
  return focusses?.map(focusValue => germanFocusMap[focusValue] || focusValue);
}

export function getMainFocusLabel (focusses: string[]): string {
  const labels = focusses?.map(focusValue => germanFocusMap[focusValue] || focusValue);
  if (!labels?.length) return 'N/A'

  if (labels.find((e) => e === 'Modular')) return 'Modular'
  else return labels[0]
}
