// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\pages\admin\register.js
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle,
  Clock,
  Key,
  Users,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { api } from "../../utils/api";

export default function AdminRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: Pending, 3: Success
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    adminCode: "", // Secret code for admin registration
    reason: "", // Why they need admin access
    department: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate inputs
      if (!formData.firstName || !formData.lastName || !formData.email || 
          !formData.phone || !formData.password || !formData.confirmPassword ||
          !formData.adminCode || !formData.reason) {
        throw new Error("Please fill in all required fields");
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (formData.password.length < 10) {
        throw new Error("Password must be at least 10 characters");
      }

      // Validate admin code (in production, this would be more secure)
      const validAdminCodes = ["SURE2024", "ADMINACCESS", "SUPERSECRET"];
      if (!validAdminCodes.includes(formData.adminCode.toUpperCase())) {
        throw new Error("Invalid admin registration code");
      }

      console.log('Submitting admin registration request:', {
        ...formData,
        password: '***', // Don't log actual password
        confirmPassword: '***'
      });

      // In production, this would call a backend endpoint like:
      await api.request('/auth/admin/request', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          fullName: `${formData.firstName} ${formData.lastName}`,
          department: formData.department,
          reason: formData.reason,
        }),
      });
      
      // Move to pending approval step
      setStep(2);

    } catch (error) {
      console.error("Admin registration error:", error);
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Pending Approval
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700/50 text-center">
            <div className="w-20 h-20 bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-blue-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              Admin Access Requested
            </h2>
            
            <p className="text-gray-400 mb-6">
              Your request for admin access has been submitted for review.
              An existing administrator will review your application within 24-48 hours.
            </p>
            
            <div className="bg-gray-900/30 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-white mb-3">What happens next?</h3>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Request received and logged</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Security review initiated</span>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span>Pending administrator approval</span>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>You'll receive email notification</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => router.push('/admin/login')}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
              >
                Return to Admin Login
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="w-full py-3 border border-gray-700 text-gray-400 hover:text-white rounded-xl font-medium transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Step 3: Success (if approved)
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700/50 text-center">
            <div className="w-20 h-20 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-green-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              Admin Access Approved!
            </h2>
            
            <p className="text-gray-400 mb-6">
              Your admin access has been approved. You can now log in with your credentials.
            </p>
            
            <button
              onClick={() => router.push('/admin/login')}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Go to Admin Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Step 1: Registration Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Security Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              Admin Registration
            </h1>
          </div>
          <p className="text-gray-400">
            Request administrator access to SureTalk systems
          </p>
        </div>

        {/* Security Warning */}
        <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-white mb-1">Security Notice</h3>
              <p className="text-sm text-gray-400">
                Admin access provides full system control. All requests are logged and require approval from existing administrators.
              </p>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700/50">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-300">
                {error}
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  First Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-700 
                             bg-gray-900/50 text-white placeholder-gray-500
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             focus:border-transparent transition-all"
                    placeholder="John"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Last Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-700 
                             bg-gray-900/50 text-white placeholder-gray-500
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             focus:border-transparent transition-all"
                    placeholder="Doe"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-700 
                           bg-gray-900/50 text-white placeholder-gray-500
                           focus:outline-none focus:ring-2 focus:ring-blue-500 
                           focus:border-transparent transition-all"
                  placeholder="admin@company.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-700 
                           bg-gray-900/50 text-white placeholder-gray-500
                           focus:outline-none focus:ring-2 focus:ring-blue-500 
                           focus:border-transparent transition-all"
                  placeholder="+1 (555) 123-4567"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Department
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-700 
                           bg-gray-900/50 text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500 
                           focus:border-transparent transition-all"
                  disabled={loading}
                >
                  <option value="">Select Department</option>
                  <option value="IT">IT Department</option>
                  <option value="Support">Customer Support</option>
                  <option value="Management">Management</option>
                  <option value="Security">Security</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-700 
                             bg-gray-900/50 text-white placeholder-gray-500
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             focus:border-transparent transition-all"
                    placeholder="Min. 10 characters"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-700 
                             bg-gray-900/50 text-white placeholder-gray-500
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             focus:border-transparent transition-all"
                    placeholder="Confirm password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-400"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Admin Registration Code *
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  name="adminCode"
                  value={formData.adminCode}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-700 
                           bg-gray-900/50 text-white placeholder-gray-500
                           focus:outline-none focus:ring-2 focus:ring-blue-500 
                           focus:border-transparent transition-all"
                  placeholder="Enter registration code"
                  required
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Contact an existing administrator to get the registration code
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Reason for Admin Access *
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="w-full p-4 rounded-xl border border-gray-700 
                         bg-gray-900/50 text-white placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-transparent transition-all"
                placeholder="Explain why you need admin access..."
                rows="3"
                required
                disabled={loading}
              />
            </div>

            <div className="pt-4 border-t border-gray-700">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 
                         hover:from-blue-700 hover:to-blue-600
                         text-white font-medium rounded-xl border border-blue-700
                         hover:shadow-lg transform transition-all duration-300 
                         hover:-translate-y-0.5 disabled:opacity-50 
                         disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Request Admin Access
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Already have admin access?{" "}
              <Link
                href="/admin/login"
                className="font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}