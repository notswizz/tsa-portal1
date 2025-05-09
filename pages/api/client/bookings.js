import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, getDoc, doc } from 'firebase/firestore';

export default async function handler(req, res) {
  // Get the session to check authentication
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'You must be signed in to access this endpoint.' });
  }

  // Only allow client role to access this endpoint
  if (session.user.role !== 'client') {
    return res.status(403).json({ message: 'Access denied. Client role required.' });
  }

  // Handle GET request - get all bookings for this client
  if (req.method === 'GET') {
    try {
      const clientId = session.user.id;
      
      // Create query to get bookings for this client
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc')
      );
      
      // Execute query
      const bookingsSnapshot = await getDocs(bookingsQuery);
      
      // Format results
      const bookingsPromises = bookingsSnapshot.docs.map(async bookingDoc => {
        const bookingData = bookingDoc.data();
        
        // Fetch show details if available
        let showData = null;
        if (bookingData.showId) {
          try {
            const showDoc = await getDoc(doc(db, 'shows', bookingData.showId));
            if (showDoc.exists()) {
              showData = showDoc.data();
            }
          } catch (error) {
            console.error(`Error fetching show ${bookingData.showId}:`, error);
          }
        }
        
        // Get assigned staff IDs if any
        const staffIds = [];
        if (bookingData.datesNeeded) {
          bookingData.datesNeeded.forEach(dateInfo => {
            if (dateInfo.staffIds && dateInfo.staffIds.length) {
              staffIds.push(...dateInfo.staffIds);
            }
          });
        }
        
        // Count total staff needed
        const totalStaffNeeded = bookingData.datesNeeded 
          ? bookingData.datesNeeded.reduce((total, date) => total + (date.staffCount || 0), 0)
          : 0;
          
        return {
          id: bookingDoc.id,
          ...bookingData,
          showData,
          hasAssignedStaff: staffIds.length > 0,
          totalStaffNeeded,
          uniqueStaffIds: [...new Set(staffIds)]
        };
      });
      
      const bookings = await Promise.all(bookingsPromises);
      
      // Return bookings
      return res.status(200).json({ bookings });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
    }
  }

  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
} 