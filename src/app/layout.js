// src/app/layout.js
import '../styles/globals.css';
import { AnalyticsProvider } from '@/contexts/AnalyticsContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata = {
  title: 'SureTalk - Voice Legacy Platform',
  description: 'Secure voice messaging and legacy planning',
};

const themeScript = `
  try {
    var stored = localStorage.getItem('suretalk-theme');
    if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch(e) {}
`;

const langScript = `
  try {
    var lang = localStorage.getItem('suretalk-lang') || 'en';
    document.documentElement.lang = lang;
  } catch(e) {}
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: langScript }} />
      </head>
      <body>
        <AuthProvider>
          <LanguageProvider>
            <AnalyticsProvider>
              {children}
              <ToastProvider />
            </AnalyticsProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
