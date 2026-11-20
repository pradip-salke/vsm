import { isDeepStrictEqual } from 'node:util';

export type CollectionAction = 'add' | 'edit' | 'delete';

/**
 * Determine which privileges are necessary for a collection replacement.
 * Records with unique, stable IDs can be compared individually. Legacy records
 * without IDs are treated conservatively when an edit and a replacement cannot
 * be distinguished; this prevents an edit-only user from replacing records.
 */
export function collectionActions(before: unknown[], after: unknown[]): Set<CollectionAction> {
  const actions = new Set<CollectionAction>();
  const remainingBefore = [...before];
  const remainingAfter: unknown[] = [];
  for (const item of after) {
    const index = remainingBefore.findIndex(old => isDeepStrictEqual(old, item));
    if (index >= 0) remainingBefore.splice(index, 1);
    else remainingAfter.push(item);
  }

  const id = (value: unknown): string | number | undefined => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
    const candidate = (value as { id?: unknown }).id;
    return (typeof candidate === 'string' && candidate.length > 0) || typeof candidate === 'number' ? candidate : undefined;
  };
  const ids = (values: unknown[]) => values.map(id);
  const oldIds = ids(before); const newIds = ids(after);
  const identifiable = oldIds.every(value => value !== undefined) && newIds.every(value => value !== undefined)
    && new Set(oldIds).size === oldIds.length && new Set(newIds).size === newIds.length;
  if (identifiable) {
    const oldById = new Map(before.map(item => [id(item), item]));
    const newById = new Map(after.map(item => [id(item), item]));
    for (const [key, value] of newById) {
      if (!oldById.has(key)) actions.add('add');
      else if (!isDeepStrictEqual(oldById.get(key), value)) actions.add('edit');
    }
    for (const key of oldById.keys()) if (!newById.has(key)) actions.add('delete');
    return actions;
  }
  if (remainingBefore.length && remainingAfter.length) {
    actions.add('add'); actions.add('edit'); actions.add('delete');
  } else if (remainingBefore.length) actions.add('delete');
  else if (remainingAfter.length) actions.add('add');
  return actions;
}
