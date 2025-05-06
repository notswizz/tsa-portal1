import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC1I_hYoiuc-IEMNwaSss41CD7jnaEpy7Q",
  authDomain: "the-smith-agency.firebaseapp.com",
  projectId: "the-smith-agency",
  storageBucket: "the-smith-agency.firebasestorage.app",
  messagingSenderId: "1048512215721",
  appId: "1:1048512215721:web:c092a7c008d61c4c7d47b8",
  measurementId: "G-QTTX3YDDMP"
};

const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(firebaseApp);

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: "221969249317-kmm7qntmg5bu6eak3sipp7pt8uotmr08.apps.googleusercontent.com",
      clientSecret: "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",
    }),
  ],
  secret: "your-nextauth-secret-key",
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // When a user signs in, store their information in the staff collection
      if (user && user.email) {
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
      }
      return true;
    },
    async session({ session, token }) {
      // Add user info to session from token
      if (token) {
        session.user.id = token.sub;
        session.user.role = 'staff';
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      // Persist the Google access token to the token right after sign in
      if (account && profile) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      return token;
    },
  },
  debug: process.env.NODE_ENV === 'development',
}); 