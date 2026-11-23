import { test } from 'node:test';
import assert from 'node:assert/strict';
import { adminMenu, isMenuLeaf, permittedNodes } from '../apps/admin/src/ui/navigation';

test('roles see only selected sidebar pages and empty branches disappear', () => {
  const pages = adminMenu.find(group => group.id === 'pages')!;
  const home = permittedNodes(pages.children ?? [], new Set(['/website/home-sections']));
  assert.equal(home.length, 1);
  assert.equal(home[0].label, 'Home');
  assert.ok(!isMenuLeaf(home[0]));
  assert.deepEqual(home[0].children.map(child => isMenuLeaf(child) ? child.path : ''), ['/website/home-sections']);
  const about = permittedNodes(pages.children ?? [], new Set(['/website/about-us/our-philosophy']));
  assert.equal(about.length, 1);
  assert.equal(about[0].label, 'About Us');
  assert.deepEqual(permittedNodes(pages.children ?? [], new Set()), []);
});
