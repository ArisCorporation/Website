export default function resolveToStringOrUndefined (value: any | string | null | undefined): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === 'string') {
    return value;
  }
  // Prüfe auf gängige Objekttypen, die eine 'id' Eigenschaft haben könnten
  if (typeof value === 'object' && 'id' in value && value.id !== null && value.id !== undefined) {
    return String(value.id);
  }
  // Fallback oder spezifischere Prüfungen für deine Typen (DirectusUser, Ship, etc.)
  // Wenn value ein Objekt ohne 'id' ist oder ein unerwarteter Typ, gib undefined zurück,
  // um Formularfehler zu vermeiden, oder werfe einen Fehler, falls das kritisch ist.
  console.warn("Konnte Wert nicht zu String-ID auflösen:", value);
  return undefined;
}