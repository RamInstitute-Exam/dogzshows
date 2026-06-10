'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Dog, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Dog className="h-8 w-8 text-indigo-600" />
              <span className="font-bold text-xl text-gray-900 tracking-tight">DogProfiles</span>
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/about" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                Contact
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className="text-purple-600 hover:text-purple-800 font-bold flex items-center space-x-1 transition-colors bg-purple-50 px-3 py-1 rounded-md border border-purple-100 mr-2">
                    <span>Admin Panel</span>
                  </Link>
                )}
                <Link href="/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium flex items-center space-x-1 transition-colors">
                  <UserIcon className="h-5 w-5" />
                  <span>{user.email.split('@')[0]}</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-gray-500 hover:text-red-600 font-medium transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full font-medium transition-all shadow-md hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
