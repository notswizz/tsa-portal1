import { useState } from 'react';
import ShowAvailability from './ShowAvailability';

export default function AvailabilityCard({ session, staffDocRef }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-purple-200 overflow-hidden h-full flex flex-col">
      {/* Compact Header */}
      <div className="px-4 py-2.5 bg-purple-500 relative overflow-hidden flex-shrink-0">
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-sm font-bold text-white">Manage Availability</h2>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
            <span className="text-white/80 text-xs font-medium">Active</span>
          </div>
        </div>
        
        {/* Simple decorative element */}
        <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -translate-y-6 translate-x-6"></div>
      </div>
      
      <div className="flex-1 min-h-0 overflow-y-auto bg-gradient-to-br from-white to-purple-50/30 p-3">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-purple-100/50 p-3 h-full">
          <ShowAvailability session={session} staffDocRef={staffDocRef} />
        </div>
      </div>
    </div>
  );
} 