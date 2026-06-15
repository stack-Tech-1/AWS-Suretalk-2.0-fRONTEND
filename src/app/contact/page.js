"use client";
import SimplePageLayout from "../../components/layout/SimplePageLayout";
import { Mail, Phone, Clock, MessageSquare } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <SimplePageLayout
      title={t('contact.title')}
      subtitle={t('contact.subtitle')}
      gradientFrom="from-blue-50"
      gradientTo="to-cyan-50"
    >
      <div className="space-y-8">
        <div className="text-center mb-8">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('contact.intro')}
          </p>
        </div>

        {/* Contact Information */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="glass rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('contact.emailTitle')}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">{t('contact.emailDesc')}</p>
            <a href="mailto:contact@suretalknow.com" className="text-brand-600 hover:text-brand-700 font-medium">
              contact@suretalknow.com
            </a>
          </div>

          <div className="glass rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('contact.phoneTitle')}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">{t('contact.phoneDesc')}</p>
            <a href="tel:+18005551234" className="text-brand-600 hover:text-brand-700 font-medium">
              +1 (800) 555-1234
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('contact.formTitle')}</h2>
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('contact.firstName')}</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800/50 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('contact.lastName')}</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800/50 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('contact.email')}</label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800/50 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('contact.subject')}</label>
              <select className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800/50 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent">
                <option>{t('contact.generalInquiry')}</option>
                <option>{t('contact.technicalSupport')}</option>
                <option>{t('contact.billingQuestion')}</option>
                <option>{t('contact.partnership')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('contact.message')}</label>
              <textarea
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800/50 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder={t('contact.messagePlaceholder')}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-accent-500 text-white font-semibold rounded-xl hover:shadow-lg transform transition-all duration-300"
            >
              {t('contact.send')}
            </button>
          </form>
        </div>

        {/* Additional Info */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Additional Information</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Response Time</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Typically within 24 hours</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Support Hours</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">24/7 for urgent voice-related issues</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimplePageLayout>
  );
}
