import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'You must be signed in to access this endpoint.' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const showsQuery = query(collection(db, 'shows'));
    const snap = await getDocs(showsQuery);
    const shows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.status(200).json({ shows });
  } catch (error) {
    console.error('Error fetching shows:', error);
    return res.status(500).json({ message: 'Failed to fetch shows' });
  }
} 