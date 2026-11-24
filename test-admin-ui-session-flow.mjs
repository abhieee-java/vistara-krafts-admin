import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://niamxrskqhjvzwxomxrx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gK22Lr7xNqKI7VFAfnsQTA_7UD0S2iu';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('========================================================================');
console.log('  VISTĀRA KRAFTS — ADMIN UI/UX & AUTHENTICATION VERIFICATION SUITE');
console.log('========================================================================\n');

async function testSuite() {
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}:`, err.message || err);
      throw err;
    }
  }

  // 1. Password Verification
  let sessionToken = null;
  await test('Master Password Authentication (2008)', async () => {
    const { data, error } = await client.rpc('verify_admin_login', { p_password: '2008' });
    if (error) throw error;
    if (!data || !data.success) throw new Error(data?.error || 'Login failed');
    sessionToken = data.session_token;
    if (!sessionToken) throw new Error('No session_token returned');
    console.log(`         -> Received valid session token: ${sessionToken.slice(0, 16)}...`);
  });

  // 2. Real Orders RPC with Token
  await test('Fetch Real Orders via Session Token (Strict Zero Mock Data)', async () => {
    const { data, error } = await client.rpc('get_admin_orders', { p_token: sessionToken });
    if (error) throw error;
    if (!Array.isArray(data)) throw new Error('Expected array of orders');
    if (data.length === 0) throw new Error('Expected real production orders, got 0');
    console.log(`         -> Successfully verified ${data.length} real live production orders!`);
  });

  // 3. Security Rejection on Invalid Token
  await test('Verify Security Guard Rejection on Invalid/Dummy Token', async () => {
    const { data, error } = await client.rpc('get_admin_orders', { p_token: 'invalid_dummy_token_12345' });
    if (!error) throw new Error('Expected Access Denied error for invalid token, but succeeded');
    if (!error.message.includes('Access Denied')) {
      throw new Error(`Unexpected error message: ${error.message}`);
    }
    console.log(`         -> Properly caught expected Access Denied security rejection: "${error.message}"`);
  });

  // 4. Products Catalog Verification
  await test('Fetch Real Products Catalog from Supabase', async () => {
    const { data, error } = await client.from('products').select('*');
    if (error) throw error;
    if (!Array.isArray(data)) throw new Error('Expected array of products');
    console.log(`         -> Verified ${data.length} live products in master catalog`);
  });

  // 5. Customer Directory Verification
  await test('Fetch Real Customer Directory via Session Token', async () => {
    const { data, error } = await client.rpc('get_customer_directory', { p_token: sessionToken });
    if (error) throw error;
    if (!Array.isArray(data)) throw new Error('Expected array of patrons');
    console.log(`         -> Verified ${data.length} registered patrons in directory`);
  });

  console.log(`\n========================================================================`);
  console.log(`  ALL ${passed}/${total} TESTS PASSED! UI/UX AUTHENTICATION FLOW VERIFIED.`);
  console.log(`========================================================================\n`);
}

testSuite().catch((err) => {
  console.error('\nTEST SUITE FAILED:', err);
  process.exit(1);
});
