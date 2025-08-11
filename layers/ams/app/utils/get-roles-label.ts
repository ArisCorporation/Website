export function getRolesLabel (roles: ('recruitment' | 'marketing_and_press' | 'content_writer')[] | null): string | null {
  const roleMap = (role: string) => {
    switch (role) {
      case 'recruitment':
        return 'Rekrutierung'
      case 'marketing_and_press':
        return 'Marketing und Presse'
      case 'content_writer':
        return 'Inhaltsersteller'
    }
  }

  return roles?.[0] ? roles.map((role) => roleMap(role)).join(', ') : null
}