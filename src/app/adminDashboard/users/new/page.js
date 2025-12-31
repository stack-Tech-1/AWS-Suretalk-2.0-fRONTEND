"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../../../components/dashboard/Layout";
import { motion } from "framer-motion";
import { api } from "../../../../utils/api";
import Link from "next/link";
import {
  ArrowLeft, Save, User, Mail, Phone, Shield, CreditCard,
  HardDrive, Users, Volume2, AlertCircle, CheckCircle,
  XCircle, RefreshCw, Home, FolderOpen, UserPlus,
  Lock, Eye, EyeOff, ChevronRight
} from "lucide-react";

export default function CreateUser() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    fullName: "",
    subscriptionTier: "ESSENTIAL",
    subscriptionStatus: "inactive",
    storageLimitGb: 5,
    contactsLimit: 50,
    voiceNotesLimit: 100,
    isAdmin: false,
    adminStatus: "none",
    sendWelcomeEmail: true
  });

  const subscriptionPlans = [
    { id: "LITE", name: "Lite", storage: 2, contacts: 10, notes: 50, price: "$0" },
    { id: "ESSENTIAL", name: "Essential", storage: 5, contacts: 50, notes: 100, price: "$4.99" },
    { id: "LEGACY_VAULT_PREMIUM", name: "Premium", storage: 1000, contacts: 500, notes: 1000, price: "$9.99" },
  ];

  // Breadcrumb items
  const breadcrumbs = [
    { label: "Dashboard", href: "/adminDashboard", icon: <Home className="w-4 h-4" /> },
    { label: "User Management", href: "/adminDashboard/users", icon: <FolderOpen className="w-4 h-4" /> },
    { label: "Create User", href: "/adminDashboard/users/new", icon: <UserPlus className="w-4 h-4" />, current: true }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePlanChange = (planId) => {
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (plan) {
      setFormData(prev => ({
        ...prev,
        subscriptionTier: planId,
        storageLimitGb: plan.storage,
        contactsLimit: plan.contacts,
        voiceNotesLimit: plan.notes
      }));
    }
  };

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await api.createUser(formData);
      
      if (response.success) {
        setSuccess(true);
        setTempPassword(response.data.tempPassword || "");
        
        // Redirect after 5 seconds
        setTimeout(() => {
          router.push('/adminDashboard/users');
        }, 5000);
      } else {
        setError(response.error || "Failed to create user");
      }
    } catch (err) {
      console.error("Failed to create user:", err);
      setError(err.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                )}
                <Link
                  href={crumb.href}
                  className={`flex items-center gap-2 text-sm ${
                    crumb.current 
                      ? 'font-semibold text-brand-600 dark:text-brand-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                  }`}
                >
                  {crumb.icon}
                  {crumb.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </motion.div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/adminDashboard/users"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Create New User</h1>
              <p className="text-gray-600 dark:text-gray-400">Add a new user to the SureTalk platform</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div className="flex-1">
              <p className="font-medium text-green-800 dark:text-green-300">User created successfully!</p>
              <p className="text-sm text-green-700 dark:text-green-400">
                {formData.sendWelcomeEmail 
                  ? "A welcome email with login instructions has been sent to the user."
                  : "User account created. You need to provide login credentials manually."}
              </p>
              
              {tempPassword && (
                <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">Temporary Password</p>
                      <p className="text-xs text-green-700 dark:text-green-400">Save this password securely</p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(tempPassword);
                        alert("Password copied to clipboard!");
                      }}
                      className="text-sm text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <code className="flex-1 p-2 bg-white dark:bg-gray-800 rounded font-mono text-sm">
                      {showTempPassword ? tempPassword : "•".repeat(12)}
                    </code>
                    <button
                      onClick={() => setShowTempPassword(!showTempPassword)}
                      className="p-2 hover:bg-green-200 dark:hover:bg-green-800 rounded"
                    >
                      {showTempPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="font-medium text-red-800 dark:text-red-300">{error}</p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                      placeholder="user@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Initial Status
                  </label>
                  <select
                    name="subscriptionStatus"
                    value={formData.subscriptionStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  >
                    <option value="inactive">Inactive (Requires activation)</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Subscription Plan */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Subscription Plan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {subscriptionPlans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => handlePlanChange(plan.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.subscriptionTier === plan.id
                        ? 'border-brand-500 bg-gradient-to-br from-brand-50 to-accent-50 dark:from-brand-900/20 dark:to-accent-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-800 dark:text-white">{plan.name}</h3>
                      <span className="text-lg font-bold text-brand-600 dark:text-brand-400">{plan.price}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-gray-400" />
                        <span>{plan.storage} GB Storage</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{plan.contacts} Contacts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-gray-400" />
                        <span>{plan.notes} Voice Notes</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Limits (Optional) */}
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Custom Limits (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Storage Limit (GB)
                  </label>
                  <div className="relative">
                    <HardDrive className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="storageLimitGb"
                      value={formData.storageLimitGb}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contacts Limit
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="contactsLimit"
                      value={formData.contactsLimit}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Voice Notes Limit
                  </label>
                  <div className="relative">
                    <Volume2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="voiceNotesLimit"
                      value={formData.voiceNotesLimit}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Admin & Settings */}
          <div className="space-y-8">
            {/* Admin Settings */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Admin Settings
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-gray-700 dark:text-gray-300">Admin Access</label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Grant admin privileges</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isAdmin"
                      checked={formData.isAdmin}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                  </label>
                </div>
                
                {formData.isAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Admin Status
                    </label>
                    <select
                      name="adminStatus"
                      value={formData.adminStatus}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    >
                      <option value="pending">Pending (Requires approval)</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Select "pending" to require admin approval for admin access
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Email Settings */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Email Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-gray-700 dark:text-gray-300">Send Welcome Email</label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Send login instructions to user's email
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="sendWelcomeEmail"
                      checked={formData.sendWelcomeEmail}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                  </label>
                </div>
                
                {!formData.sendWelcomeEmail && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      You will need to provide the temporary password to the user manually.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="glass rounded-2xl p-6">
              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Creating User...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Create User
                    </>
                  )}
                </button>
                <Link
                  href="/adminDashboard/users"
                  className="block w-full text-center px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </div>

            {/* Information Panel */}
            <div className="glass rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-3">Information</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>A temporary password will be generated automatically</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>User will receive welcome email with login instructions</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>Admin access requires additional approval by default</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}