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
  const [saveSuccess, setSaveSuccess] = useState(false);

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
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const getProfileCompleteness = () => {
    const fields = ['college', 'phone', 'shoeSize', 'dressSize', 'address'];
    const filledFields = fields.filter(field => profileData[field] && profileData[field].trim() !== '');
    return (filledFields.length / fields.length) * 100;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200 overflow-hidden h-full flex flex-col hover:shadow-xl transition-all duration-300 group">
      {/* Enhanced Header with Gradient */}
      <div className="px-4 py-3 bg-gradient-to-r from-gray-800 via-slate-800 to-gray-900 relative overflow-hidden flex-shrink-0">
        <div className="relative flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-white">Profile</h2>
          </div>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 text-xs font-semibold text-gray-800 bg-white rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
            >
              Edit
            </button>
          )}
        </div>
        
        {/* Enhanced decorative elements */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 bg-white/5 rounded-full translate-y-4 -translate-x-4"></div>
      </div>
      
      <div className="flex-1 min-h-0 overflow-y-auto bg-gradient-to-br from-white to-gray-50/30 p-3">
        <div className="space-y-3">
          {/* Enhanced Success Message */}
          {saveSuccess && (
            <div className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center space-x-2 text-sm shadow-sm animate-fadeIn">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-semibold">Profile updated successfully!</span>
            </div>
          )}

          {/* Enhanced User Info with Better Design */}
                     <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="relative flex-shrink-0">
                {session?.user?.image ? (
                  <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-gray-100 shadow-md group-hover:ring-gray-200 transition-all duration-300">
                    <Image 
                      src={session.user.image} 
                      alt={session.user.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 via-slate-700 to-gray-800 flex items-center justify-center ring-2 ring-gray-100 shadow-md">
                    <span className="text-lg font-bold text-white">
                      {session?.user?.name?.charAt(0) || "U"}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-800 mb-0.5 group-hover:text-gray-700 transition-colors truncate">{session?.user?.name}</h3>
                                  <p className="text-xs text-slate-600 truncate flex items-center space-x-1">
                    <svg className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{session?.user?.email}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Stats with Better Visual Design */}
          <div className="grid grid-cols-2 gap-2">
            {statsLoading ? (
              <>
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-3 animate-pulse border border-pink-100">
                  <div className="h-2 bg-slate-200 rounded mb-1"></div>
                  <div className="h-4 bg-slate-200 rounded"></div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 animate-pulse border border-blue-100">
                  <div className="h-2 bg-slate-200 rounded mb-1"></div>
                  <div className="h-4 bg-slate-200 rounded"></div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-3 border border-pink-200 text-center hover:shadow-md transition-all duration-200 group/stat">
                  <div className="text-xl font-bold text-pink-700 mb-0.5 group-hover/stat:scale-110 transition-transform duration-200">{bookingStats.totalShows}</div>
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Shows</div>
                  <div className="w-6 h-0.5 bg-pink-300 rounded-full mx-auto mt-1"></div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200 text-center hover:shadow-md transition-all duration-200 group/stat">
                  <div className="text-xl font-bold text-blue-700 mb-0.5 group-hover/stat:scale-110 transition-transform duration-200">{bookingStats.daysBooked}</div>
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Days</div>
                  <div className="w-6 h-0.5 bg-blue-300 rounded-full mx-auto mt-1"></div>
                </div>
              </>
            )}
          </div>

          {/* Enhanced Profile Details */}
          {isEditing ? (
                                     <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-3 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                  <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Details</span>
                </h4>
                <div className="flex space-x-1">
                                                        <button 
                    onClick={saveProfile}
                    disabled={profileLoading}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-gray-700 rounded-lg hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    {profileLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    disabled={profileLoading}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white rounded-lg hover:bg-slate-50 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                                                  <input
                  type="text"
                  name="college"
                  value={profileData.college}
                  onChange={handleProfileChange}
                  className="w-full px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent text-xs bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200"
                  placeholder="🎓 College"
                />
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  className="w-full px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent text-xs bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200"
                  placeholder="📱 Phone"
                />
                <input
                  type="text"
                  name="shoeSize"
                  value={profileData.shoeSize}
                  onChange={handleProfileChange}
                  className="w-full px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent text-xs bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200"
                  placeholder="👟 Shoe Size"
                />
                <input
                  type="text"
                  name="dressSize"
                  value={profileData.dressSize}
                  onChange={handleProfileChange}
                  className="w-full px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent text-xs bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200"
                  placeholder="👔 Dress Size"
                />
                <input
                  type="text"
                  name="address"
                  value={profileData.address}
                  onChange={handleProfileChange}
                  className="col-span-2 w-full px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent text-xs bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200"
                  placeholder="📍 Address"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {[
                { emoji: '🎓', value: profileData.college, label: 'College' },
                { emoji: '📱', value: profileData.phone, label: 'Phone' },
                { emoji: '👟', value: profileData.shoeSize, label: 'Shoe Size' },
                { emoji: '👔', value: profileData.dressSize, label: 'Dress Size' },
              ].map((field, index) => (
                                 <div key={index} className="bg-white/60 backdrop-blur-sm rounded-lg p-2 border border-gray-100 hover:shadow-md transition-all duration-200 group/field">
                  <div className="flex items-center space-x-1 mb-0.5">
                    <span className="text-sm group-hover/field:scale-110 transition-transform duration-200">{field.emoji}</span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide truncate">{field.label}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {field.value || <span className="text-slate-400 italic">Not provided</span>}
                  </div>
                </div>
              ))}
              
              {/* Address takes full width */}
                             <div className="col-span-2 bg-white/60 backdrop-blur-sm rounded-lg p-2 border border-gray-100 hover:shadow-md transition-all duration-200 group/field">
                <div className="flex items-center space-x-1 mb-0.5">
                  <span className="text-sm group-hover/field:scale-110 transition-transform duration-200">📍</span>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Address</span>
                </div>
                <div className="text-xs font-semibold text-slate-800 truncate">
                  {profileData.address || <span className="text-slate-400 italic">No address provided</span>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 