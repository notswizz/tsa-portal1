import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

  const clientId = session.user.id;
  const clientRef = doc(db, 'clients', clientId);

  // Handle GET request - get client profile
  if (req.method === 'GET') {
    try {
      const clientDoc = await getDoc(clientRef);
      
      if (!clientDoc.exists()) {
        return res.status(404).json({ message: 'Client profile not found' });
      }
      
      const profileData = clientDoc.data();
      
      return res.status(200).json({ profile: profileData });
    } catch (error) {
      console.error('Error fetching client profile:', error);
      return res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
    }
  }
  
  // Handle PUT request - update client profile
  if (req.method === 'PUT') {
    try {
      const updateData = req.body;
      
      // Validate the update data - updated to match Firebase fields
      const allowedFields = [
        'name',      // Changed from companyName
        'category',
        'location',  // Instead of boothLocation
        'phone',
        'website',
        'email',
        // contacts would be handled separately if needed
      ];
      
      // Filter out any fields that are not allowed
      const filteredData = Object.keys(updateData)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updateData[key];
          return obj;
        }, {});
      
      // Add updatedAt timestamp
      filteredData.updatedAt = new Date().toISOString();
      
      // Update the document
      await updateDoc(clientRef, filteredData);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Profile updated successfully' 
      });
    } catch (error) {
      console.error('Error updating client profile:', error);
      return res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
  }

  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
} 