"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  MessageSquare, 
  Shield, 
  Users, 
  Globe, 
  Award, 
  Target,
  Heart,
  Building,
  Clock,
  Zap
} from "lucide-react";
import Button from "../../components/common/Button";

export default function AboutPage() {
  const values = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Empathy First",
      description: "We understand the emotional value of voice memories."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Security & Trust",
      description: "Your memories deserve the highest level of protection."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Accessibility",
      description: "Voice preservation should be available to everyone."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Innovation",
      description: "Continuously improving how we preserve memories."
    }
  ];

  const milestones = [
    { year: "2023", event: "SureTalk founded with a vision to preserve voices" },
    { year: "2024", event: "Launched MVP with AWS integration" },
    { year: "2024", event: "First 1,000 users onboarded" },
    { year: "2025", event: "Expanded to family and business plans" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              About <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">SureTalk</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10">
              We're on a mission to preserve the most human form of communication—your voice—for generations to come.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="px-8">
                  Get in Touch
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" size="lg" className="px-8">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-3xl p-8 md:p-12 shadow-xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Our Mission
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  At SureTalk, we believe voices carry more than just words—they carry emotion, personality, and legacy. 
                  In a world of text messages and emails, we're preserving the most human form of communication.
                </p>
                <p className="text-lg text-gray-600">
                  Founded in 2023, we've grown from a simple idea into a platform trusted by thousands to safeguard their 
                  most precious voice memories, from personal notes to family legacies and business communications.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass rounded-2xl p-6 text-center">
                    <div className="text-3xl font-bold text-brand-600 mb-2">1,000+</div>
                    <div className="text-gray-600">Active Users</div>
                  </div>
                  <div className="glass rounded-2xl p-6 text-center">
                    <div className="text-3xl font-bold text-accent-500 mb-2">10K+</div>
                    <div className="text-gray-600">Voice Notes</div>
                  </div>
                  <div className="glass rounded-2xl p-6 text-center">
                    <div className="text-3xl font-bold text-purple-500 mb-2">15+</div>
                    <div className="text-gray-600">Countries</div>
                  </div>
                  <div className="glass rounded-2xl p-6 text-center">
                    <div className="text-3xl font-bold text-green-500 mb-2">99.9%</div>
                    <div className="text-gray-600">Uptime</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do at SureTalk
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mx-auto mb-6">
                  <div className="text-white">
                    {value.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From idea to trusted voice preservation platform
            </p>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-brand-500 to-accent-500"></div>
            
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`flex items-center mb-12 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`glass rounded-2xl p-6 w-5/12 ${index % 2 === 0 ? 'mr-auto' : 'ml-auto'}`}>
                  <div className="flex items-center mb-3">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 mr-3"></div>
                    <span className="text-lg font-bold text-brand-600">{milestone.year}</span>
                  </div>
                  <p className="text-gray-700">{milestone.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team CTA */}
      <section className="py-20 bg-gradient-to-r from-brand-600 to-accent-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Join Us on This Journey
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Whether you're a user preserving memories or someone who believes in our mission, we'd love to connect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="xl" className="bg-white text-brand-600 hover:bg-gray-100">
                Contact Our Team
              </Button>
            </Link>
            <Link href="/careers">
              <Button 
                variant="outline" 
                size="xl"
                className="border-white text-white hover:bg-white/10"
              >
                View Careers
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}