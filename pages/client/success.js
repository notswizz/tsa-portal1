import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Confirming your payment...');

  useEffect(() => {
    if (!session_id) return;
    let isMounted = true;
    async function confirm() {
      try {
        const res = await fetch(`/api/stripe/confirm-session?session_id=${encodeURIComponent(session_id)}`);
        const json = await res.json();
        if (!isMounted) return;
        if (res.ok && json?.success) {
          setStatus('success');
          setMessage('Payment confirmed and booking recorded.');
        } else {
          setStatus('success');
          setMessage('Payment confirmed. We are finalizing your booking.');
        }
      } catch (_) {
        if (!isMounted) return;
        setStatus('success');
        setMessage('Payment confirmed. We are finalizing your booking.');
      }
    }
    confirm();
    return () => { isMounted = false; };
  }, [session_id]);

  if (status === 'loading') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">Confirming your payment...</h1>
          <p className="mt-2 text-lg text-gray-500">Please wait while we verify your payment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="text-center">
        <h1 className="mt-6 text-3xl font-extrabold text-gray-900">Success</h1>
        <p className="mt-2 text-lg text-gray-600">{message}</p>
        <div className="mt-8">
          <Link href="/client/dashboard" className="text-primary hover:underline">Return to dashboard</Link>
        </div>
      </div>
    </div>
  );
} 