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

  if (user.title) {
    parts.unshift(user.title)
  }

  let label = parts.join(' ');

  return label;
}