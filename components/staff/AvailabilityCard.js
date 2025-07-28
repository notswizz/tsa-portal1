import { useState } from 'react';
import ShowAvailability from './ShowAvailability';

export default function AvailabilityCard({ session, staffDocRef, completedForms = [], staffData }) {
  // Check if required forms are completed AND approved
  const requiredForms = ['application', 'interview'];
  const isAvailabilityUnlocked = requiredForms.every(formType => {
    const form = completedForms.find(f => f.formType === formType);
    const isCompleted = form && form.completed;
    const isApproved = staffData && staffData[`${formType}FormApproved`];
    return isCompleted && isApproved;
  });
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-purple-200 overflow-hidden h-full flex flex-col">
      {/* Compact Header */}
      <div className={`px-4 py-2.5 relative overflow-hidden flex-shrink-0 ${isAvailabilityUnlocked ? 'bg-purple-500' : 'bg-gray-500'}`}>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isAvailabilityUnlocked ? (
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
            <h2 className="text-sm font-bold text-white">
              {isAvailabilityUnlocked ? 'Manage Availability' : 'Availability Locked'}
            </h2>
          </div>
          <div className="flex items-center space-x-1">
            <div className={`w-1.5 h-1.5 rounded-full ${isAvailabilityUnlocked ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
            <span className="text-white/80 text-xs font-medium">
              {isAvailabilityUnlocked ? 'Active' : 'Locked'}
            </span>
          </div>
        </div>
        
        {/* Simple decorative element */}
        <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -translate-y-6 translate-x-6"></div>
      </div>
      
      <div className="flex-1 min-h-0 overflow-y-auto bg-gradient-to-br from-white to-purple-50/30 p-3">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-purple-100/50 p-3 h-full">
          {isAvailabilityUnlocked ? (
            <ShowAvailability session={session} staffDocRef={staffDocRef} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700">Availability Locked</h3>
                <p className="text-sm text-gray-500">
                  Complete and get approval for your application and interview forms to unlock availability management.
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-600">Required approvals:</p>
                <div className="space-y-1">
                  {requiredForms.map(formType => {
                    const form = completedForms.find(f => f.formType === formType);
                    const isCompleted = form && form.completed;
                    const isApproved = staffData && staffData[`${formType}FormApproved`];
                    const isFullyReady = isCompleted && isApproved;
                    
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