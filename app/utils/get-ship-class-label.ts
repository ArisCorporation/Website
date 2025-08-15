export function getShipClassLabel (classification: string): string {
  switch (classification) {
    case 'cargo':
      return 'Fracht'
    case 'combat':
      return 'Kampf'
    case 'exploration':
      return 'Erkundung'
    case 'industrial':
      return 'Industriel'
    case 'specialized':
      return 'Spezialisiert'
    case 'multi-role':
      return 'Multirolle'
    case 'personal_transport':
      return 'Personentransport'
    case 'support':
      return 'Unterstützung'
    case 'mining':
      return 'Bergbau'
    case 'salvage':
      return 'Bergung'
    default:
      return ''
  }
}