import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

async function readRawBody(req) {
  return await new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    const buf = await readRawBody(req);
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const bookingId = session.metadata?.bookingId;
        const paymentIntentId = session.payment_intent;
        if (bookingId) {
          await updateDoc(doc(db, 'bookings', bookingId), {
            status: 'deposit_paid',
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId: paymentIntentId,
            stripeCustomerId: session.customer,
            bookingFeeCentsPaid: session.amount_total || null,
            updatedAt: new Date().toISOString(),
          });
        }
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object;
        const bookingId = session.metadata?.bookingId;
        if (bookingId) {
          await updateDoc(doc(db, 'bookings', bookingId), {
            status: 'payment_expired',
            updatedAt: new Date().toISOString(),
          });
        }
        break;
      }
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        if (pi.metadata?.type === 'final_fee' && pi.metadata?.bookingId) {
          await updateDoc(doc(db, 'bookings', pi.metadata.bookingId), {
            status: 'final_paid',
            finalFeeCentsPaid: pi.amount,
            stripeFinalPaymentIntentId: pi.id,
            updatedAt: new Date().toISOString(),
          });
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const bookingId = invoice.metadata?.bookingId;
        if (bookingId) {
          await updateDoc(doc(db, 'bookings', bookingId), {
            status: 'final_paid',
            finalFeeCentsPaid: invoice.amount_paid,
            stripeInvoiceId: invoice.id,
            updatedAt: new Date().toISOString(),
          });
        }
        break;
      }
      default:
        // no-op for unhandled events
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error', error);
    res.status(500).json({ message: 'Internal webhook error' });
  }
} 