import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const { chromium } = await import(pathToFileURL(resolve(process.argv[2], 'index.mjs')).href);
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
let original;
async function read() { return (await (await page.request.get('http://localhost:4000/api/v1/admin/home/master-hero')).json()).data; }
async function save(content, updatedAt) { return page.request.patch('http://localhost:4000/api/v1/admin/home/master-hero', { headers: { Origin: 'http://localhost:5173' }, data: { content, updatedAt } }); }
try {
  await page.goto('http://localhost:5173/masters/hero');
  await page.getByRole('textbox', { name: 'Email address' }).fill('home-cms-audit@example.invalid');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('Temporary-Home-CMS-Audit!2026');
  await page.getByRole('button', { name: 'Sign in to dashboard' }).click();
  await page.getByRole('button', { name: 'Edit slide 1', exact: true }).waitFor();
  original = await read();
  assert.ok(await page.getByRole('navigation', { name: 'Breadcrumb' }).textContent().then(text => text.includes('Website Pages') && text.includes('Home')));
  await page.getByRole('button', { name: 'Edit slide 1', exact: true }).click();
  assert.equal(await page.getByRole('spinbutton', { name: 'Width', exact: true }).count(), 0);
  assert.equal(await page.getByRole('spinbutton', { name: 'Height', exact: true }).count(), 0);
  await page.getByRole('textbox', { name: 'Primary button text', exact: true }).fill('Audit Apply');
  await page.getByRole('textbox', { name: 'Primary button link', exact: true }).fill('/admissions/application-form?cms-audit=1');
  const subtitle = page.getByRole('textbox', { name: 'Description / Subtitle', exact: true });
  await subtitle.fill('Home Slider formatting audit');
  await subtitle.press('Control+a');
  await page.getByRole('button', { name: 'Bold', exact: true }).click();
  assert.match(await subtitle.innerHTML(), /<(?:strong|b)>/);
  for (const [width, height] of [[1280, 720], [768, 1024], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(250);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: `.tmp-hero-editor-${width}.png` });
  }
  await page.getByRole('button', { name: /Update Home Slide/ }).click();
  await page.getByRole('heading', { name: 'Home Slider', exact: true }).waitFor();
  const updated = await read();
  assert.equal(updated.content.items[0].primaryText, 'Audit Apply');
  assert.match(updated.content.items[0].subtitle, /<(?:strong|b)>/);
  assert.deepEqual(updated.content.items.slice(1), original.content.items.slice(1), 'Other slides unchanged');
  const publicPage = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await publicPage.goto('http://localhost:3000/');
  assert.ok(await publicPage.getByRole('link', { name: 'Audit Apply', exact: true }).count() > 0);
  assert.ok(await publicPage.locator('strong,b').filter({ hasText: 'Home Slider formatting audit' }).count() > 0);
  await publicPage.close();
  const unsafe = structuredClone(updated.content);
  unsafe.items[0].subtitle = '<p onclick="alert(1)">Safe<strong>bold</strong><script>alert(1)</script><a href="javascript:alert(1)">link</a></p>';
  assert.equal((await save(unsafe, updated.updatedAt)).status(), 200);
  const cleaned = await read();
  assert.ok(!/onclick|script|javascript:/.test(cleaned.content.items[0].subtitle));
  assert.deepEqual(errors, []);
  console.info('Passed: Home dropdown navigation, reference form, rich-text formatting, per-slide button persistence/public rendering, preserved other slides, HTML sanitization, desktop/tablet/mobile layouts and no runtime errors.');
} finally {
  if (original) { const current = await read(); assert.equal((await save(original.content, current.updatedAt)).status(), 200); }
  await browser.close();
}
