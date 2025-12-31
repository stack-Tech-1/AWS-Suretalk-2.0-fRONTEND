import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/contexts/AuthContext';

export const useUserOnly = () => {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (isAdmin) {
        router.push('/adminDashboard');
      }
    }
  }, [user, loading, router, isAdmin]);

  return { user, loading, isAdmin };
};

export const useAdminOnly = () => {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/admin/login');
      } else if (!isAdmin) {
        router.push('/usersDashboard');
      }
    }
  }, [user, loading, router, isAdmin]);

  return { user, loading, isAdmin };
};