export function getDivisionLabel (division: 'army' | 'marines' | 'navy' | string | null | undefined): string | null {
  switch (division) {
    case 'army':
      return 'UEE Army'
    case 'marines':
      return 'UEE Marines'
    case 'navy':
      return 'UEE Navy'
    default:
      return null
  }
}