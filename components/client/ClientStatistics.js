import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import Image from 'next/image';

export default function ClientStatistics({ clientId }) {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalShows: 0,
    totalDaysBooked: 0,
    staffMembers: [],
    isLoading: true
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch bookings
        const bookingsResponse = await fetch('/api/client/bookings');
        
        if (!bookingsResponse.ok) {
          throw new Error('Failed to fetch bookings');
        }
        
        const bookingsData = await bookingsResponse.json();
        const bookings = bookingsData.bookings || [];
        
        // Calculate statistics
        const uniqueShows = new Set();
        let totalDays = 0;
        const staffIds = new Set();
        
        bookings.forEach(booking => {
          // Count unique shows
          uniqueShows.add(booking.showId);
          
          // Calculate total days booked (counting staff per day)
          if (booking.datesNeeded && booking.datesNeeded.length > 0) {
            booking.datesNeeded.forEach(day => {
              // Add the number of staff required for this day to the total
              totalDays += day.staffCount || 0;
            });
          }
          
          // Collect unique staff IDs
          if (booking.staffAssignments && booking.staffAssignments.length > 0) {
            booking.staffAssignments.forEach(assignment => {
              if (assignment.staffId) {
                staffIds.add(assignment.staffId);
              }
            });
          }
        });
        
        // Fetch staff details if we have any staff IDs
        let staffMembers = [];
        if (staffIds.size > 0) {
          try {
            const staffResponse = await fetch('/api/staff/list');
            if (staffResponse.ok) {
              const staffData = await staffResponse.json();
              const allStaff = staffData.staff || [];
              
              // Filter to only staff who have worked with this client
              staffMembers = allStaff
                .filter(staff => staffIds.has(staff.id))
                .map(staff => ({
                  id: staff.id,
                  name: staff.name,
                  image: staff.image || null,
                  bookingsCount: 0, // We'll set this later if needed
                }));
            }
          } catch (error) {
            console.error('Error fetching staff details:', error);
          }
        }
        
        setStats({
          totalBookings: bookings.length,
          totalShows: uniqueShows.size,
          totalDaysBooked: totalDays,
          staffMembers,
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching statistics:', error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    }
    
    if (clientId) {
      fetchStats();
    }
  }, [clientId]);
  
  if (stats.isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-pink-300"></div>
        <span className="ml-2 text-xs text-gray-500">Loading statistics...</span>
      </div>
    );
  }
  
  return (
    <div className="mb-6">
      <div className="flex justify-end space-x-6 mb-4">
        <div className="flex items-center">
          <div className="w-7 h-7 rounded-full bg-pink-50 flex items-center justify-center mr-2">
            <svg className="h-3.5 w-3.5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500">Shows</p>
            <p className="text-base font-medium text-gray-800">{stats.totalShows}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="w-7 h-7 rounded-full bg-pink-50 flex items-center justify-center mr-2">
            <svg className="h-3.5 w-3.5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9.5 5.5h16m-16 1v-1.5m16 1v-1.5m0 14v-10h-16v10a1 1 0 001 1h14a1 1 0 001-1z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500">Days</p>
            <p className="text-base font-medium text-gray-800">{stats.totalDaysBooked}</p>
          </div>
        </div>
      </div>
      
      {stats.staffMembers.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-xs font-medium text-gray-500 mb-2">Staff You've Worked With</h4>
          <div className="flex flex-wrap gap-2">
            {stats.staffMembers.map(staff => (
              <div key={staff.id} className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                <div className="h-6 w-6 rounded-full overflow-hidden bg-pink-50 mr-2 flex items-center justify-center">
                  {staff.image ? (
                    <Image 
                      src={staff.image} 
                      alt={staff.name}
                      width={24}
                      height={24}
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-xs font-medium text-pink-500">
                      {staff.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-700">{staff.name}</span>
              </div>
            ))}
            
            {stats.staffMembers.length === 0 && (
              <p className="text-xs text-gray-500 italic">You haven't worked with any staff members yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 