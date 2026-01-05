import { motion } from "framer-motion";
import Head from "next/head";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

export default function AuthLayout({
  children,
  title = "Welcome to SureTalk",
  subtitle = "Your voice messaging platform",
  background = "default"
}) {
  const backgrounds = {
    default: "bg-gradient-to-br from-gray-50 to-gray-100",
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
            <Link href="/" className="flex items-center space-x-2">
            <img 
                    src="https://i.postimg.cc/9MbyJVL4/cropped-fulllogo-edited.webp" 
                    alt="SureTalk Logo" 
                    className="w-10 h-10 object-contain"
                  />
              <span className="text-xl font-bold text-gray-800">SureTalk</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/signup"
                className="bg-white text-brand-600 px-4 py-2 rounded-lg font-medium 
                         border border-brand-300 hover:bg-brand-50 transition-colors"
              >
                Sign Up Free
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
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {title}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                {subtitle}
              </p>
            </div>

            {children}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 py-6 px-4 border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-gray-600 text-sm">
                  © {new Date().getFullYear()} SureTalk. All rights reserved.
                </p>
              </div>
              
              <div className="flex space-x-6">
                <Link href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                  Privacy Policy
                </Link>
                <Link href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                  Terms of Service
                </Link>
                <Link href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                  Contact Us
                </Link>
                <Link href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                  Support
                </Link>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                Secure voice messaging with end-to-end encryption. 
                Voice notes are stored in AWS S3 with optional permanent vault storage.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}