import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from './app.js';

test('API health endpoint is available without touching the database', async (t) => {
  const server = createApp().listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  t.after(() => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const response = await fetch(`http://127.0.0.1:${address.port}/health/live`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { data: { status: 'ok' } });
  assert.ok(response.headers.get('x-request-id'));
});

test('API returns structured 404 errors', async (t) => {
  const server = createApp().listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  t.after(() => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const response = await fetch(`http://127.0.0.1:${address.port}/missing`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

test('API rejects cross-site state changes and malformed JSON', async (t) => {
  const server = createApp().listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  t.after(() => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const base = `http://127.0.0.1:${address.port}`;
  const csrf = await fetch(`${base}/api/v1/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(csrf.status, 403);
  assert.equal((await csrf.json()).error.code, 'CSRF_REJECTED');
  const malformed = await fetch(`${base}/api/v1/public/enquiries`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(malformed.status, 400);
  assert.equal((await malformed.json()).error.code, 'INVALID_JSON');
});

test('API allows the local Vite fallback origin for CMS requests in development', async (t) => {
  const server = createApp().listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  t.after(() => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const base = `http://127.0.0.1:${address.port}`;
  const preflight = await fetch(`${base}/api/v1/auth/me`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://localhost:5174',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'content-type',
    },
  });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-origin'), 'http://localhost:5174');
  assert.equal(preflight.headers.get('access-control-allow-credentials'), 'true');

  const login = await fetch(`${base}/api/v1/auth/login`, {
    method: 'POST',
    headers: { Origin: 'http://localhost:5174', 'Content-Type': 'application/json' },
    body: '{}',
  });
  assert.notEqual(login.status, 403);
});
