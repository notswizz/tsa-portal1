import React from 'react';
import BookingsList from './BookingsList';

export default function BookingsSection({ clientId, openBookingModal }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-primary-100 p-12 transition-all duration-200 hover:shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <span className="flex-shrink-0 p-1.5 rounded-lg bg-primary-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </span>
          <h2 className="page-title text-xl">Your Bookings</h2>
        </div>
        <button
          onClick={openBookingModal}
          className="btn btn-primary text-xs sm:text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Booking
        </button>
      </div>
      <div className="card-body overflow-y-auto max-h-[600px]">
        <BookingsList clientId={clientId} />
      </div>
    </div>
  );
} 