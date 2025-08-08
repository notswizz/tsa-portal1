import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

function computeFinalFromBooking(booking, overrideRateCents) {
  const rateCents = typeof overrideRateCents === 'number' && overrideRateCents > 0
    ? overrideRateCents
    : parseInt(process.env.STRIPE_FINAL_RATE_CENTS || '20000', 10); // default $200/day/staff

  const staffDays = (booking?.datesNeeded || []).reduce((sum, d) => sum + (parseInt(d.staffCount || 0, 10) || 0), 0);
  const totalCents = staffDays * rateCents;
  return { rateCents, staffDays, totalCents };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'You must be signed in to access this endpoint.' });
  }
  if (!['staff', 'admin'].includes(session.user.role)) {
    return res.status(403).json({ message: 'Access denied. Staff/Admin role required.' });
  }

  const { bookingId, finalFeeCents, dryRun = false, overrideRateCents } = req.body || {};
  if (!bookingId) {
    return res.status(400).json({ message: 'bookingId is required' });
  }

  try {
    const origin = req.headers.origin || (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000');

    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingRef);
    if (!bookingSnap.exists()) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    const booking = bookingSnap.data();

    const { rateCents, staffDays, totalCents } = computeFinalFromBooking(booking, overrideRateCents);

    const amountToChargeCents = typeof finalFeeCents === 'number' && finalFeeCents > 0 ? finalFeeCents : totalCents;
    if (!amountToChargeCents || amountToChargeCents < 50) {
      return res.status(400).json({ message: 'Calculated final amount is too low or invalid' });
    }

    if (dryRun) {
      return res.status(200).json({
        dryRun: true,
        bookingId,
        computed: { rateCents, staffDays, totalCents },
        amountToChargeCents,
      });
    }

    const customerId = booking.stripeCustomerId;
    if (!customerId) {
      return res.status(400).json({ message: 'No Stripe customer stored for this booking/client' });
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountToChargeCents,
        currency: 'usd',
        customer: customerId,
        off_session: true,
        confirm: true,
        metadata: { bookingId, type: 'final_fee' },
      });

      await updateDoc(bookingRef, {
        status: 'final_paid',
        finalFeeCentsPaid: paymentIntent.amount,
        stripeFinalPaymentIntentId: paymentIntent.id,
        finalCalculation: {
          rateCents,
          staffDays,
          totalCents,
          chargedCents: paymentIntent.amount,
          chargedAt: new Date().toISOString(),
          triggeredByUserId: session.user.id,
        },
        updatedAt: new Date().toISOString(),
      });

      return res.status(200).json({ success: true, paymentIntentId: paymentIntent.id, amountCents: paymentIntent.amount });
    } catch (err) {
      // If card requires authentication, fall back to Checkout to collect it
      if (err.code === 'authentication_required' || err.code === 'payment_intent_authentication_failure' || err.decline_code === 'authentication_required') {
        const checkoutSession = await stripe.checkout.sessions.create({
          mode: 'payment',
          customer: customerId,
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: { name: `Final staffing fee for ${booking.showName || 'your event'}` },
                unit_amount: amountToChargeCents,
              },
              quantity: 1,
            },
          ],
          metadata: { bookingId, type: 'final_fee' },
          payment_intent_data: { metadata: { bookingId, type: 'final_fee' } },
          success_url: `${origin}/client/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/client/dashboard`,
        });

        await updateDoc(bookingRef, {
          finalCalculation: {
            rateCents,
            staffDays,
            totalCents,
            requiresActionCents: amountToChargeCents,
            checkoutSessionId: checkoutSession.id,
            createdAt: new Date().toISOString(),
            triggeredByUserId: session.user.id,
          },
          updatedAt: new Date().toISOString(),
        });

        return res.status(200).json({ requiresAction: true, url: checkoutSession.url });
      }
      throw err;
    }
  } catch (error) {
    console.error('Final charge error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
} 