import test from 'node:test';
import assert from 'node:assert/strict';
import { createSessionToken, hashSessionToken } from './session.js';

test('session tokens are high entropy and only their hash is persisted', () => {
  const first = createSessionToken();
  const second = createSessionToken();
  assert.equal(Buffer.from(first, 'base64url').length, 32);
  assert.notEqual(first, second);
  assert.equal(hashSessionToken(first), hashSessionToken(first));
  assert.notEqual(hashSessionToken(first), first);
});
