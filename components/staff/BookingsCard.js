import { useState, useEffect } from 'react';
import { format, parseISO, isBefore, isAfter, addDays } from 'date-fns';
import BookingSummary from './BookingSummary';

export default function BookingsCard({ staffDocRef, staffEmail, staffName, completedForms = [], staffData }) {
  // Check if required forms are completed AND approved
  const requiredForms = ['application', 'interview'];
  const isBookingsUnlocked = requiredForms.every(formType => {
    const form = completedForms.find(f => f.formType === formType);
    const isCompleted = form && form.completed;
    const isApproved = staffData && staffData[`${formType}FormApproved`];
    return isCompleted && isApproved;
  });

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-pink-200 overflow-hidden h-full flex flex-col">
      {/* Header - Made more compact and modern */}
      <div className={`px-4 py-2.5 relative overflow-hidden flex-shrink-0 ${isBookingsUnlocked ? 'bg-emerald-500' : 'bg-gray-500'}`}>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isBookingsUnlocked ? (
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
            <h2 className="text-sm font-bold text-white">
              {isBookingsUnlocked ? 'Bookings' : 'Bookings Locked'}
            </h2>
          </div>
          <div className="flex items-center space-x-1">
            <div className={`w-1.5 h-1.5 rounded-full ${isBookingsUnlocked ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
            <span className="text-white/80 text-xs font-medium">
              {isBookingsUnlocked ? 'Active' : 'Locked'}
            </span>
          </div>
        </div>
        
        {/* Simple decorative element */}
        <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -translate-y-6 translate-x-6"></div>
      </div>
      
      <div className="flex-1 min-h-0 overflow-y-auto bg-gradient-to-br from-white to-emerald-50/30 p-3">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-emerald-100/50 h-full">
          {isBookingsUnlocked ? (
            <BookingSummary 
              staffDocRef={staffDocRef} 
              staffEmail={staffEmail} 
              staffName={staffName}
              showPastOnly={false}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700">Bookings Locked</h3>
                <p className="text-sm text-gray-500">
                  Complete and get approval for your application and interview forms to view your bookings.
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-600">Required approvals:</p>
                <div className="space-y-1">
                  {requiredForms.map(formType => {
                    const form = completedForms.find(f => f.formType === formType);
                    const isCompleted = form && form.completed;
                    const isApproved = staffData && staffData[`${formType}FormApproved`];
                    
                    let statusText = 'Not Started';
                    let statusColor = 'text-red-600';
                    let dotColor = 'bg-red-400';
                    
                    if (isCompleted && isApproved) {
                      statusText = 'Approved';
                      statusColor = 'text-green-600';
                      dotColor = 'bg-green-400';
                    } else if (isCompleted && !isApproved) {
                      statusText = 'Awaiting Approval';
                      statusColor = 'text-orange-600';
                      dotColor = 'bg-orange-400';
                    } else if (!isCompleted) {
                      statusText = 'Not Completed';
                      statusColor = 'text-red-600';
                      dotColor = 'bg-red-400';
                    }
                    
                    return (
                      <div key={formType} className="flex items-center space-x-2 text-xs">
                        <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
                        <span className={statusColor}>
                          {formType.charAt(0).toUpperCase() + formType.slice(1)}: {statusText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 