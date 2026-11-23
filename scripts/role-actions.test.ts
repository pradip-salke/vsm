import { test } from 'node:test';
import assert from 'node:assert/strict';
import { actionAllowed, actionKey, allRoleOptionsSelected, setAllRoleOptions } from '../apps/admin/src/ui/roleActions';

test('two roles have independent action choices without changing menu visibility', () => {
  const path = '/masters/faculty';
  const roleOne = [path, actionKey(path, 'delete')];
  const roleTwo = [path, actionKey(path, 'add'), actionKey(path, 'edit')];
  assert.equal(actionAllowed(roleOne, path, 'add'), true);
  assert.equal(actionAllowed(roleOne, path, 'delete'), false);
  assert.equal(actionAllowed(roleTwo, path, 'add'), false);
  assert.equal(actionAllowed(roleTwo, path, 'edit'), false);
  assert.equal(actionAllowed(roleTwo, path, 'delete'), true);
  assert.equal(actionAllowed(null, path, 'delete'), true);
  assert.ok(roleOne.includes(path) && roleTwo.includes(path));
});

test('All reflects and changes every applicable option without touching other rows', () => {
  const path = '/enquiries/enquiry';
  const unrelated = '/masters/faculty';
  const enabled = setAllRoleOptions([unrelated, actionKey(unrelated, 'add')], [path], true);
  assert.equal(allRoleOptionsSelected(enabled, [path]), true);
  assert.equal(allRoleOptionsSelected([...enabled, actionKey(path, 'export')], [path]), false);
  assert.equal(allRoleOptionsSelected(enabled.filter(item => item !== path), [path]), false);
  const disabled = setAllRoleOptions(enabled, [path], false);
  assert.equal(allRoleOptionsSelected(disabled, [path]), false);
  for (const action of ['edit', 'delete', 'export'] as const) assert.equal(actionAllowed(disabled, path, action), false);
  assert.equal(actionAllowed(disabled, path, 'add'), true);
  assert.ok(disabled.includes(unrelated) && disabled.includes(actionKey(unrelated, 'add')));
  assert.equal(allRoleOptionsSelected(setAllRoleOptions(disabled, [path], true), [path]), true);
});

test('enquiry export is independent from edit and delete for different roles', () => {
  const path = '/enquiries/enquiry';
  const exporter = [path, actionKey(path, 'edit'), actionKey(path, 'delete')];
  const editor = [path, actionKey(path, 'export')];
  assert.equal(actionAllowed(exporter, path, 'export'), true);
  assert.equal(actionAllowed(exporter, path, 'edit'), false);
  assert.equal(actionAllowed(exporter, path, 'delete'), false);
  assert.equal(actionAllowed(editor, path, 'export'), false);
  assert.equal(actionAllowed(editor, path, 'edit'), true);
  assert.equal(actionAllowed(editor, path, 'delete'), true);
  assert.equal(actionAllowed(null, path, 'export'), true);
});
