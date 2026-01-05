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
  Globe,
  Image
} from "lucide-react";
import Button from "../components/common/Button";

export default function Home() {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
                
                  <img 
                    src="https://i.postimg.cc/9MbyJVL4/cropped-fulllogo-edited.webp" 
                    alt="SureTalk Logo" 
                    className="w-10 h-10 object-contain"
                  />
                
                <span className="text-xl font-bold text-gray-800">SureTalk</span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium">
                Pricing
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium">
                How It Works
              </a>
              <Link 
                href="/login" 
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </Link>
              <Link 
                href="/signup"
                className="btn-primary px-6 py-2"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
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
              <span className="bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">
                Preserved Forever
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10">
              Secure voice messaging platform with legacy features, scheduled delivery, 
              and permanent storage for your most important memories.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/signup">
                <Button size="xl" className="px-8">
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
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              {/* Mock dashboard */}
              <div className="bg-gray-900 p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="flex-1 text-center text-gray-300 font-medium">
                    SureTalk Dashboard
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-2xl font-bold text-white mb-1">12</div>
                      <div className="text-gray-400 text-sm">Voice Notes</div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-2xl font-bold text-white mb-1">5</div>
                      <div className="text-gray-400 text-sm">Contacts</div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-2xl font-bold text-white mb-1">2.1GB</div>
                      <div className="text-gray-400 text-sm">Storage Used</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center">
                          <Headphones className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-white font-medium">Voice Note #{i}</div>
                            <div className="text-gray-400 text-sm">Recorded 2 days ago</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 hover:bg-gray-600 rounded">
                            <Play className="w-4 h-4 text-green-400" />
                          </button>
                          <button className="p-2 hover:bg-gray-600 rounded">
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

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
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
                whileHover={{ y: -8 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 
                         shadow-lg hover:shadow-2xl transition-all duration-300 
                         border border-gray-100"
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

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
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
                <div className="bg-white rounded-2xl p-8 shadow-lg relative z-10">
                  <div className="text-5xl font-bold text-gray-200 mb-4">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center mb-6">
                    <div className="text-brand-600">
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </div>
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

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
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
                className={`relative rounded-2xl p-8 border-2 transition-all duration-300 
                          ${tier.highlighted 
                            ? 'border-brand-500 shadow-2xl scale-105' 
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-brand-500 to-accent-500 text-white 
                                   px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`inline-block px-4 py-1 rounded-full text-sm font-semibold mb-4 
                                ${tier.color === 'blue' ? 'badge-lite' : 
                                  tier.color === 'purple' ? 'bg-purple-100 text-purple-800' : 
                                  'badge-premium'}`}>
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-brand-500 to-brand-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Preserving Your Voice?
          </h2>
          <p className="text-xl text-brand-100 mb-10 max-w-2xl mx-auto">
            Join thousands of users who trust SureTalk with their most important voice memories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="xl" className="bg-white text-brand-600 hover:bg-gray-100">
                Get Started Free
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="xl"
              className="border-white text-white hover:bg-white/10"
            >
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
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
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white">GDPR</a></li>
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