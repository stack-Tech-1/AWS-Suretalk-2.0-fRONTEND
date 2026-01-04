"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "../../../../../utils/api";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Shield,
  CreditCard,
  HardDrive,
  Users,
  Volume2,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw
} from "lucide-react";

export default function EditUser() {
  const router = useRouter();
  const params = useParams(); 
  const { id } = params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    subscription_tier: "ESSENTIAL",
    subscription_status: "active",
    storage_limit_gb: 5,
    contacts_limit: 50,
    voice_notes_limit: 100,
    is_admin: false,
    admin_status: "none"
  });

  const subscriptionPlans = [
    { id: "LITE", name: "Lite", storage: 2, contacts: 10, notes: 50, price: "$0" },
    { id: "ESSENTIAL", name: "Essential", storage: 5, contacts: 50, notes: 100, price: "$4.99" },
    { id: "LEGACY_VAULT_PREMIUM", name: "Premium", storage: 1000, contacts: 500, notes: 1000, price: "$9.99" },
  ];

  useEffect(() => {
    if (id) {
      fetchUserData();
    }
  }, [id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await api.getUserDetails(id);
      const user = response.data.user;
      
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        subscription_tier: user.subscription_tier || "ESSENTIAL",
        subscription_status: user.subscription_status || "active",
        storage_limit_gb: user.storage_limit_gb || 5,
        contacts_limit: user.contacts_limit || 50,
        voice_notes_limit: user.voice_notes_limit || 100,
        is_admin: user.is_admin || false,
        admin_status: user.admin_status || "none"
      });
      
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

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
        subscription_tier: planId,
        storage_limit_gb: plan.storage,
        contacts_limit: plan.contacts,
        voice_notes_limit: plan.notes
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Prepare data for API
      const updateData = {
        fullName: formData.full_name,
        phone: formData.phone,
        subscriptionTier: formData.subscription_tier,
        subscriptionStatus: formData.subscription_status,
        storageLimitGb: parseInt(formData.storage_limit_gb),
        contactsLimit: parseInt(formData.contacts_limit),
        voiceNotesLimit: parseInt(formData.voice_notes_limit),
      };

      await api.updateUser(id, updateData);
      setSuccess(true);
      
      // Redirect back after 2 seconds
      setTimeout(() => {
        router.push(`/adminDashboard/users/${id}`);
      }, 2000);

    } catch (err) {
      console.error("Failed to update user:", err);
      setError(err.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <RefreshCw className="w-12 h-12 text-brand-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/adminDashboard/users/${id}`}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Edit User</h1>
              <p className="text-gray-600 dark:text-gray-400">Update user details and settings</p>
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
            <div>
              <p className="font-medium text-green-800 dark:text-green-300">User updated successfully!</p>
              <p className="text-sm text-green-700 dark:text-green-400">Redirecting back to user details...</p>
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
                    name="full_name"
                    value={formData.full_name}
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
                      disabled // Email shouldn't be changed after creation
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
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
                    Account Status
                  </label>
                  <select
                    name="subscription_status"
                    value={formData.subscription_status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="canceled">Canceled</option>
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
                      formData.subscription_tier === plan.id
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

              {/* Custom Limits */}
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
                      name="storage_limit_gb"
                      value={formData.storage_limit_gb}
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
                      name="contacts_limit"
                      value={formData.contacts_limit}
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
                      name="voice_notes_limit"
                      value={formData.voice_notes_limit}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Admin & Actions */}
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
                      name="is_admin"
                      checked={formData.is_admin}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                  </label>
                </div>
                {formData.is_admin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Admin Status
                    </label>
                    <select
                      name="admin_status"
                      value={formData.admin_status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    >
                      <option value="none">None</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="glass rounded-2xl p-6 border-2 border-red-200 dark:border-red-800">
              <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-4">Danger Zone</h2>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  These actions are permanent and cannot be undone.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to reset this user\'s password? An email will be sent with reset instructions.')) {
                      // Add password reset logic
                      console.log('Reset password for:', id);
                    }
                  }}
                  className="w-full px-4 py-3 text-left border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="font-medium text-gray-800 dark:text-white">Reset Password</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Send password reset email</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to deactivate this account? The user will lose access immediately.')) {
                      // Add deactivate logic
                      console.log('Deactivate user:', id);
                    }
                  }}
                  className="w-full px-4 py-3 text-left border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="font-medium text-gray-800 dark:text-white">Deactivate Account</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Temporarily disable access</div>
                </button>
              </div>
            </div>

            {/* Form Actions */}
            <div className="glass rounded-2xl p-6">
              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
                <Link
                  href={`/adminDashboard/users/${id}`}
                  className="block w-full text-center px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}