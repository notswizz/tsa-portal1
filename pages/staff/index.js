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
import ResourcesOnlyCard from '../../components/staff/ResourcesOnlyCard';

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
  const [activeMobileView, setActiveMobileView] = useState('overview');
  const [activeDesktopTab, setActiveDesktopTab] = useState('availability');

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

  const getIcon = (iconName) => {
    const icons = {
      calendar: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      clock: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      document: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      overview: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    };
    return icons[iconName] || icons.overview;
  };

  // If loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-slate-100">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.15s', animationDuration: '1.5s' }}></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-800">Loading your portal...</h3>
            <p className="text-slate-600">Preparing your personalized dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  // If not logged in, show login prompt
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-slate-100 py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-pink-200 backdrop-blur-lg">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">TSA</span>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  The Smith Agency
                </h1>
                <div className="h-1 w-24 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mx-auto"></div>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-slate-700">Welcome to your staff portal</h2>
                <p className="text-slate-500">Access your schedule, manage availability, and stay connected</p>
              </div>
              
              <button
                onClick={() => signIn('google')}
                className="w-full group relative bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-pink-300"
              >
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
                  </svg>
                  <span>Continue with Google</span>
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Staff dashboard content with modular components
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-slate-100">
      {/* Header */}
      <StaffHeader session={session} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Mobile View */}
        <div className="lg:hidden space-y-6">
          {/* Welcome Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-pink-200 p-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {session?.user?.image ? (
                  <div className="w-16 h-16 rounded-2xl overflow-hidden ring-4 ring-pink-100 shadow-lg">
                    <Image 
                      src={session.user.image} 
                      alt={session.user.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center ring-4 ring-pink-100 shadow-lg">
                    <span className="text-2xl font-bold text-white">
                      {session?.user?.name?.charAt(0) || "U"}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-slate-800 truncate">
                  Welcome back, {session?.user?.name?.split(' ')[0]}!
                </h2>
                <p className="text-slate-600 text-sm">Ready to manage your schedule</p>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Tabs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-200 p-2">
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'overview', label: 'Overview', icon: 'overview' },
                { id: 'calendar', label: 'Calendar', icon: 'calendar' },
                { id: 'bookings', label: 'Schedule', icon: 'clock' },
                { id: 'availability', label: 'Availability', icon: 'calendar' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveMobileView(tab.id)}
                  className={`relative py-3 px-2 rounded-xl transition-all duration-300 ${
                    activeMobileView === tab.id 
                      ? 'bg-pink-500 text-white shadow-lg' 
                      : 'text-slate-600 hover:bg-pink-50 hover:text-slate-800'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div className={`${activeMobileView === tab.id ? 'scale-110' : ''} transition-transform duration-300`}>
                      {getIcon(tab.icon)}
                    </div>
                    <span className="text-xs font-medium leading-none">{tab.label}</span>
                  </div>
                  {activeMobileView === tab.id && (
                    <div className="absolute inset-0 rounded-xl bg-pink-500/20"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Content Sections */}
          <div className="space-y-6">
            {activeMobileView === 'overview' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Quick Stats */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-200 p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Your Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border border-pink-100">
                      <div className="text-2xl font-bold text-pink-600">6</div>
                      <div className="text-xs text-slate-600 mt-1">Shows</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <div className="text-2xl font-bold text-blue-600">29</div>
                      <div className="text-xs text-slate-600 mt-1">Days</div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-200 p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-xl border border-pink-100">
                      <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">Availability updated</p>
                        <p className="text-xs text-slate-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">New booking assigned</p>
                        <p className="text-xs text-slate-500">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeMobileView === 'calendar' && (
              <div className="animate-fadeIn">
                <CalendarCard staffDocRef={staffDocRef} />
              </div>
            )}

            {activeMobileView === 'availability' && (
              <div className="animate-fadeIn">
                <AvailabilityCard session={session} staffDocRef={staffDocRef} />
              </div>
            )}

            {activeMobileView === 'bookings' && (
              <div className="animate-fadeIn">
                <BookingsCard 
                  staffDocRef={staffDocRef} 
                  staffEmail={session.user.email} 
                  staffName={session.user.name} 
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Desktop Grid Layout */}
        <div className="hidden lg:block">
          {/* Main Row - Profile+Forms, Calendar+Resources, Bookings/Availability */}
          <div className="grid grid-cols-7 gap-6 min-h-[calc(100vh-200px)]">
            {/* Left Column - Profile + Forms (2 columns) */}
            <div className="col-span-2 space-y-4">
              {/* Profile Section */}
              <div className="h-[60%]">
                <EnhancedProfileSection 
                  session={session} 
                  profileData={profileData} 
                  setProfileData={setProfileData} 
                  staffDocRef={staffDocRef} 
                />
              </div>
              
              {/* Forms Section */}
              <div className="h-[35%]">
                <FormsCard />
              </div>
            </div>

            {/* Center Column - Calendar + Resources (3 columns) */}
            <div className="col-span-3 space-y-4">
              {/* Calendar Section - Taller to avoid scrolling */}
              <div className="h-[70%]">
                <CalendarCard staffDocRef={staffDocRef} />
              </div>
              
              {/* Resources Section */}
              <div className="h-[25%]">
                <ResourcesOnlyCard />
              </div>
            </div>

            {/* Right Column - Bookings/Availability with Tabs (2 columns) */}
            <div className="col-span-2 space-y-4">
              {/* Tab Switcher */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-200 p-2">
                <div className="flex space-x-1">
                  <button
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                      activeDesktopTab === 'availability' 
                        ? 'bg-pink-500 text-white shadow-lg' 
                        : 'text-slate-600 hover:bg-pink-50'
                    }`}
                    onClick={() => setActiveDesktopTab('availability')}
                  >
                    Availability
                  </button>
                  <button
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                      activeDesktopTab === 'bookings' 
                        ? 'bg-pink-500 text-white shadow-lg' 
                        : 'text-slate-600 hover:bg-pink-50'
                    }`}
                    onClick={() => setActiveDesktopTab('bookings')}
                  >
                    Bookings
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1">
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
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-pink-200 py-6 mt-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">TSA</span>
            </div>
            <span className="font-semibold text-slate-700">The Smith Agency</span>
          </div>
        </div>
      </footer>
    </div>
  );
} 