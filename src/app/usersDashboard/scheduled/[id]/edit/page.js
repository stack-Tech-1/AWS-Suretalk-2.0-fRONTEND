// /app/usersDashboard/scheduled/[id]/edit/page.js
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Users,
  FileAudio,
  ArrowLeft,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  X,
  Loader2,
  CalendarClock,
  Shield,
  Bell,
  RefreshCw
} from "lucide-react";
import { api } from "@/utils/api";
import { format, parseISO, addDays, isAfter } from "date-fns";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function EditScheduledMessage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    scheduledFor: "",
    deliveryMethod: "email",
    customMessage: "",
    status: "scheduled"
  });

  // Data state
  const [message, setMessage] = useState(null);
  const [voiceNote, setVoiceNote] = useState(null);
  const [contact, setContact] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load message details
  useEffect(() => {
    loadMessageDetails();
    generateTimeSlots();
  }, [params.id]);

  const loadMessageDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load scheduled message
      const response = await api.getScheduledMessage(params.id);
      
      if (response.success) {
        const messageData = response.data;
        setMessage(messageData);

        // Set form data
        setFormData({
          scheduledFor: messageData.scheduled_for,
          deliveryMethod: messageData.delivery_method || "email",
          customMessage: messageData.custom_message || "",
          status: messageData.delivery_status || "scheduled"
        });

        // Load voice note details if available
        if (messageData.voice_note_id) {
          try {
            const noteResponse = await api.getVoiceNote(messageData.voice_note_id);
            if (noteResponse.success) {
              setVoiceNote(noteResponse.data);
            }
          } catch (error) {
            console.error("Failed to load voice note:", error);
          }
        }

        // Load contact details if available
        if (messageData.recipient_contact_id) {
          try {
            const contactResponse = await api.getContact(messageData.recipient_contact_id);
            if (contactResponse.success) {
              setContact(contactResponse.data);
            }
          } catch (error) {
            console.error("Failed to load contact:", error);
          }
        }

      } else {
        throw new Error(response.error || "Failed to load message");
      }
    } catch (error) {
      console.error("Failed to load message details:", error);
      setError(error.message || "Failed to load message details");
      toast.error(error.message || "Failed to load message details");
    } finally {
      setLoading(false);
    }
  };

  // Generate time slots for the next 7 days
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(now, i);
      for (let hour = 8; hour <= 20; hour += 2) {
        const time = new Date(date);
        time.setHours(hour, 0, 0, 0);
        
        if (isAfter(time, now)) {
          slots.push(time);
        }
      }
    }
    
    setAvailableTimes(slots);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.scheduledFor) {
      toast.error("Please select a date and time");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const scheduledDate = new Date(formData.scheduledFor);
      const isUpcoming = isAfter(scheduledDate, new Date());
      
      // Prepare update data
      const updateData = {
        scheduledFor: scheduledDate.toISOString(),
        deliveryMethod: formData.deliveryMethod,
        status: formData.status,
        ...(formData.customMessage !== message.custom_message && { 
          customMessage: formData.customMessage || null 
        })
      };

      // Update the message
      const response = await api.updateScheduledMessage(params.id, updateData);
      
      if (response.success) {
        toast.success("Message updated successfully");
        
        // Redirect to message details
        setTimeout(() => {
          router.push(`/usersDashboard/scheduled/${params.id}`);
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to update message:", error);
      setError(error.message || "Failed to update message");
      toast.error(error.message || "Failed to update message");
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel message
  const handleCancelMessage = async () => {
    try {
      setSaving(true);
      
      const response = await api.cancelScheduledMessage(params.id);
      
      if (response.success) {
        toast.success("Message cancelled successfully");
        setShowDeleteConfirm(false);
        
        // Redirect to scheduled messages list
        setTimeout(() => {
          router.push("/usersDashboard/scheduled");
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to cancel message:", error);
      toast.error(error.message || "Failed to cancel message");
    } finally {
      setSaving(false);
    }
  };

  // Quick date selection
  const setQuickDate = (hoursFromNow) => {
    const date = new Date();
    date.setHours(date.getHours() + hoursFromNow);
    date.setMinutes(0, 0, 0);
    
    setFormData(prev => ({
      ...prev,
      scheduledFor: date.toISOString()
    }));
  };

  // Get status info
  const getStatusInfo = (status) => {
    switch (status) {
      case "scheduled":
        return {
          icon: Clock,
          color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
          label: "Scheduled"
        };
      case "paused":
        return {
          icon: Pause,
          color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
          label: "Paused"
        };
      default:
        return {
          icon: Clock,
          color: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
          label: status || "Unknown"
        };
    }
  };

  // Get delivery method info
  const getDeliveryMethodInfo = (method) => {
    switch (method) {
      case "phone":
        return {
          icon: Phone,
          color: "bg-blue-100 dark:bg-blue-900/30 text-blue-500",
          label: "Phone"
        };
      case "email":
        return {
          icon: Mail,
          color: "bg-green-100 dark:bg-green-900/30 text-green-500",
          label: "Email"
        };
      case "both":
        return {
          icon: Users,
          color: "bg-purple-100 dark:bg-purple-900/30 text-purple-500",
          label: "Both"
        };
      default:
        return {
          icon: Bell,
          color: "bg-gray-100 dark:bg-gray-800 text-gray-500",
          label: method || "Unknown"
        };
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading message details...</p>
      </div>
    );
  }

  // Error state
  if (error || !message) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          {error || "Message not found"}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
          {error || "The requested scheduled message could not be found."}
        </p>
        <div className="flex gap-3">
          <button
            onClick={loadMessageDetails}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
          <Link
            href="/usersDashboard/scheduled"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Back to List
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(message.delivery_status);
  const deliveryMethodInfo = getDeliveryMethodInfo(message.delivery_method);
  const scheduledDate = parseISO(message.scheduled_for);
  const isUpcoming = isAfter(scheduledDate, new Date());
  const canCancel = message.delivery_status === "scheduled" && isUpcoming;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/usersDashboard/scheduled/${params.id}`}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Edit Scheduled Message
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Update delivery details for: {message.voice_note_title || "Voice Message"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Message Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Message Overview</h2>
          
          <div className="space-y-6">
            {/* Current Status */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">Current Status</h3>
                  <div className={`flex items-center gap-1 mt-1 ${statusInfo.color} px-3 py-1 rounded-full w-fit`}>
                    <statusInfo.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{statusInfo.label}</span>
                  </div>
                </div>
                {canCancel && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
                  >
                    Cancel Message
                  </button>
                )}
              </div>
            </div>

            {/* Voice Note */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileAudio className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white">
                    {message.voice_note_title || "Voice Message"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Voice Note • Cannot be changed
                  </p>
                </div>
              </div>
              {voiceNote?.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-2">{voiceNote.description}</p>
              )}
            </div>

            {/* Recipient */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <User className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white">
                    {contact?.name || message.recipient_email || message.recipient_phone || "Recipient"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {contact ? "Contact" : "Manual Recipient"} • Cannot be changed
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                {message.recipient_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{message.recipient_email}</span>
                  </div>
                )}
                {message.recipient_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{message.recipient_phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Delivery Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Delivery Settings</h2>
          
          <div className="space-y-6">
            {/* Delivery Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Delivery Method
              </label>
              <div className="flex gap-2">
                {["email", "phone", "both"].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, deliveryMethod: method }))}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      formData.deliveryMethod === method
                        ? method === 'email' ? 'bg-green-500 text-white' :
                          method === 'phone' ? 'bg-blue-500 text-white' :
                          'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {method === 'email' ? 'Email' : method === 'phone' ? 'Phone' : 'Both'}
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Schedule Time
              </label>
              
              {/* Quick Schedule */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Quick Schedule</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { label: "Tomorrow", hours: 24 },
                    { label: "In 3 days", hours: 72 },
                    { label: "Next week", hours: 168 },
                    { label: "Next month", hours: 720 }
                  ].map((option) => (
                    <button
                      key={option.hours}
                      type="button"
                      onClick={() => setQuickDate(option.hours)}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-center"
                    >
                      <span className="text-sm font-medium">{option.label}</span>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(addDays(new Date(), option.hours / 24), 'MMM d')}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Date/Time */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Custom Date & Time</p>
                <input
                  type="datetime-local"
                  value={formData.scheduledFor ? format(new Date(formData.scheduledFor), "yyyy-MM-dd'T'HH:mm") : ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledFor: new Date(e.target.value).toISOString() }))}
                  min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Time Suggestions */}
              {availableTimes.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Suggested Times</p>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {availableTimes.slice(0, 12).map((time, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, scheduledFor: time.toISOString() }))}
                        className={`p-2 rounded-lg text-xs text-center transition-colors ${
                          formData.scheduledFor && new Date(formData.scheduledFor).getTime() === time.getTime()
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {format(time, 'MMM d')}<br />
                        {format(time, 'h a')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Current Schedule */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="flex items-center gap-3">
                <CalendarClock className="w-5 h-5 text-blue-500" />
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">Current Schedule</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {format(scheduledDate, "MMM d, yyyy • h:mm a")}
                    {isUpcoming && ` • ${formatDistanceToNow(scheduledDate, { addSuffix: true })}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Custom Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Custom Message</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Message (Optional)
            </label>
            <textarea
              value={formData.customMessage}
              onChange={(e) => setFormData(prev => ({ ...prev, customMessage: e.target.value }))}
              placeholder="Add a personal note to accompany your voice message..."
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-2">
              This message will be included with your voice note delivery.
            </p>
          </div>
        </motion.div>

        {/* Status Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Status Settings</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="scheduled">Scheduled</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <p className="text-sm text-gray-500 mt-2">
              Pausing will temporarily stop delivery. Cancelling will permanently stop delivery.
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/usersDashboard/scheduled/${params.id}`}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-center transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !formData.scheduledFor}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </motion.div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Cancel Scheduled Message</h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to cancel this scheduled message? This action cannot be undone.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Keep Message
              </button>
              <button
                onClick={handleCancelMessage}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Cancel Message
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}