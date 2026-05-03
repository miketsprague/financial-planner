/**
 * Generate a random ID string suitable for use as a plan or income stream identifier.
 * IDs are prefixed with `<prefix>-` followed by a timestamp and a random suffix.
 *
 * @param prefix - Optional prefix (defaults to "id").
 * @returns A pseudo-unique ID string.
 */
export function generateId(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
