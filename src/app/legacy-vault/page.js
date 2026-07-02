"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Archive,
  FileText,
  Calendar,
  Shield,
  ArrowRight,
  CheckCircle,
  MessageSquare,
  UserCheck,
  Mic,
  Clock,
  Star,
  Lock,
} from "lucide-react";
import Navbar from "../../components/common/Navbar";
import { useLanguage } from "../../contexts/LanguageContext";

export default function LegacyVaultPage() {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Archive className="w-7 h-7" />,
      title: t("vault.lp.f1.title"),
      desc: t("vault.lp.f1.desc"),
      color: "from-indigo-500 to-brand-600",
    },
    {
      icon: <FileText className="w-7 h-7" />,
      title: t("vault.lp.f2.title"),
      desc: t("vault.lp.f2.desc"),
      color: "from-brand-500 to-accent-500",
    },
    {
      icon: <Calendar className="w-7 h-7" />,
      title: t("vault.lp.f3.title"),
      desc: t("vault.lp.f3.desc"),
      color: "from-accent-500 to-purple-600",
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: t("vault.lp.f4.title"),
      desc: t("vault.lp.f4.desc"),
      color: "from-emerald-500 to-teal-600",
    },
  ];

  const steps = [
    {
      num: "01",
      icon: <UserCheck className="w-6 h-6" />,
      title: t("vault.lp.how.s1"),
      desc: t("vault.lp.how.s1d"),
    },
    {
      num: "02",
      icon: <Mic className="w-6 h-6" />,
      title: t("vault.lp.how.s2"),
      desc: t("vault.lp.how.s2d"),
    },
    {
      num: "03",
      icon: <Clock className="w-6 h-6" />,
      title: t("vault.lp.how.s3"),
      desc: t("vault.lp.how.s3d"),
    },
  ];

  const included = [
    t("home.pricing.premium.f1"),
    t("home.pricing.premium.f2"),
    t("home.pricing.premium.f3"),
    t("home.pricing.premium.f4"),
    t("home.pricing.premium.f5"),
    t("home.pricing.premium.f6"),
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar type="landing" />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-accent-800 py-28">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-32 w-96 h-96 bg-brand-400/20 rounded-full blur-3xl" />
          {/* Star field effect */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-8">
            <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span className="text-sm font-semibold text-white">{t("vault.lp.badge")}</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold text-white leading-tight mb-2">
            {t("vault.lp.headline")}
          </motion.h1>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
            className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
              {t("vault.lp.headline2")}
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-white/80 mb-10">
            {t("vault.lp.sub")}
          </motion.p>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup?plan=PREMIUM"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-700 font-bold rounded-xl hover:bg-gray-50 hover:scale-105 transition-all duration-200 text-lg shadow-xl">
              {t("vault.lp.cta")}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.45 }}
            className="mt-4 text-white/60 text-sm">
            {t("vault.lp.ctaSub")}
          </motion.p>
        </div>
      </section>

      {/* ── WHAT'S INCLUDED ───────────────────────────────────────────────── */}
      <section className="py-10 bg-gray-900 dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">{t("vault.lp.included")}</p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {included.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-200 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t("vault.lp.f1.title")} & More
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-8">
            {features.map((feat, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex gap-5 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-900">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-white flex-shrink-0 shadow-lg`}>
                  {feat.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feat.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t("vault.lp.how.title")}</h2>
          </div>

          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex items-start gap-6 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-brand-500 mb-1">{step.num}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-brand-700 to-accent-700">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <Lock className="w-12 h-12 text-white/60 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t("vault.lp.bottomCta")}</h2>
            <p className="text-xl text-white/80 mb-8">{t("vault.lp.ctaSub")}</p>
            <Link href="/signup?plan=PREMIUM"
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-brand-700 font-bold rounded-xl hover:bg-gray-50 hover:scale-105 transition-all duration-200 text-lg shadow-xl">
              {t("vault.lp.cta")}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold">SureTalk</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/#pricing" className="hover:text-white transition-colors">{t("home.footer.pricing")}</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">{t("home.footer.privacy")}</Link>
            <Link href="/terms" className="hover:text-white transition-colors">{t("home.footer.terms")}</Link>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} SureTalk. {t("home.footer.copyright")}</p>
        </div>
      </footer>
    </div>
  );
}
