import React, { useState } from 'react';

export default function ResourcesOnlyCard() {
  const [selectedResource, setSelectedResource] = useState(null);

  const resources = [
    {
      id: 'maps',
      title: 'Location Maps',
      icon: '🗺️',
      color: 'from-blue-500 to-blue-600',
      description: 'Venue locations and parking information',
      content: 'Interactive maps and directions to all venue locations would be displayed here...'
    },
    {
      id: 'guidelines',
      title: 'Agency Guidelines',
      icon: '📜',
      color: 'from-emerald-500 to-emerald-600',
      description: 'Important rules and professional standards',
      content: 'Complete agency guidelines and professional standards documentation would be shown here...'
    },
    {
      id: 'contacts',
      title: 'Contact Info',
      icon: '📞',
      color: 'from-purple-500 to-purple-600',
      description: 'Emergency contacts and support',
      content: 'Emergency contact numbers and support information would be listed here...'
    },
    {
      id: 'training',
      title: 'Training Materials',
      icon: '📚',
      color: 'from-rose-500 to-rose-600',
      description: 'Educational resources and tutorials',
      content: 'Training videos, educational materials, and tutorial resources would be available here...'
    }
  ];

  const openModal = (resource) => {
    setSelectedResource(resource);
  };

  const closeModal = () => {
    setSelectedResource(null);
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-pink-200 overflow-hidden h-full flex flex-col">
        {/* Header - Fixed height to prevent cutoff */}
        <div className="px-4 py-2.5 bg-orange-500 relative overflow-hidden flex-shrink-0">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <h2 className="text-sm font-bold text-white">Resources</h2>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full"></div>
              <span className="text-white/80 text-xs font-medium">Available</span>
            </div>
          </div>
          
          {/* Simple decorative element */}
          <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -translate-y-6 translate-x-6"></div>
        </div>

        {/* Horizontal Scrollable Line of Resource Icons */}
        <div className="flex-1 p-3 bg-gradient-to-br from-white to-orange-50/30 overflow-x-auto">
          <div className="flex space-x-3 h-full items-center min-w-max">
            {resources.map((resource, index) => (
              <button
                key={resource.id}
                onClick={() => openModal(resource)}
                className="group bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-orange-200 hover:shadow-md transition-all duration-300 transform hover:scale-[1.05] flex flex-col items-center justify-center text-center min-w-[70px] h-20 flex-shrink-0"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${resource.color} flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <span className="text-lg">{resource.icon}</span>
                </div>
                <h3 className="font-semibold text-slate-800 text-xs leading-tight">{resource.title}</h3>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden animate-scaleIn">
            {/* Modal Header */}
            <div className={`px-6 py-4 bg-gradient-to-r ${selectedResource.color} relative overflow-hidden`}>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{selectedResource.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedResource.title}</h3>
                    <p className="text-white/80 text-sm">{selectedResource.description}</p>
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
                {selectedResource.content}
              </div>
              
              {/* Action Buttons */}
              <div className="mt-6 flex space-x-3">
                <button className={`flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r ${selectedResource.color} hover:opacity-90 transition-opacity duration-200`}>
                  View Resource
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