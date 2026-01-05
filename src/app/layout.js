// src/app/layout.js
import '../styles/globals.css';
import { AnalyticsProvider } from '@/contexts/AnalyticsContext';

export const metadata = {
  title: 'SureTalk - Voice Legacy Platform',
  description: 'Secure voice messaging and legacy planning',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" >
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}