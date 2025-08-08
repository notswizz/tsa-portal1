import React, { useRef } from 'react';

export default function ContactsSection({
  clientData,
  editedProfile,
  handleProfileChange,
  showAddContactForm,
  setShowAddContactForm,
  newContact,
  handleNewContactChange,
  addContact,
  removeContact,
  onContactAdded
}) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.95;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Handler for form submit
  const handleAddContact = async (e) => {
    e.preventDefault();
    await addContact();
    setShowAddContactForm(false);
    if (onContactAdded) onContactAdded();
  };

  return (
    <div className="space-y-6">
      {/* Contacts Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-primary-100 pt-6 pb-10 px-12 transition-all duration-200 hover:shadow-2xl relative">
        <div className="flex items-center justify-between mb-6 relative">
          <h4 className="flex items-center gap-2 text-xl font-bold text-primary-700 border-l-4 border-primary-300 pl-3 tracking-tight">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0z" />
              <path d="M18 8a2 2 0 11-4 0 2 2 0 014 0z" />
              <path d="M14 15a4 4 0 00-8 0v3h8v-3z" />
              <path d="M6 8a2 2 0 11-4 0 2 2 0 014 0z" />
              <path d="M16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3z" />
              <path d="M4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            CONTACTS
          </h4>
          {!showAddContactForm && (
            <button
              onClick={() => setShowAddContactForm(true)}
              className="absolute top-0 right-0 inline-flex items-center text-lg text-pink-500 hover:text-pink-700 border border-pink-200 rounded-full w-8 h-8 justify-center bg-pink-50 hover:bg-pink-100 shadow transition-colors z-20"
              aria-label="Add contact"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        {/* Horizontal Scrollable Contacts */}
        {clientData.contacts && clientData.contacts.length > 0 ? (
          <div className="relative">
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-pink-50 border border-pink-200 rounded-full p-2 shadow-lg hover:bg-pink-100 transition-colors duration-150"
              onClick={() => scroll('left')}
              aria-label="Scroll left"
              style={{ left: '-2rem' }}
            >
              <svg className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide pr-2 scroll-snap-x snap-mandatory pb-4 relative"
              style={{ scrollBehavior: 'smooth', scrollSnapType: 'x mandatory' }}
            >
              {clientData.contacts.map((contact, index) => (
                <div
                  key={contact.id || index}
                  className="group bg-white min-w-[220px] max-w-[240px] snap-center rounded-2xl py-2 px-3 border-2 border-pink-200 shadow-xl hover:shadow-2xl hover:border-pink-400 transition-all duration-200 relative overflow-hidden flex flex-col gap-0.5 hover:bg-pink-50/40"
                >
                  {/* Delete (X) button, only visible on hover */}
                  <button
                    type="button"
                    onClick={() => removeContact(contact.id)}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-pink-500 bg-white rounded-full p-2 shadow-md border border-neutral-200 transition-colors hover:border-pink-200 z-10 opacity-0 group-hover:opacity-100"
                    aria-label="Delete contact"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-lg text-neutral-900 tracking-tight">{contact.name || 'Unnamed Contact'}</span>
                      {contact.role && (
                        <span className="inline-block px-3 py-1 bg-pink-100 text-pink-700 text-xs font-bold rounded-full shadow-sm border border-pink-200 uppercase tracking-wide">{contact.role}</span>
                      )}
                    </div>
                    {contact.email && (
                      <div className="flex items-center gap-2 text-sm text-pink-700">
                        <span className="bg-pink-50 rounded-full p-1 flex items-center justify-center"><svg className="h-4 w-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M2.003 5.884L12 12.882l9.997-6.998A2 2 0 0020 4H4a2 2 0 00-1.997 1.884z" /><path d="M22 8.118l-10 6-10-6V20a2 2 0 002 2h16a2 2 0 002-2V8.118z" /></svg></span>
                        <a href={`mailto:${contact.email}`} className="hover:underline font-medium">{contact.email}</a>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-sm text-pink-700">
                        <span className="bg-pink-50 rounded-full p-1 flex items-center justify-center"><svg className="h-4 w-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg></span>
                        <a href={`tel:${contact.phone}`} className="hover:underline font-medium">{contact.phone}</a>
                      </div>
                    )}
                    {contact.location && (
                      <div className="flex items-center gap-2 text-sm text-pink-700">
                        <span className="bg-pink-50 rounded-full p-1 flex items-center justify-center"><svg className="h-4 w-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><circle cx="12" cy="10" r="3" /></svg></span>
                        {contact.location}
                      </div>
                    )}
                    {contact.notes && (
                      <div className="flex items-center gap-2 text-sm text-pink-700">
                        <span className="bg-pink-50 rounded-full p-1 flex items-center justify-center"><svg className="h-4 w-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8M8 16h8M8 8h8" /></svg></span>
                        <span>{contact.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {/* Progress Bar */}
              <div className="absolute left-0 right-0 bottom-0 h-2 flex items-center">
                <div className="w-1/2 h-1 rounded-full bg-pink-200 transition-all duration-300" style={{ width: '40%' }}></div>
                <div className="flex-1 h-1 bg-pink-50 rounded-full"></div>
              </div>
            </div>
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-pink-50 border border-pink-200 rounded-full p-2 shadow-lg hover:bg-pink-100 transition-colors duration-150"
              onClick={() => scroll('right')}
              aria-label="Scroll right"
              style={{ right: '-2rem' }}
            >
              <svg className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        ) : clientData.contacts && clientData.contacts.length === 0 && !showAddContactForm && (
          <div className="bg-white p-10 rounded-xl border border-dashed border-primary-200 text-center">
            <div className="w-16 h-16 mx-auto bg-primary-50 rounded-full flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0z" />
                <path d="M18 8a2 2 0 11-4 0 2 2 0 014 0z" />
                <path d="M14 15a4 4 0 00-8 0v3h8v-3z" />
                <path d="M6 8a2 2 0 11-4 0 2 2 0 014 0z" />
                <path d="M16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3z" />
                <path d="M4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <h5 className="text-lg font-medium text-neutral-800 mb-2">No contacts added yet</h5>
            <p className="text-neutral-500 mb-4">Add contacts to keep track of your team members</p>
            <button 
              onClick={() => setShowAddContactForm(true)}
              className="btn btn-primary w-full max-w-xs mx-auto flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add your first contact
            </button>
          </div>
        )}
        {/* Add New Contact Form as Modal */}
        {showAddContactForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl p-8 border border-primary-100 shadow-2xl max-w-lg w-full relative">
              <button
                className="absolute top-3 right-3 text-neutral-400 hover:text-primary"
                onClick={() => setShowAddContactForm(false)}
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
                Add New Contact
              </h5>
              <form className="flex flex-col gap-5" onSubmit={handleAddContact}>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={newContact.name}
                      onChange={handleNewContactChange}
                      className="block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="Contact name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Role</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="role"
                      value={newContact.role}
                      onChange={handleNewContactChange}
                      className="block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="e.g. Marketing Manager"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={newContact.email}
                      onChange={handleNewContactChange}
                      className="block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="Contact email"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={newContact.phone}
                      onChange={handleNewContactChange}
                      className="block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="Contact phone"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Location</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9l-4.95 4.95-4.95-4.95a7 7 0 010-9.9zm7.07 7.07a5 5 0 10-7.07-7.07 5 5 0 007.07 7.07z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="location"
                      value={newContact.location}
                      onChange={handleNewContactChange}
                      className="block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="Contact location"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={newContact.notes}
                    onChange={handleNewContactChange}
                    className="block w-full py-2 px-3 sm:text-sm border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Any notes about this contact"
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
                  Add Contact
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}