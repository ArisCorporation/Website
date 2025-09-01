export function getBuyStatusLabel (buy_status: ('pledged' | 'in_game' | 'planned') | null | undefined): string | null {
  switch (buy_status) {
    case 'pledged':
      return 'Gepledget'
    case 'in_game':
      return 'In-Game gekauft'
    case 'planned':
      return 'Geplant'
    default:
      return null
  }
}