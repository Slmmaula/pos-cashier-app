export const USERNAME_PATTERN = /^[a-z0-9._-]{3,30}$/;

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}
