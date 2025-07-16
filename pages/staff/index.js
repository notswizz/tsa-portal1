import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn } from 'next-auth/react';
import { db } from '../../lib/firebase';
import { doc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import Image from 'next/image';

// Components
import StaffHeader from '../../components/staff/StaffHeader';
import EnhancedProfileSection from '../../components/staff/EnhancedProfileSection';
import CalendarCard from '../../components/staff/CalendarCard';
import BookingsCard from '../../components/staff/BookingsCard';
import AvailabilityCard from '../../components/staff/AvailabilityCard';
import FormsCard from '../../components/staff/FormsCard';
import ResourcesCard from '../../components/staff/ResourcesCard';

export default function StaffPortal() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    college: '',
    shoeSize: '',
    dressSize: '',
    phoneNumber: '',
    address: '',
    phone: '',
  });
  const [staffDocRef, setStaffDocRef] = useState(null);
  const [isEditingMobile, setIsEditingMobile] = useState(false);
  const [activeMobileView, setActiveMobileView] = useState('calendar'); // 'calendar', 'bookings', 'availability', 'forms'
  const [activeDesktopTab, setActiveDesktopTab] = useState('availability'); // 'availability' or 'bookings'
  const [activeBottomTab, setActiveBottomTab] = useState('forms'); // 'forms' or 'resources'

  // Loading state
  useEffect(() => {
    if (status !== 'loading') {
      setLoading(false);
    }
  }, [status]);

  // Fetch staff profile
  useEffect(() => {
    async function fetchProfileData() {
      if (session?.user?.email) {
        try {
          // Find matching document if it exists
          const staffCollection = collection(db, 'staff');
          const staffSnapshot = await getDocs(staffCollection);
          const allStaff = staffSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Check if there's a document that matches this email with a different case
          const matchingDoc = allStaff.find(
            staff => staff.email && staff.email.toLowerCase() === session.user.email.toLowerCase()
          );
          
          let docRef;
          
          if (matchingDoc && matchingDoc.id !== session.user.email) {
            // If we found a matching document with different case, use that ID
            docRef = doc(db, 'staff', matchingDoc.id);
          } else {
            // Otherwise use the current email as ID
            docRef = doc(db, 'staff', session.user.email);
          }
          
          setStaffDocRef(docRef);
          
          const staffDoc = await getDoc(docRef);
          
          if (staffDoc.exists()) {
            // If document exists, update state with data
            const data = staffDoc.data();
            
            const profileInfo = {
              college: data.college || '',
              shoeSize: data.shoeSize || '',
              dressSize: data.dressSize || '',
              phoneNumber: data.phoneNumber || '',
              address: data.address || '',
              phone: data.phone || '',
            };
            
            setProfileData(profileInfo);
          }
        } catch (error) {
          console.error("Error fetching staff profile:", error);
        }
      }
    }
    
    if (session) {
      fetchProfileData();
    }
  }, [session]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveProfile = async () => {
    if (!staffDocRef) return;
    
    try {
      // Update document with current profile data
      await updateDoc(staffDocRef, {
        ...profileData,
        updatedAt: new Date()
      });
      
      setIsEditingMobile(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  // If loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500 mx-auto"></div>
          <p className="mt-6 text-xl text-pink-600 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in, show login prompt
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl border-2 border-pink-500 transform transition-all">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-pink-700 mb-6">The Smith Agency</h1>
            <div className="w-full h-0.5 bg-gradient-to-r from-pink-400 to-pink-600 mx-auto mb-8"></div>
            <p className="text-lg text-gray-600 mb-6">Welcome to your staff portal</p>
          </div>
          
          <button
            onClick={() => signIn('google')}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-pink-500 to-black hover:from-pink-600 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-150 ease-in-out shadow-lg hover:shadow-xl"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-pink-200 group-hover:text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="currentColor" />
              </svg>
            </span>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // Staff dashboard content with modular components
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      {/* Header */}
      <StaffHeader session={session} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
        {/* Mobile View */}
        <div className="lg:hidden space-y-4">
          {/* Mobile Profile Summary - Only shows name, image, and booking stats */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-pink-300">
            <div className="px-3 py-2 border-b border-pink-100 bg-gradient-to-r from-pink-500 to-pink-600 flex justify-between items-center">
              <h2 className="text-base font-bold text-white flex items-center">
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Profile
              </h2>
              <button 
                onClick={() => setIsEditingMobile(!isEditingMobile)}
                className="px-2 py-1 text-xs font-medium text-white bg-pink-600 bg-opacity-30 rounded-md hover:bg-opacity-50 focus:outline-none transition-all duration-150"
              >
                {isEditingMobile ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
            <div className="p-3 bg-gradient-to-br from-white to-pink-50">
              {!isEditingMobile ? (
                <>
                  <div className="flex items-center mb-3">
                    <div className="relative bg-gradient-to-br from-pink-500 to-pink-600 p-1 rounded-full shadow-lg mr-4">
                      {session?.user?.image ? (
                        <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-white">
                          <Image 
                            src={session.user.image} 
                            alt={session.user.name}
                            width={56}
                            height={56}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-14 w-14 rounded-full bg-pink-200 flex items-center justify-center border-2 border-white">
                          <span className="text-xl font-bold text-pink-700">
                            {session?.user?.name?.charAt(0) || "U"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{session?.user?.name}</h3>
                      <p className="text-pink-500 text-xs truncate">{session?.user?.email}</p>
                    </div>
                  </div>
                  
                  {/* Booking Stats */}
                  <div className="bg-pink-50 p-3 rounded-lg mb-2">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-white rounded-lg p-2 shadow-sm">
                        <p className="text-xl font-bold text-pink-600">5</p>
                        <p className="text-xs text-gray-600">Shows Worked</p>
                      </div>
                      <div className="bg-white rounded-lg p-2 shadow-sm">
                        <p className="text-xl font-bold text-pink-600">26</p>
                        <p className="text-xs text-gray-600">Days Booked</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="animate-fadeIn">
                  <div className="bg-pink-50 p-3 rounded-lg shadow-inner">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="bg-white rounded p-2 shadow-sm">
                        <label className="block text-pink-600 font-medium mb-1">College/University</label>
                        <input
                          type="text"
                          name="college"
                          value={profileData.college}
                          onChange={handleProfileChange}
                          className="w-full px-2 py-1 border border-pink-200 rounded focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                          placeholder="Enter your college"
                        />
                      </div>
                      <div className="bg-white rounded p-2 shadow-sm">
                        <label className="block text-pink-600 font-medium mb-1">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          className="w-full px-2 py-1 border border-pink-200 rounded focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                          placeholder="Enter your phone"
                        />
                      </div>
                      <div className="bg-white rounded p-2 shadow-sm">
                        <label className="block text-pink-600 font-medium mb-1">Shoe Size</label>
                        <input
                          type="text"
                          name="shoeSize"
                          value={profileData.shoeSize}
                          onChange={handleProfileChange}
                          className="w-full px-2 py-1 border border-pink-200 rounded focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                          placeholder="Enter your shoe size"
                        />
                      </div>
                      <div className="bg-white rounded p-2 shadow-sm">
                        <label className="block text-pink-600 font-medium mb-1">Dress/Suit Size</label>
                        <input
                          type="text"
                          name="dressSize"
                          value={profileData.dressSize}
                          onChange={handleProfileChange}
                          className="w-full px-2 py-1 border border-pink-200 rounded focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                          placeholder="Enter your dress/suit size"
                        />
                      </div>
                      <div className="bg-white rounded p-2 shadow-sm sm:col-span-2">
                        <label className="block text-pink-600 font-medium mb-1">Address</label>
                        <input
                          type="text"
                          name="address"
                          value={profileData.address}
                          onChange={handleProfileChange}
                          className="w-full px-2 py-1 border border-pink-200 rounded focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                          placeholder="Enter your address"
                        />
                      </div>
                      <div className="col-span-2 mt-2">
                        <button
                          onClick={saveProfile}
                          className="w-full py-2 text-sm font-medium text-white bg-pink-500 rounded-md hover:bg-pink-600 focus:outline-none transition-all duration-150 shadow-sm"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile View Tabs */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-pink-300">
            <div className="grid grid-cols-5 divide-x divide-pink-100">
              <button 
                onClick={() => setActiveMobileView('calendar')}
                className={`py-3 flex flex-col items-center justify-center ${
                  activeMobileView === 'calendar' 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-white text-pink-600 hover:bg-pink-50'
                } transition-colors duration-150`}
              >
                <svg className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-medium">Calendar</span>
              </button>
              
              <button 
                onClick={() => setActiveMobileView('bookings')}
                className={`py-3 flex flex-col items-center justify-center ${
                  activeMobileView === 'bookings' 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-white text-pink-600 hover:bg-pink-50'
                } transition-colors duration-150`}
              >
                <svg className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium">Bookings</span>
              </button>
              
              <button 
                onClick={() => setActiveMobileView('availability')}
                className={`py-3 flex flex-col items-center justify-center ${
                  activeMobileView === 'availability' 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-white text-pink-600 hover:bg-pink-50'
                } transition-colors duration-150`}
              >
                <svg className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-xs font-medium">Availability</span>
              </button>
              <button 
                onClick={() => setActiveMobileView('forms')}
                className={`py-3 flex flex-col items-center justify-center ${
                  activeMobileView === 'forms' 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-white text-pink-600 hover:bg-pink-50'
                } transition-colors duration-150`}
              >
                <svg className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-xs font-medium">Forms</span>
              </button>
              <button 
                onClick={() => setActiveMobileView('resources')}
                className={`py-3 flex flex-col items-center justify-center ${
                  activeMobileView === 'resources' 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-white text-pink-600 hover:bg-pink-50'
                } transition-colors duration-150`}
              >
                <svg className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 0a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v3a2 2 0 002 2m12 0v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7" />
                </svg>
                <span className="text-xs font-medium">Resources</span>
              </button>
            </div>
          </div>
          
          {/* Dynamic Section Title */}
          <div className="bg-white rounded-xl px-4 py-3 shadow-lg overflow-hidden border border-pink-300">
            <h2 className="text-lg font-bold text-pink-600 flex items-center justify-center">
              {activeMobileView === 'calendar' && (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  My Calendar
                </>
              )}
              {activeMobileView === 'bookings' && (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  My Bookings
                </>
              )}
              {activeMobileView === 'availability' && (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  My Availability
                </>
              )}
              {activeMobileView === 'forms' && (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Forms
                </>
              )}
              {activeMobileView === 'resources' && (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 0a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v3a2 2 0 002 2m12 0v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7" />
                  </svg>
                  Resources
                </>
              )}
            </h2>
          </div>
          
          {/* Calendar */}
          {activeMobileView === 'calendar' && (
            <div className="animate-fadeIn transition-all duration-300">
              <CalendarCard staffDocRef={staffDocRef} />
            </div>
          )}
          
          {/* Availability */}
          {activeMobileView === 'availability' && (
            <div className="animate-fadeIn transition-all duration-300">
              <AvailabilityCard session={session} staffDocRef={staffDocRef} />
            </div>
          )}
          
          {/* Bookings */}
          {activeMobileView === 'bookings' && (
            <div className="animate-fadeIn transition-all duration-300">
              <BookingsCard 
                staffDocRef={staffDocRef} 
                staffEmail={session.user.email} 
                staffName={session.user.name} 
              />
            </div>
          )}

          {/* Forms */}
          {activeMobileView === 'forms' && (
            <div className="animate-fadeIn transition-all duration-300">
              <FormsCard />
            </div>
          )}

          {/* Resources */}
          {activeMobileView === 'resources' && (
            <div className="animate-fadeIn transition-all duration-300">
              <ResourcesCard />
            </div>
          )}
        </div>
        
        {/* Desktop Grid Layout */}
        <div className="hidden lg:grid grid-cols-2 gap-4">
          {/* Left column: Profile (top), Calendar (bottom) */}
          <div className="flex flex-col h-full gap-6">
            <div className="h-[420px]">
              <EnhancedProfileSection 
                session={session} 
                profileData={profileData} 
                setProfileData={setProfileData} 
                staffDocRef={staffDocRef} 
              />
            </div>
            <div className="flex-1 min-h-0">
              <CalendarCard staffDocRef={staffDocRef} />
            </div>
          </div>
          {/* Right column: Bookings/Availability (top), Forms/Resources (bottom) */}
          <div className="flex flex-col h-full gap-6">
            <div className="h-[420px] flex flex-col">
              {/* Desktop-only toggle for Availability/Bookings */}
              <div className="hidden lg:flex justify-center mb-4 gap-2">
                <button
                  className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-150 shadow-sm border-2 focus:outline-none focus:ring-2 focus:ring-pink-300
                    ${activeDesktopTab === 'availability' ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-pink-500 border-pink-200 hover:bg-pink-50'}`}
                  onClick={() => setActiveDesktopTab('availability')}
                >
                  Availability
                </button>
                <button
                  className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-150 shadow-sm border-2 focus:outline-none focus:ring-2 focus:ring-pink-300
                    ${activeDesktopTab === 'bookings' ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-pink-500 border-pink-200 hover:bg-pink-50'}`}
                  onClick={() => setActiveDesktopTab('bookings')}
                >
                  Bookings
                </button>
              </div>
              <div className="flex-1 min-h-0">
                {activeDesktopTab === 'availability' ? (
                  <AvailabilityCard session={session} staffDocRef={staffDocRef} />
                ) : (
                  <BookingsCard 
                    staffDocRef={staffDocRef} 
                    staffEmail={session.user.email} 
                    staffName={session.user.name} 
                  />
                )}
              </div>
            </div>
            <div className="flex-1 min-h-0 flex flex-col mt-4">
              {/* Desktop-only toggle for Forms/Resources */}
              <div className="hidden lg:flex justify-center mb-4 gap-2">
                <button
                  className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-150 shadow-sm border-2 focus:outline-none focus:ring-2 focus:ring-pink-300
                    ${activeBottomTab === 'forms' ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-pink-500 border-pink-200 hover:bg-pink-50'}`}
                  onClick={() => setActiveBottomTab('forms')}
                >
                  Forms
                </button>
                <button
                  className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-150 shadow-sm border-2 focus:outline-none focus:ring-2 focus:ring-pink-300
                    ${activeBottomTab === 'resources' ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-pink-500 border-pink-200 hover:bg-pink-50'}`}
                  onClick={() => setActiveBottomTab('resources')}
                >
                  Resources
                </button>
              </div>
              <div className="flex-1 min-h-0">
                {activeBottomTab === 'forms' ? <FormsCard /> : <ResourcesCard />}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-pink-100 py-3 mt-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} The Smith Agency. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 