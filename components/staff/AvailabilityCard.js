import { useState } from 'react';
import ShowAvailability from './ShowAvailability';

export default function AvailabilityCard({ session, staffDocRef }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-pink-300 hover:border-pink-500 transition-all duration-300 h-full">
      <div className="px-3 py-2 border-b border-pink-100 bg-gradient-to-r from-pink-400 to-pink-500 sticky top-0 z-10">
        <h2 className="text-base font-bold text-white flex items-center">
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Manage Availability
        </h2>
      </div>
      
      <div className="p-2 bg-gradient-to-b from-white to-pink-50">
        <div className="bg-white rounded-lg shadow-md border border-pink-100 p-3">
          <ShowAvailability session={session} staffDocRef={staffDocRef} />
        </div>
      </div>
    </div>
  );
} 