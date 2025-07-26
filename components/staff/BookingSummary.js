import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { format, parseISO, isBefore, isAfter, addDays, isWithinInterval, startOfWeek, endOfWeek, addWeeks } from 'date-fns';

export default function BookingSummary({ staffDocRef, staffEmail, staffName }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      if (!staffDocRef) return;
      
      try {
        setLoading(true);
        
        // Fetch clients for reference
        const clientsCollection = collection(db, 'clients');
        const clientsSnapshot = await getDocs(clientsCollection);
        const clientsMap = {};
        clientsSnapshot.docs.forEach(doc => {
          clientsMap[doc.id] = doc.data().name || 'Unknown Client';
        });

        // Fetch shows for reference
        const showsCollection = collection(db, 'shows');
        const showsSnapshot = await getDocs(showsCollection);
        const showsMap = {};
        showsSnapshot.docs.forEach(doc => {
          showsMap[doc.id] = {
            ...doc.data(),
            id: doc.id
          };
        });
        
        // Fetch bookings collection
        const bookingsCollection = collection(db, 'bookings');
        const bookingsSnapshot = await getDocs(bookingsCollection);
        
        const staffBookings = [];
        
        bookingsSnapshot.docs.forEach(doc => {
          const booking = doc.data();
          
          // Check if this booking has datesNeeded with staffIds that match this staff
          if (booking.datesNeeded && Array.isArray(booking.datesNeeded)) {
            booking.datesNeeded.forEach((dateNeeded, dateIndex) => {
              if (dateNeeded.staffIds && Array.isArray(dateNeeded.staffIds)) {
                // Check if staff is in staffIds array
                const isStaffBooked = dateNeeded.staffIds.some(id => 
                  id === staffDocRef.id || 
                  id === staffEmail || 
                  id === staffName
                );
                
                if (isStaffBooked) {
                  const showData = showsMap[booking.showId] || {};
                  
                  // Determine the best show name to use
                  let showName = showData.name;
                  if (!showName && booking.showName) {
                    showName = booking.showName;
                  }
                  if (!showName && booking.title) {
                    showName = booking.title;
                  }
                  if (!showName && booking.name) {
                    showName = booking.name;
                  }
                  if (!showName) {
                    showName = 'Unknown Show';
                  }
                  
                  staffBookings.push({
                    id: doc.id,
                    date: dateNeeded.date,
                    clientId: booking.clientId,
                    clientName: clientsMap[booking.clientId] || 'Unknown Client',
                    showId: booking.showId,
                    showName: showName,
                    location: booking.location || showData.location || '',
                    notes: booking.notes || '',
                    dateIndex,
                    booking
                  });
                }
              }
            });
          }
        });
        
        // Sort by date (soonest first)
        staffBookings.sort((a, b) => {
          const dateA = parseISO(a.date);
          const dateB = parseISO(b.date);
          return dateA - dateB;
        });
        
        setBookings(staffBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, [staffDocRef, staffEmail, staffName]);

  // Helper function to determine time-based status and colors
  const getBookingStatus = (dates) => {
    if (!dates || dates.length === 0) return { status: null, color: 'emerald', borderColor: 'border-l-emerald-400' };
    
    const now = new Date();
    const firstDate = parseISO(dates[0].date);
    const thisWeekStart = startOfWeek(now);
    const thisWeekEnd = endOfWeek(now);
    const nextWeekStart = startOfWeek(addWeeks(now, 1));
    const nextWeekEnd = endOfWeek(addWeeks(now, 1));
    
    // Check if booking is this week
    if (isWithinInterval(firstDate, { start: thisWeekStart, end: thisWeekEnd })) {
      return { status: 'This Week', color: 'rose', borderColor: 'border-l-rose-400' };
    }
    
    // Check if booking is next week
    if (isWithinInterval(firstDate, { start: nextWeekStart, end: nextWeekEnd })) {
      return { status: 'Next Week', color: 'amber', borderColor: 'border-l-amber-400' };
    }
    
    // Otherwise no status indicator
    return { status: null, color: 'emerald', borderColor: 'border-l-emerald-400' };
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-emerald-50 rounded-2xl flex items-center justify-center">
          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-slate-700 font-semibold mb-1">No Upcoming Bookings</h3>
        <p className="text-slate-500 text-sm">You'll see your scheduled events here when you're assigned to shows.</p>
      </div>
    );
  }

  // Group bookings by show/client for better organization
  const groupBookingsByShow = (bookingsList) => {
    const grouped = {};
    
    bookingsList.forEach(booking => {
      // Create a unique key combining showId and clientId
      const key = `${booking.showId || 'unknown'}-${booking.clientId || 'unknown'}`;
      
      // Try to get the title from various sources
      let title = booking.showName;
      if (!title && booking.booking && booking.booking.title) {
        title = booking.booking.title;
      }
      if (!title && booking.booking && booking.booking.name) {
        title = booking.booking.name;
      }
      if (!title) {
        title = 'Show';
      }
      
      if (!grouped[key]) {
        grouped[key] = {
          title,
          clientName: booking.clientName,
          location: booking.location,
          id: booking.showId,
          clientId: booking.clientId,
          dates: []
        };
      }
      
      grouped[key].dates.push({
        date: booking.date,
        bookingId: booking.id,
        notes: booking.notes
      });
    });
    
    // Sort dates within each group
    Object.values(grouped).forEach(group => {
      group.dates.sort((a, b) => {
        const dateA = parseISO(a.date);
        const dateB = parseISO(b.date);
        return dateA - dateB;
      });
      
      // Add first and last date for display
      if (group.dates.length > 0) {
        group.firstDate = parseISO(group.dates[0].date);
        group.lastDate = parseISO(group.dates[group.dates.length - 1].date);
      }
    });
    
    return Object.values(grouped).sort((a, b) => {
      // Sort by first date
      return a.firstDate - b.firstDate;
    });
  };

  const groupedBookings = groupBookingsByShow(bookings);

  // Format date ranges nicely
  const formatDateRange = (dates) => {
    if (!dates || dates.length === 0) return 'No dates';
    
    if (dates.length === 1) {
      return format(parseISO(dates[0].date), 'MMM d');
    }
    
    // Find consecutive date ranges
    const ranges = [];
    let currentRange = [parseISO(dates[0].date)];
    
    for (let i = 1; i < dates.length; i++) {
      const currentDate = parseISO(dates[i].date);
      const previousDate = parseISO(dates[i-1].date);
      const expectedDate = addDays(previousDate, 1);
      
      if (format(currentDate, 'yyyy-MM-dd') === format(expectedDate, 'yyyy-MM-dd')) {
        // Add to current range
        currentRange.push(currentDate);
      } else {
        // Start new range
        ranges.push([...currentRange]);
        currentRange = [currentDate];
      }
    }
    
    // Add the last range
    if (currentRange.length > 0) {
      ranges.push([...currentRange]);
    }
    
    // Format each range
    return ranges.map(range => {
      if (range.length === 1) {
        return format(range[0], 'MMM d');
      }
      return `${format(range[0], 'MMM d')} - ${format(range[range.length - 1], 'MMM d')}`;
    }).join(', ');
  };

  return (
    <div className="h-[450px] overflow-y-auto space-y-3 pr-2">
      {groupedBookings.map((booking, index) => {
        const bookingStatus = getBookingStatus(booking.dates);
        
        // Define status-specific styles
        const statusStyles = {
          rose: {
            statusBg: 'bg-rose-100',
            statusText: 'text-rose-700',
            badgeBg: 'bg-rose-500',
            patternBg: 'bg-rose-500'
          },
          amber: {
            statusBg: 'bg-amber-100',
            statusText: 'text-amber-700',
            badgeBg: 'bg-amber-500',
            patternBg: 'bg-amber-500'
          },
          emerald: {
            statusBg: 'bg-emerald-100',
            statusText: 'text-emerald-700',
            badgeBg: 'bg-emerald-500',
            patternBg: 'bg-emerald-500'
          }
        };
        
        const styles = statusStyles[bookingStatus.color];
        
        return (
          <div
            key={`${booking.id}-${booking.clientId}-${index}`}
            className={`bg-white/80 backdrop-blur-sm border border-emerald-200 ${bookingStatus.borderColor} border-l-4 rounded-2xl p-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden`}
          >
            {/* Status indicator - only show for this week and next week */}
            {bookingStatus.status && (
              <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${styles.statusBg} ${styles.statusText}`}>
                {bookingStatus.status}
              </div>
            )}
            
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className={`w-32 h-32 ${styles.patternBg} rounded-full absolute -top-16 -right-16`}></div>
            </div>
            
            <div className={`relative mb-3 ${bookingStatus.status ? 'pr-20' : 'pr-4'}`}>
              <h4 className="font-bold text-slate-800 text-lg mb-2 leading-tight group-hover:text-emerald-700 transition-colors">{booking.title}</h4>
              <div className="flex items-center space-x-2 text-slate-600 text-sm">
                <div className="flex items-center space-x-1">
                  <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium text-slate-700">{booking.clientName}</span>
                </div>
              </div>
            </div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center text-sm text-slate-600">
                <svg className="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">{formatDateRange(booking.dates)}</span>
              </div>
              
              {/* Days badge with better styling */}
              <div className={`${styles.badgeBg} text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-sm`}>
                {booking.dates.length} {booking.dates.length === 1 ? 'day' : 'days'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 