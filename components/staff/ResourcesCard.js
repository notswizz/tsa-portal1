import React from 'react';
import StaffForms from '../../pages/staff/forms';

export default function ResourcesAndFormsCard() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-pink-300 hover:border-pink-500 transition-all duration-300 flex flex-col h-[700px]">
      {/* Forms Section (on top) */}
      <div className="px-3 py-2 border-b border-pink-100 bg-gradient-to-r from-pink-400 to-pink-500 sticky top-0 z-10">
        <h2 className="text-base font-bold text-white flex items-center">
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Forms
        </h2>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-2 bg-gradient-to-br from-white to-pink-50">
        <div className="bg-white rounded-lg p-3 shadow-md border border-pink-100 mb-4">
          <StaffForms />
        </div>
        {/* Resources Section (below) */}
        <div className="bg-white rounded-lg p-3 shadow-md border border-pink-100">
          <div className="px-3 py-2 border-b border-pink-100 bg-gradient-to-r from-pink-400 to-pink-500 rounded-t-lg mb-3">
            <h2 className="text-base font-bold text-white flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 0a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v3a2 2 0 002 2m12 0v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7" />
              </svg>
              Resources
            </h2>
          </div>
          <div className="space-y-4">
            <div className="bg-pink-50 rounded-lg p-3 shadow-sm border border-pink-100">
              <h3 className="text-sm font-semibold text-pink-700 mb-1">Maps of Locations</h3>
              <p className="text-gray-600 text-xs">[Placeholder for maps of each location]</p>
            </div>
            <div className="bg-pink-50 rounded-lg p-3 shadow-sm border border-pink-100">
              <h3 className="text-sm font-semibold text-pink-700 mb-1">Smith Agency Rules</h3>
              <p className="text-gray-600 text-xs">[Placeholder for agency rules and guidelines]</p>
            </div>
            <div className="bg-pink-50 rounded-lg p-3 shadow-sm border border-pink-100">
              <h3 className="text-sm font-semibold text-pink-700 mb-1">Other Resources</h3>
              <p className="text-gray-600 text-xs">[Placeholder for additional resources]</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 