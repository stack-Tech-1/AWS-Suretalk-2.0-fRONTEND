// In C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\components\auth\ProtectedRoute.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';


export const useAdminOnly = () => {
    const { user, loading } = useAuth();
    const router = useRouter();
  
    useEffect(() => {
      if (!loading && (!user || !user.is_admin)) {
        router.replace('/admin/login');
      }
    }, [user, loading]);
  };

  
  export const useUserOnly = () => {
    const { user, loading } = useAuth();
    const router = useRouter();
  
    useEffect(() => {
      if (!loading && !user) {
        router.replace('/login');
      }
      if (!loading && user?.is_admin) {
        router.replace('/adminDashboard');
      }
    }, [user, loading]);
  };
  

