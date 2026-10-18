import { motion } from "framer-motion";
import Head from "next/head";
import LogoIcon from "@/components/common/LogoIcon";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AuthLayout({
  children,
  title = "Welcome to SureTalk",
  subtitle = "Your voice messaging platform",
  background = "default"
}) {
  const { t } = useLanguage();
  const backgrounds = {
    default: "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900",
    gradient: "gradient-bg",
    brand: "brand-gradient"
  };

  return (
    <>
      <Head>
        <title>{title} | SureTalk</title>
        <meta name="description" content="Secure voice messaging platform" />
      </Head>

      <div className={`min-h-screen ${backgrounds[background]}`}>
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-300 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        </div>

        {/* Top navigation */}
        <nav className="relative z-10 py-4 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="https://suretalknow.com" className="flex items-center space-x-2">
            <LogoIcon size={40} />
              <span className="text-xl font-bold text-gray-800 dark:text-white">SureTalk</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium transition-colors"
              >
                {t('auth.signIn')}
              </Link>
              <Link 
                href="/signup"
                className="bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-300 px-4 py-2 rounded-lg font-medium 
                         border border-brand-300 dark:border-brand-700 hover:bg-brand-50 dark:hover:bg-slate-700 transition-colors"
              >
                {t('auth.signUpFree')}
              </Link>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="relative z-10 py-8 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto"
          >
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {title}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {subtitle}
              </p>
            </div>

            {children}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 py-6 px-4 border-t border-gray-200 dark:border-slate-800 mt-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  © {new Date().getFullYear()} SureTalk. {t("home.footer.copyright")}
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                <Link href="/privacy" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm">
                  {t('auth.privacy')}
                </Link>
                <Link href="/terms" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm">
                  {t('auth.terms')}
                </Link>
                <Link href="/contact" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm">
                  {t('home.footer.contact')}
                </Link>
                <a href="mailto:contact@suretalknow.com" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm">
                  {t('auth.support')}
                </a>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-800 text-center">
              <p className="text-xs text-gray-500">
                {t("home.footer.secured")}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}