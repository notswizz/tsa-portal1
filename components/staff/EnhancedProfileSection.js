import { useState, useEffect } from 'react';
import Image from 'next/image';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function EnhancedProfileSection({ session, profileData, setProfileData, staffDocRef }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [bookingStats, setBookingStats] = useState({
    totalShows: 0,
    daysBooked: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch booking statistics
  useEffect(() => {
    async function fetchBookingStats() {
      if (!staffDocRef) return;
      
      try {
        setStatsLoading(true);
        
        // Fetch all bookings where this staff member is assigned
        const bookingsCollection = collection(db, 'bookings');
        const bookingsSnapshot = await getDocs(bookingsCollection);
        
        let totalShows = new Set();
        let totalDays = 0;
        
        // Process each booking
        bookingsSnapshot.docs.forEach(doc => {
          const booking = doc.data();
          
          // Check if this staff member is in any of the booking dates
          if (booking.datesNeeded && Array.isArray(booking.datesNeeded)) {
            booking.datesNeeded.forEach(dateNeeded => {
              if (dateNeeded.staffIds && Array.isArray(dateNeeded.staffIds)) {
                const isStaffBooked = dateNeeded.staffIds.some(id => 
                  id === staffDocRef.id || 
                  id === session?.user?.email || 
                  id === session?.user?.name
                );
                
                if (isStaffBooked) {
                  // Count this booking
                  totalShows.add(booking.showId || doc.id);
                  totalDays++;
                }
              }
            });
          }
        });
        
        setBookingStats({
          totalShows: totalShows.size,
          daysBooked: totalDays
        });
      } catch (error) {
        console.error("Error fetching booking stats:", error);
      } finally {
        setStatsLoading(false);
      }
    }
    
    fetchBookingStats();
  }, [staffDocRef, session]);

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
      setProfileLoading(true);
      
      // Update document with current profile data
      await updateDoc(staffDocRef, {
        ...profileData,
        updatedAt: new Date()
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-pink-300 hover:border-pink-500 transition-all duration-300">
      <div className="px-3 py-2 border-b border-pink-100 bg-gradient-to-r from-pink-500 to-pink-600 sticky top-0 z-10 flex justify-between items-center">
        <h2 className="text-base font-bold text-white flex items-center">
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          My Profile
        </h2>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="px-2 py-1 text-xs font-medium text-white bg-pink-600 bg-opacity-30 rounded-md hover:bg-opacity-50 focus:outline-none transition-all duration-150"
          >
            Edit Profile
          </button>
        )}
      </div>
      
      <div className="p-3 overflow-y-auto bg-gradient-to-br from-white to-pink-50">
        <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
          <div className="flex-shrink-0">
            <div className="relative bg-gradient-to-br from-pink-500 to-pink-600 p-1 rounded-full shadow-lg">
              {session?.user?.image ? (
                <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-white">
                  <Image 
                    src={session.user.image} 
                    alt={session.user.name}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-full bg-pink-200 flex items-center justify-center border-2 border-white">
                  <span className="text-xl font-bold text-pink-700">
                    {session?.user?.name?.charAt(0) || "U"}
                  </span>
                </div>
              )}
              <div className="absolute bottom-1 right-1 bg-green-500 p-1 rounded-full border border-white">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
            </div>
          </div>
          
          <div className="text-center md:text-left w-full flex-1">
            <div className="bg-white rounded-lg shadow-sm p-2 mb-3">
              <h3 className="text-lg font-bold text-gray-800">{session?.user?.name}</h3>
              <p className="text-pink-500 text-xs truncate">{session?.user?.email}</p>
            </div>
            
            {/* Booking Statistics */}
            <div className="mb-3 bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-2 shadow-inner">
              <h4 className="text-xs font-semibold text-pink-700 mb-2 uppercase tracking-wider">Booking Statistics</h4>
              
              {statsLoading ? (
                <div className="flex justify-center py-2">
                  <div className="animate-spin h-5 w-5 border-2 border-pink-500 rounded-full border-t-transparent"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-white rounded-lg p-2 shadow-sm">
                    <p className="text-xl font-bold text-pink-600">{bookingStats.totalShows}</p>
                    <p className="text-xs text-gray-600">Shows Worked</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 shadow-sm">
                    <p className="text-xl font-bold text-pink-600">{bookingStats.daysBooked}</p>
                    <p className="text-xs text-gray-600">Days Booked</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile Details */}
            {isEditing ? (
              <div className="bg-pink-50 p-3 rounded-lg shadow-inner">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-semibold text-gray-900">Staff Details</h4>
                  <div className="flex space-x-2">
                    <button 
                      onClick={saveProfile}
                      disabled={profileLoading}
                      className="px-2 py-1 text-xs font-medium text-white bg-pink-500 rounded-md hover:bg-pink-600 focus:outline-none transition-all duration-150 shadow-sm"
                    >
                      {profileLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving
                        </span>
                      ) : 'Save'}
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      disabled={profileLoading}
                      className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none transition-all duration-150"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                
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
                </div>
              </div>
            ) : (
              <div className="bg-pink-50 p-3 rounded-lg shadow-inner">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Staff Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white rounded p-2 shadow-sm transform transition-all duration-150 hover:shadow-md hover:-translate-y-0.5">
                    <p className="text-pink-600 font-medium">College/University</p>
                    <p className="font-medium text-gray-800 mt-1">{profileData.college || 'Not specified'}</p>
                  </div>
                  <div className="bg-white rounded p-2 shadow-sm transform transition-all duration-150 hover:shadow-md hover:-translate-y-0.5">
                    <p className="text-pink-600 font-medium">Phone</p>
                    <p className="font-medium text-gray-800 mt-1">{profileData.phone || 'Not specified'}</p>
                  </div>
                  <div className="bg-white rounded p-2 shadow-sm transform transition-all duration-150 hover:shadow-md hover:-translate-y-0.5">
                    <p className="text-pink-600 font-medium">Shoe Size</p>
                    <p className="font-medium text-gray-800 mt-1">{profileData.shoeSize || 'Not specified'}</p>
                  </div>
                  <div className="bg-white rounded p-2 shadow-sm transform transition-all duration-150 hover:shadow-md hover:-translate-y-0.5">
                    <p className="text-pink-600 font-medium">Dress/Suit Size</p>
                    <p className="font-medium text-gray-800 mt-1">{profileData.dressSize || 'Not specified'}</p>
                  </div>
                  <div className="bg-white rounded p-2 shadow-sm transform transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 sm:col-span-2">
                    <p className="text-pink-600 font-medium">Address</p>
                    <p className="font-medium text-gray-800 mt-1">{profileData.address || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 