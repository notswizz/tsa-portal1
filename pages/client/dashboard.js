import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import Layout from '../../components/Layout';
import ClientProfileSection from '../../components/client/ClientProfileSection';
import BookingsSection from '../../components/client/BookingsSection';
import BookingModal from '../../components/client/BookingModal';

export default function ClientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    contacts: [],
    logoUrl: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    contacts: [],
  });
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    location: '',
    notes: ''
  });
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAddContactForm, setShowAddContactForm] = useState(false);
  const [locations, setLocations] = useState([]);
  const [showAddLocationForm, setShowAddLocationForm] = useState(false);
  const [newLocation, setNewLocation] = useState({ city: '', booth: '', notes: '' });
  
  useEffect(() => {
    if (status !== 'loading') {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (router.query.tab === 'book') {
      setShowBookingModal(true);
    }
  }, [router.query.tab]);

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/auth/signin?type=client');
    }
  }, [session, loading, router]);

  useEffect(() => {
    async function fetchClientData() {
      if (session?.user?.id) {
        try {
          const clientDocRef = doc(db, 'clients', session.user.id);
          const clientDoc = await getDoc(clientDocRef);
          if (clientDoc.exists()) {
            const data = clientDoc.data();
            const profileInfo = {
              name: data.name || '',
              email: data.email || '',
              phone: data.phone || '',
              website: data.website || '',
              contacts: Array.isArray(data.contacts) ? data.contacts : [],
              logoUrl: data.logoUrl || '',
              id: session.user.id,
            };
            setClientData(profileInfo);
            setEditedProfile(profileInfo);
            setLocations(Array.isArray(data.locations) ? data.locations : []);
          }
        } catch (error) {
          console.error("Error fetching client profile:", error);
        }
      }
    }
    if (session) {
      fetchClientData();
    }
  }, [session]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewContactChange = (e) => {
    const { name, value } = e.target;
    setNewContact(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addContact = async () => {
    if (newContact.name || newContact.email || newContact.phone || newContact.role) {
      const contactWithId = { ...newContact, id: Date.now() };
      setEditedProfile(prev => ({
        ...prev,
        contacts: Array.isArray(prev.contacts) ? [...prev.contacts, contactWithId] : [contactWithId]
      }));
      setNewContact({ name: '', email: '', phone: '', role: '', location: '', notes: '' });
      if (session?.user?.id) {
        const clientDocRef = doc(db, 'clients', session.user.id);
        try {
          await updateDoc(clientDocRef, {
            contacts: arrayUnion(contactWithId),
            updatedAt: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error adding contact:', error);
        }
      }
    }
  };

  const removeContact = async (contactId) => {
    setEditedProfile(prev => ({
      ...prev,
      contacts: Array.isArray(prev.contacts) ? prev.contacts.filter(contact => contact.id !== contactId) : []
    }));
    if (session?.user?.id) {
      const clientDocRef = doc(db, 'clients', session.user.id);
      const contactToRemove = editedProfile.contacts.find(c => c.id === contactId);
      if (contactToRemove) {
        try {
          await updateDoc(clientDocRef, {
            contacts: arrayRemove(contactToRemove),
            updatedAt: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error removing contact:', error);
        }
      }
    }
  };

  // Location handlers
  const handleNewLocationChange = (e) => {
    const { name, value } = e.target;
    setNewLocation((prev) => ({ ...prev, [name]: value }));
  };

  const addLocation = async () => {
    if (!newLocation.city && !newLocation.booth) return;
    const locationWithId = { ...newLocation, id: Date.now() };
    setLocations((prev) => [...prev, locationWithId]);
    setNewLocation({ city: '', booth: '', notes: '' });
    if (session?.user?.id) {
      const clientDocRef = doc(db, 'clients', session.user.id);
      try {
        await updateDoc(clientDocRef, {
          locations: arrayUnion(locationWithId),
          updatedAt: new Date().toISOString(),
        });
        // Refresh locations from Firestore
        const clientDoc = await getDoc(clientDocRef);
        if (clientDoc.exists()) {
          const data = clientDoc.data();
          setLocations(Array.isArray(data.locations) ? data.locations : []);
        }
      } catch (error) {
        console.error('Error adding location:', error);
      }
    }
  };

  const removeLocation = async (locationId) => {
    const locationToRemove = locations.find((l) => l.id === locationId);
    setLocations((prev) => prev.filter((l) => l.id !== locationId));
    if (session?.user?.id && locationToRemove) {
      const clientDocRef = doc(db, 'clients', session.user.id);
      try {
        await updateDoc(clientDocRef, {
          locations: arrayRemove(locationToRemove),
          updatedAt: new Date().toISOString(),
        });
        // Refresh locations from Firestore
        const clientDoc = await getDoc(clientDocRef);
        if (clientDoc.exists()) {
          const data = clientDoc.data();
          setLocations(Array.isArray(data.locations) ? data.locations : []);
        }
      } catch (error) {
        console.error('Error removing location:', error);
      }
    }
  };

  const saveProfile = async () => {
    if (session?.user?.id) {
      try {
        const clientDocRef = doc(db, 'clients', session.user.id);
        const updatedProfile = {
          ...editedProfile,
          updatedAt: new Date().toISOString()
        };
        await updateDoc(clientDocRef, updatedProfile);
        setClientData(prev => ({
          ...prev,
          ...editedProfile
        }));
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };

  const openBookingModal = () => {
    setShowBookingModal(true);
    router.push({
      pathname: router.pathname,
      query: { tab: 'book' }
    }, undefined, { shallow: true });
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    router.push({
      pathname: router.pathname
    }, undefined, { shallow: true });
  };

  if (loading) {
    return (
      <Layout title="Loading... | Client Dashboard">
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500 mx-auto"></div>
            <p className="mt-6 text-xl text-pink-600 font-light">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Layout title="Client Dashboard | The Smith Agency">
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
        <header className="bg-white shadow-md border-b-2 border-primary py-3 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <a href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg sm:text-xl">TSA</span>
                </div>
                <span className="text-lg sm:text-2xl font-display font-bold text-primary-800 truncate">
                  The Smith Agency
                </span>
              </a>
              <div className="flex items-center space-x-3 sm:space-x-6">
                <div className="flex items-center bg-white rounded-full shadow-md p-1 border border-primary-100">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full overflow-hidden border-2 border-primary bg-primary-50 flex items-center justify-center">
                    {clientData.logoUrl ? (
                      <img 
                        src={clientData.logoUrl} 
                        alt={clientData.name}
                        width={36}
                        height={36}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-primary font-bold">
                        {clientData.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="mx-2 sm:mx-3 hidden sm:block">
                    <p className="text-sm font-medium text-neutral-700 truncate max-w-[100px] md:max-w-none">
                      {clientData.name || 'Client'}
                    </p>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="hidden sm:block text-xs text-neutral-500 hover:text-primary ml-2 transition-colors"
                  >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M3 4a1 1 0 011-1h6a1 1 0 110 2H5v10h5a1 1 0 110 2H4a1 1 0 01-1-1V4zm13.293 4.293a1 1 0 010 1.414L14.414 12H9a1 1 0 110-2h5.414l-1.293-1.293a1 1 0 111.414-1.414z" clipRule="evenodd" />
                   </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5 max-h-[80vh] overflow-y-auto pr-2">
              <ClientProfileSection
                clientData={clientData}
                isEditing={isEditing}
                editedProfile={editedProfile}
                setIsEditing={setIsEditing}
                handleProfileChange={handleProfileChange}
                saveProfile={saveProfile}
                showAddContactForm={showAddContactForm}
                setShowAddContactForm={setShowAddContactForm}
                newContact={newContact}
                handleNewContactChange={handleNewContactChange}
                addContact={addContact}
                removeContact={removeContact}
                onContactAdded={null}
                locations={locations}
                addLocation={addLocation}
                removeLocation={removeLocation}
                showAddLocationForm={showAddLocationForm}
                setShowAddLocationForm={setShowAddLocationForm}
                newLocation={newLocation}
                handleNewLocationChange={handleNewLocationChange}
              />
            </div>
            <div className="lg:col-span-7">
              <BookingsSection
                clientId={session.user.id}
                openBookingModal={openBookingModal}
              />
            </div>
          </section>
        </main>
        <BookingModal
          showBookingModal={showBookingModal}
          closeBookingModal={closeBookingModal}
                    clientId={session.user.id} 
                  />
      </div>
    </Layout>
  );
} 