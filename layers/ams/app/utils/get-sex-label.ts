export function getSexLabel (sex: 'male' | 'female' | null | undefined): { label: string, salutation: string } | null {
  switch (sex) {
    case 'male':
      return {
        label: 'Männlich',
        salutation: 'Herr'
      }
    case 'female':
      return {
        label: 'Weiblich',
        salutation: 'Frau'
      }
    default:
      return null
  }
}