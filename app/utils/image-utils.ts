import type { DirectusFile } from '@@/types'; // Nuxt 3 auto-importiert Typen, z.B. aus '~~/types'

/**
 * Extrahiert die Asset-ID aus einer Bildquelle für die Verwendung mit <NuxtImg>.
 * Die Quelle kann ein DirectusFile-Objekt, ein String (vermutlich bereits eine ID
 * oder ein für NuxtImg verständlicher Pfad), null oder undefined sein.
 *
 * @param source Die Bildquelle.
 * @returns Die Asset-ID als String oder undefined, wenn keine ID extrahiert werden kann.
 */
export function getAssetId (source: string | DirectusFile | null | undefined): string {
  if (source == null) {
    return '';
  }

  const ensurePrefixedPath = (value: string) => {
    if (!value) {
      return '';
    }

    // Wenn bereits eine vollständige URL übergeben wurde, nutzen wir diese direkt.
    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    // Wenn der Pfad bereits mit 'assets/' (oder einem benutzerdefinierten Präfix) beginnt,
    // nicht erneut präfixen.
    if (value.startsWith('assets/')) {
      return value;
    }

    return `${value}`;
  };

  if (typeof source === 'string') {
    return ensurePrefixedPath(source);
  }

  if (typeof source === 'object' && typeof source.id === 'string') {
    return ensurePrefixedPath(source.id);
  }

  console.warn('Konnte keine Asset-ID aus der Quelle extrahieren:', source);
  return '';
}
