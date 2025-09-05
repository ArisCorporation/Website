export function getUserStatusLabel (status: "active" | "archived" | "draft" | "suspended" | "invited" | "unverified" | undefined): string | null {
  switch (status) {
    case 'active':
      return 'Aktiv'
    case 'archived':
      return 'Archiviert'
    case 'draft':
      return 'Entwurf'
    case 'suspended':
      return 'Deaktiviert'
    default:
      return null
  }
}