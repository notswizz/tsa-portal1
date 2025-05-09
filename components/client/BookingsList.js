import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';

export default function BookingsList({ clientId }) {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);

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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'declined':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
        <span className="ml-2 text-gray-500">Loading bookings...</span>
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
      <div className="text-center py-12 bg-pink-50 rounded-lg border border-pink-200">
        <svg className="w-16 h-16 mx-auto text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No bookings yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Start booking staff for your events right away.
        </p>
        <div className="mt-6">
          <button
            onClick={() => window.location.href = '/client/dashboard?tab=book'}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
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
        <div key={booking.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50 px-5 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 tracking-tight">{booking.showName || 'No show name'}</h3>
                <p className="text-xs text-gray-500">{booking.createdAt && format(new Date(booking.createdAt), 'MMM dd, yyyy')}</p>
              </div>
            </div>
            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full border ${getStatusBadgeClass(booking.status)}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>
          
          <div className="px-5 py-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Show Details</h4>
                {booking.showData && (
                  <div className="text-sm">
                    <div className="font-medium text-gray-800">{booking.showData.location}</div>
                    <div className="mt-1">
                      {booking.showData.startDate && booking.showData.endDate && (
                        <div className="text-gray-600 flex items-center">
                          <svg className="mr-1 h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{format(parseISO(booking.showData.startDate), 'MMM dd')} - {format(parseISO(booking.showData.endDate), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {booking.notes && (
                  <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 italic">
                    "{booking.notes}"
                  </div>
                )}
              </div>
              
              <div className="md:col-span-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Staff Requirements</h4>
                <div className="flex items-center mb-2">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-pink-50 flex items-center justify-center mr-2">
                    <svg className="h-4 w-4 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{booking.totalStaffNeeded} Total Staff</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {booking.datesNeeded && booking.datesNeeded
                    .filter(day => day.staffCount > 0)
                    .slice(0, 3)
                    .map((dateNeeded, i) => (
                      <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200">
                        {format(parseISO(dateNeeded.date), 'MMM dd')}: {dateNeeded.staffCount}
                      </span>
                    ))}
                  {booking.datesNeeded && booking.datesNeeded.filter(day => day.staffCount > 0).length > 3 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-pink-50 text-pink-600 border border-pink-100">
                      +{booking.datesNeeded.filter(day => day.staffCount > 0).length - 3} more
                    </span>
                  )}
                </div>
              </div>
              
              <div className="md:col-span-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Staff Assignment</h4>
                {booking.hasAssignedStaff ? (
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-50 flex items-center justify-center mr-2">
                      <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {booking.uniqueStaffIds?.length || 0} Staff Assigned
                      </div>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                          Confirmed
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-yellow-50 flex items-center justify-center mr-2">
                      <svg className="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-sm text-gray-600 italic">
                      Waiting for staff assignment
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 