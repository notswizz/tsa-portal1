import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { db } from '../../lib/firebase';
import { doc, collection, addDoc, getDoc, getDocs } from 'firebase/firestore';
import { format, parseISO, eachDayOfInterval } from 'date-fns';
import Link from 'next/link';
import Layout from '../../components/Layout';

export default function BookStaffRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to dashboard with book tab active
    if (status !== 'loading') {
      if (session && session.user.role === 'client') {
        router.replace('/client/dashboard?tab=book');
      } else {
        router.replace('/auth/signin?type=client');
      }
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500 mx-auto"></div>
        <p className="mt-6 text-xl text-pink-600 font-light">Redirecting...</p>
      </div>
    </div>
  );
} 