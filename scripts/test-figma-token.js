/**
 * Test if Figma access token is valid
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: integrations, error } = await supabase
    .from('integrations')
    .select('access_token_encrypted')
    .eq('source', 'figma')
    .order('updated_at', { ascending: false })
    .limit(1);

  if (error || !integrations?.[0]) {
    console.error('No integration found');
    process.exit(1);
  }

  const token = integrations[0].access_token_encrypted;
  console.log('Testing token:', token.substring(0, 20) + '...');

  const response = await fetch('https://api.figma.com/v1/me', {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const data = await response.json();
  console.log('Status:', response.status);
  console.log(JSON.stringify(data, null, 2));
}

main();
