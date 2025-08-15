export function getSizeLetter (size: string): string {
  switch (size) {
    case 'v':
      return 'V'
    case '1':
      return 'XS'
    case '2':
      return 'S'
    case '3':
      return 'M'
    case '4':
      return 'L'
    case '5':
      return 'XL'
    case '6':
      return 'C'
    default:
      return ''
  }
}