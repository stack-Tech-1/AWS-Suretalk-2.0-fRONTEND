import Link from "next/link";
import { MessageSquare } from "lucide-react";

export default function Navbar({ type = "landing" }) {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-accent-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">SureTalk</span>
          </Link>
          
          {type === "landing" && (
            <div className="flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium hidden md:block">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium hidden md:block">
                Pricing
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
          )}
        </div>
      </div>
    </nav>
  );
}