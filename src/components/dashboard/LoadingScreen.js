// src/components/dashboard/LoadingScreen.js
import { useLanguage } from '@/contexts/LanguageContext';

export default function LoadingScreen() {
    const { t } = useLanguage();
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{t('dash.loadingDashboard')}</p>
        </div>
      </div>
    );
  }