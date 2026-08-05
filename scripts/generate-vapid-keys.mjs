/**
 * Generates a VAPID key pair for Web Push.
 *
 * VAPID is how a push service verifies who is sending a notification. The
 * public key is embedded in the client and is meant to be public; the private
 * key signs outgoing pushes and must never be committed.
 *
 * Writes .vapid.json (gitignored) and prints only the public half.
 *
 *   node scripts/generate-vapid-keys.mjs
 */

import { generateKeyPairSync } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = resolve(fileURLToPath(new URL('../.vapid.json', import.meta.url)));

if (existsSync(OUT) && !process.argv.includes('--force')) {
  console.error('.vapid.json already exists. Re-run with --force to replace it.');
  console.error('Replacing the keys invalidates every existing subscription.');
  process.exit(1);
}

const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });

const pub = publicKey.export({ format: 'jwk' });
const priv = privateKey.export({ format: 'jwk' });

const b64url = (buf) => Buffer.from(buf).toString('base64url');

// An application server key is the uncompressed EC point: 0x04 || X || Y.
const applicationServerKey = b64url(
  Buffer.concat([
    Buffer.from([0x04]),
    Buffer.from(pub.x, 'base64url'),
    Buffer.from(pub.y, 'base64url'),
  ])
);

writeFileSync(
  OUT,
  JSON.stringify({ publicKey: applicationServerKey, privateKey: priv.d, createdAt: new Date().toISOString() }, null, 2)
);

console.log('Wrote .vapid.json (gitignored).');
console.log('\nPublic key, safe to embed in the client:\n');
console.log(applicationServerKey);
