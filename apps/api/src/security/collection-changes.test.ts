import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectionActions } from './collection-changes.js';

const sorted = (value: Set<string>) => [...value].sort();
test('classifies additions, edits, deletions and reordering with stable IDs', () => {
  const before = [{ id: 1, title: 'one' }, { id: 2, title: 'two' }];
  assert.deepEqual(sorted(collectionActions(before, [...before].reverse())), []);
  assert.deepEqual(sorted(collectionActions(before, [...before, { id: 3, title: 'three' }])), ['add']);
  assert.deepEqual(sorted(collectionActions(before, [{ id: 1, title: 'changed' }, before[1]])), ['edit']);
  assert.deepEqual(sorted(collectionActions(before, [before[0]])), ['delete']);
  assert.deepEqual(sorted(collectionActions(before, [{ id: 1, title: 'changed' }, { id: 3, title: 'three' }])), ['add', 'delete', 'edit']);
});
test('fails closed for ambiguous legacy records and preserves duplicates', () => {
  assert.deepEqual(sorted(collectionActions([{ name: 'a' }], [{ name: 'b' }])), ['add', 'delete', 'edit']);
  assert.deepEqual(sorted(collectionActions(['a', 'a'], ['a'])), ['delete']);
  assert.deepEqual(sorted(collectionActions([], ['a'])), ['add']);
  assert.deepEqual(sorted(collectionActions(['a'], [])), ['delete']);
});
