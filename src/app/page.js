"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  MessageSquare,
  Shield,
  Mic,
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  Play,
  Headphones,
  Phone,
  User,
  Users as UsersGroup,
  Building,
  Lock,
  Cloud,
  Zap,
  Globe
} from "lucide-react";
import { Dialog } from '@headlessui/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import Button from "../components/common/Button";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const features = [
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Voice Recording",
      description: "Record and store voice messages with crystal clear quality",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Scheduled Messages",
      description: "Schedule voice messages to be delivered at specific times",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Storage",
      description: "Military-grade encryption for your voice memories",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Contact Management",
      description: "Organize and manage contacts for voice sharing",
      color: "from-orange-500 to-red-500",
    },
  ];

  const tiers = [
    {
      name: "LITE",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "3 Voice Notes",
        "3 Contacts",
        "180 Day Storage",
        "Phone Access",
        "Basic IVR",
      ],
      buttonText: "Start Free",
      highlighted: false,
      color: "blue",
    },
    {
      name: "Essential",
      price: "$4.99",
      period: "per month",
      description: "Most popular choice",
      features: [
        "Unlimited Voice Notes",
        "9 Contacts",
        "90 Day Storage",
        "Web Dashboard",
        "Export Features",
        "Advanced IVR",
      ],
      buttonText: "Get Essential",
      highlighted: true,
      color: "purple",
    },
    {
      name: "Premium",
      price: "$9.99",
      period: "per month",
      description: "Legacy & Permanent",
      features: [
        "Everything in Essential",
        "Permanent Storage",
        "Voice Wills",
        "Scheduled Messages",
        "Glacier Archive",
        "Priority Support",
      ],
      buttonText: "Go Premium",
      highlighted: false,
      color: "amber",
    },
  ];

  const audienceTypes = [
    {
      icon: <User className="w-8 h-8" />,
      title: "Individuals",
      description: "Preserve personal voice messages, memories, and heartfelt notes for loved ones.",
      features: ["Personal voice diary", "Messages to family", "Memory preservation"]
    },
    {
      icon: <UsersGroup className="w-8 h-8" />,
      title: "Families",
      description: "Create voice wills, family histories, and legacy messages for future generations.",
      features: ["Family voice vault", "Generational messages", "Voice wills & inheritance"]
    },
    {
      icon: <Building className="w-8 h-8" />,
      title: "Businesses",
      description: "Secure voice documentation, client communications, and professional recordings.",
      features: ["Client voice memos", "Meeting recordings", "Secure documentation"]
    }
  ];

  const trustIndicators = [
    { icon: <Shield className="w-5 h-5" />, text: "256-bit Encryption" },
    { icon: <Cloud className="w-5 h-5" />, text: "AWS Secure Storage" },
    { icon: <Globe className="w-5 h-5" />, text: "GDPR Compliant" },
    { icon: <Zap className="w-5 h-5" />, text: "99.9% Uptime" },
    { icon: <Lock className="w-5 h-5" />, text: "KMS Encryption" },
    { icon: <MessageSquare className="w-5 h-5" />, text: "End-to-End Secure" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation - ENHANCED */}
      <nav className="sticky top-0 z-50 glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">SureTalk</span>
              </Link>
            </div>
            
            {/* Desktop Navigation - ENHANCED */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-700 hover:text-brand-600 font-medium transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-brand-600 font-medium transition-colors">
                Pricing
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-brand-600 font-medium transition-colors">
                How It Works
              </a>
              <a href="#audience" className="text-gray-700 hover:text-brand-600 font-medium transition-colors">
                Who Uses It
              </a>
              <Link 
                href="/login" 
                className="text-gray-700 hover:text-brand-600 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/signup"
                className="btn-primary px-6 py-2.5"
              >
                Get Started Free
              </Link>
            </div>
            
            {/* Mobile Menu Button - ENHANCED */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-xl p-2.5 text-gray-700 hover:bg-gray-100/50 transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
        
        {/* Mobile Menu Dialog - ENHANCED WITH GLASS EFFECT */}
        <Dialog 
          as="div" 
          className="md:hidden relative z-50" 
          open={mobileMenuOpen} 
          onClose={setMobileMenuOpen}
        >
          {/* Backdrop with blur */}
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          
          {/* Slide-in Panel with glass effect */}
          <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gradient-to-b from-white/95 to-gray-50/95 backdrop-blur-xl px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-white/10 shadow-2xl">
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="h-full"
            >
              <div className="flex items-center justify-between">
                <Link href="/" className="-m-1.5 p-1.5 flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">SureTalk</span>
                </Link>
                <button
                  type="button"
                  className="rounded-lg p-2.5 text-gray-700 hover:bg-gray-100/50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              
              {/* Mobile Navigation Links - Enhanced */}
              <div className="mt-8 flow-root">
                <div className="-my-6 divide-y divide-gray-200/50">
                  <div className="space-y-1 py-6">
                    <a
                      href="#features"
                      className="-mx-3 block rounded-xl px-3 py-3 text-lg font-semibold text-gray-900 hover:bg-white/50 hover:shadow-sm transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Features
                    </a>
                    <a
                      href="#pricing"
                      className="-mx-3 block rounded-xl px-3 py-3 text-lg font-semibold text-gray-900 hover:bg-white/50 hover:shadow-sm transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Pricing
                    </a>
                    <a
                      href="#how-it-works"
                      className="-mx-3 block rounded-xl px-3 py-3 text-lg font-semibold text-gray-900 hover:bg-white/50 hover:shadow-sm transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      How It Works
                    </a>
                    <a
                      href="#audience"
                      className="-mx-3 block rounded-xl px-3 py-3 text-lg font-semibold text-gray-900 hover:bg-white/50 hover:shadow-sm transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Who Uses It
                    </a>
                    <Link
                      href="/login"
                      className="-mx-3 block rounded-xl px-3 py-3 text-lg font-semibold text-gray-900 hover:bg-white/50 hover:shadow-sm transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                  </div>
                  
                  <div className="py-6">
                    <Link
                      href="/signup"
                      className="w-full inline-flex items-center justify-center px-6 py-3.5 text-lg font-semibold rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 text-white hover:shadow-lg hover:scale-[1.02] transform transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Started Free
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Additional info for mobile */}
              <div className="mt-8 pt-6 border-t border-gray-200/50">
                <p className="text-sm text-gray-500 text-center">
                  Secure voice messaging • AWS encrypted • GDPR compliant
                </p>
              </div>
            </motion.div>
          </Dialog.Panel>
        </Dialog>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Your Voice,<br />
              <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
                Preserved Forever
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10">
              Secure voice messaging platform with legacy features, scheduled delivery, 
              and permanent storage for your most important memories.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/signup">
                <Button size="xl" className="px-8 btn-primary">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button variant="outline" size="xl" className="px-8">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>
          </motion.div>

          {/* Hero Image/Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative max-w-4xl mx-auto"
          >
            <div className="glass rounded-2xl overflow-hidden shadow-2xl border border-white/20">
              {/* Mock dashboard */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="flex-1 text-center text-gray-300 font-medium">
                    SureTalk Dashboard
                  </div>
                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-700/50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-white mb-1">12</div>
                      <div className="text-gray-400 text-sm">Voice Notes</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-white mb-1">5</div>
                      <div className="text-gray-400 text-sm">Contacts</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-white mb-1">2.1GB</div>
                      <div className="text-gray-400 text-sm">Storage Used</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center justify-between bg-gray-700/30 rounded-xl p-3 backdrop-blur-sm">
                        <div className="flex items-center">
                          <Headphones className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-white font-medium">Voice Note #{i}</div>
                            <div className="text-gray-400 text-sm">Recorded 2 days ago</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 hover:bg-gray-600/50 rounded-lg transition-colors">
                            <Play className="w-4 h-4 text-green-400" />
                          </button>
                          <button className="p-2 hover:bg-gray-600/50 rounded-lg transition-colors">
                            <Phone className="w-4 h-4 text-blue-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators Section */}
      <section className="py-12 bg-gradient-to-r from-brand-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {trustIndicators.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mb-3">
                  <div className="text-white">
                    {item.icon}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - ENHANCED WITH GLASS */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Every Need
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From simple voice notes to legacy messages, we've got you covered
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} 
                              flex items-center justify-center mb-6`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Uses SureTalk Section */}
      <section id="audience" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Who Uses SureTalk
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built for everyone who values voice preservation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {audienceTypes.map((audience, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mb-6">
                  <div className="text-white">
                    {audience.icon}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {audience.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {audience.description}
                </p>
                
                <ul className="space-y-2">
                  {audience.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - ENHANCED */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How SureTalk Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple three-step process to preserve and share your voice
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Record Your Message",
                description: "Call our number or use the web dashboard to record your voice message",
                icon: <Mic className="w-8 h-8" />,
              },
              {
                step: "02",
                title: "Choose Recipients",
                description: "Select contacts or schedule for future delivery",
                icon: <Users className="w-8 h-8" />,
              },
              {
                step: "03",
                title: "Secure Storage",
                description: "Your message is encrypted and stored in AWS with optional legacy vault",
                icon: <Shield className="w-8 h-8" />,
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.2 }}
                  className="glass rounded-2xl p-8 shadow-lg relative z-10 border border-white/20"
                >
                  <div className="text-5xl font-bold text-gray-200/50 mb-4">
                    {item.step}
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mb-6">
                    <div className="text-white">
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </motion.div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-0">
                    <ArrowRight className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - ENHANCED WITH GLASS */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start free, upgrade anytime. All plans include secure voice storage.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {tiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`relative glass rounded-2xl p-8 border-2 transition-all duration-300 
                          ${tier.highlighted 
                            ? 'border-brand-500/50 shadow-2xl scale-105' 
                            : 'border-white/20 hover:border-brand-200/50'
                          }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="glass px-4 py-1 rounded-full text-sm font-semibold border border-brand-500/30">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`inline-block px-4 py-1 rounded-full text-sm font-semibold mb-4 
                                ${tier.color === 'blue' ? 'bg-blue-100 text-blue-800' : 
                                  tier.color === 'purple' ? 'bg-purple-100 text-purple-800' : 
                                  'bg-amber-100 text-amber-800'}`}>
                    {tier.name}
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-5xl font-bold text-gray-900">{tier.price}</span>
                    <span className="text-gray-600 ml-2">{tier.period}</span>
                  </div>
                  <p className="text-gray-600">{tier.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/signup">
                  <Button
                    variant={tier.highlighted ? "primary" : "secondary"}
                    fullwidth
                    size="lg"
                  >
                    {tier.buttonText}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600">
              All plans include 24/7 phone access, basic security, and email support.
              <br />
              Need a custom plan?{" "}
              <a href="#" className="text-brand-600 hover:text-brand-700 font-medium">
                Contact our sales team
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section - UPDATED GRADIENT */}
      <section className="py-20 bg-gradient-to-r from-brand-600 to-accent-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Preserving Your Voice?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of users who trust SureTalk with their most important voice memories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="xl" className="bg-white text-brand-600 hover:bg-gray-100 hover:scale-105 transform transition-all">
                Get Started Free
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="xl"
              className="border-white text-white hover:bg-white/10 hover:scale-105 transform transition-all"
            >
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer - UPDATED */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">SureTalk</span>
              </div>
              <p className="text-gray-400">
                Secure voice messaging platform with legacy preservation features.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/api" className="hover:text-white transition-colors">API</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                <li><Link href="/gdpr" className="hover:text-white transition-colors">GDPR</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} SureTalk. All rights reserved.
              <br />
              <span className="text-sm">Secured by AWS • Encrypted with KMS</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}