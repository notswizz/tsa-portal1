import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Layout from '../../components/Layout';

export default function ClientPortal() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If the session loading is done, update loading state
    if (status !== 'loading') {
      setLoading(false);
    }
  }, [status]);

  // If authenticated as a client, redirect to dashboard
  useEffect(() => {
    if (!loading && session && session.user.role === 'client') {
      router.replace('/client/dashboard');
    }
  }, [session, loading, router]);

  // If loading, show loading state
  if (loading) {
    return (
      <Layout title="Client Portal | The Smith Agency">
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500 mx-auto"></div>
            <p className="mt-6 text-xl text-pink-600 font-light">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Client Portal | The Smith Agency">
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-pink-700 sm:text-5xl mb-8">
            Client Portal
          </h1>
          
          <div className="bg-white shadow-lg rounded-lg border-2 border-pink-300 overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome to The Smith Agency</h2>
              
              <p className="text-lg text-gray-600 mb-8">
                Access your client dashboard to manage your bookings and company profile.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div className="bg-white border-2 border-pink-200 p-6 rounded-lg shadow-md hover:shadow-lg transition-all">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Sign In</h3>
                  <p className="text-gray-600 mb-4">
                    Already have an account? Sign in to access your dashboard.
                  </p>
                  <Link 
                    href="/auth/signin?type=client"
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                  >
                    Sign In
                  </Link>
                </div>
                
                <div className="bg-white border-2 border-pink-200 p-6 rounded-lg shadow-md hover:shadow-lg transition-all">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Register</h3>
                  <p className="text-gray-600 mb-4">
                    New to The Smith Agency? Create an account to get started.
                  </p>
                  <Link 
                    href="/auth/register"
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                  >
                    Register
                  </Link>
                </div>
              </div>
              
              <div className="mt-10 text-center">
                <p className="text-gray-500">
                  Need assistance? Contact our support team at <a href="mailto:support@thesmithagency.com" className="text-pink-600 hover:underline">support@thesmithagency.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 