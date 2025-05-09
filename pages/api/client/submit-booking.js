import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, getDoc } from 'firebase/firestore';

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(firebaseApp);

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

  // Handle POST request - create a new booking
  if (req.method === 'POST') {
    try {
      const clientId = session.user.id;
      
      // Get booking data from request body
      const { 
        eventDate, 
        startTime, 
        endTime, 
        eventLocation, 
        eventType, 
        attire, 
        notes,
        staffCount,
        eventDuration
      } = req.body;
      
      // Validate required fields
      if (!eventDate || !startTime || !endTime || !eventLocation || !eventType) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Validate staff count
      if (!staffCount || staffCount < 1) {
        return res.status(400).json({ message: 'Staff count must be at least 1' });
      }

      // Validate event duration
      if (!eventDuration || eventDuration < 1) {
        return res.status(400).json({ message: 'Event duration must be at least 1 day' });
      }
      
      // Get client data
      const clientDocRef = doc(db, 'clients', clientId);
      const clientDoc = await getDoc(clientDocRef);
      const clientData = clientDoc.exists() ? clientDoc.data() : {};
      
      // Create booking in Firestore
      const bookingRef = await addDoc(collection(db, 'bookings'), {
        clientId,
        clientName: clientData.companyName || session.user.name || session.user.email,
        eventDate,
        startTime,
        endTime,
        eventLocation,
        eventType,
        attire,
        notes,
        staffCount,
        eventDuration,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      
      // Return success with booking ID
      return res.status(201).json({ 
        success: true, 
        bookingId: bookingRef.id 
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      return res.status(500).json({ message: 'Failed to create booking', error: error.message });
    }
  }

  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
} 