"use client";
import SimplePageLayout from "../../components/layout/SimplePageLayout";
import { useLanguage } from "../../contexts/LanguageContext";

export default function TermsPage() {
  const { t } = useLanguage();
  return (
    <SimplePageLayout
      title={t('legal.termsTitle')}
      subtitle="Our terms and conditions"
      gradientFrom="from-gray-50"
      gradientTo="to-gray-100"
    >
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Last updated: November 2026
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-600 dark:text-gray-300">
              By accessing or using SureTalk, you agree to be bound by these Terms of Service. 
              If you disagree with any part of the terms, you may not access our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Description of Service</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              SureTalk provides voice message preservation and storage services including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
              <li>Voice recording and storage</li>
              <li>Scheduled message delivery</li>
              <li>Contact management for voice sharing</li>
              <li>Legacy message preservation</li>
              <li>Secure encrypted storage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. User Accounts</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              When you create an account with us, you must provide accurate information. 
              You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
              <li>Maintaining the security of your account</li>
              <li>All activities that occur under your account</li>
              <li>Promptly notifying us of any security breaches</li>
              <li>Ensuring you have the right to store any voice content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Subscription Plans</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              SureTalk offers multiple subscription tiers:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
              <li><strong>LITE:</strong> Free tier with basic features</li>
              <li><strong>Essential:</strong> Monthly subscription with expanded features</li>
              <li><strong>Premium:</strong> Premium features including permanent storage</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300 mt-4">
              All paid subscriptions automatically renew unless cancelled before the renewal date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Content Ownership</h2>
            <p className="text-gray-600 dark:text-gray-300">
              You retain all rights to your voice recordings. By using SureTalk, you grant us 
              a license to store, process, and deliver your content as part of our service. 
              We do not claim ownership of your voice data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Prohibited Uses</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You may not use SureTalk for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
              <li>Illegal activities or content</li>
              <li>Harassment or threatening behavior</li>
              <li>Spam or unsolicited communications</li>
              <li>Copyright infringement</li>
              <li>Attempting to compromise system security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Termination</h2>
            <p className="text-gray-600 dark:text-gray-300">
              We may terminate or suspend your account immediately for violation of these Terms. 
              Upon termination, your right to use the service will cease immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-600 dark:text-gray-300">
              SureTalk shall not be liable for any indirect, incidental, special, consequential, 
              or punitive damages resulting from your use or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Changes to Terms</h2>
            <p className="text-gray-600 dark:text-gray-300">
              We reserve the right to modify these terms at any time. We will provide notice 
              of significant changes. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. SMS Data Handling</h2>
            <p className="text-gray-600 dark:text-gray-300">
            SureTalk LLC sends text messages to account holders who opt in, about their account: verification codes, PIN reset and account ID recovery, security alerts, reminders about their scheduled messages and voice wills, and reminders before a voice will is released. If an account holder does not respond to those reminders, we may text the trusted contact they named. We also send text messages to recipients chosen by an account holder to receive a voice message or voice will from them. By scheduling a message, or naming a recipient or trusted contact, you confirm that person expects to receive messages from you through SureTalk. Every message names SureTalk. Anyone can reply STOP at any time to stop receiving texts, or HELP for help. Message frequency varies, and message and data rates may apply.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-3">
            No mobile information will be shared with third parties/affiliates for marketing/promotional purposes. All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Contact Information</h2>
            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
              <p className="text-gray-700 dark:text-gray-200">
                Questions about these Terms? Contact us at:<br />
                <strong>Email:</strong> Contact@SureTalkNow.com<br />
                <strong>Mail:</strong> Legal Department, SureTalk LLC
              </p>
            </div>
          </section>          
        </div>
      </div>
    </SimplePageLayout>
  );
}