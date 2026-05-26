// src/app/layout.js
import '../styles/globals.css';
import { AnalyticsProvider } from '@/contexts/AnalyticsContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata = {
  title: 'SureTalk - Voice Legacy Platform',
  description: 'Secure voice messaging and legacy planning',
};

const themeScript = `
  try {
    const stored = localStorage.getItem('suretalk-theme');
    if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch {}
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AuthProvider>
          <AnalyticsProvider>
            {children}
            <ToastProvider />
          </AnalyticsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
