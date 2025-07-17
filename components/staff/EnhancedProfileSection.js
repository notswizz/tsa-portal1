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
        const bookingsCollection = collection(db, 'bookings');
        const bookingsSnapshot = await getDocs(bookingsCollection);
        let totalShows = new Set();
        let totalDays = 0;
        bookingsSnapshot.docs.forEach(doc => {
          const booking = doc.data();
          if (booking.datesNeeded && Array.isArray(booking.datesNeeded)) {
            booking.datesNeeded.forEach(dateNeeded => {
              if (dateNeeded.staffIds && Array.isArray(dateNeeded.staffIds)) {
                const isStaffBooked = dateNeeded.staffIds.some(id => 
                  id === staffDocRef.id || 
                  id === session?.user?.email || 
                  id === session?.user?.name
                );
                if (isStaffBooked) {
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
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        <div className="flex-shrink-0">
          <div className="relative p-1 rounded-full shadow-md bg-gray-100">
            {session?.user?.image ? (
              <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-white">
                <Image 
                  src={session.user.image} 
                  alt={session.user.name}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white">
                <span className="text-2xl font-bold text-pink-600">
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
          <div className="mb-3">
            <h3 className="text-xl font-bold text-gray-900">{session?.user?.name}</h3>
            <p className="text-sm text-gray-500 truncate">{session?.user?.email}</p>
          </div>
          {/* Booking Statistics */}
          <div className="mb-3 bg-gray-50 rounded-lg p-3 flex gap-4 justify-center md:justify-start">
            {statsLoading ? (
              <div className="flex justify-center py-2">
                <div className="animate-spin h-5 w-5 border-2 border-pink-500 rounded-full border-t-transparent"></div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-lg p-3 shadow-sm text-center border border-gray-100">
                  <p className="text-2xl font-bold text-pink-600">{bookingStats.totalShows}</p>
                  <p className="text-xs text-gray-500">Shows Worked</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm text-center border border-gray-100">
                  <p className="text-2xl font-bold text-pink-600">{bookingStats.daysBooked}</p>
                  <p className="text-xs text-gray-500">Days Booked</p>
                </div>
              </>
            )}
          </div>
          {/* Profile Details */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-base font-semibold text-gray-900">Staff Details</h4>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1 text-xs font-medium text-pink-600 border border-pink-300 rounded-md hover:bg-pink-50 focus:outline-none transition-all duration-150"
                >
                  Edit Profile
                </button>
              )}
            </div>
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">College/University</label>
                  <input type="text" name="college" value={profileData.college} onChange={handleProfileChange} className="w-full border border-gray-200 rounded-md px-2 py-1 text-gray-900 bg-white focus:border-pink-400 focus:ring-1 focus:ring-pink-200" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Phone</label>
                  <input type="text" name="phone" value={profileData.phone} onChange={handleProfileChange} className="w-full border border-gray-200 rounded-md px-2 py-1 text-gray-900 bg-white focus:border-pink-400 focus:ring-1 focus:ring-pink-200" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Shoe Size</label>
                  <input type="text" name="shoeSize" value={profileData.shoeSize} onChange={handleProfileChange} className="w-full border border-gray-200 rounded-md px-2 py-1 text-gray-900 bg-white focus:border-pink-400 focus:ring-1 focus:ring-pink-200" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Dress/Suit Size</label>
                  <input type="text" name="dressSize" value={profileData.dressSize} onChange={handleProfileChange} className="w-full border border-gray-200 rounded-md px-2 py-1 text-gray-900 bg-white focus:border-pink-400 focus:ring-1 focus:ring-pink-200" />
                </div>
                <div className="col-span-2 flex gap-2 mt-2">
                  <button 
                    onClick={saveProfile}
                    disabled={profileLoading}
                    className="px-4 py-1 text-xs font-medium text-white bg-pink-500 rounded-md hover:bg-pink-600 focus:outline-none transition-all duration-150 shadow-sm"
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
                    className="px-4 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none transition-all duration-150"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <span className="block text-xs text-gray-500 mb-1">College/University</span>
                  <span className="block text-base text-gray-900">{profileData.college}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">Phone</span>
                  <span className="block text-base text-gray-900">{profileData.phone}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">Shoe Size</span>
                  <span className="block text-base text-gray-900">{profileData.shoeSize}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">Dress/Suit Size</span>
                  <span className="block text-base text-gray-900">{profileData.dressSize}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 