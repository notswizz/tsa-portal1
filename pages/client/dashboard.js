import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { format, parseISO, eachDayOfInterval } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../../components/Layout';
import BookingsList from '../../components/client/BookingsList';
import BookingForm from '../../components/client/BookingForm';
import ClientStatistics from '../../components/client/ClientStatistics';

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
    role: ''
  });
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  useEffect(() => {
    // If the session loading is done, update loading state
    if (status !== 'loading') {
      setLoading(false);
    }
  }, [status]);

  // If URL query includes tab parameter, check if it's 'book' to show modal
  useEffect(() => {
    if (router.query.tab === 'book') {
      setShowBookingModal(true);
    }
  }, [router.query.tab]);

  // If not authenticated or not a client, redirect to sign in
  useEffect(() => {
    if (!loading && !session) {
      router.replace('/auth/signin?type=client');
    }
  }, [session, loading, router]);

  // Fetch client data from Firebase when session is available
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
            };
            
            setClientData(profileInfo);
            setEditedProfile(profileInfo);
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

  const addContact = () => {
    // Check if any field is filled before adding
    if (newContact.name || newContact.email || newContact.phone || newContact.role) {
      setEditedProfile(prev => ({
        ...prev,
        contacts: Array.isArray(prev.contacts) ? [...prev.contacts, { ...newContact, id: Date.now() }] : [{ ...newContact, id: Date.now() }]
      }));
      
      // Reset new contact fields
      setNewContact({
        name: '',
        email: '',
        phone: '',
        role: ''
      });
    }
  };

  const removeContact = (contactId) => {
    setEditedProfile(prev => ({
      ...prev,
      contacts: Array.isArray(prev.contacts) ? prev.contacts.filter(contact => contact.id !== contactId) : []
    }));
  };

  const saveProfile = async () => {
    if (session?.user?.id) {
      try {
        const clientDocRef = doc(db, 'clients', session.user.id);
        // Add updatedAt timestamp
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
    // Update URL without refreshing page
    router.push({
      pathname: router.pathname,
      query: { tab: 'book' }
    }, undefined, { shallow: true });
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    // Update URL without refreshing page
    router.push({
      pathname: router.pathname
    }, undefined, { shallow: true });
  };

  // If loading, show loading state
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

  // If not logged in, show nothing (redirect is handled by useEffect)
  if (!session) {
    return null;
  }

  // Client dashboard
  return (
    <Layout title="Client Dashboard | The Smith Agency">
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
        {/* Header with user info */}
        <header className="bg-white shadow-md border-b-2 border-primary py-3 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg sm:text-xl">TSA</span>
                </div>
                <span className="text-lg sm:text-2xl font-display font-bold text-primary-800 truncate">
                  The Smith Agency
                </span>
              </Link>
              
              <div className="flex items-center space-x-3 sm:space-x-6">
                <div className="hidden md:flex space-x-6">
                  <Link href="/" className="text-neutral-600 hover:text-primary transition-colors">
                    Home
                  </Link>
                </div>
                
                <div className="flex items-center bg-white rounded-full shadow-md p-1 border border-primary-100">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full overflow-hidden border-2 border-primary bg-primary-50 flex items-center justify-center">
                    {clientData.logoUrl ? (
                      <Image 
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
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Client Profile Section */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
              <div className="card animate-slideUp">
                <div className="flex items-center justify-between card-header">
                  <div className="flex items-center space-x-2">
                    <span className="flex-shrink-0 p-1.5 rounded-lg bg-primary-50">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H7a1 1 0 00-1 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <h2 className="page-title text-xl">Company Profile</h2>
                  </div>
                  
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center text-sm text-primary hover:text-primary-dark"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="text-sm text-neutral-500 hover:text-neutral-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveProfile}
                        className="btn btn-primary py-1 px-3 text-xs"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="card-body">
                  <h3 className="text-xl font-display font-semibold text-neutral-800 mb-6">
                    {clientData.name || "Complete Your Profile"}
                  </h3>
                  
                  <div className="mb-6 bg-gradient-to-r from-primary-50 to-white p-4 rounded-lg border border-primary-100">
                    <ClientStatistics clientId={session.user.id} />
                  </div>
                  
                  <div className="space-y-8">
                    {/* Company Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-neutral-100 p-5">
                      <h4 className="text-md font-medium text-primary-800 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H7a1 1 0 00-1 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                        </svg>
                        COMPANY INFORMATION
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-neutral-400 uppercase">Company Name</label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="name"
                              value={editedProfile.name}
                              onChange={handleProfileChange}
                              className="form-input mt-1"
                            />
                          ) : (
                            <p className="text-neutral-800 font-medium text-lg">{clientData.name || "—"}</p>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-neutral-400 uppercase">Email</label>
                          {isEditing ? (
                            <input
                              type="email"
                              name="email"
                              value={editedProfile.email}
                              onChange={handleProfileChange}
                              className="form-input mt-1"
                            />
                          ) : (
                            <p className="text-neutral-800 font-medium">
                              <a href={`mailto:${clientData.email}`} className="hover:text-primary transition-colors">
                                {clientData.email || "—"}
                              </a>
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-neutral-400 uppercase">Phone</label>
                          {isEditing ? (
                            <input
                              type="tel"
                              name="phone"
                              value={editedProfile.phone}
                              onChange={handleProfileChange}
                              className="form-input mt-1"
                              placeholder="e.g. 123-456-7890"
                            />
                          ) : (
                            <p className="text-neutral-800 font-medium">
                              <a href={`tel:${clientData.phone}`} className="hover:text-primary transition-colors">
                                {clientData.phone || "—"}
                              </a>
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-neutral-400 uppercase">Website</label>
                          {isEditing ? (
                            <input
                              type="url"
                              name="website"
                              value={editedProfile.website}
                              onChange={handleProfileChange}
                              className="form-input mt-1"
                              placeholder="e.g. https://yourwebsite.com"
                            />
                          ) : (
                            <p className="text-neutral-800 font-medium">
                              {clientData.website ? (
                                <a href={clientData.website.startsWith('http') ? clientData.website : `https://${clientData.website}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline transition-colors">
                                  {clientData.website}
                                </a>
                              ) : "—"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Contacts Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-neutral-100 p-5">
                      <h4 className="text-md font-medium text-primary-800 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                        CONTACTS
                      </h4>
                      
                      {/* Existing Contacts */}
                      {clientData.contacts && clientData.contacts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {(isEditing ? editedProfile.contacts : clientData.contacts).map((contact, index) => (
                            <div key={contact.id || index} className="bg-white rounded-xl p-4 border border-primary-100 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden">
                              {/* Pink accent line at top */}
                              <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
                              
                              {isEditing && (
                                <button 
                                  type="button" 
                                  onClick={() => removeContact(contact.id)}
                                  className="absolute top-3 right-3 text-neutral-400 hover:text-primary bg-white rounded-full p-1.5 shadow-md border border-neutral-200 transition-colors hover:border-primary-200 z-10"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              )}
                              <div className="flex items-start space-x-4 pt-3">
                                <div className="h-14 w-14 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center text-primary font-bold text-xl shadow-sm border-2 border-primary-200">
                                  {contact.name ? contact.name.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-semibold text-lg text-neutral-900 truncate">{contact.name || 'Unnamed Contact'}</h5>
                                  {contact.role && (
                                    <div className="inline-block px-2.5 py-0.5 bg-primary-50 text-primary-800 text-xs font-medium rounded-full mt-1 mb-3">
                                      {contact.role}
                                    </div>
                                  )}
                                  
                                  <div className="space-y-2 mt-3">
                                    {contact.email && (
                                      <div className="flex items-center group">
                                        <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center mr-2 group-hover:bg-primary-100 transition-colors">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                          </svg>
                                        </div>
                                        <a href={`mailto:${contact.email}`} className="text-primary hover:text-primary-dark text-sm font-medium hover:underline truncate block">
                                          {contact.email}
                                        </a>
                                      </div>
                                    )}
                                    
                                    {contact.phone && (
                                      <div className="flex items-center group">
                                        <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center mr-2 group-hover:bg-primary-100 transition-colors">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                          </svg>
                                        </div>
                                        <a href={`tel:${contact.phone}`} className="text-primary hover:text-primary-dark text-sm font-medium hover:underline truncate block">
                                          {contact.phone}
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : !isEditing ? (
                        <div className="bg-white p-6 rounded-xl border border-dashed border-primary-200 text-center">
                          <div className="w-16 h-16 mx-auto bg-primary-50 rounded-full flex items-center justify-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                            </svg>
                          </div>
                          <h5 className="text-lg font-medium text-neutral-800 mb-2">No contacts added yet</h5>
                          <p className="text-neutral-500 mb-4">Add contacts to keep track of your team members</p>
                          {!isEditing && (
                            <button 
                              onClick={() => setIsEditing(true)}
                              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                              Add your first contact
                            </button>
                          )}
                        </div>
                      ) : null}
                      
                      {/* Add New Contact Form (when editing) */}
                      {isEditing && (
                        <div className="mt-6 bg-white rounded-xl p-6 border border-primary-100 shadow-sm">
                          <h5 className="font-medium text-primary-800 mb-4 flex items-center">
                            <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                            Add New Contact
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                          </div>
                          <button
                            type="button"
                            onClick={addContact}
                            className="mt-5 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors w-full md:w-auto"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Add Contact
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-7">
              <div className="card h-full animate-slideUp">
                <div className="flex items-center justify-between card-header">
                  <div className="flex items-center space-x-2">
                    <span className="flex-shrink-0 p-1.5 rounded-lg bg-primary-50">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <h2 className="page-title text-xl">Your Bookings</h2>
                  </div>
                  
                  <button
                    onClick={openBookingModal}
                    className="btn btn-primary text-xs sm:text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    New Booking
                  </button>
                </div>
                
                <div className="card-body overflow-y-auto max-h-[600px]">
                  <BookingsList clientId={session.user.id} />
                </div>
              </div>
            </div>
          </section>
        </main>
        
        {/* Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-neutral-800 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeBookingModal}></div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
                <div className="flex justify-between items-center bg-neutral-50 px-6 py-4 border-b border-neutral-100">
                  <h3 className="text-lg font-display font-semibold text-neutral-800" id="modal-title">
                    Book Staff for Your Event
                  </h3>
                  <button 
                    type="button" 
                    className="bg-white rounded-full p-1 hover:bg-neutral-100"
                    onClick={closeBookingModal}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                <div className="p-6">
                  <BookingForm 
                    clientId={session.user.id} 
                    closeModal={closeBookingModal} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 