const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    res.status(500).json({ error: 'SMTP_USER or SMTP_PASS not configured' });
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.privateemail.com',
      port: parseInt(process.env.SMTP_PORT || '465', 10),
      secure: true,
      auth: { user: smtpUser, pass: smtpPass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });

    // Verify SMTP connection
    await transporter.verify();

    // Send a test email
    const info = await transporter.sendMail({
      from: `NOVA Collective <${smtpUser}>`,
      to: process.env.NOTIFICATION_EMAIL || 'support@novacollective.vip',
      subject: 'NOVA Collective - Email Test',
      html: '<h2>Email notifications are working!</h2><p>This is a test message from the NOVA Collective application system.</p><p>Sent at: ' + new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }) + '</p>',
    });

    res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
      messageId: info.messageId,
      smtpHost: process.env.SMTP_HOST || 'mail.privateemail.com',
      smtpPort: process.env.SMTP_PORT || '465',
      from: smtpUser,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      code: err.code || null,
      smtpHost: process.env.SMTP_HOST || 'mail.privateemail.com',
      smtpPort: process.env.SMTP_PORT || '465',
      from: smtpUser,
    });
  }
};
