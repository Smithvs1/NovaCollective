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
    const { name, email, specialty } = req.body;

    if (!email) {
      res.status(400).set(CORS_HEADERS).json({ error: 'Email is required' });
      return;
    }

    const { error } = await supabase.from('interest_list').insert([
      {
        name,
        email,
        specialty,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('Supabase insert error:', error);
      res.status(500).set(CORS_HEADERS).json({ error: 'Failed to save interest signup' });
      return;
    }

    res.status(200).set(CORS_HEADERS).json({ success: true });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).set(CORS_HEADERS).json({ error: 'Internal server error' });
  }
};
