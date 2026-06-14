'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function RoleProtectedRoute({ children, allowedRoles }: RoleProtectedRouteProps) {
  const { user, token } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      if (!token && !user) {
        router.push('/login');
      } else if (allowedRoles && allowedRoles.length > 0 && user?.role) {
        if (!allowedRoles.includes(user.role)) {
          router.push('/unauthorized'); // Or some 403 page
        }
      }
    }
  }, [user, token, router, isClient, allowedRoles]);

  if (!isClient) {
    return null; // Don't render anything during SSR
  }

  if (!token && !user) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // If roles are specified, check them before rendering children
  if (allowedRoles && allowedRoles.length > 0 && user?.role) {
    if (!allowedRoles.includes(user.role)) {
       return (
        <div className="flex-1 flex items-center justify-center min-h-[50vh] flex-col gap-4">
          <h1 className="text-2xl font-bold text-red-600">403 Forbidden</h1>
          <p className="text-gray-600">You do not have permission to view this page.</p>
        </div>
      );
    }
  }

  return <>{children}</>;
}
