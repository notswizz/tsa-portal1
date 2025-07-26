import { useState, useEffect } from 'react';
import { format, parseISO, isBefore, isAfter, addDays } from 'date-fns';
import BookingSummary from './BookingSummary';

export default function BookingsCard({ staffDocRef, staffEmail, staffName }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-pink-200 overflow-hidden h-full flex flex-col">
      {/* Header - Made more compact and modern */}
      <div className="px-4 py-2.5 bg-emerald-500 relative overflow-hidden flex-shrink-0">
        <div className="relative flex items-center">
          <div className="flex items-center space-x-2">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-sm font-bold text-white">Bookings</h2>
          </div>
        </div>
        
        {/* Simple decorative element */}
        <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -translate-y-6 translate-x-6"></div>
      </div>
      
      <div className="flex-1 min-h-0 overflow-y-auto bg-gradient-to-br from-white to-emerald-50/30 p-3">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-emerald-100/50 h-full">
          <BookingSummary 
            staffDocRef={staffDocRef} 
            staffEmail={staffEmail} 
            staffName={staffName}
            showPastOnly={false}
          />
        </div>
      </div>
    </div>
  );
} 