require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────────────────

// Stripe webhooks need the raw body for signature verification.
// Mount the webhook route BEFORE the JSON body-parser.
app.post(
  '/stripe/webhook',
  bodyParser.raw({ type: 'application/json' }),
  (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        const { gigId, posterId } = pi.metadata;
        console.log(`PaymentIntent succeeded for gig ${gigId} (poster: ${posterId}): $${(pi.amount / 100).toFixed(2)}`);
        // In production: update gig.escrowStatus = 'in_escrow' in database
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object;
        console.error(`PaymentIntent failed: ${pi.id} — ${pi.last_payment_error?.message}`);
        break;
      }
      case 'transfer.created': {
        const transfer = event.data.object;
        console.log(`Transfer created: ${transfer.id} — $${(transfer.amount / 100).toFixed(2)}`);
        // In production: mark gig.escrowStatus = 'released'
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object;
        console.log(`Charge refunded: ${charge.id}`);
        // In production: mark gig.escrowStatus = 'refunded'
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  }
);

// JSON parsing for all other routes
app.use(cors());
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────────────────

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'ugig-stripe-server' });
});

// Create a PaymentIntent (poster funds escrow)
app.post('/stripe/create-payment-intent', async (req, res) => {
  try {
    const { gigId, amountCents, posterId } = req.body;

    if (!gigId || !amountCents) {
      return res.status(400).json({ error: 'gigId and amountCents are required' });
    }

    if (typeof amountCents !== 'number' || amountCents < 50) {
      return res.status(400).json({ error: 'amountCents must be a number >= 50 (i.e. $0.50)' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      metadata: {
        gigId,
        posterId: posterId || 'unknown',
        type: 'gig_escrow',
      },
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error('Error creating PaymentIntent:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Release escrow — transfer funds to worker's connected account
// Stub for Stripe Connect integration
app.post('/stripe/release-escrow', async (req, res) => {
  try {
    const { gigId, paymentIntentId, workerAccountId, amountCents, platformFeeCents } = req.body;

    // TODO: When Stripe Connect is live, create a transfer:
    // const transfer = await stripe.transfers.create({
    //   amount: amountCents - platformFeeCents,
    //   currency: 'usd',
    //   destination: workerAccountId,
    //   transfer_group: `gig_${gigId}`,
    // });

    console.log(`Escrow released for gig ${gigId}: PI ${paymentIntentId}, $${((amountCents - platformFeeCents) / 100).toFixed(2)} to ${workerAccountId}`);
    res.json({ success: true, gigId });
  } catch (err) {
    console.error('Error releasing escrow:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Refund escrow — refund the poster's payment
// Stub for dispute resolution
app.post('/stripe/refund-escrow', async (req, res) => {
  try {
    const { paymentIntentId, gigId } = req.body;

    // TODO: When live:
    // const refund = await stripe.refunds.create({ payment_intent: paymentIntentId });

    console.log(`Escrow refunded for gig ${gigId}: PI ${paymentIntentId}`);
    res.json({ success: true, gigId });
  } catch (err) {
    console.error('Error refunding escrow:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Create a Stripe Connect account for a worker
// Stub for future onboarding
app.post('/stripe/create-connected-account', async (req, res) => {
  try {
    const { userId, email } = req.body;

    // TODO: When Stripe Connect is live:
    // const account = await stripe.accounts.create({
    //   type: 'express',
    //   country: 'US',
    //   email,
    //   capabilities: { transfers: { requested: true } },
    //   metadata: { userId },
    // });
    // const accountLink = await stripe.accountLinks.create({
    //   account: account.id,
    //   refresh_url: `${process.env.APP_URL}/stripe/onboarding/refresh`,
    //   return_url: `${process.env.APP_URL}/stripe/onboarding/complete`,
    //   type: 'account_onboarding',
    // });

    console.log(`Connected account stub for user ${userId} (${email})`);
    res.json({
      accountId: `acct_mock_${userId}`,
      onboardingUrl: 'https://connect.stripe.com/mock-onboarding',
    });
  } catch (err) {
    console.error('Error creating connected account:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Start ──────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`UGig Stripe server running on http://localhost:${PORT}`);
  console.log(`Webhook endpoint: POST http://localhost:${PORT}/stripe/webhook`);

  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_...') {
    console.warn('\n  STRIPE_SECRET_KEY is not set. Copy .env.example to .env and add your keys.');
    console.warn('   Get test keys at: https://dashboard.stripe.com/test/apikeys\n');
  }
});
