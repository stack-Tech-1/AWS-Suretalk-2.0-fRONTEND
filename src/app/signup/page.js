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

export default function Signup() {
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
  });

  const tiers = [
    {
      id: "LITE",
      name: "SureTalk LITE",
      price: "$0",
      period: "forever",
      description: "Perfect for trying out voice messaging",
      features: [
        "Up to 3 contacts",
        "Up to 3 voice notes",
        "180-day storage",
        "Phone access only",
        "Basic IVR menu",
      ],
      color: "blue",
    },
    {
      id: "ESSENTIAL",
      name: "SureTalk Essential",
      price: "$4.99",
      period: "per month",
      description: "Our most popular plan",
      features: [
        "Up to 9 contacts",
        "Unlimited voice notes",
        "Advanced IVR features",
        "Web dashboard access",
        "Voice note exports",
        "90-day Standard-IA storage",
      ],
      color: "purple",
      highlighted: true,
    },
    {
      id: "PREMIUM",
      name: "Legacy Vault",
      price: "$9.99",
      period: "per month",
      description: "Permanent storage & legacy features",
      features: [
        "All Essential features",
        "Permanent voice storage",
        "Voice Wills creation",
        "Scheduled legacy messages",
        "Glacier Deep Archive",
        "KMS encryption",
        "Priority support",
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

    console.log("Sending signup data:", apiData);

    // Call the real API
    const response = await api.register(apiData);
    
    console.log("Signup successful:", response);

    // Auto-login after successful registration
    try {
      const loginResponse = await api.login(formData.email, formData.password);
      console.log("Auto-login successful:", loginResponse);
      
      // Go to success page (step 2)
      setStep(2);
    } catch (loginError) {
      console.error("Auto-login failed:", loginError);
      // Still show success page even if auto-login fails
      setStep(2);
    }

  } catch (error) {
    console.error("Signup failed:", error);
    
    // Show error to user
    alert(`Signup failed: ${error.message}`);
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
        title="Welcome to SureTalk!"
        subtitle="Your account has been created successfully"
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
            Account Created Successfully!
          </h2>
          
          <p className="text-gray-600 mb-6">
            We've sent a verification email to <strong>{formData.email}</strong>. 
            Please check your inbox and click the verification link to activate your account.
          </p>
          
          <div className="bg-brand-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-brand-700 mb-2">
              Next Steps:
            </h3>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Verify your email address
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Complete your subscription setup
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Start recording voice notes!
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <Button
              className="w-full btn-primary"
              onClick={() => window.location.href = '/login'}
            >
              Go to Login
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.reload()}
            >
              Create Another Account
            </Button>
          </div>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Join SureTalk"
      subtitle="Create your account in minutes"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl mx-auto"
      >
        <div className="glass-card p-8 rounded-2xl shadow-2xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Choose Your Plan
            </h2>
            <p className="text-gray-600">
              Start with LITE for free, or unlock premium features with Essential or Premium.
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
                      Selected
                    </span>
                  ) : (
                    "Select Plan"
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                required
                icon={<User className="w-5 h-5 text-gray-400" />}
              />
              
              <Input
                label="Last Name"
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
                icon={<User className="w-5 h-5 text-gray-400" />}
              />
            </div>

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              icon={<Mail className="w-5 h-5 text-gray-400" />}
            />

            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={handleChange}
              required
              icon={<Phone className="w-5 h-5 text-gray-400" />}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
                icon={<Lock className="w-5 h-5 text-gray-400" />}
              />
              
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                icon={<Lock className="w-5 h-5 text-gray-400" />}
              />
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="mt-1 rounded border-gray-300 text-brand-600 
                         focus:ring-brand-500 focus:ring-offset-0"
                required
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                I agree to the SureTalk{" "}
                <a href="#" className="text-brand-600 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-brand-600 hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Button
                type="submit"
                loading={loading}
                className="w-full btn-primary py-4 text-lg font-semibold"
              >
                {loading ? "Creating Account..." : `Start with ${selectedTier}`}
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-brand-600 hover:text-brand-700 
                           transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-brand-50 to-accent-50 rounded-xl">
          <h3 className="font-semibold text-brand-800 mb-3">
            Why Choose SureTalk?
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 shadow-sm">
                <span className="text-brand-600 font-bold">✓</span>
              </div>
              <span className="text-gray-700">Secure & Encrypted Storage</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 shadow-sm">
                <span className="text-brand-600 font-bold">✓</span>
              </div>
              <span className="text-gray-700">24/7 Voice Access</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 shadow-sm">
                <span className="text-brand-600 font-bold">✓</span>
              </div>
              <span className="text-gray-700">Legacy Message Protection</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AuthLayout>
  );
}