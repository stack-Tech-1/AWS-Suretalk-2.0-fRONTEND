// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\pages\_app.js
import { useEffect } from 'react';
import '../styles/globals.css';
import { AuthProvider } from '../contexts/AuthContext';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Check for saved theme preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;