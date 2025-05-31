import type { DirectusUser } from '~~/types';

export function getUserLabel (user: DirectusUser): string {
  const parts = [];

  if (user.first_name) {
    parts.push(user.first_name);
  }

  if (user.middle_name) {
    parts.push(user.middle_name);
  }

  if (user.last_name) {
    parts.push(user.last_name);
  }

  let label = parts.join(' ');
  if (user.title) {
    // label += ` (${user.title})`;
    label = user.title + label;
  }

  return label;
}