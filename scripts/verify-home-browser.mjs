import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import sharp from 'sharp';

// Use an installed Playwright runtime without adding a production dependency.
const { chromium } = process.argv[2] ? await import(pathToFileURL(resolve(process.argv[2], 'index.mjs')).href) : await import('playwright');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
try {
  await page.goto('http://localhost:5173/website/home-sections');
  await page.getByRole('textbox', { name: 'Email address' }).fill('home-cms-audit@example.invalid');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('Temporary-Home-CMS-Audit!2026');
  await page.getByRole('button', { name: 'Sign in to dashboard' }).click();
  await page.getByRole('heading', { name: 'Home Page CMS', exact: true }).waitFor();
  assert.equal(await page.locator('.cms-section-card').count(), 14);
  const headings = await page.locator('.cms-section-card-heading').allInnerTexts();
  assert.equal(headings.length, 14);
  for (const h of headings) {
    assert.match(h, /^[A-Za-z]/, `Heading "${h}" should not start with numbers`);
  }
  await page.locator('.cms-marquee-editor').waitFor();
  assert.ok(await page.locator('.cms-marquee-row').count() > 0);
  await page.locator('.cms-btn-add-item').waitFor();
  await page.locator('.cms-btn-update-home').waitFor();
  // Verify Global Settings route
  await page.goto('http://localhost:5173/settings/global');
  await page.getByRole('heading', { name: 'Common Enquire Now Section', exact: true }).waitFor();
  await page.locator('input[value="Enquire Now"]').waitFor();
  for (const [width, height] of [[1280, 720], [1440, 900], [768, 1024], [390, 844]]) {
    await page.setViewportSize({ width, height });
    const actual = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, overflow: document.documentElement.scrollWidth > innerWidth }));
    assert.deepEqual(actual, { width, height, overflow: false });
    await page.screenshot({ path: `.tmp-cms-home-${width}.png` });
  }
  await page.setViewportSize({ width: 1280, height: 720 });
  for (const key of ['hero', 'faculty', 'recruiters', 'internships', 'testimonials', 'events', 'life']) {
    await page.goto(`http://localhost:5173/masters/${key}`);
    await page.getByRole('button', { name: 'Add Slide', exact: true }).waitFor();
    await page.locator('table tbody tr td img').first().waitFor();
    assert.ok(await page.locator('table tbody tr').count() > 0);
    await page.getByRole('searchbox', { name: 'Search slides' }).fill('no-matching-audit-slide');
    await page.getByText('No slides found.', { exact: true }).waitFor();
    await page.getByRole('searchbox', { name: 'Search slides' }).fill('');
  }
  await page.goto('http://localhost:5173/masters/recruiters');
  await page.locator('table tbody tr td img').first().waitFor();
  await page.screenshot({ path: '.tmp-cms-master-table-1280.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.screenshot({ path: '.tmp-cms-master-table-390.png' });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.getByRole('button', { name: 'Add Slide', exact: true }).click();
  await page.getByRole('textbox', { name: 'Image URL', exact: true }).fill('/images/figma/recruiter-dcb.webp');
  await page.getByRole('textbox', { name: 'Alternative text', exact: true }).fill('CMS table audit');
  await page.getByRole('button', { name: 'Save slide', exact: true }).click();
  await page.getByRole('button', { name: 'Edit slide 6', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Delete slide 6', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete slide', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  assert.equal(await page.locator('table tbody tr').count(), 5);
  await page.getByRole('button', { name: 'Edit slide 1', exact: true }).click();
  const item = page.locator('.cms-slide-editor');
  const url = item.getByRole('textbox', { name: 'Image URL', exact: true });
  const width = item.getByRole('spinbutton', { name: 'Width', exact: true });
  const height = item.getByRole('spinbutton', { name: 'Height', exact: true });
  const original = { src: await url.inputValue(), width: await width.inputValue(), height: await height.inputValue() };
  const image = await sharp({ create: { width: 40, height: 30, channels: 3, background: 'navy' } }).png().toBuffer();
  try {
    await item.locator('input[type=file]').setInputFiles({ name: 'home-cms-ui-audit.png', mimeType: 'image/png', buffer: image });
    await page.waitForFunction(() => [...document.querySelectorAll('.cms-slide-editor input')].some(input => input.value.startsWith('/cms-media/')));
    const asset = await url.inputValue();
    await page.getByRole('button', { name: 'Save slide', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'Saved.' }).waitFor();
    const publicPage = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await publicPage.goto('http://localhost:3000/');
    await publicPage.locator('#recruiters-title').scrollIntoViewIfNeeded();
    assert.ok(await publicPage.locator(`img[src*="${encodeURIComponent(asset)}"]`).count() > 0, 'Uploaded logo renders on the public homepage');
    assert.equal((await publicPage.request.get(`http://localhost:3000${asset}`)).status(), 200, 'Public media proxy');
    await publicPage.screenshot({ path: '.tmp-cms-public-home.png' });
    await publicPage.close();
  } finally {
    if (!await page.locator('.cms-slide-editor').count()) await page.getByRole('button', { name: 'Edit slide 1', exact: true }).click();
    await url.fill(original.src); await width.fill(original.width); await height.fill(original.height);
    await page.getByRole('button', { name: 'Save slide', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'Saved.' }).waitFor();
  }
  assert.deepEqual(errors, []);
  console.info('Browser passed: actual desktop/laptop/tablet/mobile viewports, all seven master editors, image upload/save, public image rendering, media proxy and no runtime errors. Content restored.');
} finally { await browser.close(); }
