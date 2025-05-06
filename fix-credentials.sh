#!/bin/bash

# Script to help fix the sensitive credential issues in the repository
# This will create an environment file for storing secrets and update the code to use it

echo "🔐 Creating .env file for sensitive credentials..."
cat > .env << EOL
# Environment Variables
NEXTAUTH_SECRET=your-nextauth-secret-key
GOOGLE_CLIENT_ID=221969249317-kmm7qntmg5bu6eak3sipp7pt8uotmr08.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
FIREBASE_API_KEY=AIzaSyC1I_hYoiuc-IEMNwaSss41CD7jnaEpy7Q
FIREBASE_AUTH_DOMAIN=the-smith-agency.firebaseapp.com
FIREBASE_PROJECT_ID=the-smith-agency
FIREBASE_STORAGE_BUCKET=the-smith-agency.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=1048512215721
FIREBASE_APP_ID=1:1048512215721:web:c092a7c008d61c4c7d47b8
FIREBASE_MEASUREMENT_ID=G-QTTX3YDDMP
EOL

echo "📝 Updating .gitignore to exclude .env file..."
if ! grep -q "^.env$" .gitignore; then
    echo "" >> .gitignore
    echo "# Environment variables" >> .gitignore
    echo ".env" >> .gitignore
    echo ".env.local" >> .gitignore
    echo ".env.development.local" >> .gitignore
    echo ".env.test.local" >> .gitignore
    echo ".env.production.local" >> .gitignore
fi

echo "🔧 Updating NextAuth configuration to use environment variables..."
cat > pages/api/auth/[...nextauth].js << EOL
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

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

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
EOL

echo "✅ Updates complete!"
echo ""
echo "🚨 IMPORTANT NEXT STEPS 🚨"
echo "1. Make sure to add .env.example with empty values for documentation"
echo "2. Commit these changes and try pushing again"
echo "3. Store your real credentials securely in a .env file or environment variables"
echo ""
echo "You can now run: ./push-to-github.sh \"Fix: Remove sensitive credentials\" to commit and push these changes" 