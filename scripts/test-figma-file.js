/**
 * Test access to a specific Figma file
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const fileKey = process.argv[2] || 'zCmZAW85TtyTW3Q1CUDLgI';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: integrations } = await supabase
    .from('integrations')
    .select('access_token_encrypted')
    .eq('source', 'figma')
    .order('updated_at', { ascending: false })
    .limit(1);

  const token = integrations?.[0]?.access_token_encrypted;

  const endpoints = [
    `https://api.figma.com/v1/files/${fileKey}`,
    `https://api.figma.com/v1/files/${fileKey}/comments`,
    `https://api.figma.com/v1/files/${fileKey}/versions`,
  ];

  for (const url of endpoints) {
    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    const body = await response.text();
    console.log(`\n${url}`);
    console.log(`Status: ${response.status}`);
    console.log(body.substring(0, 300));
  }
}

main().catch(console.error);
