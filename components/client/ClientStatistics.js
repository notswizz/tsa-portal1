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
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-300"></div>
        <span className="ml-2 text-xs text-neutral-500">Loading statistics...</span>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-primary-50 rounded-lg p-3 shadow-sm border border-primary-100 transition-all duration-200 hover:shadow">
          <div className="flex items-center mb-1">
            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H7a1 1 0 00-1 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-xs font-medium text-neutral-500">Shows</p>
          </div>
          <p className="text-2xl font-display font-semibold text-neutral-800 ml-9">{stats.totalShows}</p>
        </div>
        
        <div className="bg-primary-50 rounded-lg p-3 shadow-sm border border-primary-100 transition-all duration-200 hover:shadow">
          <div className="flex items-center mb-1">
            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-xs font-medium text-neutral-500">Days</p>
          </div>
          <p className="text-2xl font-display font-semibold text-neutral-800 ml-9">{stats.totalDaysBooked}</p>
        </div>
      </div>
      
      {stats.staffMembers.length > 0 && (
        <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200 shadow-sm">
          <h4 className="section-title mb-3">Staff You've Worked With</h4>
          <div className="flex flex-wrap gap-2">
            {stats.staffMembers.map(staff => (
              <div key={staff.id} className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm border border-neutral-100 hover:border-primary-200 transition-all duration-200">
                <div className="h-6 w-6 rounded-full overflow-hidden bg-primary-50 mr-2 flex items-center justify-center">
                  {staff.image ? (
                    <Image 
                      src={staff.image} 
                      alt={staff.name}
                      width={24}
                      height={24}
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-xs font-medium text-primary">
                      {staff.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-neutral-700">{staff.name}</span>
              </div>
            ))}
            
            {stats.staffMembers.length === 0 && (
              <p className="text-xs text-neutral-500 italic">You haven't worked with any staff members yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 