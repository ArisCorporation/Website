export default function (value: string): number | null {
  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }

  // 1. Entferne alle Tausendertrennzeichen (Punkte im deutschen Format).
  //    Benutzer könnten diese beim Editieren weglassen oder eintippen.
  const withoutThousandSeparators = value.replace(/\.(?=\d{3})/g, ''); // Nur Punkte entfernen, die Tausendertrenner sind
  // 2. Ersetze das Dezimal-Komma durch einen Punkt für parseFloat.
  const normalizedForParse = withoutThousandSeparators.replace(/,/g, '.');

  const number = parseFloat(normalizedForParse);

  return isNaN(number) ? null : number;
}