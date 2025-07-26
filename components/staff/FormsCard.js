import React, { useState } from 'react';

export default function FormsCard() {
  const [selectedForm, setSelectedForm] = useState(null);

  const forms = [
    {
      id: 'application',
      title: 'Agency Application',
      icon: '📝',
      color: 'from-blue-500 to-blue-600',
      description: 'Complete your staff application form',
      content: 'Staff application form content would go here...'
    },
    {
      id: 'w9',
      title: 'W-9 Tax Form',
      icon: '📋',
      color: 'from-green-500 to-green-600',
      description: 'Tax information and documentation',
      content: 'W-9 tax form content would go here...'
    },
    {
      id: 'direct-deposit',
      title: 'Direct Deposit',
      icon: '💳',
      color: 'from-purple-500 to-purple-600',
      description: 'Set up payment information',
      content: 'Direct deposit setup form would go here...'
    },
    {
      id: 'emergency',
      title: 'Emergency Contact',
      icon: '🚨',
      color: 'from-red-500 to-red-600',
      description: 'Emergency contact details',
      content: 'Emergency contact form would go here...'
    }
  ];

  const openModal = (form) => {
    setSelectedForm(form);
  };

  const closeModal = () => {
    setSelectedForm(null);
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-pink-200 overflow-hidden h-full flex flex-col">
        {/* Header - Fixed height to prevent cutoff */}
        <div className="px-4 py-2.5 bg-blue-500 relative overflow-hidden flex-shrink-0">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-sm font-bold text-white">Forms</h2>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-blue-300 rounded-full"></div>
              <span className="text-white/80 text-xs font-medium">Required</span>
            </div>
          </div>
          
          {/* Simple decorative element */}
          <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -translate-y-6 translate-x-6"></div>
        </div>

        {/* 2x2 Grid of Form Icons - Scrollable if needed */}
        <div className="flex-1 p-3 bg-gradient-to-br from-white to-blue-50/30 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2 min-h-full">
            {forms.map((form, index) => (
              <button
                key={form.id}
                onClick={() => openModal(form)}
                className="group bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-blue-200 hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] flex flex-col items-center justify-center text-center h-24"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${form.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <span className="text-lg">{form.icon}</span>
                </div>
                <h3 className="font-semibold text-slate-800 text-xs leading-tight">{form.title}</h3>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden animate-scaleIn">
            {/* Modal Header */}
            <div className={`px-6 py-4 bg-gradient-to-r ${selectedForm.color} relative overflow-hidden`}>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{selectedForm.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedForm.title}</h3>
                    <p className="text-white/80 text-sm">{selectedForm.description}</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors duration-200"
                >
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="text-slate-700">
                {selectedForm.content}
              </div>
              
              {/* Action Buttons */}
              <div className="mt-6 flex space-x-3">
                <button className={`flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r ${selectedForm.color} hover:opacity-90 transition-opacity duration-200`}>
                  Fill Out Form
                </button>
                <button 
                  onClick={closeModal}
                  className="px-4 py-3 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 