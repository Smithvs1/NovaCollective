const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://www.novacollective.vip',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(204).set(CORS_HEADERS).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).set(CORS_HEADERS).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      business_name,
      specialty,
      portfolio,
      clientele_size,
      message,
      status = 'new',
      created_display,
    } = req.body;

    const { error } = await supabase.from('applications').insert([
      {
        first_name,
        last_name,
        email,
        phone,
        business_name,
        specialty,
        portfolio,
        clientele_size,
        message,
        status,
        created_display,
      },
    ]);

    if (error) {
      console.error('Supabase insert error:', error);
      res.status(500).set(CORS_HEADERS).json({ error: 'Failed to save application' });
      return;
    }

    res.status(200).set(CORS_HEADERS).json({ success: true });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).set(CORS_HEADERS).json({ error: 'Internal server error' });
  }
};
