import React from 'react';
import ContactsSection from './ContactsSection';
import ClientStatistics from './ClientStatistics';
import { useRouter } from 'next/router';
import LocationsSection from './LocationsSection';

export default function ClientProfileSection({
  clientData,
  editedProfile,
  handleProfileChange,
  showAddContactForm,
  setShowAddContactForm,
  newContact,
  handleNewContactChange,
  addContact,
  removeContact,
  onContactAdded,
  locations,
  addLocation,
  removeLocation,
  showAddLocationForm,
  setShowAddLocationForm,
  newLocation,
  handleNewLocationChange
}) {
  const router = useRouter();
  const handleContactAdded = () => {
    router.reload();
  };
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-primary-100 p-5 sm:p-6 transition-all duration-200 hover:shadow-2xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="flex-shrink-0 p-1.5 rounded-lg bg-primary-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H7a1 1 0 00-1 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
            </svg>
          </span>
          <h2 className="page-title text-lg sm:text-xl">{clientData.name || 'Company'}</h2>
          {clientData.website && (
            <a
              href={clientData.website.startsWith('http') ? clientData.website : `https://${clientData.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-pink-600 hover:underline text-xs sm:text-sm font-semibold bg-pink-50 px-2.5 py-1 rounded-lg shadow-sm"
            >
              {clientData.website.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
      </div>
      <div className="space-y-4">
        <div className="mb-2 bg-gradient-to-r from-primary-50 to-white p-3 sm:p-4 rounded-lg border border-primary-100">
          {/* Shrink top spacing and remove extra header row */}
          <ClientStatistics clientId={clientData.id} />
        </div>
        <ContactsSection
          clientData={clientData}
          editedProfile={editedProfile}
          handleProfileChange={handleProfileChange}
          showAddContactForm={showAddContactForm}
          setShowAddContactForm={setShowAddContactForm}
          newContact={newContact}
          handleNewContactChange={handleNewContactChange}
          addContact={addContact}
          removeContact={removeContact}
          onContactAdded={handleContactAdded}
        />
        <LocationsSection
          locations={locations}
          addLocation={addLocation}
          removeLocation={removeLocation}
          showAddLocationForm={showAddLocationForm}
          setShowAddLocationForm={setShowAddLocationForm}
          newLocation={newLocation}
          handleNewLocationChange={handleNewLocationChange}
        />
      </div>
    </div>
  );
} 