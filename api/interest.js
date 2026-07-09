const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

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

async function sendLeadEmail(lead) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpUser || !smtpPass) {
    console.warn('SMTP_USER/SMTP_PASS not set — skipping lead email notification');
    return;
  }

  const toEmail = process.env.NOTIFICATION_EMAIL || 'support@novacollective.vip';

  const htmlBody = `
    <h2>New NOVA Collective Lead (Interest List)</h2>
    <table style="border-collapse:collapse; font-family:sans-serif; font-size:14px;">
      <tr><td style="padding:8px 16px 8px 0; font-weight:bold;">Name</td><td style="padding:8px 0;">${lead.name || 'N/A'}</td></tr>
      <tr><td style="padding:8px 16px 8px 0; font-weight:bold;">Email</td><td style="padding:8px 0;"><a href="mailto:${lead.email}">${lead.email || ''}</a></td></tr>
      <tr><td style="padding:8px 16px 8px 0; font-weight:bold;">Business</td><td style="padding:8px 0;">${lead.specialty || 'N/A'}</td></tr>
      <tr><td style="padding:8px 16px 8px 0; font-weight:bold;">Submitted</td><td style="padding:8px 0;">${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}</td></tr>
    </table>
    <p style="margin-top:20px; font-size:13px; color:#888;">This lead was captured from the "Get on the list" section on novacollective.vip</p>
  `;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.privateemail.com',
      port: parseInt(process.env.SMTP_PORT || '465', 10),
      secure: true,
      auth: { user: smtpUser, pass: smtpPass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    await transporter.sendMail({
      from: `NOVA Collective <${smtpUser}>`,
      to: toEmail,
      subject: `New Lead: ${lead.name || 'Unknown'} — ${lead.specialty || 'Unknown Business'}`,
      html: htmlBody,
    });

    console.log('Lead notification email sent to', toEmail);
  } catch (emailErr) {
    console.error('Lead email send failed (non-blocking):', emailErr.message);
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
    const { name, email, specialty } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const supabase = getSupabase();
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
      res.status(500).json({ error: 'Failed to save interest signup' });
      return;
    }

    // Await email before responding — Vercel kills the function after res is sent
    await sendLeadEmail({ name, email, specialty });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
};
