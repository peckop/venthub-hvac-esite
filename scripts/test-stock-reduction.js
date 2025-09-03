// Manuel stok düşümü test scripti
// Browser console'da çalıştırın

// Order ID'niz
const orderID = '8a9ea6bf-14a3-4634-ade2-78b8b2e4e96a';

// Supabase config (site'den alınacak)
const SUPABASE_URL = 'https://tnofewwkwlyjsqgwjjga.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRub2Zld3drd2x5anNxZ3dqamdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2Mzg1MzIsImV4cCI6MjA3MTIxNDUzMn0.pqgvGZQS4x9WcIo7TqqobK_1PiUSbuCyw_mORBea4g4';

// Manuel RPC çağrısı
async function testStockReduction() {
  try {
    console.log('🧪 Testing stock reduction for order:', orderID);
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/process_order_stock_reduction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        p_order_id: orderID
      })
    });
    
    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Stock reduction result:', result);
      return result;
    } else {
      const error = await response.text();
      console.error('❌ Stock reduction failed:', error);
      return null;
    }
  } catch (err) {
    console.error('❌ Request error:', err);
    return null;
  }
}

// Çalıştır
testStockReduction();
