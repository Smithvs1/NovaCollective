const Stripe = require('stripe');

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }
  return new Stripe(key);
}

const BASE_AMOUNT = 50000; // $500.00 deposit
const ACH_FEE_CENTS = 400; // $4.00 flat ACH processing fee
const CARD_FEE_CENTS = 1500; // $15.00 flat card processing fee

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const stripe = getStripe();
    const { payment_method } = req.body || {};

    let paymentMethodTypes;
    let lineItems;

    if (payment_method === 'ach') {
      paymentMethodTypes = ['us_bank_account'];
      lineItems = [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'NOVA Collective Founding Member Deposit' },
            unit_amount: BASE_AMOUNT,
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'ACH Processing Fee' },
            unit_amount: ACH_FEE_CENTS,
          },
          quantity: 1,
        },
      ];
    } else {
      paymentMethodTypes = ['card'];
      lineItems = [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'NOVA Collective Founding Member Deposit' },
            unit_amount: BASE_AMOUNT,
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Card Processing Fee' },
            unit_amount: CARD_FEE_CENTS,
          },
          quantity: 1,
        },
      ];
    }

    const sessionParams = {
      mode: 'payment',
      payment_method_types: paymentMethodTypes,
      line_items: lineItems,
      success_url: 'https://www.novacollective.vip/deposit-success.html',
      cancel_url: 'https://www.novacollective.vip/choose-payment.html',
    };

    if (payment_method === 'ach') {
      sessionParams.payment_method_options = {
        us_bank_account: {
          financial_connections: { permissions: ['payment_method'] },
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: err.message || 'Failed to create checkout session' });
  }
};
