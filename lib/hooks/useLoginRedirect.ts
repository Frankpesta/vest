// hooks/useLoginRedirect.ts - Enhanced version with perfect route handling
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/lib/store';

interface UseLoginRedirectOptions {
  preventRedirectFrom?: string[];
  defaultAdminRoute?: string;
  defaultUserRoute?: string;
}

export function useLoginRedirect(
  isAuthenticated: boolean, 
  options: UseLoginRedirectOptions = {}
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const hasRedirected = useRef(false);

  const {
    preventRedirectFrom = ['/login', '/register', '/forgot-password'],
    defaultAdminRoute = '/admin',
    defaultUserRoute = '/dashboard'
  } = options;

  const shouldRedirect = useCallback(() => {
    // Don't redirect if not authenticated or no user
    if (!isAuthenticated || !user) {
      return false;
    }

    // Don't redirect if already redirected in this session
    if (hasRedirected.current) {
      return false;
    }

    // Don't redirect from certain pages
    if (preventRedirectFrom.some(route => pathname.startsWith(route))) {
      return true; // Should redirect away from auth pages
    }

    // Don't redirect if user is already on a valid route for their role
    const isOnAdminRoute = pathname.startsWith('/admin');
    const isOnUserRoute = pathname.startsWith('/dashboard');
    const isAdmin = user.role === 'admin';

    if (isAdmin && isOnAdminRoute) {
      return false; // Admin on admin route, no redirect needed
    }

    if (!isAdmin && isOnUserRoute) {
      return false; // User on user route, no redirect needed
    }

    return true;
  }, [isAuthenticated, user, pathname, preventRedirectFrom]);

  const performRedirect = useCallback(() => {
    if (!user || hasRedirected.current) return;

    // Get redirect parameter from URL
    const redirectParam = searchParams.get('redirect');
    
    // Determine target route
    let targetRoute: string;
    
    if (redirectParam && redirectParam.startsWith('/')) {
      // Validate redirect parameter based on user role
      const isAdmin = user.role === 'admin';
      const isAdminRoute = redirectParam.startsWith('/admin');
      
      if (isAdmin || !isAdminRoute) {
        targetRoute = redirectParam;
      } else {
        // User trying to access admin route, redirect to user dashboard
        targetRoute = defaultUserRoute;
      }
    } else {
      // Default redirect based on role
      const isAdmin = user.role === 'admin';
      targetRoute = isAdmin ? defaultAdminRoute : defaultUserRoute;
    }

    // Prevent redirect loops
    if (pathname === targetRoute) {
      hasRedirected.current = true;
      return;
    }

    console.log(`Redirecting ${user.role} to: ${targetRoute}`);
    hasRedirected.current = true;
    router.replace(targetRoute);
  }, [user, searchParams, pathname, router, defaultAdminRoute, defaultUserRoute]);

  // Reset redirect flag when user changes
  useEffect(() => {
    hasRedirected.current = false;
  }, [user?.id]);

  // Perform redirect when conditions are met
  useEffect(() => {
    if (shouldRedirect()) {
      performRedirect();
    }
  }, [shouldRedirect, performRedirect]);

  return {
    isLoading: isAuthenticated && !user,
    user,
    shouldRedirect: shouldRedirect(),
    hasRedirected: hasRedirected.current
  };
}