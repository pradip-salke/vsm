import test from 'node:test';
import assert from 'node:assert/strict';
import { parseEnv } from './env.js';

test('environment requires a database URL and applies safe local defaults', () => {
  const config = parseEnv({ DATABASE_URL: 'mysql://user:pass@localhost:3306/vsmedu' });
  assert.equal(config.API_PORT, 4000);
  assert.equal(config.NODE_ENV, 'development');
  assert.equal(config.COOKIE_SECURE, false);
});

test('environment rejects invalid ports and weak seed credentials', () => {
  assert.throws(() => parseEnv({ DATABASE_URL: 'x', API_PORT: '70000' }));
  assert.throws(() => parseEnv({ DATABASE_URL: 'x', SEED_ADMIN_PASSWORD: 'weak' }));
  assert.throws(() => parseEnv({ NODE_ENV: 'production', DATABASE_URL: 'mysql://user:pass@localhost/db' }));
});
