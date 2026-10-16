"use client";
import SimplePageLayout from "../../components/layout/SimplePageLayout";
import { useLanguage } from "../../contexts/LanguageContext";

export default function PrivacyPage() {
  const { t } = useLanguage();
  return (
    <SimplePageLayout
      title={t('legal.privacyTitle')}
      subtitle="How we protect and handle your personal information"
      gradientFrom="from-blue-50"
      gradientTo="to-cyan-50"
    >
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Last updated: October 2026
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Information We Collect</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              At SureTalk, we collect information necessary to provide our voice preservation services:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
              <li><strong>Account Information:</strong> Name, email, phone number for account creation</li>
              <li><strong>Voice Data:</strong> Audio recordings you choose to store with us</li>
              <li><strong>Contact Information:</strong> Recipient details for message delivery</li>
              <li><strong>Usage Data:</strong> How you interact with our platform for service improvements</li>
              <li><strong>Technical Information:</strong> Device information, IP address, browser type</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
              <li>To provide and maintain our voice preservation services</li>
              <li>To process your voice message storage and delivery</li>
              <li>To communicate with you about service updates and support</li>
              <li>To improve our platform and develop new features</li>
              <li>To ensure security and prevent fraud</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Data Security</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We implement industry-leading security measures:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
              <li><strong>AWS Encryption:</strong> All voice data encrypted at rest and in transit</li>
              <li><strong>KMS Key Management:</strong> Advanced key management for added security</li>
              <li><strong>Access Controls:</strong> Strict access controls and authentication</li>
              <li><strong>Regular Audits:</strong> Security audits and vulnerability assessments</li>
              <li><strong>GDPR Compliance:</strong> Designed with privacy regulations in mind</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Your Rights</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your voice data</li>
              <li>Opt-out of marketing communications</li>
              <li>Lodge a complaint with regulatory authorities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Data Retention</h2>
            <p className="text-gray-600 dark:text-gray-300">
              We retain your data only as long as necessary:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300 mt-2">
              <li><strong>Account Data:</strong> Retained while your account is active</li>
              <li><strong>Voice Recordings:</strong> Stored according to your selected plan duration</li>
              <li><strong>Legacy Messages:</strong> Permanent storage for premium users</li>
              <li><strong>Deleted Data:</strong> Securely erased from all systems</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Third-Party Services</h2>
            <p className="text-gray-600 dark:text-gray-300">
              We use trusted third-party services:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300 mt-2">
              <li><strong>AWS:</strong> Secure cloud infrastructure and storage</li>
              <li><strong>Payment Processors:</strong> For subscription payments</li>
              <li><strong>Analytics:</strong> Anonymous usage data for improvements</li>
              <li><strong>Support Tools:</strong> Customer service and communication</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-300">
              For privacy-related questions or to exercise your rights:
            </p>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
              <p className="text-gray-700 dark:text-gray-200">
                <strong>Email:</strong> Contact@SureTalkNow.com<br />
                <strong>Mail:</strong> Privacy Officer, SureTalk Inc.<br />
                <strong>Response Time:</strong> We aim to respond within 48 hours
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. SMS Data Handling</h2>
            <p className="text-gray-600 dark:text-gray-300">
            Phone numbers collected for SMS communications are used solely for account security purposes and are never shared with third parties for marketing.
            </p>            
          </section>

          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-400/30">
            <p className="text-blue-800 dark:text-blue-200 font-medium">
              We take your privacy seriously. Your voice memories are encrypted and protected with enterprise-grade security.
            </p>
          </div>
        </div>
      </div>
    </SimplePageLayout>
  );
}