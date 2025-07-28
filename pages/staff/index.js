import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn } from 'next-auth/react';
import { db } from '../../lib/firebase';
import { doc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import Image from 'next/image';
import Head from 'next/head';

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
  const [staffData, setStaffData] = useState(null);
  const [isEditingMobile, setIsEditingMobile] = useState(false);
  const [activeMobileView, setActiveMobileView] = useState('profile');
  const [activeDesktopTab, setActiveDesktopTab] = useState('availability');
  const [completedForms, setCompletedForms] = useState([
    {
      completed: false,
      dateCompleted: null,
      dateEnabled: "2025-07-27T02:48:43.018Z",
      enabled: true,
      formType: "application"
    },
    {
      completed: false,
      dateCompleted: null,
      dateEnabled: null,
      enabled: false,
      formType: "interview"
    }
  ]);

  // Handle form completion
  const handleFormComplete = (formType, formData) => {
    setCompletedForms(prev => 
      prev.map(form => 
        form.formType === formType 
          ? { ...form, completed: true, dateCompleted: new Date().toISOString() }
          : form
      )
    );
    console.log(`${formType} form completed with data:`, formData);
  };

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
            
            // Store the full staff data for use in components
            setStaffData(data);
            
            const profileInfo = {
              college: data.college || '',
              shoeSize: data.shoeSize || '',
              dressSize: data.dressSize || '',
              phoneNumber: data.phoneNumber || '',
              address: data.address || '',
              phone: data.phone || '',
            };
            
            setProfileData(profileInfo);
            
            // Update form completion states from Firebase data
            // Check if completedForms array exists in Firebase data
            if (data.completedForms && Array.isArray(data.completedForms)) {
              // Use the completedForms array from Firebase directly
              setCompletedForms(data.completedForms.map(firebaseForm => {
                // Handle timestamp conversion for dates
                let completedDate = null;
                let enabledDate = null;
                
                if (firebaseForm.dateCompleted) {
                  const completedDateField = firebaseForm.dateCompleted;
                  if (typeof completedDateField.toDate === 'function') {
                    completedDate = completedDateField.toDate().toISOString();
                  } else if (completedDateField instanceof Date) {
                    completedDate = completedDateField.toISOString();
                  } else if (typeof completedDateField === 'string') {
                    completedDate = completedDateField;
                  } else if (completedDateField.seconds) {
                    completedDate = new Date(completedDateField.seconds * 1000).toISOString();
                  }
                }
                
                if (firebaseForm.dateEnabled) {
                  const enabledDateField = firebaseForm.dateEnabled;
                  if (typeof enabledDateField.toDate === 'function') {
                    enabledDate = enabledDateField.toDate().toISOString();
                  } else if (enabledDateField instanceof Date) {
                    enabledDate = enabledDateField.toISOString();
                  } else if (typeof enabledDateField === 'string') {
                    enabledDate = enabledDateField;
                  } else if (enabledDateField.seconds) {
                    enabledDate = new Date(enabledDateField.seconds * 1000).toISOString();
                  }
                }
                
                return {
                  ...firebaseForm,
                  dateCompleted: completedDate,
                  dateEnabled: enabledDate
                };
              }));
            } else {
              // Fallback to individual field approach
              setCompletedForms(prev => prev.map(form => {
                const isCompleted = data[`${form.formType}FormCompleted`] || false;
                const isEnabled = data[`${form.formType}FormEnabled`];
                const completedDateField = data[`${form.formType}FormCompletedDate`];
                const enabledDateField = data[`${form.formType}FormEnabledDate`];
                
                let completedDate = null;
                let enabledDate = null;
                
                if (completedDateField) {
                  if (typeof completedDateField.toDate === 'function') {
                    completedDate = completedDateField.toDate().toISOString();
                  } else if (completedDateField instanceof Date) {
                    completedDate = completedDateField.toISOString();
                  } else if (typeof completedDateField === 'string') {
                    completedDate = completedDateField;
                  } else if (completedDateField.seconds) {
                    completedDate = new Date(completedDateField.seconds * 1000).toISOString();
                  }
                }
                
                if (enabledDateField) {
                  if (typeof enabledDateField.toDate === 'function') {
                    enabledDate = enabledDateField.toDate().toISOString();
                  } else if (enabledDateField instanceof Date) {
                    enabledDate = enabledDateField.toISOString();
                  } else if (typeof enabledDateField === 'string') {
                    enabledDate = enabledDateField;
                  } else if (enabledDateField.seconds) {
                    enabledDate = new Date(enabledDateField.seconds * 1000).toISOString();
                  }
                }
                
                return {
                  ...form,
                  completed: isCompleted,
                  dateCompleted: completedDate,
                  enabled: isEnabled !== undefined ? isEnabled : form.enabled,
                  dateEnabled: enabledDate || form.dateEnabled
                };
              }));
            }
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
      profile: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      forms: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      resources: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    };
    return icons[iconName] || icons.profile;
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

  // Helper function to get first name
  const getFirstName = (fullName) => {
    if (!fullName) return '';
    return fullName.split(' ')[0];
  };

  // Staff dashboard content with modular components
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-slate-100">
      <Head>
        <title>{session?.user?.name ? `${getFirstName(session.user.name)} - TSA` : 'TSA Staff Portal'}</title>
        <meta name="description" content="The Smith Agency Staff Portal" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* Header */}
      <StaffHeader session={session} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Mobile View */}
        <div className="lg:hidden space-y-6">

          {/* Mobile Navigation Tabs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-200 p-2">
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'profile', label: 'Profile', icon: 'profile' },
                { id: 'calendar', label: 'Calendar', icon: 'calendar' },
                { id: 'bookings', label: 'Bookings', icon: 'clock' },
                { id: 'availability', label: 'Availability', icon: 'calendar' },
                { id: 'forms', label: 'Forms', icon: 'forms' },
                { id: 'resources', label: 'Resources', icon: 'resources' }
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
            {activeMobileView === 'profile' && (
              <div className="animate-fadeIn">
                <EnhancedProfileSection 
                  session={session} 
                  profileData={profileData} 
                  setProfileData={setProfileData} 
                  staffDocRef={staffDocRef} 
                />
              </div>
            )}

            {activeMobileView === 'calendar' && (
              <div className="animate-fadeIn">
                <CalendarCard staffDocRef={staffDocRef} />
              </div>
            )}

            {activeMobileView === 'availability' && (
              <div className="animate-fadeIn">
                <AvailabilityCard session={session} staffDocRef={staffDocRef} completedForms={completedForms} staffData={staffData} />
              </div>
            )}

            {activeMobileView === 'bookings' && (
              <div className="animate-fadeIn">
                <BookingsCard 
                  staffDocRef={staffDocRef} 
                  staffEmail={session.user.email} 
                  staffName={session.user.name}
                  completedForms={completedForms}
                  staffData={staffData}
                />
              </div>
            )}

            {activeMobileView === 'forms' && (
              <div className="animate-fadeIn">
                <FormsCard 
                  completedForms={completedForms} 
                  onFormComplete={handleFormComplete}
                  staffDocRef={staffDocRef}
                  session={session}
                  staffData={staffData}
                />
              </div>
            )}

            {activeMobileView === 'resources' && (
              <div className="animate-fadeIn">
                <ResourcesOnlyCard />
              </div>
            )}
          </div>
        </div>
        
        {/* Desktop Grid Layout */}
        <div className="hidden lg:block">
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
                <FormsCard 
                  completedForms={completedForms} 
                  onFormComplete={handleFormComplete}
                  staffDocRef={staffDocRef}
                  session={session}
                  staffData={staffData}
                />
              </div>
            </div>

            {/* Center + Right Area (5 columns) */}
            <div className="col-span-5 space-y-4">
              {/* Top Row - Calendar and Availability/Bookings */}
              <div className="grid grid-cols-5 gap-6 h-[75%]">
                {/* Calendar Section (3 columns) */}
                <div className="col-span-3">
                  <CalendarCard staffDocRef={staffDocRef} />
                </div>

                {/* Availability/Bookings Section (2 columns) */}
                <div className="col-span-2 flex flex-col h-full max-h-full overflow-hidden">
                  {/* Tab Switcher */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-200 p-2 flex-shrink-0 mb-4">
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

                  {/* Content Area - Strictly constrained height */}
                  <div className="flex-1 min-h-0 max-h-full overflow-hidden">
                    <div className="h-full">
                      {activeDesktopTab === 'availability' ? (
                        <AvailabilityCard session={session} staffDocRef={staffDocRef} completedForms={completedForms} staffData={staffData} />
                      ) : (
                        <BookingsCard 
                          staffDocRef={staffDocRef} 
                          staffEmail={session.user.email} 
                          staffName={session.user.name}
                          completedForms={completedForms}
                          staffData={staffData}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row - Resources Section */}
              <div className="h-[20%]">
                <ResourcesOnlyCard />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-pink-200 py-6 mt-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-6 h-6 rounded-lg overflow-hidden">
              <img
                src="/tsa.png"
                alt="The Smith Agency Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-semibold text-slate-700">The Smith Agency</span>
          </div>
        </div>
      </footer>
    </div>
  );
} 