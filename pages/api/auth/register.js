import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default async function handler(req, res) {
  // Only POST method is accepted
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  // Validate request data
  const { email, password, companyName, website } = req.body;
  
  if (!email || !password || !companyName) {
    res.status(400).json({ message: 'Missing required fields' });
    return;
  }

  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Current timestamp
    const now = new Date().toISOString();

    // Create user document in Firestore with correct field names
    await setDoc(doc(db, 'clients', user.uid), {
      email: email,
      name: companyName,
      category: "",
      location: "",
      phone: "",
      website: website || "",
      createdAt: now,
      updatedAt: now,
      contacts: {}
    });

    // Return success
    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle Firebase auth errors
    let errorMessage = 'Registration failed';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Email is already in use';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email format';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak';
    }
    
    res.status(400).json({ 
      success: false, 
      message: errorMessage 
    });
  }
} 