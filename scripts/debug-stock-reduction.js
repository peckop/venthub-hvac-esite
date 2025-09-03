// Debug script to investigate stock reduction failure
// Run in browser console

const orderID = '8a9ea6bf-14a3-4634-ade2-78b8b2e4e96a';
const SUPABASE_URL = 'https://tnofewwkwlyjsqgwjjga.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRub2Zld3drd2x5anNxZ3dqamdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2Mzg1MzIsImV4cCI6MjA3MTIxNDUzMn0.pqgvGZQS4x9WcIo7TqqobK_1PiUSbuCyw_mORBea4g4';

async function debugStockReduction() {
console.log('🔍 Debugging stock reduction failure for order:', orderID);

  try {
    // 1. Check order details and status
    console.log('\n1️⃣ Checking order details...');
    const orderResp = await fetch(`${SUPABASE_URL}/rest/v1/venthub_orders?id=eq.${orderID}&select=id,status,created_at,user_id`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });
    const orderData = await orderResp.json();
    console.log('📋 Order details:', orderData[0]);

    // 2. Check order items
    console.log('\n2️⃣ Checking order items...');
    const itemsResp = await fetch(`${SUPABASE_URL}/rest/v1/venthub_order_items?order_id=eq.${orderID}&select=product_id,quantity,price`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });
    const itemsData = await itemsResp.json();
    console.log('🛒 Order items:', itemsData);

    // 3. Check product details for each item (especially Adsorption Dehumidifier 250)
      console.log('\n3️⃣ Checking product details...');
    for (const item of itemsData) {
      const productResp = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${item.product_id}&select=id,name,stock_qty,low_stock_threshold`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY
        }
      });
      const productData = await productResp.json();
      console.log(`📦 Product "${productData[0]?.name}":`, {
        current_stock: productData[0]?.stock_qty,
        ordered_quantity: item.quantity,
        sufficient_stock: (productData[0]?.stock_qty || 0) >= item.quantity
      });
    }

    // 4. Check existing inventory movements for this order
    console.log('\n4️⃣ Checking existing inventory movements...');
    const movementsResp = await fetch(`${SUPABASE_URL}/rest/v1/inventory_movements?order_id=eq.${orderID}&select=product_id,quantity_change,reason,created_at`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });
    const movementsData = await movementsResp.json();
    console.log('📊 Existing inventory movements:', movementsData);

    // 5. Try to run stock reduction again and see detailed response
    console.log('\n5️⃣ Running stock reduction test...');
    const stockResp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/process_order_stock_reduction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ p_order_id: orderID })
    });
    
    const stockResult = await stockResp.json();
    console.log('🔧 Stock reduction result:', stockResult);

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

// Run the debug
debugStockReduction();
