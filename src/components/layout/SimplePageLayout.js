"use client";
import { motion } from "framer-motion";
import PageNavigation from "./PageNavigation";
import Button from "../common/Button";

export default function SimplePageLayout({ 
  title, 
  subtitle, 
  children,
  gradientFrom = "from-brand-50",
  gradientTo = "to-accent-50",
  showBackButton = true,
  showFooter = true
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Shared Navigation */}
      <PageNavigation showBackButton={showBackButton} />
      
      {/* Hero Section */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${gradientFrom} ${gradientTo}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-24 md:pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {title}
            </h1>
            
            {subtitle && (
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10">
                {subtitle}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass rounded-3xl p-6 md:p-12 shadow-xl"
          >
            {children}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      {showFooter && (
        <section className="pb-12 md:pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="glass rounded-2xl p-8 shadow-lg"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Preserve Your Voice?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Join thousands who trust SureTalk with their most important voice memories.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/signup">
                  <Button size="lg">
                    Start Free Trial
                  </Button>
                </a>
                <a href="/contact">
                  <Button variant="outline" size="lg">
                    Contact Support
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Simple Footer */}
      {showFooter && (
        <footer className="border-t border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} SureTalk. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}