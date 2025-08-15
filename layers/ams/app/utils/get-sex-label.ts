export function getSexLabel (sex: 'male' | 'female' | null | undefined): { label: string, salutation: string, pronoun: string } | null {
  switch (sex) {
    case 'male':
      return {
        label: 'Männlich',
        salutation: 'Herr',
        pronoun: 'Er'
      }
    case 'female':
      return {
        label: 'Weiblich',
        salutation: 'Frau',
        pronoun: 'Sie'
      }
    default:
      return null
  }
}