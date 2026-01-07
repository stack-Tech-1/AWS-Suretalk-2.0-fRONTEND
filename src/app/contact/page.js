import SimplePageLayout from "../../components/layout/SimplePageLayout";
import { Mail, Phone, MapPin, Clock, MessageSquare } from "lucide-react";

export default function ContactPage() {
  return (
    <SimplePageLayout 
      title="Contact Us"
      subtitle="Get in touch with our team"
      gradientFrom="from-blue-50"
      gradientTo="to-cyan-50"
    >
      <div className="space-y-8">
        <div className="text-center mb-8">
          <p className="text-gray-600 mb-6">
            Have questions about SureTalk? Our team is here to help you preserve your voice memories.
          </p>
        </div>

        {/* Contact Information */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="glass rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Email Support</h3>
            <p className="text-gray-600 mb-2">General Inquiries</p>
            <a href="mailto:support@suretalk.com" className="text-brand-600 hover:text-brand-700 font-medium">
              support@suretalk.com
            </a>
          </div>

          <div className="glass rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Phone Support</h3>
            <p className="text-gray-600 mb-2">Available 24/7</p>
            <a href="tel:+18005551234" className="text-brand-600 hover:text-brand-700 font-medium">
              +1 (800) 555-1234
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent">
                <option>General Inquiry</option>
                <option>Technical Support</option>
                <option>Billing Question</option>
                <option>Partnership Opportunity</option>
                <option>Feature Request</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea 
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Tell us how we can help..."
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-accent-500 text-white font-semibold rounded-xl hover:shadow-lg transform transition-all duration-300"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Additional Info */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Information</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Response Time</h4>
                <p className="text-sm text-gray-600">Typically within 24 hours</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Support Hours</h4>
                <p className="text-sm text-gray-600">24/7 for urgent voice-related issues</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimplePageLayout>
  );
}