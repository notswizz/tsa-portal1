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
    },
    {
      id: 'instagram',
      title: 'Instagram',
      icon: (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      color: 'from-pink-500 to-pink-600',
      description: 'Follow us on Instagram',
      isExternal: true,
      url: 'https://instagram.com/the_smithagency'
    },
    {
      id: 'website',
      title: 'Website',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9m0 18c5 0 9-4 9-9s-4-9 9-9m-9 9c0-5 4-9 9-9s9 4 9 9-4 9-9 9z" />
        </svg>
      ),
      color: 'from-indigo-500 to-indigo-600',
      description: 'Visit our official website',
      isExternal: true,
      url: 'https://thesmithagency.net'
    }
  ];

  const handleResourceClick = (resource) => {
    if (resource.isExternal) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    } else {
      setSelectedResource(resource);
    }
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

        {/* Responsive Resources Layout */}
        <div className="flex-1 p-3 bg-gradient-to-br from-white to-orange-50/30">
          {/* Mobile: 2x2 Grid */}
          <div className="md:hidden grid grid-cols-2 gap-3 h-full">
            {resources.map((resource, index) => (
              <button
                key={resource.id}
                onClick={() => handleResourceClick(resource)}
                className="group bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-orange-200 hover:shadow-md transition-all duration-300 transform hover:scale-[1.05] flex flex-col items-center justify-center text-center h-full"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${resource.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {typeof resource.icon === 'string' ? (
                    <span className="text-lg">{resource.icon}</span>
                  ) : (
                    resource.icon
                  )}
                </div>
                <h3 className="font-semibold text-slate-800 text-xs leading-tight">{resource.title}</h3>
              </button>
            ))}
          </div>

          {/* Desktop: Horizontal Scrollable Line */}
          <div className="hidden md:block overflow-x-auto h-full px-2">
            <div className="flex justify-center items-center space-x-4 h-full min-w-full">
              {resources.map((resource, index) => (
                <button
                  key={resource.id}
                  onClick={() => handleResourceClick(resource)}
                  className="group bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-orange-200 hover:shadow-md transition-all duration-300 transform hover:scale-[1.05] flex flex-col items-center justify-center text-center flex-1 h-20 max-w-[120px]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${resource.color} flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {typeof resource.icon === 'string' ? (
                      <span className="text-lg">{resource.icon}</span>
                    ) : (
                      <div className="w-6 h-6 flex items-center justify-center">
                        {React.cloneElement(resource.icon, { className: 'w-5 h-5 text-white' })}
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-slate-800 text-[10px] leading-tight">{resource.title}</h3>
                </button>
              ))}
            </div>
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
                  <div className="text-3xl flex items-center justify-center">
                    {typeof selectedResource.icon === 'string' ? (
                      <span>{selectedResource.icon}</span>
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center">
                        {selectedResource.icon}
                      </div>
                    )}
                  </div>
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