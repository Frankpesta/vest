// hooks/useLoginRedirect.ts - Simplified version
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useLoginRedirect(isAuthenticated: boolean) {
  const router = useRouter();
  const userRole = useQuery(api.users.getUserRole);

  useEffect(() => {
    if (isAuthenticated && userRole !== undefined) {
      if (userRole?.role === 'admin' && userRole?.isActive) {
        router.push('/admin');
      } else if (userRole) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, userRole, router]);

  return {
    isLoading: isAuthenticated && userRole === undefined,
    userRole
  };
}