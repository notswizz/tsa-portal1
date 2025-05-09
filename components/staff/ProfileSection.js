import { useState } from 'react';
import Image from 'next/image';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function ProfileSection({ session, profileData, setProfileData, staffDocRef }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveProfile = async () => {
    if (!session?.user?.email) return;
    
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
      alert("Failed to save profile. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-10 border border-gray-100 transition-all duration-300 hover:shadow-xl">
      <div className="bg-gradient-to-r from-primary to-primary-dark px-6 py-5 flex justify-between items-center">
        <div className="flex-1">
          <h3 className="text-lg leading-6 font-semibold text-white">My Profile</h3>
          <p className="mt-1 max-w-2xl text-sm text-primary-light">Personal details and preferences</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          disabled={profileLoading}
          className="text-sm text-white opacity-80 hover:opacity-100 flex items-center focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {profileLoading ? (
            <>
              <svg className="animate-spin mr-1.5 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Processing...</span>
            </>
          ) : isEditing ? (
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
      
      <div className="border-t border-gray-100">
        <div className="px-6 py-6">
          {profileLoading && !isEditing ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="h-40 w-40 rounded-full overflow-hidden border-4 border-white shadow-md">
                    {session.user.image ? (
                      <Image 
                        src={session.user.image} 
                        alt={session.user.name}
                        width={160}
                        height={160}
                        className="object-cover"
                      />
                    ) : (
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-full w-full flex items-center justify-center">
                        <svg className="h-20 w-20 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-green-400 border-2 border-white"></div>
                </div>
                <h2 className="text-xl font-bold text-gray-800">{session.user.name}</h2>
                <p className="text-gray-500 text-sm">{session.user.email}</p>
                {!isEditing && <div className="mt-4 px-3 py-1 bg-primary-light bg-opacity-20 rounded-full text-xs font-medium text-primary-dark">Profile</div>}
              </div>
              
              <div className="col-span-2">
                {isEditing ? (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="college" className="block text-sm font-medium text-gray-700">College/University</label>
                        <input
                          type="text"
                          name="college"
                          id="college"
                          value={profileData.college}
                          onChange={handleProfileChange}
                          className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg px-4 py-2 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg px-4 py-2 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label htmlFor="shoeSize" className="block text-sm font-medium text-gray-700">Shoe Size</label>
                        <input
                          type="text"
                          name="shoeSize"
                          id="shoeSize"
                          value={profileData.shoeSize}
                          onChange={handleProfileChange}
                          className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg px-4 py-2 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label htmlFor="dressSize" className="block text-sm font-medium text-gray-700">Dress/Suit Size</label>
                        <input
                          type="text"
                          name="dressSize"
                          id="dressSize"
                          value={profileData.dressSize}
                          onChange={handleProfileChange}
                          className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg px-4 py-2 transition-all duration-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                      <textarea
                        name="address"
                        id="address"
                        rows="3"
                        value={profileData.address}
                        onChange={handleProfileChange}
                        className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg px-4 py-2 transition-all duration-200"
                      ></textarea>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={saveProfile}
                        disabled={profileLoading}
                        className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {profileLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                    <div className="bg-gray-50 rounded-lg p-4 transition-all duration-200 hover:shadow-md">
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">College/University</h4>
                      <p className="mt-2 text-gray-900 font-medium">{profileData.college || 'Not specified'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 transition-all duration-200 hover:shadow-md">
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Phone</h4>
                      <p className="mt-2 text-gray-900 font-medium">{profileData.phone || 'Not specified'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 transition-all duration-200 hover:shadow-md">
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Shoe Size</h4>
                      <p className="mt-2 text-gray-900 font-medium">{profileData.shoeSize || 'Not specified'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 transition-all duration-200 hover:shadow-md">
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Dress/Suit Size</h4>
                      <p className="mt-2 text-gray-900 font-medium">{profileData.dressSize || 'Not specified'}</p>
                    </div>
                    <div className="col-span-2 bg-gray-50 rounded-lg p-4 transition-all duration-200 hover:shadow-md">
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Address</h4>
                      <p className="mt-2 text-gray-900 font-medium">{profileData.address || 'Not specified'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 