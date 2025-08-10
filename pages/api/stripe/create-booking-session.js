import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, addDoc, collection, updateDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

export default async function handler(req, res) {
  // Basic CORS + health for preflight
  const origin = req.headers.origin || (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Vary', 'Origin');
  res.setHeader('x-create-booking-session', 'hit');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'You must be signed in to access this endpoint.' });
  }
  if (session.user.role !== 'client') {
    return res.status(403).json({ message: 'Access denied. Client role required.' });
  }

  const { showId, notes, datesNeeded, totalStaffNeeded } = req.body || {};
  if (!showId || !Array.isArray(datesNeeded) || datesNeeded.length === 0) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const originForUrls = req.headers.origin || (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000');

    // Load client
    const clientId = session.user.id;
    const clientRef = doc(db, 'clients', clientId);
    const clientSnap = await getDoc(clientRef);
    const clientData = clientSnap.exists() ? clientSnap.data() : {};

    // Ensure Stripe customer
    let stripeCustomerId = clientData.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: clientData.companyName || session.user.name || session.user.email,
        metadata: { clientId }
      });
      stripeCustomerId = customer.id;
      await setDoc(clientRef, { ...clientData, stripeCustomerId }, { merge: true });
    }

    // Load show info
    const showRef = doc(db, 'shows', showId);
    const showSnap = await getDoc(showRef);
    if (!showSnap.exists()) {
      return res.status(400).json({ message: 'Selected show not found' });
    }
    const show = showSnap.data();

    // Determine booking fee (in cents)
    const bookingFeeCents = parseInt(process.env.STRIPE_BOOKING_FEE_CENTS || '0', 10);
    if (!bookingFeeCents || bookingFeeCents < 50) {
      return res.status(500).json({ message: 'Server missing STRIPE_BOOKING_FEE_CENTS (>=50)' });
    }

    // Create booking record (pending payment)
    const createdAt = new Date().toISOString();
    const bookingDocRef = await addDoc(collection(db, 'bookings'), {
      clientId,
      showId,
      showName: show.name,
      showData: {
        location: show.location,
        startDate: show.startDate,
        endDate: show.endDate,
      },
      datesNeeded,
      notes: notes || '',
      totalStaffNeeded: typeof totalStaffNeeded === 'number' ? totalStaffNeeded : (datesNeeded || []).reduce((s, d) => s + (d.staffCount || 0), 0),
      status: 'payment_pending',
      paymentStatus: 'payment_pending',
      bookingFeeCents,
      createdAt,
    });

    const bookingId = bookingDocRef.id;

    // Create Checkout Session for booking fee and save PM for off_session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Booking fee for ${show.name}`,
              metadata: { bookingId },
            },
            unit_amount: bookingFeeCents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        setup_future_usage: 'off_session',
        metadata: { bookingId, type: 'booking_fee' },
      },
      metadata: { bookingId, type: 'booking_fee' },
      success_url: `${originForUrls}/client/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${originForUrls}/client/dashboard?tab=book`,
    });

    await updateDoc(bookingDocRef, {
      stripeCheckoutSessionId: checkoutSession.id,
      stripeCustomerId,
    });

    return res.status(200).json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe booking session error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
} 