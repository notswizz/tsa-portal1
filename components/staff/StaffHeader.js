import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

export default function StaffHeader({ session }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="bg-white shadow-md border-b-2 border-pink-500 py-2 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">TSA</span>
            </div>
            <span className="text-lg font-bold text-pink-600 truncate">
              The Smith Agency
            </span>
          </Link>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-600 hover:text-pink-600 hover:bg-pink-50 focus:outline-none"
            >
              {menuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-600 hover:text-pink-600 transition-colors">
              Home
            </Link>
            <div className="flex items-center bg-white rounded-full shadow-md p-1 border border-pink-300">
              {session?.user?.image && (
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full overflow-hidden border-2 border-pink-500">
                  <Image 
                    src={session.user.image} 
                    alt={session.user.name}
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="mx-2 hidden sm:block">
                <p className="text-sm font-medium text-gray-700 truncate max-w-[100px] md:max-w-none">
                  {session?.user?.name}
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="p-1.5 rounded-full text-gray-500 hover:text-white hover:bg-pink-500 transition-colors"
                title="Log out"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="mt-2 pb-2 md:hidden">
            <div className="flex items-center mb-3 pt-3 border-t border-pink-100">
              {session?.user?.image && (
                <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-pink-500 mr-2">
                  <Image 
                    src={session.user.image} 
                    alt={session.user.name}
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="mr-auto">
                <p className="text-sm font-medium text-gray-700 truncate">{session?.user?.name}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-pink-500 transition-colors"
                title="Log out"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
            <nav className="grid grid-cols-1 gap-1">
              <Link 
                href="/" 
                className="px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-pink-600 hover:bg-pink-50"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 