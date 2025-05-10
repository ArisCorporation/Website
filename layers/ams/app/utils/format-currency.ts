export default function (value: string | number | null | undefined): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '';
  }
  // Diese Implementierung ist ein Beispiel und muss ggf. an Ihre genauen Anforderungen angepasst werden
  // (z.B. Umgang mit mehr als einer Nachkommastelle, Rundung etc.)
  let [integerPart, decimalPart] = String(value).split('.');
  integerPart = integerPart?.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Tausendertrennzeichen

  if (decimalPart !== undefined) { // Prüfen, ob es überhaupt einen Dezimalteil gab
    return `${integerPart},${decimalPart}`;
  }

  return integerPart ?? '';
}