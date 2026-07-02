"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Lock, Check, Star } from "lucide-react";
import Link from "next/link";
import AuthLayout from "../../components/auth/AuthLayout";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { api } from "../../utils/api";
import React from "react";
import { toast } from '@/components/ui/Toast';
import { useLanguage } from "../../contexts/LanguageContext";

export default function Signup() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState("LITE");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    smsConsent: false,
  });

  const tiers = [
    {
      id: "LITE",
      name: t('auth.tier.lite.name'),
      price: "$0",
      period: t('home.pricing.lite.period'),
      description: t('auth.tier.lite.desc'),
      features: [
        t('auth.tier.lite.f1'),
        t('auth.tier.lite.f2'),
        t('auth.tier.lite.f3'),
        t('auth.tier.lite.f4'),
        t('auth.tier.lite.f5'),
      ],
      color: "blue",
    },
    {
      id: "ESSENTIAL",
      name: t('auth.tier.essential.name'),
      price: "$6.99",
      period: t('home.pricing.essential.period'),
      description: t('auth.tier.essential.desc'),
      features: [
        t('auth.tier.essential.f1'),
        t('auth.tier.essential.f2'),
        t('auth.tier.essential.f3'),
        t('auth.tier.essential.f4'),
      ],
      color: "purple",
      highlighted: true,
    },
    {
      id: "LEGACY_VAULT_PREMIUM",
      name: t('auth.tier.premium.name'),
      price: "$12.99",
      period: t('home.pricing.premium.period'),
      description: t('auth.tier.premium.desc'),
      features: [
        t('auth.tier.premium.f1'),
        t('auth.tier.premium.f2'),
        t('auth.tier.premium.f3'),
        t('auth.tier.premium.f4'),
        t('auth.tier.premium.f5'),
      ],
      color: "amber",
    },
  ];

  // Update the handleSubmit function:
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Validate form
    if (formData.password !== formData.confirmPassword) {
      throw new Error("Passwords do not match");
    }

    if (formData.password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    if (!formData.agreeToTerms) {
      throw new Error("You must agree to the terms and conditions");
    }

    // Prepare data for API - NOW INCLUDING SELECTED TIER
    const apiData = {
      email: formData.email,
      phone: formData.phone,
      fullName: `${formData.firstName} ${formData.lastName}`.trim(),
      password: formData.password,
      subscriptionTier: selectedTier, 
    };

    // Call the real API
    await api.register(apiData);

     // Show v ion message instead of auto-login
     setStep(2); 

  } catch (error) {
    console.error("Signup failed:", error);
    
    // Show error to user
    toast.error(`Signup failed: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleTierSelect = (tierId) => {
    setSelectedTier(tierId);
  };

  if (step === 2) {
    return (
      <AuthLayout
        title={t('auth.welcomeTitle')}
        subtitle={t('auth.welcomeSubtitle')}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 rounded-2xl shadow-2xl max-w-md mx-auto text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {t('auth.accountCreated')}
          </h2>

          <p className="text-gray-600 mb-6">
            {t('auth.verificationSent')} <strong>{formData.email}</strong>.
            {t('auth.verificationCheck')}
          </p>

          <div className="bg-brand-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-brand-700 mb-2">
              {t('auth.nextSteps')}
            </h3>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                {t('auth.step1')}
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                {t('auth.step2')}
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                {t('auth.step3')}
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <Button
              className="w-full btn-primary"
              onClick={() => window.location.href = '/login'}
            >
              {t('auth.goToLogin')}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={async () => {
                try {
                  setLoading(true);
                  await api.resendVerification({ email: formData.email });
                  toast.success('Verification email resent successfully!', 'Email Sent');
                } catch (error) {
                  toast.error('Failed to resend: ' + error.message);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              {loading ? t('auth.sending') : t('auth.resendVerification')}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.reload()}
            >
              {t('auth.createAnother')}
            </Button>
          </div>

        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={t('auth.joinTitle')}
      subtitle={t('auth.joinSubtitle')}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl mx-auto"
      >
        <div className="glass-card p-8 rounded-2xl shadow-2xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {t('auth.choosePlan')}
            </h2>
            <p className="text-gray-600">
              {t('auth.choosePlanSubtitle')}
            </p>
          </div>

          {/* Tier Selection Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {tiers.map((tier) => (
              <motion.div
                key={tier.id}
                whileHover={{ y: -5 }}
                onClick={() => handleTierSelect(tier.id)}
                className={`relative p-6 rounded-xl border-2 cursor-pointer 
                          transition-all duration-200 ${
                  selectedTier === tier.id
                    ? 'border-brand-500 shadow-lg scale-[1.02] ring-2 ring-brand-500/20'
                    : 'border-gray-200 hover:border-gray-300'
                } ${tier.highlighted ? 'ring-2 ring-purple-200' : ''}`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white 
                                   px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 
                                ${tier.color === 'blue' ? 'badge-lite' : 
                                  tier.color === 'purple' ? 'bg-purple-100 text-purple-800' : 
                                  'badge-premium'}`}>
                    {tier.name}
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                    {tier.period !== 'forever' && (
                      <span className="text-gray-600 ml-1 text-sm">{tier.period}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{tier.description}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm">
                      <Check className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className={`text-center p-3 rounded-lg font-medium transition-colors ${
                  selectedTier === tier.id
                    ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  {selectedTier === tier.id ? (
                    <span className="flex items-center justify-center">
                      <Check className="w-4 h-4 mr-2" />
                      {t('auth.selected')}
                    </span>
                  ) : (
                    t('auth.selectPlan')
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label={t('auth.firstName')}
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                required
                icon={<User className="w-5 h-5 text-gray-400" />}
              />
              
              <Input
                label={t('auth.lastName')}
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
                icon={<User className="w-5 h-5 text-gray-400" />}
              />
            </div>

            <Input
              label={t('auth.emailLabel')}
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              icon={<Mail className="w-5 h-5 text-gray-400" />}
            />

            <div>
              <Input
                label={t('auth.phoneLabel')}
                name="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={handleChange}
                required
                icon={<Phone className="w-5 h-5 text-gray-400" />}
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('auth.phoneHint')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label={t('auth.passwordCreate')}
                name="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
                icon={<Lock className="w-5 h-5 text-gray-400" />}
              />

              <Input
                label={t('auth.confirmPassword')}
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                icon={<Lock className="w-5 h-5 text-gray-400" />}
              />
            </div>

            {/* Terms & Privacy (REQUIRED) */}
            <div className="flex items-start">
              <input
                id="terms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="mt-1 rounded border-gray-300 text-brand-600 focus:ring-brand-500 focus:ring-offset-0"
                required
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                {t('auth.agreeTerms')}{" "}
                <a href="/terms" className="text-brand-600 hover:underline">
                  {t('auth.terms')}
                </a>{" "}
                {t('auth.agreeTermsAnd')}{" "}
                <a href="/privacy" className="text-brand-600 hover:underline">
                  {t('auth.privacy')}
                </a>
              </label>
            </div>

            {/* SMS Consent (OPTIONAL) */}
            <div className="flex items-start mt-3">
              <input
                id="smsConsent"
                name="smsConsent"
                type="checkbox"
                checked={formData.smsConsent}
                onChange={handleChange}
                className="mt-1 rounded border-gray-300 text-brand-600 focus:ring-brand-500 focus:ring-offset-0"
              />
              <label htmlFor="smsConsent" className="ml-2 text-sm text-gray-600">
                {t('auth.smsConsent')}
              </label>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Button
                type="submit"
                loading={loading}
                className="w-full btn-primary py-4 text-lg font-semibold"
              >
                {loading ? t('auth.creatingAccount') : `${t('auth.startWith')} ${selectedTier}`}
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {t('auth.alreadyAccount')}{" "}
              <Link
                href="/login"
                className="font-semibold text-brand-600 hover:text-brand-700
                           transition-colors"
              >
                {t('auth.signInHere')}
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-brand-50 to-accent-50 rounded-xl">
          <h3 className="font-semibold text-brand-800 mb-3">
            {t('auth.whySuretalk')}
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 shadow-sm">
                <span className="text-brand-600 font-bold">✓</span>
              </div>
              <span className="text-gray-700">{t('auth.whyF1')}</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 shadow-sm">
                <span className="text-brand-600 font-bold">✓</span>
              </div>
              <span className="text-gray-700">{t('auth.whyF2')}</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 shadow-sm">
                <span className="text-brand-600 font-bold">✓</span>
              </div>
              <span className="text-gray-700">{t('auth.whyF3')}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AuthLayout>
  );
}