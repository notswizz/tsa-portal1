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
    category: '',
    location: '',
    logoUrl: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    category: '',
    location: '',
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
              category: data.category || '',
              location: data.location || '',
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
        {/* Header with user info */}
        <header className="bg-white shadow-md border-b-2 border-pink-500 py-3 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg sm:text-xl">TSA</span>
                </div>
                <span className="text-lg sm:text-2xl font-bold text-pink-600 truncate">
                  The Smith Agency
                </span>
              </Link>
              
              <div className="flex items-center space-x-3 sm:space-x-6">
                <div className="hidden md:flex space-x-6">
                  <Link href="/" className="text-gray-600 hover:text-pink-600 transition-colors">
                    Home
                  </Link>
                </div>
                
                <div className="flex items-center bg-white rounded-full shadow-md p-1 border border-pink-300">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full overflow-hidden border-2 border-pink-500 bg-pink-100 flex items-center justify-center">
                    {clientData.logoUrl ? (
                      <Image 
                        src={clientData.logoUrl} 
                        alt={clientData.name}
                        width={36}
                        height={36}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-pink-500 font-bold">
                        {clientData.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="mx-2 sm:mx-3 hidden sm:block">
                    <p className="text-sm font-medium text-gray-700 truncate max-w-[100px] md:max-w-none">
                      {clientData.name}
                    </p>
                    <p className="text-xs text-pink-500">Client</p>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="p-1.5 rounded-full text-gray-500 hover:text-white hover:bg-pink-500 transition-colors"
                    title="Log out"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
          {/* Two-column layout for desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Company Profile Section */}
            <div className="lg:col-span-5 bg-white rounded-2xl shadow-xl overflow-hidden border border-pink-200 h-[calc(100vh-180px)] flex flex-col">
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-pink-200 bg-pink-500 flex justify-between items-center flex-shrink-0">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Company Profile
                </h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-sm text-white opacity-80 hover:opacity-100 flex items-center focus:outline-none transition-all duration-200"
                >
                  {isEditing ? (
                    <>
                      <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Cancel</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <span>Edit</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="p-4 sm:p-6 overflow-y-auto">
                {isEditing ? (
                  <div className="animate-fadeIn mb-6">
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Company Name</label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={editedProfile.name}
                            onChange={handleProfileChange}
                            className="mt-1 focus:ring-pink-500 focus:border-pink-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={editedProfile.email}
                            onChange={handleProfileChange}
                            className="mt-1 focus:ring-pink-500 focus:border-pink-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                          <input
                            type="tel"
                            name="phone"
                            id="phone"
                            value={editedProfile.phone}
                            onChange={handleProfileChange}
                            className="mt-1 focus:ring-pink-500 focus:border-pink-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website</label>
                          <input
                            type="url"
                            name="website"
                            id="website"
                            value={editedProfile.website}
                            onChange={handleProfileChange}
                            className="mt-1 focus:ring-pink-500 focus:border-pink-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                          <input
                            type="text"
                            name="category"
                            id="category"
                            value={editedProfile.category}
                            onChange={handleProfileChange}
                            className="mt-1 focus:ring-pink-500 focus:border-pink-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                          <input
                            type="text"
                            name="location"
                            id="location"
                            value={editedProfile.location}
                            onChange={handleProfileChange}
                            className="mt-1 focus:ring-pink-500 focus:border-pink-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={saveProfile}
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="animate-fadeIn">
                    <div className="mb-4">
                      <h3 className="text-xl font-extrabold text-gray-800 mb-2 tracking-tight">{clientData.name}</h3>
                    </div>
                    
                    {/* Client Statistics at the top without title */}
                    <ClientStatistics clientId={session.user.id} />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div className="bg-pink-50 rounded-lg p-4 transition-all duration-200 hover:shadow-md">
                        <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Email</h4>
                        <p className="mt-2 text-gray-900 font-medium">{clientData.email || 'Not specified'}</p>
                      </div>
                      <div className="bg-pink-50 rounded-lg p-4 transition-all duration-200 hover:shadow-md">
                        <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Phone</h4>
                        <p className="mt-2 text-gray-900 font-medium">{clientData.phone || 'Not specified'}</p>
                      </div>
                      <div className="bg-pink-50 rounded-lg p-4 transition-all duration-200 hover:shadow-md">
                        <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Website</h4>
                        <p className="mt-2 text-gray-900 font-medium">
                          {clientData.website ? (
                            <a 
                              href={clientData.website.startsWith('http') ? clientData.website : `https://${clientData.website}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-pink-600 hover:text-pink-800 hover:underline"
                            >
                              {clientData.website}
                            </a>
                          ) : (
                            'Not specified'
                          )}
                        </p>
                      </div>
                      <div className="bg-pink-50 rounded-lg p-4 transition-all duration-200 hover:shadow-md">
                        <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Category</h4>
                        <p className="mt-2 text-gray-900 font-medium">{clientData.category || 'Not specified'}</p>
                      </div>
                      <div className="col-span-2 bg-pink-50 rounded-lg p-4 transition-all duration-200 hover:shadow-md">
                        <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Location</h4>
                        <p className="mt-2 text-gray-900 font-medium">{clientData.location || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Bookings Section */}
            <div className="lg:col-span-7 bg-white rounded-2xl shadow-xl overflow-hidden border border-pink-200 h-[calc(100vh-180px)] flex flex-col">
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-pink-200 bg-pink-500 flex justify-between items-center flex-shrink-0">
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Your Bookings
                </h3>
                <button
                  onClick={openBookingModal}
                  className="px-4 py-2 rounded-full bg-white text-pink-600 font-medium text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-pink-500"
                >
                  <span className="flex items-center">
                    <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Booking
                  </span>
                </button>
              </div>
              <div className="overflow-y-auto p-4 sm:p-6">
                <BookingsList clientId={session.user.id} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            {/* Modal container */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-pink-500 px-4 py-3 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-white">
                  Book Staff
                </h3>
                <button
                  onClick={closeBookingModal}
                  type="button"
                  className="bg-pink-500 rounded-md text-white hover:text-gray-200 focus:outline-none"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
                <BookingForm 
                  session={session} 
                  onSuccess={() => {
                    closeBookingModal();
                    router.push('/client/dashboard');
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
} 