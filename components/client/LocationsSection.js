import React, { useRef } from 'react';

export default function LocationsSection({
  locations = [],
  addLocation,
  removeLocation,
  showAddLocationForm,
  setShowAddLocationForm,
  newLocation,
  handleNewLocationChange
}) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    await addLocation();
    setShowAddLocationForm(false);
  };

  return (
    <div className="space-y-6 mt-8">
      <div className="bg-white rounded-2xl shadow-xl border border-primary-100 p-6 sm:p-8 transition-all duration-200 hover:shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h4 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-primary-700 border-l-4 border-primary-300 pl-3 tracking-tight">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z" />
            </svg>
            LOCATIONS
          </h4>
          <div className="flex items-center gap-2">
            {!showAddLocationForm && (
              <button
                onClick={() => setShowAddLocationForm(true)}
                className="inline-flex items-center text-sm text-primary hover:text-primary-dark border border-primary-200 rounded-lg px-3 py-1 bg-primary-50 hover:bg-primary-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
        {/* Horizontal Scrollable Locations */}
        {locations && locations.length > 0 ? (
          <div className="relative">
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-primary-200 rounded-full p-2 shadow hover:bg-primary-50"
              onClick={() => scroll('left')}
              aria-label="Scroll left"
              style={{ left: '-2rem' }}
            >
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide pr-2 scroll-snap-x snap-mandatory"
              style={{ scrollBehavior: 'smooth', scrollSnapType: 'x mandatory' }}
            >
              {locations.map((location, index) => (
                <div
                  key={location.id || index}
                  className="group bg-white min-w-[220px] max-w-[240px] snap-center rounded-2xl p-6 border-2 border-primary-100 shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden mb-4 flex flex-col gap-2"
                >
                  {/* Delete (X) button, only visible on hover */}
                  <button
                    type="button"
                    onClick={() => removeLocation(location.id)}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-primary bg-white rounded-full p-2 shadow-md border border-neutral-200 transition-colors hover:border-primary-200 z-10 opacity-0 group-hover:opacity-100"
                    aria-label="Delete location"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-lg text-neutral-900">{location.city || 'City'}</span>
                      {location.booth && (
                        <span className="inline-block px-3 py-1 bg-primary-50 text-primary-800 text-xs font-semibold rounded-full">{location.booth}</span>
                      )}
                    </div>
                    {location.notes && (
                      <div className="flex items-center gap-2 text-sm text-primary-700">
                        <svg className="h-4 w-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8M8 16h8M8 8h8" /></svg>
                        <span>{location.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-primary-200 rounded-full p-2 shadow hover:bg-primary-50"
              onClick={() => scroll('right')}
              aria-label="Scroll right"
              style={{ right: '-2rem' }}
            >
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        ) : (
          <div className="bg-white p-10 rounded-xl border border-dashed border-primary-200 text-center">
            <div className="w-16 h-16 mx-auto bg-primary-50 rounded-full flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z" />
              </svg>
            </div>
            <h5 className="text-lg font-medium text-neutral-800 mb-2">No showrooms added</h5>
            <button 
              onClick={() => setShowAddLocationForm(true)}
              className="btn btn-primary w-full max-w-xs mx-auto flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add showroom
            </button>
          </div>
        )}
        {/* Add New Location Form as Modal */}
        {showAddLocationForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl p-8 border border-primary-100 shadow-2xl max-w-lg w-full relative">
              <button
                className="absolute top-3 right-3 text-neutral-400 hover:text-primary"
                onClick={() => setShowAddLocationForm(false)}
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <h5 className="font-semibold text-primary-800 mb-6 flex items-center text-lg">
                <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </div>
                Add New Location
              </h5>
              <form className="flex flex-col gap-5" onSubmit={handleAddLocation}>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={newLocation.city}
                    onChange={handleNewLocationChange}
                    className="block w-full py-2 px-3 sm:text-sm border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="City name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Showroom Location (bld, floor, #)</label>
                  <input
                    type="text"
                    name="booth"
                    value={newLocation.booth}
                    onChange={handleNewLocationChange}
                    className="block w-full py-2 px-3 sm:text-sm border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="e.g. Bldg 2, Floor 3, Showroom 12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={newLocation.notes}
                    onChange={handleNewLocationChange}
                    className="block w-full py-2 px-3 sm:text-sm border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Any notes about this location"
                    rows={2}
                  />
                </div>
                <button
                  type="submit"
                  className="mt-7 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl shadow-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors w-full md:w-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Location
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 