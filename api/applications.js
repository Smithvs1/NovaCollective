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

async function sendNotificationEmail(applicant) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping email notification');
    return;
  }

  const toEmail = process.env.NOTIFICATION_EMAIL || 'support@novacollective.vip';
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'NOVA Collective <notifications@novacollective.vip>';

  const htmlBody = `
    <h2>New NOVA Collective Application</h2>
    <table style="border-collapse:collapse; font-family:sans-serif; font-size:14px;">
      <tr><td style="padding:8px 16px 8px 0; font-weight:bold;">Name</td><td style="padding:8px 0;">${applicant.first_name || ''} ${applicant.last_name || ''}</td></tr>
      <tr><td style="padding:8px 16px 8px 0; font-weight:bold;">Email</td><td style="padding:8px 0;"><a href="mailto:${applicant.email}">${applicant.email || ''}</a></td></tr>
      <tr><td style="padding:8px 16px 8px 0; font-weight:bold;">Phone</td><td style="padding:8px 0;">${applicant.phone || ''}</td></tr>
      <tr><td style="padding:8px 16px 8px 0; font-weight:bold;">Business</td><td style="padding:8px 0;">${applicant.business_name || 'N/A'}</td></tr>
      <tr><td style="padding:8px 16px 8px 0; font-weight:bold;">Specialty</td><td style="padding:8px 0;">${applicant.specialty || ''}</td></tr>
      <tr><td style="padding:8px 16px 8px 0; font-weight:bold;">Portfolio</td><td style="padding:8px 0;">${applicant.portfolio ? '<a href="' + applicant.portfolio + '">' + applicant.portfolio + '</a>' : 'N/A'}</td></tr>
      <tr><td style="padding:8px 16px 8px 0; font-weight:bold;">Clientele</td><td style="padding:8px 0;">${applicant.clientele_size || 'N/A'}</td></tr>
      <tr><td style="padding:8px 16px 8px 0; font-weight:bold;">Message</td><td style="padding:8px 0;">${applicant.message || 'N/A'}</td></tr>
      <tr><td style="padding:8px 16px 8px 0; font-weight:bold;">Submitted</td><td style="padding:8px 0;">${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}</td></tr>
    </table>
    <p style="margin-top:20px; font-size:13px; color:#888;">This notification was sent automatically from novacollective.vip</p>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: `New Application: ${applicant.first_name || ''} ${applicant.last_name || ''} — ${applicant.specialty || 'Unknown Specialty'}`,
        html: htmlBody,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Resend email error:', response.status, errBody);
    } else {
      console.log('Notification email sent to', toEmail);
    }
  } catch (emailErr) {
    console.error('Email send failed (non-blocking):', emailErr.message);
  }
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

    sendNotificationEmail({
      first_name, last_name, email, phone,
      business_name, specialty, portfolio, clientele_size, message,
    }).catch(err => console.error('Email notification error:', err));

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
};
