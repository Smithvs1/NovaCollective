const { createClient } = require('@supabase/supabase-js');

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
  }
  return createClient(url, key);
}

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
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

    const supabase = getSupabase();
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
      res.status(500).json({ error: 'Failed to save application' });
      return;
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
};
