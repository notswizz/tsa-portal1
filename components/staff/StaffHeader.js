import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

export default function StaffHeader({ session }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-pink-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <Link href="/staff" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-lg">TSA</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                The Smith Agency
              </h1>
              <p className="text-xs text-slate-500 font-medium">Staff Portal</p>
            </div>
          </Link>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="p-2 rounded-xl text-pink-600 hover:text-pink-800 hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200"
            >
              {menuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Navigation Links */}
            <nav className="flex items-center space-x-1">
              <Link 
                href="/" 
                className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-pink-50 transition-all duration-200 font-medium"
              >
                Home
              </Link>
              <Link 
                href="/staff" 
                className="px-4 py-2 rounded-xl text-pink-600 bg-pink-50 font-medium"
              >
                Dashboard
              </Link>
            </nav>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-3 bg-white rounded-2xl shadow-lg border border-pink-200 p-2 hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {session?.user?.image ? (
                  <div className="w-8 h-8 rounded-xl overflow-hidden ring-2 ring-pink-100">
                    <Image 
                      src={session.user.image} 
                      alt={session.user.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {session?.user?.name?.charAt(0) || "U"}
                    </span>
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-slate-800 truncate max-w-32">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-slate-500">Staff Member</p>
                </div>
                <svg 
                  className={`w-4 h-4 text-pink-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-pink-200 py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-pink-100">
                    <div className="flex items-center space-x-3">
                      {session?.user?.image ? (
                        <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-pink-100">
                          <Image 
                            src={session.user.image} 
                            alt={session.user.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {session?.user?.name?.charAt(0) || "U"}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {session?.user?.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {session?.user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <Link
                      href="/staff"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-pink-50 hover:text-slate-900 transition-colors duration-200"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        <span>Dashboard</span>
                      </div>
                    </Link>
                    
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign Out</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="md:hidden animate-fadeIn">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-200 mt-2 mb-4 overflow-hidden">
              {/* Mobile User Info */}
              <div className="px-4 py-4 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-purple-50">
                <div className="flex items-center space-x-3">
                  {session?.user?.image ? (
                    <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-pink-100 shadow-lg">
                      <Image 
                        src={session.user.image} 
                        alt={session.user.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center ring-2 ring-pink-100 shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {session?.user?.name?.charAt(0) || "U"}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {session?.user?.email}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Mobile Navigation */}
              <nav className="py-2">
                <Link 
                  href="/" 
                  className="block px-4 py-3 text-slate-700 hover:bg-pink-50 hover:text-slate-900 transition-colors duration-200"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="font-medium">Home</span>
                  </div>
                </Link>
                
                <Link 
                  href="/staff" 
                  className="block px-4 py-3 text-pink-600 bg-pink-50 font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span>Dashboard</span>
                  </div>
                </Link>
                
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium">Sign Out</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>
      
      {/* Click outside overlay for dropdown */}
      {dropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setDropdownOpen(false)}
        ></div>
      )}
    </header>
  );
} 