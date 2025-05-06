#!/bin/bash

# Script to help fix the sensitive credential issues in the repository
# This will create an environment file structure and update the code to use environment variables

echo "🔐 Setting up environment variables structure..."
cat > .env.example << EOL
# Environment Variables - COPY THIS FILE TO .env AND ADD YOUR REAL CREDENTIALS
NEXTAUTH_SECRET=your-nextauth-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
FIREBASE_APP_ID=your-firebase-app-id
FIREBASE_MEASUREMENT_ID=your-firebase-measurement-id
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
echo "1. After pushing these changes, you'll need to manually create a .env file with your real credentials"
echo "2. The .env file is gitignored, so your credentials will stay private"
echo "3. For deployment, set these environment variables in your hosting platform"
echo ""
echo "You can now run: ./push-to-github.sh \"Fix: Use environment variables for sensitive credentials\" to commit and push these changes" 