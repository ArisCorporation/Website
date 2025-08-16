import { describe, it, expect } from 'vitest'
import { getShipClassLabel } from '../../../app/utils/get-ship-class-label'

describe('Utils > get-ship-class-label', () => {
  it('sollte das korrekte Label für jede Klassifizierung zurückgeben', () => {
    expect(getShipClassLabel('cargo')).toBe('Fracht')
    expect(getShipClassLabel('combat')).toBe('Kampf')
    expect(getShipClassLabel('exploration')).toBe('Erkundung')
    expect(getShipClassLabel('industrial')).toBe('Industriel')
    expect(getShipClassLabel('specialized')).toBe('Spezialisiert')
    expect(getShipClassLabel('multi-role')).toBe('Multirolle')
    expect(getShipClassLabel('personal_transport')).toBe('Personentransport')
    expect(getShipClassLabel('support')).toBe('Unterstützung')
    expect(getShipClassLabel('mining')).toBe('Bergbau')
    expect(getShipClassLabel('salvage')).toBe('Bergung')
  })

  it('sollte einen leeren String für eine unbekannte Klassifizierung zurückgeben', () => {
    expect(getShipClassLabel('unknown')).toBe('')
    expect(getShipClassLabel('')).toBe('')
    expect(getShipClassLabel(null as any)).toBe('')
    expect(getShipClassLabel(undefined as any)).toBe('')
  })
})
