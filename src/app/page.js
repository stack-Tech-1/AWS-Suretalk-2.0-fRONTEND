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
  Globe,
  Sparkles,
  Star
} from "lucide-react";
import { Dialog } from '@headlessui/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import Button from "../components/common/Button";
import Waveform from "../components/audio/Waveform";
import { useLanguage } from "../contexts/LanguageContext";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();

  const features = [
    {
      icon: <Mic className="w-6 h-6" />,
      title: t('home.features.voice.title'),
      description: t('home.features.voice.desc'),
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: t('home.features.schedule.title'),
      description: t('home.features.schedule.desc'),
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: t('home.features.secure.title'),
      description: t('home.features.secure.desc'),
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: t('home.features.contacts.title'),
      description: t('home.features.contacts.desc'),
      color: "from-orange-500 to-red-500",
    },
  ];

  const tiers = [
    {
      name: t('home.pricing.lite.name'),
      price: t('home.pricing.lite.price'),
      period: t('home.pricing.lite.period'),
      description: t('home.pricing.lite.desc'),
      features: [
        t('home.pricing.lite.f1'),
        t('home.pricing.lite.f2'),
        t('home.pricing.lite.f3'),
        t('home.pricing.lite.f4'),
        t('home.pricing.lite.f5'),
      ],
      buttonText: t('home.pricing.lite.btn'),
      highlighted: false,
      color: "blue",
    },
    {
      name: t('home.pricing.essential.name'),
      price: t('home.pricing.essential.price'),
      period: t('home.pricing.essential.period'),
      description: t('home.pricing.essential.desc'),
      features: [
        t('home.pricing.essential.f1'),
        t('home.pricing.essential.f2'),
        t('home.pricing.essential.f3'),
        t('home.pricing.essential.f4'),
        t('home.pricing.essential.f5'),
        t('home.pricing.essential.f6'),
      ],
      buttonText: t('home.pricing.essential.btn'),
      highlighted: true,
      color: "purple",
    },
    {
      name: t('home.pricing.premium.name'),
      price: t('home.pricing.premium.price'),
      period: t('home.pricing.premium.period'),
      description: t('home.pricing.premium.desc'),
      features: [
        t('home.pricing.premium.f1'),
        t('home.pricing.premium.f2'),
        t('home.pricing.premium.f3'),
        t('home.pricing.premium.f4'),
        t('home.pricing.premium.f5'),
        t('home.pricing.premium.f6'),
      ],
      buttonText: t('home.pricing.premium.btn'),
      highlighted: false,
      color: "amber",
    },
  ];

  const audienceTypes = [
    {
      icon: <User className="w-8 h-8" />,
      title: t('home.audience.individuals.title'),
      description: t('home.audience.individuals.desc'),
      features: [
        t('home.audience.individuals.f1'),
        t('home.audience.individuals.f2'),
        t('home.audience.individuals.f3'),
      ]
    },
    {
      icon: <UsersGroup className="w-8 h-8" />,
      title: t('home.audience.families.title'),
      description: t('home.audience.families.desc'),
      features: [
        t('home.audience.families.f1'),
        t('home.audience.families.f2'),
        t('home.audience.families.f3'),
      ]
    },
    {
      icon: <Building className="w-8 h-8" />,
      title: t('home.audience.businesses.title'),
      description: t('home.audience.businesses.desc'),
      features: [
        t('home.audience.businesses.f1'),
        t('home.audience.businesses.f2'),
        t('home.audience.businesses.f3'),
      ]
    }
  ];

  const trustIndicators = [
    { icon: <Shield className="w-5 h-5" />, text: t('home.trust.encryption') },
    { icon: <Cloud className="w-5 h-5" />, text: t('home.trust.storage') },
    { icon: <Globe className="w-5 h-5" />, text: t('home.trust.gdpr') },
    { icon: <Zap className="w-5 h-5" />, text: t('home.trust.uptime') },
    { icon: <Lock className="w-5 h-5" />, text: t('home.trust.kms') },
    { icon: <MessageSquare className="w-5 h-5" />, text: t('home.trust.e2e') }
  ];

  const howItWorksSteps = [
    {
      step: "01",
      title: t('home.how.step1.title'),
      description: t('home.how.step1.desc'),
      icon: <Mic className="w-8 h-8" />,
    },
    {
      step: "02",
      title: t('home.how.step2.title'),
      description: t('home.how.step2.desc'),
      icon: <Users className="w-8 h-8" />,
    },
    {
      step: "03",
      title: t('home.how.step3.title'),
      description: t('home.how.step3.desc'),
      icon: <Shield className="w-8 h-8" />,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-white/20 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-display font-bold gradient-text tracking-tight">SureTalk</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-brand-600 font-medium transition-colors">
                {t('nav.features')}
              </a>
              <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-brand-600 font-medium transition-colors">
                {t('nav.pricing')}
              </a>
              <a href="#how-it-works" className="text-gray-700 dark:text-gray-300 hover:text-brand-600 font-medium transition-colors">
                {t('nav.howItWorks')}
              </a>
              <a href="#audience" className="text-gray-700 dark:text-gray-300 hover:text-brand-600 font-medium transition-colors">
                {t('nav.whoUsesIt')}
              </a>
              <Link
                href="/login"
                className="text-gray-700 dark:text-gray-300 hover:text-brand-600 font-medium transition-colors"
              >
                {t('nav.signIn')}
              </Link>
              <button
                onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
                className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                title={lang === 'en' ? t('nav.switchToSpanish') : t('nav.switchToEnglish')}
              >
                {lang === 'en' ? 'ES' : 'EN'}
              </button>
              <Link
                href="/signup"
                className="btn-primary rounded-full px-6 py-2.5"
              >
                {t('nav.getStartedFree')}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-xl p-2.5 text-gray-700 hover:bg-gray-100/50 transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">{t('nav.openMenu')}</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Mobile Menu Dialog */}
        <Dialog
          as="div"
          className="md:hidden relative z-50"
          open={mobileMenuOpen}
          onClose={setMobileMenuOpen}
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
                  <span className="sr-only">{t('nav.closeMenu')}</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-8 flow-root">
                <div className="-my-6 divide-y divide-gray-200/50">
                  <div className="space-y-1 py-6">
                    {[
                      { href: '#features', label: t('nav.features') },
                      { href: '#pricing', label: t('nav.pricing') },
                      { href: '#how-it-works', label: t('nav.howItWorks') },
                      { href: '#audience', label: t('nav.whoUsesIt') },
                    ].map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="-mx-3 block rounded-xl px-3 py-3 text-lg font-semibold text-gray-900 hover:bg-white/50 hover:shadow-sm transition-all duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </a>
                    ))}
                    <Link
                      href="/login"
                      className="-mx-3 block rounded-xl px-3 py-3 text-lg font-semibold text-gray-900 hover:bg-white/50 hover:shadow-sm transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.signIn')}
                    </Link>
                    <button
                      onClick={() => { setLang(lang === 'en' ? 'es' : 'en'); setMobileMenuOpen(false); }}
                      className="-mx-3 block w-full text-left rounded-xl px-3 py-3 text-lg font-semibold text-brand-600 hover:bg-white/50 hover:shadow-sm transition-all duration-200"
                    >
                      {lang === 'en' ? 'Cambiar a Español' : 'Switch to English'}
                    </button>
                  </div>

                  <div className="py-6">
                    <Link
                      href="/signup"
                      className="w-full inline-flex items-center justify-center px-6 py-3.5 text-lg font-semibold rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 text-white hover:shadow-lg hover:scale-[1.02] transform transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.getStartedFree')}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200/50">
                <p className="text-sm text-gray-500 text-center">
                  {t('nav.secureTagline')}
                </p>
              </div>
            </motion.div>
          </Dialog.Panel>
        </Dialog>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04] dark:opacity-[0.06]">
            <Waveform barCount={32} height={220} isActive={true} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/25 text-brand-700 dark:text-brand-300 text-sm font-medium mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t('home.badge')}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="font-display font-bold text-gray-900 dark:text-white mb-6 leading-[1.05]"
                style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)' }}>
              {t('home.heroTitle1')}<br />
              <span className="gradient-text-animated">
                {t('home.heroTitle2')}
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              {t('home.heroSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/signup">
                <motion.span
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary btn-pill inline-flex items-center gap-2"
                >
                  {t('home.ctaPrimary')}
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </Link>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-secondary rounded-full px-8 py-3 text-base flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                {t('home.ctaDemo')}
              </motion.button>
            </div>

            {/* Social proof strip */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-16 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-2">
                  {['#6366f1','#7c3aed','#0ea5e9','#10b981'].map((c, i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-xs font-bold"
                         style={{ background: c }}>
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <span>{t('home.usersCount')}</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1"><strong className="text-gray-700 dark:text-gray-200">4.9</strong> {t('home.rating')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-green-500" />
                <span>{t('home.encrypted')}</span>
              </div>
            </div>
          </motion.div>

          {/* Hero App Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-4xl mx-auto"
            style={{ perspective: '1200px' }}
          >
            <motion.div
              style={{ rotateX: 4, rotateY: -2 }}
              className="rounded-2xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.18)] dark:shadow-[0_40px_80px_rgba(0,0,0,0.5)] border border-white/30 dark:border-white/10"
            >
              {/* Browser chrome */}
              <div className="bg-[#1a1f2e] px-4 pt-3 pb-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/90" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/90" />
                  <div className="w-3 h-3 rounded-full bg-green-500/90" />
                </div>
                <div className="flex-1 mx-3 h-6 rounded-md bg-white/10 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">app.suretalk.com/dashboard</span>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="bg-[#0d1117] p-5">
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: t('dash.voiceNotes'), value: '24', color: '#5B4CF5' },
                    { label: t('dash.contacts'), value: '9', color: '#0EA5E9' },
                    { label: t('dash.storage'), value: '2.4 GB', color: '#7c3aed' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="text-2xl font-display font-bold text-white mb-0.5">{s.value}</div>
                      <div className="text-xs" style={{ color: s.color }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2.5">
                  {[
                    { title: 'Message to Sarah', duration: '1:24', date: t('common.today') },
                    { title: 'Family update — July', duration: '3:07', date: t('common.yesterday') },
                    { title: 'Voice Will — 2024', duration: '12:41', date: t('common.permanent') },
                  ].map((note, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl p-3"
                         style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                             style={{ background: i === 2 ? 'rgba(124,58,237,0.2)' : 'rgba(14,165,233,0.15)' }}>
                          {i === 2 ? (
                            <Shield className="w-4 h-4 text-purple-400" />
                          ) : (
                            <Mic className="w-4 h-4 text-audio-400" style={{ color: '#38bdf8' }} />
                          )}
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium">{note.title}</div>
                          <div className="text-gray-500 text-xs">{note.date} · {note.duration}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-[2px] h-5">
                          {[3,6,4,8,5,7,3,9,6,4].map((h, j) => (
                            <div key={j} className="w-[2px] rounded-full bg-current opacity-40"
                                 style={{ height: `${h * 2}px`, color: i === 2 ? '#a78bfa' : '#38bdf8' }} />
                          ))}
                        </div>
                        <button className="w-7 h-7 rounded-full flex items-center justify-center"
                                style={{ background: i === 2 ? 'rgba(124,58,237,0.25)' : 'rgba(14,165,233,0.2)' }}>
                          <Play className="w-3 h-3 ml-0.5" style={{ color: i === 2 ? '#a78bfa' : '#38bdf8' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -right-4 px-3 py-2 rounded-xl text-sm font-semibold text-white shadow-lg hidden md:flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #5B4CF5, #7c3aed)' }}
            >
              <Shield className="w-4 h-4" />
              {t('home.endToEndBadge')}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators Section */}
      <section className="py-12 bg-gradient-to-r from-brand-50/60 to-accent-50/60 dark:from-brand-500/5 dark:to-accent-500/5 border-y border-brand-100/50 dark:border-brand-500/10">
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
                  <div className="text-white">{item.icon}</div>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.features.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t('home.features.subtitle')}
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
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6`}>
                  <div className="text-white">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Uses SureTalk Section */}
      <section id="audience" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.audience.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t('home.audience.subtitle')}
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
                  <div className="text-white">{audience.icon}</div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{audience.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{audience.description}</p>
                <ul className="space-y-2">
                  {audience.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700 dark:text-gray-300">
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

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.how.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t('home.how.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorksSteps.map((item, index) => (
              <div key={index} className="relative">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.2 }}
                  className="glass rounded-2xl p-8 shadow-lg relative z-10 border border-white/20"
                >
                  <div className="text-5xl font-bold text-gray-200/50 mb-4">{item.step}</div>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mb-6">
                    <div className="text-white">{item.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
                </motion.div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-0">
                    <ArrowRight className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.pricing.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t('home.pricing.subtitle')}
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
                      {t('home.pricing.mostPopular')}
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
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">{tier.price}</span>
                    <span className="text-gray-600 dark:text-gray-400 ml-2">{tier.period}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{tier.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/signup">
                  <Button variant={tier.highlighted ? "primary" : "secondary"} fullwidth="true" size="lg">
                    {tier.buttonText}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 dark:text-gray-400">
              {t('home.pricing.footnote')}
              <br />
              {t('home.pricing.customPlan')}{" "}
              <a href="#" className="text-brand-600 hover:text-brand-700 font-medium">
                {t('home.pricing.contactSales')}
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-brand-600 to-accent-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="xl" className="bg-white text-brand-600 hover:bg-gray-100 hover:scale-105 transform transition-all">
                {t('home.cta.primary')}
              </Button>
            </Link>
            <Button
              variant="outline"
              size="xl"
              className="border-white text-white hover:bg-white/10 hover:scale-105 transform transition-all"
            >
              {t('home.cta.secondary')}
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
              <p className="text-gray-400">{t('home.footer.tagline')}</p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">{t('home.footer.product')}</h3>
              <ul className="space-y-2">
                <li><Link href="/features" className="hover:text-white transition-colors">{t('home.footer.features')}</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">{t('home.footer.pricing')}</Link></li>
                <li><Link href="/api" className="hover:text-white transition-colors">{t('home.footer.api')}</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">{t('home.footer.docs')}</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">{t('home.footer.company')}</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="hover:text-white transition-colors">{t('home.footer.about')}</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">{t('home.footer.careers')}</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">{t('home.footer.blog')}</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">{t('home.footer.contact')}</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">{t('home.footer.legal')}</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="hover:text-white transition-colors">{t('home.footer.privacy')}</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">{t('home.footer.terms')}</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors">{t('home.footer.cookies')}</Link></li>
                <li><Link href="/gdpr" className="hover:text-white transition-colors">{t('home.footer.gdpr')}</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} SureTalk. {t('home.footer.copyright')}
              <br />
              <span className="text-sm">{t('home.footer.secured')}</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
