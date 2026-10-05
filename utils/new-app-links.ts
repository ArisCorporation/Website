// Pfade, die bereits von der neuen App bedient werden; Links dorthin müssen external sein; mit grep -rn NEW_APP_PATHS auffindbar.
export const NEW_APP_PATHS = {
  AMS: '/ams',
  SHIP_EXKURS: '/shipexkurs',
  AUTH: '/auth',
} as const;

export function isNewAppPath(path: string): boolean {
  const pathname = path.startsWith('http') ? new URL(path).pathname : path.split(/[?#]/, 1)[0];

  return Object.values(NEW_APP_PATHS).some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
