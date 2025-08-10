import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, addDoc, collection, deleteDoc, getDocs, query, where, limit } from 'firebase/firestore';

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

async function findIntentIdBySessionId(sessionId) {
  try {
    const qs = query(collection(db, 'booking_intents'), where('stripeCheckoutSessionId', '==', sessionId), limit(1));
    const snap = await getDocs(qs);
    if (!snap.empty) return snap.docs[0].id;
  } catch (e) {
    console.error('findIntentIdBySessionId error', e);
  }
  return null;
}

async function createBookingFromIntent(intentId, sessionLike) {
  try {
    if (!intentId) return false;
    const intentRef = doc(db, 'booking_intents', intentId);
    const intentSnap = await getDoc(intentRef);
    if (!intentSnap.exists()) return false;
    const intent = intentSnap.data();

    if (intent.consumedAt) return true;

    const bookingRef = await addDoc(collection(db, 'bookings'), {
      clientId: intent.clientId,
      showId: intent.showId,
      showName: intent.showName,
      showData: intent.showData,
      datesNeeded: intent.datesNeeded,
      notes: intent.notes,
      totalStaffNeeded: intent.totalStaffNeeded,
      status: 'deposit_paid',
      paymentStatus: 'payment_pending',
      bookingFeeCents: intent.bookingFeeCents,
      primaryContactId: intent.primaryContactId || null,
      primaryLocationId: intent.primaryLocationId || null,
      stripeCheckoutSessionId: sessionLike?.id || null,
      stripePaymentIntentId: sessionLike?.payment_intent || sessionLike?.id || null,
      stripeCustomerId: sessionLike?.customer || null,
      bookingFeeCentsPaid: sessionLike?.amount_total || sessionLike?.amount || null,
      createdAt: intent.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await updateDoc(intentRef, { consumedAt: new Date().toISOString(), bookingId: bookingRef.id });
    return true;
  } catch (e) {
    console.error('createBookingFromIntent error', e);
    return false;
  }
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
        let intentId = session.metadata?.intentId;
        if (!intentId && session.payment_intent) {
          try {
            const pi = await stripe.paymentIntents.retrieve(session.payment_intent);
            intentId = pi?.metadata?.intentId || intentId;
          } catch (e) {
            console.error('Failed to retrieve PI for session', session.id, e?.message);
          }
        }
        if (!intentId) {
          intentId = await findIntentIdBySessionId(session.id);
        }
        if (intentId) {
          const created = await createBookingFromIntent(intentId, session);
          if (!created) console.warn('Intent not created/consumed', intentId, 'for session', session.id);
        } else {
          console.warn('No intentId resolvable for session', session.id);
        }
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object;
        const intentId = session.metadata?.intentId || (await findIntentIdBySessionId(session.id));
        if (intentId) {
          try { await deleteDoc(doc(db, 'booking_intents', intentId)); } catch (_) {}
        }
        break;
      }
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        if (pi.metadata?.type === 'final_fee' && pi.metadata?.bookingId) {
          await updateDoc(doc(db, 'bookings', pi.metadata.bookingId), {
            status: 'paid',
            paymentStatus: 'paid',
            finalFeeCentsPaid: pi.amount,
            stripeFinalPaymentIntentId: pi.id,
            updatedAt: new Date().toISOString(),
          });
        }
        if (pi.metadata?.type === 'booking_fee') {
          let intentId = pi.metadata?.intentId;
          if (!intentId) {
            // Try to locate the Checkout Session for this PI
            try {
              const sessions = await stripe.checkout.sessions.list({ payment_intent: pi.id, limit: 1 });
              const s = sessions?.data?.[0];
              if (s) {
                intentId = s.metadata?.intentId || (await findIntentIdBySessionId(s.id));
                if (intentId) await createBookingFromIntent(intentId, { id: s.id, payment_intent: pi.id, customer: s.customer, amount_total: s.amount_total });
              }
            } catch (e) {
              console.error('sessions.list failed for PI', pi.id, e?.message);
            }
          } else {
            await createBookingFromIntent(intentId, { id: null, payment_intent: pi.id, customer: pi.customer, amount: pi.amount });
          }
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const bookingId = invoice.metadata?.bookingId;
        if (bookingId) {
          await updateDoc(doc(db, 'bookings', bookingId), {
            status: 'paid',
            paymentStatus: 'paid',
            finalFeeCentsPaid: invoice.amount_paid,
            stripeInvoiceId: invoice.id,
            updatedAt: new Date().toISOString(),
          });
        }
        break;
      }
      default:
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error', error);
    res.status(500).json({ message: 'Internal webhook error' });
  }
} 