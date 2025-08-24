import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';

export default function BookingsList({ clientId }) {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        setLoading(true);
        const response = await fetch('/api/client/bookings');
        
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        
        const data = await response.json();
        
        // Sort bookings by date (newest first)
        const sortedBookings = (data.bookings || []).sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return 0;
        });
        
        setBookings(sortedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Unable to load bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (clientId) {
      fetchBookings();
    }
  }, [clientId]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'declined':
        return 'badge-danger';
      case 'completed':
        return 'badge-info';
      case 'deposit_paid':
        return 'badge-info';
      default:
        return 'badge-neutral';
    }
  };

  const getFriendlyStatus = (status) => {
    if (!status || typeof status !== 'string') return '—';
    const explicit = {
      deposit_paid: 'Deposit paid',
      final_paid: 'Final paid',
    };
    if (explicit[status]) return explicit[status];
    // Replace underscores with spaces and capitalize words
    return status
      .split('_')
      .map(w => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-2 text-neutral-500">Loading bookings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 rounded-lg bg-primary-50 border border-primary-100">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-4 text-lg font-display font-medium text-neutral-900">No bookings yet</h3>
        <p className="mt-1 text-sm text-neutral-500">
          Start booking staff for your events right away.
        </p>
        <div className="mt-6">
          <button
            onClick={() => window.location.href = '/client/dashboard?tab=book'}
            className="btn btn-primary"
          >
            Book Staff Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="bg-white rounded-xl shadow border border-primary-100 p-5 flex flex-col gap-3 md:flex-row md:items-center md:gap-6 animate-fadeIn cursor-pointer hover:shadow-lg transition"
          onClick={() => setSelectedBooking(booking)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedBooking(booking); }}
        >
          {/* Left: Show Info */}
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-9 w-9 rounded-lg bg-primary-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-lg text-neutral-900 truncate">{booking.showName || 'No show name'}</div>
                {booking.showData?.startDate && booking.showData?.endDate && (
                  <div className="text-xs text-neutral-500 truncate">
                    {format(parseISO(booking.showData.startDate), 'MMM dd')} - {format(parseISO(booking.showData.endDate), 'MMM dd, yyyy')}
                  </div>
                )}
              </div>
            </div>
            {booking.showData?.location && (
              <div className="text-sm text-primary-700 font-medium truncate">{booking.showData.location}</div>
            )}
            {booking.notes && (
              <div className="mt-1 text-xs text-neutral-500 italic bg-neutral-50 px-2 py-1 rounded">"{booking.notes}"</div>
            )}
          </div>

          {/* Middle: Staff requested total */}
          <div className="flex flex-col items-center justify-center min-w-[90px]">
            <div className="flex items-center gap-1 text-primary-700 font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span>{booking.datesNeeded ? booking.datesNeeded.reduce((sum, day) => sum + (day.staffCount || 0), 0) : 0}</span>
            </div>
            <div className="text-xs text-primary-500 mt-1 font-semibold">days</div>
          </div>

          {/* Right: Status */}
          <div className="flex flex-col items-end justify-center min-w-[120px]">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-100 ${getStatusBadgeClass(booking.status)}`}>{getFriendlyStatus(booking.status)}</span>
          </div>
        </div>
      ))}

      {/* Breakdown Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-100 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-neutral-900">{selectedBooking.showName || 'Booking'}</div>
                {selectedBooking.showData?.startDate && selectedBooking.showData?.endDate && (
                  <div className="text-xs text-neutral-500">
                    {format(parseISO(selectedBooking.showData.startDate), 'MMM dd')} - {format(parseISO(selectedBooking.showData.endDate), 'MMM dd, yyyy')}
                  </div>
                )}
              </div>
              <button className="text-neutral-500 hover:text-neutral-800" onClick={() => setSelectedBooking(null)} aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>
            <div className="p-5">
              <div className="mb-3 text-sm text-neutral-600">Per-day breakdown</div>
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {(selectedBooking.datesNeeded || []).map((d, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-neutral-200 p-3">
                    <div className="text-sm font-medium text-neutral-900">{d.date ? format(parseISO(d.date), 'EEE, MMM d') : '—'}</div>
                    <div className="text-sm text-primary-700 font-semibold">{d.staffCount || 0}</div>
                  </div>
                ))}
                {(selectedBooking.datesNeeded || []).length === 0 && (
                  <div className="text-sm text-neutral-500">No dates in this booking.</div>
                )}
              </div>
            </div>
            <div className="px-5 pb-5 flex items-center justify-end">
              <button className="btn btn-primary" onClick={() => setSelectedBooking(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 