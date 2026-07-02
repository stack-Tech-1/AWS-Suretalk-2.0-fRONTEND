"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  MessageSquare,
  Shield,
  Mic,
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  Phone,
  Heart,
  UserCheck,
  Baby,
  HandHeart,
  Lock,
  Cloud,
  Zap,
  Globe,
  Star,
  ChevronDown,
  Archive,
  FileText,
  Calendar,
  Menu,
  X,
  Smartphone,
  PhoneCall,
  Sun,
  Moon,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import LogoIcon from "../components/common/LogoIcon";
import { useTheme } from "../hooks/useTheme";

// ─── SPRING PRESETS ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const { lang, setLang, t } = useLanguage();
  const { darkMode, toggleDarkMode, mounted } = useTheme();

  // ─── CURSOR PARALLAX ──────────────────────────────────────────────────
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  useEffect(() => {
    const onMove = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - rect.left - rect.width / 2) / rect.width,
        y: (e.clientY - rect.top - rect.height / 2) / rect.height,
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // ─── PRICING TIERS ────────────────────────────────────────────────────
  const tiers = [
    {
      id: "LITE",
      name: t("home.pricing.lite.name"),
      price: "$0",
      period: t("home.pricing.lite.period"),
      description: t("home.pricing.lite.desc"),
      features: [
        t("home.pricing.lite.f1"),
        t("home.pricing.lite.f2"),
        t("home.pricing.lite.f3"),
        t("home.pricing.lite.f4"),
        t("home.pricing.lite.f5"),
      ],
      buttonText: t("home.pricing.lite.btn2"),
      buttonHref: "/signup",
      highlighted: false,
      badge: null,
      accentClass: "from-blue-500 to-cyan-500",
    },
    {
      id: "ESSENTIAL",
      name: t("home.pricing.essential.name"),
      price: "$6.99",
      period: t("home.pricing.essential.period"),
      description: t("home.pricing.essential.desc"),
      features: [
        t("home.pricing.essential.f1"),
        t("home.pricing.essential.f2"),
        t("home.pricing.essential.f3"),
        t("home.pricing.essential.f4"),
        t("home.pricing.essential.f5"),
        t("home.pricing.essential.f6"),
      ],
      buttonText: t("home.pricing.essential.btn2"),
      buttonHref: "/signup?plan=ESSENTIAL",
      highlighted: true,
      badge: t("home.pricing.mostPopular"),
      accentClass: "from-brand-500 to-accent-500",
    },
    {
      id: "PREMIUM",
      name: t("home.pricing.premium.name2"),
      price: "$12.99",
      period: t("home.pricing.premium.period"),
      description: t("home.pricing.premium.desc"),
      features: [
        t("home.pricing.premium.f1"),
        t("home.pricing.premium.f2"),
        t("home.pricing.premium.f3"),
        t("home.pricing.premium.f4"),
        t("home.pricing.premium.f5"),
        t("home.pricing.premium.f6"),
      ],
      buttonText: t("home.pricing.premium.btn2"),
      buttonHref: "/signup?plan=PREMIUM",
      highlighted: false,
      badge: null,
      accentClass: "from-amber-500 to-orange-500",
    },
  ];

  // ─── USE CASES ────────────────────────────────────────────────────────
  const useCases = [
    { icon: <Heart className="w-7 h-7" />, title: t("home.uc.families.title"), desc: t("home.uc.families.desc"), color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" },
    { icon: <UserCheck className="w-7 h-7" />, title: t("home.uc.seniors.title"), desc: t("home.uc.seniors.desc"), color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
    { icon: <Baby className="w-7 h-7" />, title: t("home.uc.parents.title"), desc: t("home.uc.parents.desc"), color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
    { icon: <HandHeart className="w-7 h-7" />, title: t("home.uc.caregivers.title"), desc: t("home.uc.caregivers.desc"), color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
    { icon: <PhoneCall className="w-7 h-7" />, title: t("home.uc.incarceration.title"), desc: t("home.uc.incarceration.desc"), color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
    { icon: <Archive className="w-7 h-7" />, title: t("home.uc.legacy.title"), desc: t("home.uc.legacy.desc"), color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" },
  ];

  // ─── STEPS ─────────────────────────────────────────────────────────────
  const steps = [
    { num: "01", title: t("home.how.step1.title"), desc: t("home.how.step1.desc"), icon: <UserCheck className="w-6 h-6" /> },
    { num: "02", title: t("home.how.step2.title"), desc: t("home.how.step2.desc"), icon: <Mic className="w-6 h-6" /> },
    { num: "03", title: t("home.how.step3.title"), desc: t("home.how.step3.desc"), icon: <Users className="w-6 h-6" /> },
    { num: "04", title: t("home.how.step4.title"), desc: t("home.how.step4.desc"), icon: <Phone className="w-6 h-6" /> },
    { num: "05", title: t("home.how.step5.title"), desc: t("home.how.step5.desc"), icon: <Zap className="w-6 h-6" /> },
  ];

  // ─── TESTIMONIALS ─────────────────────────────────────────────────────
  const testimonials = [
    { quote: t("home.testimonials.t1"), name: t("home.testimonials.n1"), role: "SureTalk LITE" },
    { quote: t("home.testimonials.t2"), name: t("home.testimonials.n2"), role: "SureTalk Essential" },
    { quote: t("home.testimonials.t3"), name: t("home.testimonials.n3"), role: "Legacy Vault Premium" },
  ];

  // ─── FAQ ──────────────────────────────────────────────────────────────
  const faqs = [
    { q: t("home.faq.q1"), a: t("home.faq.a1") },
    { q: t("home.faq.q2"), a: t("home.faq.a2") },
    { q: t("home.faq.q3"), a: t("home.faq.a3") },
    { q: t("home.faq.q4"), a: t("home.faq.a4") },
    { q: t("home.faq.q5"), a: t("home.faq.a5") },
  ];

  // ─── WORKS ON ─────────────────────────────────────────────────────────
  const worksOn = [
    { icon: <Phone className="w-5 h-5" />, label: t("home.works.cell") },
    { icon: <PhoneCall className="w-5 h-5" />, label: t("home.works.landline") },
    { icon: <Smartphone className="w-5 h-5" />, label: t("home.works.smart") },
    { icon: <Globe className="w-5 h-5" />, label: t("home.works.lang") },
  ];

  // ─── TRUST INDICATORS ──────────────────────────────────────────────────
  const trust = [
    { icon: <Shield className="w-4 h-4" />, text: t("home.trust.encryption") },
    { icon: <Cloud className="w-4 h-4" />, text: t("home.trust.storage") },
    { icon: <Globe className="w-4 h-4" />, text: t("home.trust.gdpr") },
    { icon: <Zap className="w-4 h-4" />, text: t("home.trust.uptime") },
    { icon: <Lock className="w-4 h-4" />, text: t("home.trust.kms") },
    { icon: <MessageSquare className="w-4 h-4" />, text: t("home.trust.e2e") },
  ];

  const navLinks = [
    { label: t("nav.features"), href: "#features" },
    { label: t("nav.pricing"), href: "#pricing" },
    { label: t("nav.legacyVault"), href: "/legacy-vault" },
    { label: t("nav.howItWorks"), href: "#how-it-works" },
  ];

  // ─── RENDER ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden">

      {/* ─── ANIMATED BACKGROUND MESH ────────────────────────────────── */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50/30 via-white/40 to-accent-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900" />
        {/* Moving orbs */}
        <motion.div
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-brand-400/20 blur-3xl"
          animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0] }}
          transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-30%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-400/20 blur-3xl"
          animate={{ x: [0, -50, 30, 0], y: [0, 30, -40, 0] }}
          transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full bg-indigo-400/10 blur-3xl"
          animate={{ x: [0, 40, -30, 0], y: [0, -20, 30, 0] }}
          transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
        />
        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-brand-500/30 dark:bg-brand-300/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              repeat: Infinity,
              duration: 6 + Math.random() * 8,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* ─── NAVBAR ────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/30 dark:border-gray-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
              <LogoIcon size={36} />
              <span className="text-xl font-bold text-gray-900 dark:text-white">SureTalk</span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) =>
                link.href.startsWith("#") ? (
                  <a key={link.label} href={link.href} className="text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium text-sm transition-colors">
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.label} href={link.href} className="text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium text-sm transition-colors">
                    {link.label}
                  </Link>
                )
              )}
              <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium text-sm transition-colors">
                {t("nav.signIn")}
              </Link>
              <button
                onClick={() => setLang(lang === "en" ? "es" : "en")}
                className="text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {lang === "en" ? "ES" : "EN"}
              </button>
              {mounted && (
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {darkMode ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4" />}
                </button>
              )}
              <Link href="/signup" className="btn-primary px-5 py-2 text-sm shadow-md hover:shadow-lg transition-shadow">
                {t("nav.startFree")}
              </Link>
            </div>

            <button
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden fixed inset-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200/30 dark:border-gray-700/30">
                <span className="text-xl font-bold text-gray-900 dark:text-white">SureTalk</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg text-gray-600 dark:text-gray-400">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {navLinks.map((link) =>
                  link.href.startsWith("#") ? (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block text-lg font-medium text-gray-700 dark:text-gray-200">
                      {link.label}
                    </a>
                  ) : (
                    <Link key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block text-lg font-medium text-gray-700 dark:text-gray-200">
                      {link.label}
                    </Link>
                  )
                )}
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-medium text-gray-700 dark:text-gray-200">
                  {t("nav.signIn")}
                </Link>
                <div className="pt-4 space-y-3">
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="btn-primary block text-center py-3">
                    {t("nav.startFree")}
                  </Link>
                  <button
                    onClick={() => { setLang(lang === "en" ? "es" : "en"); setMobileMenuOpen(false); }}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl py-3 text-sm font-bold text-gray-600 dark:text-gray-300"
                  >
                    {lang === "en" ? "Cambiar a Español" : "Switch to English"}
                  </button>
                  {mounted && (
                    <button
                      onClick={() => { toggleDarkMode(); setMobileMenuOpen(false); }}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-xl py-3 text-sm font-bold text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2"
                    >
                      {darkMode ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4" />}
                      {darkMode ? "Light Mode" : "Dark Mode"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── HERO ──────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative overflow-hidden pt-20 pb-24"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, rgba(59,130,246,0.08), transparent 70%)",
        }}
      >
        {/* Hero glow orbs with parallax */}
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-brand-400/20 rounded-full blur-3xl"
          animate={{ x: mousePos.x * -20, y: mousePos.y * -20 }}
          transition={{ type: "spring", stiffness: 150, damping: 30 }}
        />
        <motion.div
          className="absolute top-20 -left-40 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl"
          animate={{ x: mousePos.x * 20, y: mousePos.y * 20 }}
          transition={{ type: "spring", stiffness: 150, damping: 30 }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-6"
          >
            <LogoIcon size={80} className="drop-shadow-2xl" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50/70 dark:bg-brand-900/30 backdrop-blur-sm border border-brand-200/50 dark:border-brand-700/50 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">{t("home.endToEndBadge")}</span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white leading-tight mb-6"
          >
            {t("home.heroHeadline1")}<br />
            <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
              {t("home.heroHeadline2")}
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            {t("home.heroSub")}
          </motion.p>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <motion.div variants={fadeUp}>
              <Link href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-600 to-accent-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg"
              >
                {t("home.ctaPrimary")}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            <motion.div variants={fadeUp}>
              <a href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white/50 dark:hover:bg-gray-800/50 backdrop-blur-sm transition-all duration-300 text-lg"
              >
                {t("home.ctaDemo")}
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          >
            {trust.map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                <span className="text-brand-500">{item.icon}</span>
                {item.text}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── WORKS ON STRIP ────────────────────────────────────────────── */}
      <section className="bg-brand-600 dark:bg-brand-700 py-6 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-4 md:gap-10"
          >
            <span className="text-white/80 font-semibold text-sm tracking-wide uppercase">{t("home.worksOn")}</span>
            {worksOn.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="flex items-center gap-2 text-white font-medium"
              >
                {item.icon}
                {item.label}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── EMOTIONAL VALUE ────────────────────────────────────────────── */}
      <section className="py-24 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {t("home.ev.title")}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-gray-600 dark:text-gray-400 mb-8">{t("home.ev.intro")}</motion.p>
            <motion.ul variants={staggerContainer} className="inline-flex flex-col items-start gap-4 text-left mx-auto mb-10">
              {[t("home.ev.p1"), t("home.ev.p2"), t("home.ev.p3"), t("home.ev.p4"), t("home.ev.p5")].map((item, i) => (
                <motion.li key={i} variants={fadeUp} className="flex items-center gap-3 text-lg text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-6 h-6 text-brand-500 flex-shrink-0" />
                  {item}
                </motion.li>
              ))}
            </motion.ul>
            <motion.p variants={fadeUp} className="text-2xl font-bold bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
              {t("home.ev.tagline")}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ───────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t("home.how.title")}</motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-gray-600 dark:text-gray-400">{t("home.how.subtitle")}</motion.p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="relative flex flex-col items-center text-center p-4 rounded-2xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-brand-300 to-accent-300 dark:from-brand-700 dark:to-accent-700" />
                )}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-brand-500/25 relative z-10">
                  {step.icon}
                </div>
                <div className="text-xs font-bold text-brand-500 mb-1">{step.num}</div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── USE CASES ──────────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t("home.uc.title")}</motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{t("home.uc.subtitle")}</motion.p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((uc, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="p-6 rounded-2xl border border-gray-200/30 dark:border-gray-800/30 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm hover:shadow-2xl transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${uc.color}`}>
                  {uc.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{uc.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{uc.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-brand-600 font-semibold mb-3">{t("home.slogan")}</motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t("home.pricing.title")}</motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{t("home.pricing.subtitle")}</motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className={`relative rounded-3xl p-8 backdrop-blur-md ${
                  tier.highlighted
                    ? "bg-gradient-to-br from-brand-600 to-accent-600 text-white shadow-2xl shadow-brand-500/30 scale-105 border border-white/20"
                    : "bg-white/70 dark:bg-gray-800/70 border border-gray-200/30 dark:border-gray-700/30 shadow-lg"
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-white text-brand-600 text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-sm font-bold tracking-wider uppercase mb-3 ${tier.highlighted ? "text-white/70" : "text-gray-500 dark:text-gray-400"}`}>
                    {tier.name}
                  </h3>
                  <div className="flex items-end gap-1 mb-2">
                    <span className={`text-5xl font-bold ${tier.highlighted ? "text-white" : "text-gray-900 dark:text-white"}`}>{tier.price}</span>
                    {tier.period !== "forever" && (
                      <span className={`text-sm mb-2 ${tier.highlighted ? "text-white/70" : "text-gray-500 dark:text-gray-400"}`}>/{tier.period}</span>
                    )}
                  </div>
                  <p className={`text-sm ${tier.highlighted ? "text-white/80" : "text-gray-600 dark:text-gray-400"}`}>{tier.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tier.highlighted ? "text-white/80" : "text-brand-500"}`} />
                      <span className={tier.highlighted ? "text-white/90" : "text-gray-700 dark:text-gray-300"}>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link href={tier.buttonHref}
                  className={`block text-center py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    tier.highlighted
                      ? "bg-white text-brand-600 hover:bg-gray-100 hover:scale-105 shadow-lg"
                      : "bg-gradient-to-r from-brand-600 to-accent-500 text-white hover:shadow-2xl hover:shadow-brand-500/25 hover:scale-105"
                  }`}
                >
                  {tier.buttonText}
                </Link>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">{t("home.pricing.footnote")}</p>
        </div>
      </section>

      {/* ─── TESTIMONIALS ───────────────────────────────────────────────── */}
      <section className="py-24 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t("home.testimonials.title")}</motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-gray-600 dark:text-gray-400">{t("home.testimonials.subtitle")}</motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-gray-50/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/30 dark:border-gray-800/30 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="text-5xl text-brand-200 dark:text-brand-800 font-serif leading-none mb-2">"</div>
                <p className="text-gray-800 dark:text-gray-100 font-medium text-lg leading-relaxed mb-6">
                  {item.quote}
                </p>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-sm text-brand-600 dark:text-brand-400">{item.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t("home.faq.title")}</motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-gray-600 dark:text-gray-400">{t("home.faq.subtitle")}</motion.p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/30 dark:border-gray-700/30 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="font-semibold text-gray-900 dark:text-white pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-gray-600 dark:text-gray-400 leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-brand-600 to-accent-600 relative overflow-hidden">
        {/* Animated background shapes */}
        <motion.div
          className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-2xl"
          animate={{ x: [0, 30, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-2xl"
          animate={{ x: [0, -40, 30, 0], y: [0, 40, -30, 0] }}
          transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
        />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t("home.finalCta.title")}</h2>
            <p className="text-xl text-white/80 mb-10">{t("home.finalCta.sub")}</p>
            <Link href="/signup"
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-brand-600 font-bold rounded-xl hover:bg-gray-50 hover:scale-105 transition-all duration-300 text-lg shadow-xl"
            >
              {t("home.finalCta.btn")}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <LogoIcon size={36} />
                <span className="text-white font-bold text-lg">SureTalk</span>
              </div>
              <p className="text-sm leading-relaxed mb-4">{t("home.footer.tagline")}</p>
              <p className="text-brand-400 font-semibold text-sm">{t("home.slogan")}</p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">{t("home.footer.product")}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">{t("home.footer.features")}</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">{t("home.footer.pricing")}</a></li>
                <li><Link href="/legacy-vault" className="hover:text-white transition-colors">{t("nav.legacyVault")}</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors">{t("nav.startFree")}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">{t("home.footer.company")}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">{t("home.footer.about")}</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">{t("home.footer.contact")}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">{t("home.footer.legal")}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">{t("home.footer.privacy")}</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">{t("home.footer.terms")}</Link></li>
              </ul>
              <div className="mt-6">
                <p className="text-xs mb-2">Support:</p>
                <a href="mailto:contact@suretalknow.com" className="text-brand-400 hover:text-brand-300 text-sm transition-colors">contact@suretalknow.com</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">© {new Date().getFullYear()} SureTalk. {t("home.footer.copyright")}</p>
            <p className="text-sm text-gray-500">{t("home.footer.secured")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}