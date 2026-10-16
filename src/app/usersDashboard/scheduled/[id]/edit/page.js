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
  RefreshCw,
  Pause
} from "lucide-react";
import { api } from "@/utils/api";
import { format, parseISO, addDays, isAfter, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { toast } from '@/components/ui/Toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { getDateFnsLocale, dateTimePattern } from '@/utils/dateLocale';

export default function EditScheduledMessage() {
  const params = useParams();
  const router = useRouter();
  const { t, lang } = useLanguage();
  const dateLocale = getDateFnsLocale(lang);
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
        throw new Error(response.error || t('schedd.loadError'));
      }
    } catch (error) {
      console.error("Failed to load message details:", error);
      setError(error.message || t('schedd.loadDetailsError'));
      toast.error(error.message || t('schedd.loadDetailsError'));
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
      toast.error(t('schedc.needDate'));
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
        toast.success(t('schede.updateSuccess'));
        
        // Redirect to message details
        setTimeout(() => {
          router.push(`/usersDashboard/scheduled/${params.id}`);
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to update message:", error);
      setError(error.message || t('schede.updateError'));
      toast.error(error.message || t('schede.updateError'));
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
        toast.success(t('sched.cancelSuccess'));
        setShowDeleteConfirm(false);
        
        // Redirect to scheduled messages list
        setTimeout(() => {
          router.push("/usersDashboard/scheduled");
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to cancel message:", error);
      toast.error(error.message || t('sched.cancelError'));
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
          label: t('scheduled.statusScheduled')
        };
      case "paused":
        return {
          icon: Pause,
          color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
          label: t('schede.paused')
        };
      default:
        return {
          icon: Clock,
          color: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
          label: status || t('common.unknown')
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
          label: t('contacts.phone')
        };
      case "email":
        return {
          icon: Mail,
          color: "bg-green-100 dark:bg-green-900/30 text-green-500",
          label: t('contacts.email')
        };
      case "both":
        return {
          icon: Users,
          color: "bg-purple-100 dark:bg-purple-900/30 text-purple-500",
          label: t('sched.both')
        };
      default:
        return {
          icon: Bell,
          color: "bg-gray-100 dark:bg-gray-800 text-gray-500",
          label: method || t('common.unknown')
        };
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">{t('schedd.loading')}</p>
      </div>
    );
  }

  // Error state
  if (error || !message) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          {error || t('schedd.notFound')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
          {error || t('schedd.notFoundDesc')}
        </p>
        <div className="flex gap-3">
          <button
            onClick={loadMessageDetails}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {t('common.retry')}
          </button>
          <Link
            href="/usersDashboard/scheduled"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {t('schedd.backToList')}
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
                {t('schede.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t('schede.subtitle', { title: message.voice_note_title || t('sched.voiceMessage') })}
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
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">{t('schede.overview')}</h2>
          
          <div className="space-y-6">
            {/* Current Status */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">{t('schede.currentStatus')}</h3>
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
                    {t('sched.cancelMessageFull')}
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
                    {message.voice_note_title || t('sched.voiceMessage')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('schedd.voiceNote')} • {t('schede.cannotChange')}
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
                    {contact?.name || message.recipient_email || message.recipient_phone || t('scheduled.recipient')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {contact ? t('schedd.contact') : t('schedd.manualRecipient')} • {t('schede.cannotChange')}
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
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">{t('schede.deliverySettings')}</h2>
          
          <div className="space-y-6">
            {/* Delivery Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('sched.deliveryMethod')}
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
                    {method === 'email' ? t('contacts.email') : method === 'phone' ? t('contacts.phone') : t('sched.both')}
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('schedc.stepTime')}
              </label>
              
              {/* Quick Schedule */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('schedc.quickSchedule')}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { label: t('schede.tomorrow'), hours: 24 },
                    { label: t('schede.in3Days'), hours: 72 },
                    { label: t('schedc.nextWeek'), hours: 168 },
                    { label: t('schedc.nextMonth'), hours: 720 }
                  ].map((option) => (
                    <button
                      key={option.hours}
                      type="button"
                      onClick={() => setQuickDate(option.hours)}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-center"
                    >
                      <span className="text-sm font-medium">{option.label}</span>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(addDays(new Date(), option.hours / 24), lang === 'es' ? 'd MMM' : 'MMM d', { locale: dateLocale })}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Date/Time */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('schedc.customDate')}</p>
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
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('schede.suggestedTimes')}</p>
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
                        {format(time, lang === 'es' ? 'd MMM' : 'MMM d', { locale: dateLocale })}<br />
                        {format(time, lang === 'es' ? 'HH:mm' : 'h a')}
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
                  <h4 className="font-medium text-gray-800 dark:text-white">{t('schede.currentSchedule')}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {format(scheduledDate, dateTimePattern(lang), { locale: dateLocale })}
                    {isUpcoming && ` • ${formatDistanceToNow(scheduledDate, { addSuffix: true, locale: dateLocale })}`}
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
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">{t('schedd.customMessage')}</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('schede.additionalMessage')}
            </label>
            <textarea
              value={formData.customMessage}
              onChange={(e) => setFormData(prev => ({ ...prev, customMessage: e.target.value }))}
              placeholder={t('schedc.customMessagePlaceholder')}
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-2">
              {t('schede.additionalMessageHint')}
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
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">{t('schede.statusSettings')}</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('schede.messageStatus')}
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="scheduled">{t('scheduled.statusScheduled')}</option>
              <option value="paused">{t('schede.paused')}</option>
              <option value="cancelled">{t('scheduled.statusCancelled')}</option>
            </select>
            <p className="text-sm text-gray-500 mt-2">
              {t('schede.statusHint')}
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
              {t('common.cancel')}
            </Link>
            <button
              type="submit"
              disabled={saving || !formData.scheduledFor}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('schede.saving')}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {t('vnd.saveChanges')}
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
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">{t('scheduled.cancelTitle')}</h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('scheduled.cancelConfirm')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {t('schede.keepMessage')}
              </button>
              <button
                onClick={handleCancelMessage}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('schedd.cancelling')}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    {t('sched.cancelMessageFull')}
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