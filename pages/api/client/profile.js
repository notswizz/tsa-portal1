import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ message: 'You must be signed in to access this endpoint.' });
  if (session.user.role !== 'client') return res.status(403).json({ message: 'Access denied. Client role required.' });

  const clientId = session.user.id;
  const clientRef = doc(db, 'clients', clientId);

  if (req.method === 'GET') {
    try {
      const clientDoc = await getDoc(clientRef);
      if (!clientDoc.exists()) return res.status(404).json({ message: 'Client profile not found' });
      const profileData = clientDoc.data();
      return res.status(200).json({ profile: profileData });
    } catch (error) {
      console.error('Error fetching client profile:', error);
      return res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const updateData = req.body;
      const allowedFields = ['name','category','location','phone','website','email'];
      const filteredData = Object.keys(updateData).filter(key => allowedFields.includes(key)).reduce((obj, key) => { obj[key] = updateData[key]; return obj; }, {});
      filteredData.updatedAt = new Date().toISOString();
      await updateDoc(clientRef, filteredData);
      return res.status(200).json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error updating client profile:', error);
      return res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
  }

  // Sub-actions to persist contacts and locations
  if (req.method === 'POST') {
    try {
      const { action, contact, location } = req.body || {};
      const snap = await getDoc(clientRef);
      if (!snap.exists()) return res.status(404).json({ message: 'Client profile not found' });
      const data = snap.data() || {};

      if (action === 'add_contact') {
        const contacts = Array.isArray(data.contacts) ? [...data.contacts] : [];
        const id = contact?.id || `c_${Date.now()}`;
        const newContact = { id, name: contact?.name || '', role: contact?.role || '', email: contact?.email || '', phone: contact?.phone || '' };
        contacts.unshift(newContact);
        await updateDoc(clientRef, { contacts, updatedAt: new Date().toISOString() });
        return res.status(200).json({ success: true, contact: newContact });
      }

      if (action === 'add_location') {
        const locations = Array.isArray(data.locations) ? [...data.locations] : [];
        const id = location?.id || `l_${Date.now()}`;
        const newLocation = { id, city: location?.city || '', booth: location?.booth || '', notes: location?.notes || '' };
        locations.unshift(newLocation);
        await updateDoc(clientRef, { locations, updatedAt: new Date().toISOString() });
        return res.status(200).json({ success: true, location: newLocation });
      }

      return res.status(400).json({ message: 'Unknown action' });
    } catch (error) {
      console.error('Error updating contacts/locations:', error);
      return res.status(500).json({ message: 'Failed to update', error: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 