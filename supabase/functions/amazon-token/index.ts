// Amazon LWA token exchange – keeps client_secret server-side
// Deploy: supabase functions deploy amazon-token
// Env vars needed (supabase secrets set):
//   AMAZON_CLIENT_ID
//   AMAZON_CLIENT_SECRET
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS })
  }

  try {
    const { code, code_verifier } = await req.json()
    if (!code || !code_verifier) {
      return new Response(JSON.stringify({ error: 'Missing code or code_verifier' }), {
        status: 400, headers: { 'Content-Type': 'application/json', ...CORS },
      })
    }

    const clientId     = Deno.env.get('AMAZON_CLIENT_ID')
    const clientSecret = Deno.env.get('AMAZON_CLIENT_SECRET')
    const redirectUri  = 'https://diogosilvano.github.io/Receitas/'

    if (!clientId || !clientSecret) {
      return new Response(JSON.stringify({ error: 'Amazon credentials not configured' }), {
        status: 500, headers: { 'Content-Type': 'application/json', ...CORS },
      })
    }

    const body = new URLSearchParams({
      grant_type:    'authorization_code',
      code,
      redirect_uri:  redirectUri,
      client_id:     clientId,
      client_secret: clientSecret,
      code_verifier,
    })

    const tokenRes = await fetch('https://api.amazon.com/auth/o2/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })

    const data = await tokenRes.json()

    return new Response(JSON.stringify(data), {
      status: tokenRes.status,
      headers: { 'Content-Type': 'application/json', ...CORS },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...CORS },
    })
  }
})
