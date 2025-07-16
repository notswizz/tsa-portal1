import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { format, parseISO, isBefore, isAfter, addDays } from 'date-fns';

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

  if (loading) {
    return (
      <div className="flex justify-center py-3 sm:py-4">
        <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-3 sm:py-4 text-gray-500">
        <p>No upcoming bookings found.</p>
        <p className="text-xs sm:text-sm mt-1 sm:mt-2">You'll see your scheduled bookings here when you're assigned to events.</p>
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
      return format(parseISO(dates[0].date), 'EEE, MMM d, yyyy');
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
    <div className="space-y-5 sm:space-y-6">
      {groupedBookings.map((booking, index) => (
        <div
          key={`${booking.id}-${booking.clientId}-${index}`}
          className="border border-pink-100 rounded-2xl p-4 bg-white shadow-md hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 flex flex-col gap-2 relative"
        >
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="pr-2">
              <h4 className="font-bold text-lg text-pink-700 flex items-center gap-2">
                <svg className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {booking.title}
              </h4>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 flex items-center gap-1">
                <svg className="h-4 w-4 text-pink-300 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Client: <span className="ml-1 text-gray-400 font-medium">{booking.clientName}</span>
              </p>
            </div>
            <div className="bg-gradient-to-r from-pink-400 to-pink-600 text-xs px-3 py-1 rounded-full shadow text-white font-bold flex items-center gap-1 ml-auto">
              <svg className="h-4 w-4 text-white mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {booking.dates.length} {booking.dates.length === 1 ? 'day' : 'days'}
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
            <svg className="h-4 w-4 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {formatDateRange(booking.dates)}
          </div>
        </div>
      ))}
    </div>
  );
} 