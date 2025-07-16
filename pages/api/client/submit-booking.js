import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';

// Firebase configuration using environment variables
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { bookingData } = req.body;

    if (!bookingData) {
      return res.status(400).json({ error: 'Booking data is required' });
    }

    // Validate required fields
    const requiredFields = ['clientId', 'showId', 'selectedStaff', 'totalCost'];
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    // Create the booking document
    const bookingRef = await addDoc(collection(db, 'bookings'), {
      ...bookingData,
      createdAt: new Date().toISOString(),
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Get client data for notification
    const clientDoc = await getDoc(doc(db, 'clients', bookingData.clientId));
    let clientData = {};
    if (clientDoc.exists()) {
      clientData = clientDoc.data();
    }

    return res.status(200).json({
      success: true,
      bookingId: bookingRef.id,
      message: 'Booking created successfully'
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({
      error: 'Failed to create booking',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 