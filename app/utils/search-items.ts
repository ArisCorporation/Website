/**
 * Durchsucht ein Array von Objekten in den angegebenen Feldern nach einem Suchbegriff.
 * Unterstützt verschachtelte Felder mittels Punktnotation (z.B. 'hersteller.name').
 *
 * @param items Das Array von Objekten, das durchsucht werden soll.
 * @param fieldPaths Ein String mit Komma-separierten Feldpfaden, die durchsucht werden sollen.
 *                   Beispiel: 'name, beschreibung, autor.name'
 * @param searchTerm Der Begriff, nach dem gesucht werden soll.
 * @returns Ein neues Array mit den Objekten, die den Suchkriterien entsprechen.
 */
export function searchItems<T extends Record<string, any>> (
  items: T[],
  fieldsToSearch: string[],
  searchTerm: string,
): T[] {
  const normalizedSearchTerm = searchTerm.toLowerCase().trim()

  // Wenn kein Suchbegriff vorhanden ist, alle Elemente zurückgeben
  if (!normalizedSearchTerm) {
    return items
  }

  // Wenn keine gültigen Felder zum Durchsuchen angegeben wurden, ein leeres Array zurückgeben
  if (fieldsToSearch.length === 0) {
    return []
  }

  /**
   * Hilfsfunktion, um den Wert eines verschachtelten Pfades sicher aus einem Objekt zu lesen.
   * @param obj Das Objekt.
   * @param path Der Pfad zum Wert (z.B. 'a.b.c').
   * @returns Den Wert am Pfad oder undefined, wenn der Pfad nicht existiert.
   */
  const getNestedValue = (obj: any, path: string): any => {
    if (!obj || !path) {
      return undefined
    }
    return path.split('.').reduce((currentObject, key) => {
      if (currentObject === null || currentObject === undefined || typeof currentObject !== 'object') {
        return undefined
      }
      return currentObject[key]
    }, obj)
  }

  return items.filter(item => {
    // Prüft, ob der Suchbegriff in mindestens einem der angegebenen Felder des aktuellen Objekts vorkommt
    return fieldsToSearch.some(path => {
      const value = getNestedValue(item, path)

      // Nur Strings durchsuchen
      if (typeof value === 'string') {
        return value.toLowerCase().includes(normalizedSearchTerm)
      }
      // Optional: Zahlen ebenfalls durchsuchen, indem sie in Strings umgewandelt werden
      // if (typeof value === 'number') {
      //   return String(value).toLowerCase().includes(normalizedSearchTerm);
      // }
      return false
    })
  })
}

// Beispielhafte Verwendung:
/*
interface Manufacturer {
  name: string;
  code: string;
}

interface Product {
  id: number;
  name: string;
  slug?: string;
  manufacturer: Manufacturer;
  tags?: string[];
}

const products: Product[] = [
  { id: 1, name: "Super Produkt Alpha", slug: "super-produkt-alpha", manufacturer: { name: "Hersteller X", code: "HX01" }, tags: ["neu", "top"] },
  { id: 2, name: "Beta Erzeugnis", manufacturer: { name: "Firma Y", code: "FY02" }, tags: ["gebraucht"] },
  { id: 3, name: "Gamma Artikel", slug: "gamma-artikel", manufacturer: { name: "Hersteller X", code: "HX05" } },
];

const searchTerm = "alpha";
const fields = "name, slug, manufacturer.name";

const results = searchInObjects(products, fields, searchTerm);
console.log(results);
// Erwartete Ausgabe:
// [
//   { id: 1, name: "Super Produkt Alpha", slug: "super-produkt-alpha", manufacturer: { name: "Hersteller X", code: "HX01" }, tags: ["neu", "top"] }
// ]

const searchTerm2 = "Hersteller X";
const results2 = searchInObjects(products, fields, searchTerm2);
console.log(results2);
// Erwartete Ausgabe:
// [
//   { id: 1, name: "Super Produkt Alpha", slug: "super-produkt-alpha", manufacturer: { name: "Hersteller X", code: "HX01" }, tags: ["neu", "top"] },
//   { id: 3, name: "Gamma Artikel", slug: "gamma-artikel", manufacturer: { name: "Hersteller X", code: "HX05" } }
// ]

const searchTerm3 = "FY02";
const fields3 = "manufacturer.code";
const results3 = searchInObjects(products, fields3, searchTerm3);
console.log(results3);
// Erwartete Ausgabe:
// [
//   { id: 2, name: "Beta Erzeugnis", manufacturer: { name: "Firma Y", code: "FY02" }, tags: ["gebraucht"] }
// ]
*/
