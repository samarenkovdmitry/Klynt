import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const PREFIX = 'v1.';

function getKey(): Buffer {
  const raw = process.env.TOKEN_ENCRYPTION_KEY?.trim();
  if (!raw) {
    throw new Error('TOKEN_ENCRYPTION_KEY is not set');
  }
  const key = /^[0-9a-f]{64}$/i.test(raw)
    ? Buffer.from(raw, 'hex')
    : Buffer.from(raw, 'base64');
  if (key.length !== 32) {
    throw new Error('TOKEN_ENCRYPTION_KEY must be 32 bytes (64 hex chars or base64)');
  }
  return key;
}

export function encryptToken(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return `${PREFIX}${iv.toString('base64')}.${cipher.getAuthTag().toString('base64')}.${ciphertext.toString('base64')}`;
}

export function decryptToken(value: string): string {
  // Legacy rows stored plaintext before encryption was introduced
  if (!value.startsWith(PREFIX)) return value;
  const parts = value.split('.');
  if (parts.length !== 4) {
    throw new Error('Malformed encrypted token');
  }
  const decipher = createDecipheriv('aes-256-gcm', getKey(), Buffer.from(parts[1], 'base64'));
  decipher.setAuthTag(Buffer.from(parts[2], 'base64'));
  return Buffer.concat([
    decipher.update(Buffer.from(parts[3], 'base64')),
    decipher.final(),
  ]).toString('utf8');
}
