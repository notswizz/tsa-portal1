import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, addDoc, collection, getDocs, query, where, limit } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

async function findIntentIdBySessionId(sessionId) {
  const qs = query(collection(db, 'booking_intents'), where('stripeCheckoutSessionId', '==', sessionId), limit(1));
  const snap = await getDocs(qs);
  if (!snap.empty) return snap.docs[0].id;
  return null;
}

async function createBookingFromIntent(intentId, sessionLike) {
  const intentRef = doc(db, 'booking_intents', intentId);
  const intentSnap = await getDoc(intentRef);
  if (!intentSnap.exists()) return { created: false, reason: 'intent_not_found' };
  const intent = intentSnap.data();
  if (intent.consumedAt && intent.bookingId) return { created: true, bookingId: intent.bookingId, idempotent: true };

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
  return { created: true, bookingId: bookingRef.id };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
  try {
    const { session_id } = req.query || {};
    if (!session_id) return res.status(400).json({ message: 'Missing session_id' });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (!session || session.status !== 'complete') {
      return res.status(400).json({ message: 'Session not complete', status: session?.status || null });
    }

    let intentId = session.metadata?.intentId;
    if (!intentId && session.payment_intent) {
      try {
        const pi = await stripe.paymentIntents.retrieve(session.payment_intent);
        intentId = pi?.metadata?.intentId || intentId;
      } catch (_) {}
    }
    if (!intentId) {
      intentId = await findIntentIdBySessionId(session.id);
    }
    if (!intentId) return res.status(404).json({ message: 'No linked booking intent for session' });

    const result = await createBookingFromIntent(intentId, session);
    if (!result.created && result.reason === 'intent_not_found') return res.status(404).json({ message: 'Booking intent not found' });

    return res.status(200).json({ success: true, bookingId: result.bookingId || null, idempotent: !!result.idempotent });
  } catch (error) {
    console.error('confirm-session error', error);
    return res.status(500).json({ message: error.message || 'Internal error' });
  }
} 