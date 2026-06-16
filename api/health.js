module.exports = function handler(req, res) {
  res.status(200).json({
    ok: true,
    env: {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_KEY,
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
      nodeVersion: process.version,
    },
  });
};
