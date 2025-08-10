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

  // Allow internal server-to-server calls from admin via a shared secret
  const internalKeyHeader = req.headers['x-internal-key'] || req.headers['x-internal-service-key'];
  const internalKey = typeof internalKeyHeader === 'string' ? internalKeyHeader : Array.isArray(internalKeyHeader) ? internalKeyHeader[0] : undefined;

  let requesterUser = null;
  if (internalKey && process.env.INTERNAL_ADMIN_API_KEY && internalKey === process.env.INTERNAL_ADMIN_API_KEY) {
    requesterUser = { id: 'internal_admin', role: 'admin', email: 'internal@system' };
  } else {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'You must be signed in to access this endpoint.' });
    }
    if (!['staff', 'admin'].includes(session.user.role)) {
      return res.status(403).json({ message: 'Access denied. Staff/Admin role required.' });
    }
    requesterUser = session.user;
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

    // Try to find a suitable saved payment method to confirm off_session
    let paymentMethodId = null;
    try {
      // Prefer the card used on deposit/booking fee
      if (booking.stripePaymentIntentId) {
        const depositPi = await stripe.paymentIntents.retrieve(booking.stripePaymentIntentId);
        if (depositPi && typeof depositPi.payment_method === 'string') {
          paymentMethodId = depositPi.payment_method;
        } else if (depositPi && depositPi.payment_method && depositPi.payment_method.id) {
          paymentMethodId = depositPi.payment_method.id;
        }
      }
      // Fallback to customer default payment method
      if (!paymentMethodId) {
        const customer = await stripe.customers.retrieve(customerId);
        const defaultPm = customer?.invoice_settings?.default_payment_method;
        if (typeof defaultPm === 'string') {
          paymentMethodId = defaultPm;
        } else if (defaultPm && defaultPm.id) {
          paymentMethodId = defaultPm.id;
        }
      }
      // As last resort, list attached card methods
      if (!paymentMethodId) {
        const list = await stripe.paymentMethods.list({ customer: customerId, type: 'card', limit: 1 });
        if (list.data && list.data.length > 0) {
          paymentMethodId = list.data[0].id;
        }
      }
    } catch (pmErr) {
      // Ignore and let fallback handle missing payment method
    }

    // Validate that we have a plausible card PaymentMethod id
    if (paymentMethodId && (typeof paymentMethodId !== 'string' || !paymentMethodId.startsWith('pm_'))) {
      paymentMethodId = null;
    }

    // Ensure the PaymentMethod is attached to this customer; attach if unattached; if belongs to someone else, fall back
    if (paymentMethodId) {
      try {
        const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
        const pmCustomer = typeof pm.customer === 'string' ? pm.customer : (pm.customer && pm.customer.id ? pm.customer.id : null);
        if (!pmCustomer) {
          await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
        } else if (pmCustomer !== customerId) {
          // Don't try to reattach across customers; fall back to Checkout
          paymentMethodId = null;
        }
      } catch (_) {
        // If we fail to retrieve or attach, drop to fallback
        paymentMethodId = null;
      }
    }

    try {
      if (!paymentMethodId) {
        // No saved payment method available: fall back to checkout to collect one and pay
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
          payment_intent_data: { setup_future_usage: 'off_session', metadata: { bookingId, type: 'final_fee' } },
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
            triggeredByUserId: requesterUser?.id || null,
          },
          updatedAt: new Date().toISOString(),
        });

        return res.status(200).json({ requiresAction: true, url: checkoutSession.url });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountToChargeCents,
        currency: 'usd',
        customer: customerId,
        payment_method: paymentMethodId,
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
          triggeredByUserId: requesterUser?.id || null,
        },
        updatedAt: new Date().toISOString(),
      });

      return res.status(200).json({ success: true, paymentIntentId: paymentIntent.id, amountCents: paymentIntent.amount });
    } catch (err) {
      // If card requires authentication or cannot be used off_session, or missing PM, fall back to Checkout
      const errMsg = (err?.message || err?.raw?.message || '').toLowerCase();
      const missingPm = (err?.code === 'parameter_missing' || err?.raw?.code === 'parameter_missing') &&
        ((err?.param === 'payment_method') || (err?.raw?.param === 'payment_method'));
      if (
        missingPm ||
        errMsg.includes('payment method') ||
        errMsg.includes('missing a payment method') ||
        err?.code === 'authentication_required' ||
        err?.code === 'payment_intent_authentication_failure' ||
        err?.decline_code === 'authentication_required' ||
        errMsg.includes('requires a mandate')
      ) {
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
          payment_intent_data: { setup_future_usage: 'off_session', metadata: { bookingId, type: 'final_fee' } },
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
            triggeredByUserId: requesterUser?.id || null,
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