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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <StaffHeader session={session} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8">
        {/* Mobile View */}
        <div className="lg:hidden space-y-6">
          {/* Mobile Profile Summary - Only shows name, image, and booking stats */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4">
            <EnhancedProfileSection session={session} profileData={profileData} setProfileData={setProfileData} staffDocRef={staffDocRef} />
          </div>
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4">
            <ShowAvailability session={session} staffDocRef={staffDocRef} />
          </div>
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4">
            <AvailabilityCalendar staffDocRef={staffDocRef} />
          </div>
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4">
            <FormsCard />
          </div>
        </div>
        {/* Desktop View */}
        <div className="hidden lg:grid grid-cols-12 gap-8">
          <div className="col-span-4 flex flex-col gap-8">
            <EnhancedProfileSection session={session} profileData={profileData} setProfileData={setProfileData} staffDocRef={staffDocRef} />
            <FormsCard />
          </div>
          <div className="col-span-8 flex flex-col gap-8">
            <ShowAvailability session={session} staffDocRef={staffDocRef} />
            <AvailabilityCalendar staffDocRef={staffDocRef} />
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