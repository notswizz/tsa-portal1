import React from 'react';
import StaffForms from '../../pages/staff/forms';

export default function ResourcesAndFormsCard() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-pink-200 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 bg-orange-500 relative overflow-hidden">
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h2 className="text-lg font-bold text-white">Forms & Resources</h2>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
            <span className="text-white/80 text-sm font-medium">Available</span>
          </div>
        </div>
        
        {/* Simple decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 bg-gradient-to-br from-white to-slate-50/50">
        {/* Forms Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-slate-200/50 mb-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center">
              <svg className="h-5 w-5 text-orange-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Essential Forms
            </h3>
            <p className="text-slate-600 text-sm">Complete required documentation and forms</p>
          </div>
          <StaffForms />
        </div>

        {/* Resources Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-slate-200/50">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center">
              <svg className="h-5 w-5 text-amber-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Quick Resources
            </h3>
            <p className="text-slate-600 text-sm">Important information and guidelines</p>
          </div>
          
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 hover:shadow-sm transition-all duration-200 group cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">Location Maps & Directions</h4>
                  <p className="text-slate-600 text-sm">Venue locations and parking information</p>
                </div>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100 hover:shadow-sm transition-all duration-200 group cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors duration-200">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">Agency Guidelines & Policies</h4>
                  <p className="text-slate-600 text-sm">Important rules and professional standards</p>
                </div>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100 hover:shadow-sm transition-all duration-200 group cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-200">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">Contact Information</h4>
                  <p className="text-slate-600 text-sm">Emergency contacts and support</p>
                </div>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4 border border-rose-100 hover:shadow-sm transition-all duration-200 group cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center group-hover:bg-rose-200 transition-colors duration-200">
                  <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">Training Materials</h4>
                  <p className="text-slate-600 text-sm">Educational resources and tutorials</p>
                </div>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 