import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(router.query.type === 'staff' ? 'staff' : 'client');

  const handleClientLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result.error) {
        setError('Invalid email or password');
        setIsLoading(false);
        return;
      }

      // Redirect to the client dashboard
      router.push('/client/dashboard');
    } catch (error) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Redirect to Google OAuth flow
      await signIn('google', { callbackUrl: '/staff' });
    } catch (error) {
      setError('Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  return (
    <Layout title="Sign In | The Smith Agency">
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-pink-50 to-white">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-pink-700">
              Sign in to your account
            </h2>
            
            {/* Tab Navigation */}
            <div className="mt-8 flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTab('client')}
                className={`${
                  activeTab === 'client'
                    ? 'bg-pink-500 text-white'
                    : 'bg-white text-gray-700 hover:text-gray-500'
                } w-full px-4 py-3 border border-pink-300 text-base font-medium rounded-l-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500`}
              >
                Client
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('staff')}
                className={`${
                  activeTab === 'staff'
                    ? 'bg-pink-500 text-white'
                    : 'bg-white text-gray-700 hover:text-gray-500'
                } w-full px-4 py-3 border border-pink-300 text-base font-medium rounded-r-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500`}
              >
                Staff
              </button>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'client' ? (
            <form className="mt-8 space-y-6" onSubmit={handleClientLogin}>
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                    placeholder="Password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link href="/auth/register" className="font-medium text-pink-600 hover:text-pink-500">
                                            Don&apos;t have an account? Register
                  </Link>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-pink-600 hover:text-pink-500">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <span>Sign in</span>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-8 space-y-6">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-pink-300 group-hover:text-pink-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" clipRule="evenodd" />
                  </svg>
                </span>
                {isLoading ? 'Signing in...' : 'Sign in with Google'}
              </button>
            </div>
          )}
          
          <div className="text-center mt-4">
            <Link href="/" className="font-medium text-pink-600 hover:text-pink-500">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
} 