import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

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
const firebaseAuth = getAuth(firebaseApp);

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Email & Password',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Sign in with Firebase
          const userCredential = await signInWithEmailAndPassword(
            firebaseAuth,
            credentials.email,
            credentials.password
          );
          
          if (userCredential.user) {
            const userDoc = await getDoc(doc(db, 'clients', userCredential.user.uid));
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              return {
                id: userCredential.user.uid,
                email: userCredential.user.email,
                name: userData.companyName || userCredential.user.email,
                image: userData.logoUrl || null,
                role: 'client'
              };
            } else {
              // If user exists in Firebase but not in Firestore
              return {
                id: userCredential.user.uid,
                email: userCredential.user.email,
                name: userCredential.user.email,
                role: 'client'
              };
            }
          }
          return null;
        } catch (error) {
          console.error("Firebase auth error:", error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === 'google' && user && user.email) {
        try {
          // Check if user already exists in the staff collection
          const userRef = doc(db, 'staff', user.id);
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            // If user doesn't exist, add them to the staff collection
            await setDoc(userRef, {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              role: 'staff',
              createdAt: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error("Error saving user to Firestore:", error);
          // Still allow sign in even if storing to Firestore fails
        }
        return true;
      } else if (account.provider === 'credentials') {
        // Credentials login is for clients
        return true;
      }
      return false;
    },
    async session({ session, token }) {
      // Add user info to session from token
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role || 'client'; // Default to client for credential logins
      }
      return session;
    },
    async jwt({ token, account, user }) {
      // Persist the access token and user role to the token right after sign in
      if (account && user) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
        token.role = user.role || (account.provider === 'google' ? 'staff' : 'client');
      }
      return token;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);
