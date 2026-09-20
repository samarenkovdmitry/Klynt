// Encrypts plaintext OAuth tokens stored in integrations.
// Format matches lib/crypto.ts: v1.<iv_b64>.<tag_b64>.<ct_b64>, AES-256-GCM.
// Usage: node scripts/encrypt-tokens.js
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const PREFIX = 'v1.';

function getKey() {
  const raw = (process.env.TOKEN_ENCRYPTION_KEY || '').trim();
  if (!raw) throw new Error('TOKEN_ENCRYPTION_KEY is not set');
  const key = /^[0-9a-f]{64}$/i.test(raw) ? Buffer.from(raw, 'hex') : Buffer.from(raw, 'base64');
  if (key.length !== 32) throw new Error('TOKEN_ENCRYPTION_KEY must be 32 bytes');
  return key;
}

function encryptToken(plaintext) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return `${PREFIX}${iv.toString('base64')}.${cipher.getAuthTag().toString('base64')}.${ct.toString('base64')}`;
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: integrations, error } = await supabase
    .from('integrations')
    .select('id, source, access_token_encrypted, refresh_token_encrypted');
  if (error) throw error;

  let updated = 0;
  for (const integ of integrations || []) {
    const patch = {};
    if (integ.access_token_encrypted && !integ.access_token_encrypted.startsWith(PREFIX)) {
      patch.access_token_encrypted = encryptToken(integ.access_token_encrypted);
    }
    if (integ.refresh_token_encrypted && !integ.refresh_token_encrypted.startsWith(PREFIX)) {
      patch.refresh_token_encrypted = encryptToken(integ.refresh_token_encrypted);
    }
    if (Object.keys(patch).length === 0) continue;

    const { error: upErr } = await supabase
      .from('integrations')
      .update(patch)
      .eq('id', integ.id);
    if (upErr) {
      console.error(`Failed to update ${integ.id} (${integ.source}):`, upErr.message);
      continue;
    }
    updated++;
    console.log(`Encrypted tokens for ${integ.source} integration ${integ.id}`);
  }

  console.log(`Done. ${updated} integration(s) updated, ${(integrations || []).length - updated} already encrypted.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
