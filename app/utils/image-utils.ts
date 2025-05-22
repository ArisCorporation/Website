import type { DirectusFile } from '@@/types'; // Nuxt 3 auto-importiert Typen, z.B. aus '~~/types'

/**
 * Extrahiert die Asset-ID aus einer Bildquelle für die Verwendung mit <NuxtImg>.
 * Die Quelle kann ein DirectusFile-Objekt, ein String (vermutlich bereits eine ID
 * oder ein für NuxtImg verständlicher Pfad), null oder undefined sein.
 *
 * @param source Die Bildquelle.
 * @returns Die Asset-ID als String oder undefined, wenn keine ID extrahiert werden kann.
 */
export function getAssetId (source: string | DirectusFile | null | undefined): string | undefined {
  if (source === null || source === undefined) {
    return undefined; // <NuxtImg> behandelt undefined für src meist korrekt (kein Bild / Fallback)
  }

  // Fall 1: Quelle ist bereits ein String
  if (typeof source === 'string') {
    // Hier nehmen wir an, dass ein String entweder bereits die ID ist
    // oder ein Pfad, den dein <NuxtImg> Provider direkt verarbeiten kann.
    // Wenn es eine volle URL ist und dein Provider nur die ID erwartet,
    // müsstest du hier die ID aus der URL parsen. Das ist aber oft nicht nötig,
    // wenn der Provider gut konfiguriert ist.
    return source;
  }

  // Fall 2: Quelle ist ein DirectusFile-Objekt
  // Wir prüfen, ob es ein Objekt ist und eine 'id'-Eigenschaft vom Typ string hat.
  if (typeof source === 'object' && source !== null && typeof source.id === 'string' && source.id) {
    return source.id;
  }

  // Fallback, wenn keine ID extrahiert werden konnte
  console.warn('Konnte keine Asset-ID aus der Quelle extrahieren:', source);
  return undefined;
}