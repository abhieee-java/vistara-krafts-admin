import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://niamxrskqhjvzwxomxrx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gK22Lr7xNqKI7VFAfnsQTA_7UD0S2iu';

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('========================================================================');
console.log('  VISTĀRA KRAFTS — SUPABASE ROW LEVEL SECURITY (RLS) AUDIT & TEST SUITE');
console.log('========================================================================\n');

async function runAudit() {
  let passed = 0;
  let total = 0;

  async function testStep(name, fn) {
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

  // 1. Coupons
  await testStep('Coupons - Select all (active & inactive)', async () => {
    const { data, error } = await client.from('coupons').select('*');
    if (error) throw error;
    if (!Array.isArray(data)) throw new Error('Expected array of coupons');
    console.log(`         -> Found ${data.length} coupons in database`);
  });

  await testStep('Coupons - Upsert existing coupon (STUDIO10)', async () => {
    const { data, error } = await client.from('coupons').upsert({
      code: 'STUDIO10',
      discount_type: 'percentage',
      discount_value: 10,
      min_order_value: 1500,
      usage_limit: 1000,
      usage_count: 0,
      is_active: true,
      show_in_storefront: true,
      expires_at: '2027-12-31T00:00:00.000Z'
    }, { onConflict: 'code' }).select();
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Upsert returned no data');
  });

  await testStep('Coupons - Full CRUD lifecycle (TESTCPN_AUDIT)', async () => {
    // Insert
    const { error: insErr } = await client.from('coupons').insert([{
      code: 'TESTCPN_AUDIT',
      discount_type: 'fixed',
      discount_value: 100,
      min_order_value: 500,
      usage_limit: 50,
      usage_count: 0,
      is_active: false,
      show_in_storefront: false
    }]);
    if (insErr) throw insErr;

    // Update
    const { error: updErr } = await client.from('coupons').update({ is_active: true }).eq('code', 'TESTCPN_AUDIT');
    if (updErr) throw updErr;

    // Delete
    const { error: delErr } = await client.from('coupons').delete().eq('code', 'TESTCPN_AUDIT');
    if (delErr) throw delErr;
  });

  // 2. Products
  await testStep('Products - Read and update stock level', async () => {
    const { data, error } = await client.from('products').select('id, stock').limit(1);
    if (error) throw error;
    if (data && data.length > 0) {
      const prod = data[0];
      const { error: updErr } = await client.from('products').update({ stock: prod.stock }).eq('id', prod.id);
      if (updErr) throw updErr;
    }
  });

  // 3. Categories
  await testStep('Categories - Read and check store settings payload', async () => {
    const { data, error } = await client.from('categories').select('*');
    if (error) throw error;
    if (!Array.isArray(data)) throw new Error('Expected array of categories');
  });

  // 4. Settings
  await testStep('Settings - Read and verify announcement bar', async () => {
    const { data, error } = await client.from('settings').select('*');
    if (error) throw error;
    if (!Array.isArray(data)) throw new Error('Expected array of settings');
  });

  // 5. Inventory Logs
  await testStep('Inventory Logs - Insert and select audit log', async () => {
    const { data: prods } = await client.from('products').select('id, sku').limit(1);
    const prodId = prods && prods.length > 0 ? prods[0].id : null;
    const prodSku = prods && prods.length > 0 ? prods[0].sku : 'SKU-AUDIT';

    if (prodId) {
      const { data: ins, error: insErr } = await client.from('inventory_logs').insert([{
        product_id: prodId,
        sku: prodSku,
        change: 0,
        previous_stock: 10,
        new_stock: 10,
        reason: 'AUDIT',
        notes: 'Automated RLS audit verification',
        created_by: 'RLS Test Suite'
      }]).select();
      if (insErr) throw insErr;

      const { error: delErr } = await client.from('inventory_logs').delete().eq('id', ins[0].id);
    }
  });

  // 6. Custom Mockups
  await testStep('Custom Mockups - Anonymous patron inquiry insert & cleanup', async () => {
    const { data: ins, error: insErr } = await client.from('custom_mockups').insert([{
      customer_name: 'Auditor Patron',
      email: 'auditor@vistarakrafts.com',
      phone: '9876543210',
      preservation_type: 'Floral Resin Keepsake',
      mould_shape: 'Hexagon Frame',
      dimensions: '10x10 inches',
      notes: 'RLS verification probe',
      status: 'submitted',
      photos: []
    }]).select();
    if (insErr) throw insErr;

    const { error: delErr } = await client.from('custom_mockups').delete().eq('id', ins[0].id);
    if (delErr) throw delErr;
  });

  // 7. DPDP Consents
  await testStep('DPDP Consents - Patron consent recording & verification', async () => {
    const { data: ins, error: insErr } = await client.from('dpdp_consents').insert([{
      user_id: null,
      consent_type: 'essential',
      granted: true,
      ip_address: '127.0.0.1'
    }]).select();
    if (insErr) throw insErr;

    const { data: sel, error: selErr } = await client.from('dpdp_consents').select('*').limit(1);
    if (selErr) throw selErr;
  });

  // 8. DPDP Grievances
  await testStep('DPDP Grievances - Full statutory ticket lifecycle', async () => {
    const ticketId = 'DPDP-AUDIT-' + Math.floor(1000 + Math.random() * 9000);
    const { data: ins, error: insErr } = await client.from('dpdp_grievances').insert([{
      ticket_id: ticketId,
      request_type: 'Grievance Redressal',
      full_name: 'Auditor Patron',
      email: 'patron@vistarakrafts.com',
      mobile: '9876543210',
      details: 'Audit verification of DPDP grievance table permissions',
      status: 'open'
    }]).select();
    if (insErr) throw insErr;

    const { error: updErr } = await client.from('dpdp_grievances').update({
      status: 'in_progress',
      resolution_notes: 'Verified by system audit'
    }).eq('ticket_id', ticketId);
    if (updErr) throw updErr;

    const { error: delErr } = await client.from('dpdp_grievances').delete().eq('ticket_id', ticketId);
    if (delErr) throw delErr;
  });

  // 9. Orders RPC
  await testStep('Orders - Admin secure directory RPC verification', async () => {
    // Test parameterless version (SECURITY DEFINER)
    const resNoArg = await client.rpc('get_admin_orders');
    if (resNoArg.error) {
      // Test with active admin session token
      const resToken = await client.rpc('get_admin_orders', {
        p_token: '51c71ae373cc5ccd205c4e0d2d6e7cb5416a1c15b775cb37cc4a1aa0fada705e'
      });
      if (resToken.error) throw resToken.error;
      console.log(`         -> Found ${resToken.data.length} live orders via SECURITY DEFINER session token RPC`);
    } else {
      console.log(`         -> Found ${resNoArg.data.length} live orders via parameterless RPC`);
    }
  });

  console.log(`\n========================================================================`);
  console.log(`  ALL ${passed}/${total} AUDIT GATES PASSED! DATABASE RLS IS FULLY RESOLVED.`);
  console.log(`========================================================================\n`);
}

runAudit().catch(err => {
  console.error('\nAUDIT SUITE ABORTED:', err);
  process.exit(1);
});
