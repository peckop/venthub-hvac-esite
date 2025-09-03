// İyzico config test function
Deno.serve(async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: cors });
  }

  try {
    // Environment variables check
    const checks = {
      SUPABASE_URL: !!Deno.env.get('SUPABASE_URL'),
      SUPABASE_SERVICE_ROLE_KEY: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      IYZICO_API_KEY: !!Deno.env.get('IYZICO_API_KEY'),
      IYZICO_SECRET_KEY: !!Deno.env.get('IYZICO_SECRET_KEY'),
      IYZICO_BASE_URL: Deno.env.get('IYZICO_BASE_URL') || 'sandbox-default'
    };

    const missing = Object.entries(checks)
      .filter(([key, exists]) => key !== 'IYZICO_BASE_URL' && !exists)
      .map(([key]) => key);

    return new Response(JSON.stringify({
      success: missing.length === 0,
      checks,
      missing_vars: missing,
      message: missing.length === 0 ? 'All config OK' : `Missing: ${missing.join(', ')}`
    }), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' }
    });
  }
});
