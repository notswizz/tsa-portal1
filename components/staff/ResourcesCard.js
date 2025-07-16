import React from 'react';

export default function ResourcesCard() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-pink-300 overflow-hidden flex flex-col h-full">
      {/* Header Bar */}
      <div className="px-4 py-2 border-b border-pink-200 bg-pink-500 flex items-center">
        <svg className="h-5 w-5 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 0a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v3a2 2 0 002 2m12 0v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7" />
        </svg>
        <span className="text-lg font-bold text-white">Resources</span>
      </div>
      {/* Content */}
      <div className="flex-1 p-4 bg-pink-50">
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-pink-100">
            <h3 className="text-base font-semibold text-pink-700 mb-1">Maps of Locations</h3>
            <p className="text-gray-600 text-sm">[Placeholder for maps of each location]</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-pink-100">
            <h3 className="text-base font-semibold text-pink-700 mb-1">Smith Agency Rules</h3>
            <p className="text-gray-600 text-sm">[Placeholder for agency rules and guidelines]</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-pink-100">
            <h3 className="text-base font-semibold text-pink-700 mb-1">Other Resources</h3>
            <p className="text-gray-600 text-sm">[Placeholder for additional resources]</p>
          </div>
        </div>
      </div>
    </div>
  );
} 