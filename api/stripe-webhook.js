const Stripe = require('stripe');
const nodemailer = require('nodemailer');

// Vercel config: disable automatic body parsing so we get raw body for Stripe signature verification
const config = { api: { bodyParser: false } };

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY');
  return new Stripe(key);
}

async function sendNotification(session) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    console.warn('SMTP not configured — skipping payment notification email');
    return;
  }

  const amount = (session.amount_total / 100).toFixed(2);
  const email = session.customer_details?.email || 'N/A';
  const name = session.customer_details?.name || 'N/A';
  const paymentMethod = session.payment_method_types?.[0] || 'unknown';
  const methodLabel = paymentMethod === 'us_bank_account' ? 'ACH Bank Transfer' : 'Credit/Debit Card';

  const transporter = nodemailer.createTransport({
    host: 'mail.privateemail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 5000,
  });

  const html = `
    <h2>New Deposit Payment Received</h2>
    <table style="border-collapse:collapse; font-family:sans-serif;">
      <tr><td style="padding:8px; font-weight:bold;">Name:</td><td style="padding:8px;">${name}</td></tr>
      <tr><td style="padding:8px; font-weight:bold;">Email:</td><td style="padding:8px;">${email}</td></tr>
      <tr><td style="padding:8px; font-weight:bold;">Amount:</td><td style="padding:8px;">$${amount}</td></tr>
      <tr><td style="padding:8px; font-weight:bold;">Method:</td><td style="padding:8px;">${methodLabel}</td></tr>
      <tr><td style="padding:8px; font-weight:bold;">Stripe Payment ID:</td><td style="padding:8px;">${session.payment_intent || session.id}</td></tr>
    </table>
    <p style="margin-top:20px; color:#666;">View full details in your <a href="https://dashboard.stripe.com/payments">Stripe Dashboard</a>.</p>
  `;

  await transporter.sendMail({
    from: `"NOVA Collective" <${user}>`,
    to: 'support@novacollective.vip',
    subject: `💰 New Deposit: $${amount} from ${name}`,
    html,
  });
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const stripe = getStripe();
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET env var');
    res.status(500).json({ error: 'Webhook not configured' });
    return;
  }

  let event;
  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const rawBody = Buffer.concat(chunks).toString('utf8');

    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    if (session.payment_status === 'paid') {
      try {
        await sendNotification(session);
        console.log('Payment notification sent for session:', session.id);
      } catch (emailErr) {
        console.error('Failed to send payment notification:', emailErr.message);
      }
    }
  } else if (event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object;
    try {
      await sendNotification(session);
      console.log('ACH payment confirmed, notification sent for session:', session.id);
    } catch (emailErr) {
      console.error('Failed to send ACH payment notification:', emailErr.message);
    }
  } else if (event.type === 'checkout.session.async_payment_failed') {
    const session = event.data.object;
    const email = session.customer_details?.email || 'unknown';
    console.error(`ACH payment FAILED for ${email}, session: ${session.id}`);
  }

  res.status(200).json({ received: true });
}

module.exports = handler;
module.exports.config = config;
