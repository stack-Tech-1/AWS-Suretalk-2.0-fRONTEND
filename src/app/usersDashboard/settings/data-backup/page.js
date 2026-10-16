// /app/usersDashboard/settings/data-backup/page.js
"use client";
import { useState } from "react";
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Info
} from "lucide-react";
import Link from "next/link";
import { toast } from '@/components/ui/Toast';
import { useLanguage } from '@/contexts/LanguageContext';

export default function DataExport() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleExportData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(`${baseUrl}/users/export/zip`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SureTalk-Export-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(t('set.exportSuccess'), t('set.exportComplete'));
    } catch (err) {
      toast.error(t('set.exportError'), t('set.exportFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/usersDashboard/settings" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('exp.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('exp.subtitle')}</p>
        </div>
      </div>

      {/* Export card */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('exp.cardTitle')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t('exp.cardDesc')}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {[t('exp.itemProfile'), t('exp.itemVoiceNotes'), t('contacts.title'), t('scheduled.title'), t('exp.itemActivity')].map(item => (
                <span key={item} className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400">
                  {item}
                </span>
              ))}
            </div>
            <button
              onClick={handleExportData}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 text-white font-semibold text-sm hover:shadow-brand transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {t('exp.preparing')}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  {t('exp.exportMyData')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className="card p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{t('exp.aboutTitle')}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('exp.aboutDesc')}
          </p>
        </div>
      </div>
    </div>
  );
}
