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
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'declined':
        return 'badge-danger';
      case 'completed':
        return 'badge-info';
      default:
        return 'badge-neutral';
    }
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
    <div className="space-y-6">
      {bookings.map((booking) => (
        <div key={booking.id} className="card animate-fadeIn">
          <div className="flex justify-between items-center card-header">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 tracking-tight">{booking.showName || 'No show name'}</h3>
                <p className="text-xs text-neutral-500">{booking.createdAt && format(new Date(booking.createdAt), 'MMM dd, yyyy')}</p>
              </div>
            </div>
            <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>
          
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5">
                <h4 className="section-title">Show Details</h4>
                {booking.showData && (
                  <div className="text-sm">
                    <div className="font-medium text-neutral-800">{booking.showData.location}</div>
                    <div className="mt-1">
                      {booking.showData.startDate && booking.showData.endDate && (
                        <div className="text-neutral-600 flex items-center">
                          <svg className="mr-1 h-3.5 w-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{format(parseISO(booking.showData.startDate), 'MMM dd')} - {format(parseISO(booking.showData.endDate), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {booking.notes && (
                  <div className="mt-3 text-sm text-neutral-600 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 italic">
                    &quot;{booking.notes}&quot;
                  </div>
                )}
              </div>
              
              <div className="md:col-span-3">
                <h4 className="section-title">Staff Requirements</h4>
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-50 flex items-center justify-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-neutral-800">{booking.totalStaffNeeded} Total Staff</span>
                    <div className="mt-1">
                      <span className="badge badge-neutral text-xs">
                        {booking.datesNeeded?.filter(day => day.staffCount > 0).length || 0} days
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-4">
                <h4 className="section-title">Staff Assignment</h4>
                {booking.hasAssignedStaff ? (
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-50 flex items-center justify-center mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-neutral-800">
                        {booking.uniqueStaffIds?.length || 0} Staff Assigned
                      </div>
                      <div className="mt-1">
                        <span className="badge badge-success">
                          Confirmed
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-yellow-50 flex items-center justify-center mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-neutral-800">
                        Waiting for staff assignment
                      </div>
                      <div className="mt-1">
                        <span className="badge badge-warning">
                          Pending
                        </span>
                      </div>
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