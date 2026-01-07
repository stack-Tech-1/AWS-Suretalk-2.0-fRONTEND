"use client";
import { useState } from 'react';
import Link from "next/link";
import { Dialog } from '@headlessui/react';
import { Menu, X, ArrowLeft, MessageSquare } from 'lucide-react';
import Button from "../common/Button";

export default function PageNavigation({ showBackButton = true }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <Link 
                  href="/" 
                  className="flex items-center text-gray-700 hover:text-brand-600 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">Back to Home</span>
                </Link>
              )}
              
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">SureTalk</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/about" className="text-gray-700 hover:text-brand-600 font-medium transition-colors">
                About
              </Link>
              <Link href="/features" className="text-gray-700 hover:text-brand-600 font-medium transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-brand-600 font-medium transition-colors">
                Pricing
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-brand-600 font-medium transition-colors">
                Contact
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-brand-600 font-medium transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="btn-primary px-6 py-2.5">
                Get Started Free
              </Link>
            </div>
            
            {/* Mobile Menu Button */}
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
        
        {/* Mobile Menu Dialog */}
        <Dialog 
          as="div" 
          className="md:hidden relative z-50" 
          open={mobileMenuOpen} 
          onClose={setMobileMenuOpen}
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          
          <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gradient-to-b from-white/95 to-gray-50/95 backdrop-blur-xl px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-white/10 shadow-2xl">
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
            
            <div className="mt-8 flow-root">
              <div className="-my-6 divide-y divide-gray-200/50">
                <div className="space-y-1 py-6">
                  <Link
                    href="/about"
                    className="-mx-3 block rounded-xl px-3 py-3 text-lg font-semibold text-gray-900 hover:bg-white/50 hover:shadow-sm transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    href="/features"
                    className="-mx-3 block rounded-xl px-3 py-3 text-lg font-semibold text-gray-900 hover:bg-white/50 hover:shadow-sm transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Features
                  </Link>
                  <Link
                    href="/pricing"
                    className="-mx-3 block rounded-xl px-3 py-3 text-lg font-semibold text-gray-900 hover:bg-white/50 hover:shadow-sm transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/contact"
                    className="-mx-3 block rounded-xl px-3 py-3 text-lg font-semibold text-gray-900 hover:bg-white/50 hover:shadow-sm transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
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
                  </Link>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </Dialog>
      </nav>
    </>
  );
}