export function getShipProductionLabel (production_status: string): string {
  switch (production_status) {
    case 'flight-ready':
      return 'Flugfertig'
    case 'in-concept':
      return 'Im Konzept'
    case 'in-production':
      return 'In Produktion'
    case 'In Produktion':
      return 'In Produktion'
    default:
      return ''
  }
}