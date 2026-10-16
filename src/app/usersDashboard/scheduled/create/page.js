// /app/usersDashboard/scheduled/create/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Users,
  FileAudio,
  Plus,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Info,
  ChevronDown,
  X,
  Upload,
  Loader2,
  Bell,
  CalendarClock,
  Shield,
  Zap,
  Sun,
  Activity
} from "lucide-react";
import { api } from "@/utils/api";
import { format, addDays, parseISO, isBefore } from "date-fns";
import Link from "next/link";
import { toast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext'; // ✅ Import useAuth
import { useLanguage } from '@/contexts/LanguageContext';
import { getDateFnsLocale, dateTimePattern } from '@/utils/dateLocale';

export default function CreateScheduledMessage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // ✅ Use AuthContext
  const { t, lang } = useLanguage();
  const dateLocale = getDateFnsLocale(lang);
  
  const [loading, setLoading] = useState(false);
  const [loadingVoiceNotes, setLoadingVoiceNotes] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    voiceNoteId: "",
    recipientContactId: "",
    recipientEmail: "",
    recipientPhone: "",
    deliveryMethod: "email",
    scheduledFor: "",
    customMessage: "",
    isRecurring: false,
    recurrence: {
      type: "none",
      interval: 1,
      endDate: "",
      occurrences: 1
    }
  });

  // Data state
  const [voiceNotes, setVoiceNotes] = useState([]);
  const [contacts, setContacts] = useState([]);
  // ✅ Remove userTier state - get from AuthContext
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [showVoiceNoteSelector, setShowVoiceNoteSelector] = useState(false);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedVoiceNote, setSelectedVoiceNote] = useState(null);

  // Generate time slots for the next 7 days
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(now, i);
      for (let hour = 8; hour <= 20; hour += 2) {
        const time = new Date(date);
        time.setHours(hour, 0, 0, 0);
        
        if (isBefore(now, time)) {
          slots.push(time);
        }
      }
    }
    
    setAvailableTimes(slots);
  };

  // Load initial data
  useEffect(() => {
    if (!authLoading) {
      loadInitialData();
      generateTimeSlots();
    }
  }, [authLoading]);

  const loadInitialData = async () => {
    try {
      // ✅ User data comes from AuthContext - no separate API call needed

      // Load voice notes
      setLoadingVoiceNotes(true);
      const notesResponse = await api.getVoiceNotes({ limit: 50 });
      if (notesResponse.success) {
        setVoiceNotes(notesResponse.data.voiceNotes || []);
      }

      // Load contacts
      setLoadingContacts(true);
      const contactsResponse = await api.getContacts({ limit: 50 });
      if (contactsResponse.success) {
        setContacts(contactsResponse.data.contacts || []);
      }

    } catch (error) {
      console.error("Failed to load initial data:", error);
      toast.error(t('schedc.loadError'));
    } finally {
      setLoadingVoiceNotes(false);
      setLoadingContacts(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.voiceNoteId) {
      toast.error(t('schedc.needVoiceNote'));
      return;
    }
    
    if (!formData.scheduledFor) {
      toast.error(t('schedc.needDate'));
      return;
    }
    
    if (formData.deliveryMethod.includes("email") && !formData.recipientEmail && !formData.recipientContactId) {
      toast.error(t('schedc.needEmail'));
      return;
    }
    
    if (formData.deliveryMethod.includes("phone") && !formData.recipientPhone && !formData.recipientContactId) {
      toast.error(t('schedc.needPhone'));
      return;
    }

    // ✅ Check LITE tier limitations
    if (user?.subscription_tier === 'LITE') {
      // Check existing scheduled messages count
      try {
        const scheduledResponse = await api.getScheduledMessages({ limit: 1 });
        const totalMessages = scheduledResponse.data?.pagination?.total || 0;
        
        if (totalMessages >= 3) {
          toast.error(t('schedc.liteLimitToast'));
          router.push('/usersDashboard/billing');
          return;
        }
      } catch (error) {
        console.error("Failed to check scheduled messages count:", error);
      }
    }

    try {
      setLoading(true);
      setError(null);

      const scheduledDate = new Date(formData.scheduledFor);
      
      // Prepare request data
      const requestData = {
        voiceNoteId: formData.voiceNoteId,
        scheduledFor: scheduledDate.toISOString(),
        deliveryMethod: formData.deliveryMethod,
        customMessage: formData.customMessage || undefined,
        metadata: {
          createdVia: "dashboard",
          userTier: user?.subscription_tier, // ✅ Use from context
          isRecurring: formData.isRecurring,
          recurrence: formData.isRecurring ? formData.recurrence : undefined
        }
      };

      // Add recipient info
      if (formData.recipientContactId) {
        requestData.recipientContactId = formData.recipientContactId;
      } else {
        if (formData.recipientEmail) {
          requestData.recipientEmail = formData.recipientEmail;
        }
        if (formData.recipientPhone) {
          requestData.recipientPhone = formData.recipientPhone;
        }
      }

      // Schedule the message
      const response = await api.scheduleMessage(requestData);
      
      if (response.success) {
        toast.success(t('schedc.success'));
        
        // If recurring, schedule additional messages
        if (formData.isRecurring && formData.recurrence.type !== "none") {
          await scheduleRecurringMessages(response.data.id);
        }
        
        // Redirect to scheduled messages list
        setTimeout(() => {
          router.push("/usersDashboard/scheduled");
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to schedule message:", error);
      setError(error.message || t('schedc.error'));
      toast.error(error.message || t('schedc.error'));
    } finally {
      setLoading(false);
    }
  };

  // Schedule recurring messages
  const scheduleRecurringMessages = async (originalMessageId) => {
    try {
      const recurrence = formData.recurrence;
      if (recurrence.type === "none") return;

      const occurrences = recurrence.occurrences || 1;
      const originalDate = new Date(formData.scheduledFor);
      
      for (let i = 1; i < occurrences; i++) {
        const nextDate = new Date(originalDate);
        
        switch (recurrence.type) {
          case "daily":
            nextDate.setDate(nextDate.getDate() + (recurrence.interval * i));
            break;
          case "weekly":
            nextDate.setDate(nextDate.getDate() + (recurrence.interval * 7 * i));
            break;
          case "monthly":
            nextDate.setMonth(nextDate.getMonth() + (recurrence.interval * i));
            break;
          case "yearly":
            nextDate.setFullYear(nextDate.getFullYear() + (recurrence.interval * i));
            break;
        }

        // Skip if past end date
        if (recurrence.endDate && nextDate > new Date(recurrence.endDate)) {
          break;
        }

        // Create recurring message
        const recurringData = {
          voiceNoteId: formData.voiceNoteId,
          scheduledFor: nextDate.toISOString(),
          deliveryMethod: formData.deliveryMethod,
          customMessage: formData.customMessage || undefined,
          metadata: {
            originalMessageId,
            recurrence: {
              type: recurrence.type,
              interval: recurrence.interval,
              occurrence: i + 1,
              total: occurrences
            }
          }
        };

        if (formData.recipientContactId) {
          recurringData.recipientContactId = formData.recipientContactId;
        } else {
          if (formData.recipientEmail) {
            recurringData.recipientEmail = formData.recipientEmail;
          }
          if (formData.recipientPhone) {
            recurringData.recipientPhone = formData.recipientPhone;
          }
        }

        await api.scheduleMessage(recurringData);
      }
    } catch (error) {
      console.error("Failed to schedule recurring messages:", error);
      toast.error(t('schedc.recurringError'));
    }
  };

  // Handle contact selection
  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    setFormData(prev => ({
      ...prev,
      recipientContactId: contact.id,
      recipientEmail: contact.email || prev.recipientEmail,
      recipientPhone: contact.phone || prev.recipientPhone
    }));
    setShowContactSelector(false);
  };

  // Handle voice note selection
  const handleVoiceNoteSelect = (note) => {
    setSelectedVoiceNote(note);
    setFormData(prev => ({
      ...prev,
      voiceNoteId: note.id
    }));
    setShowVoiceNoteSelector(false);
  };

  // Remove contact
  const handleRemoveContact = () => {
    setSelectedContact(null);
    setFormData(prev => ({
      ...prev,
      recipientContactId: "",
      recipientEmail: "",
      recipientPhone: ""
    }));
  };

  // Remove voice note
  const handleRemoveVoiceNote = () => {
    setSelectedVoiceNote(null);
    setFormData(prev => ({
      ...prev,
      voiceNoteId: ""
    }));
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

  // ✅ Show loading while auth loads
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-brand-500" />
      </div>
    );
  }

  // ✅ Use helper from AuthContext
  const isLiteTier = user?.subscription_tier === 'LITE';
  const isLegacyVault = user?.subscription_tier === 'LEGACY_VAULT_PREMIUM';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/usersDashboard/scheduled"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                {t('sched.scheduleNew')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t('schedc.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1">
            <div className="flex items-center">
              {[1, 2, 3, 4].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-blue-500 text-white' :
                    index === 1 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}>
                    {index === 0 ? <CheckCircle className="w-5 h-5" /> : step}
                  </div>
                  {index < 3 && (
                    <div className={`h-1 w-24 ${
                      index === 0 ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>{t('scheduled.selectVoiceNote')}</span>
              <span>{t('schedc.chooseRecipient')}</span>
              <span>{t('schedc.stepTime')}</span>
              <span>{t('schedc.stepReview')}</span>
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

        {/* Step 1: Voice Note Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <FileAudio className="w-5 h-5 text-blue-500" />
                {t('scheduled.selectVoiceNote')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('schedc.voiceNoteHint')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowVoiceNoteSelector(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30"
            >
              <Plus className="w-4 h-4" />
              {t('schedc.browseAll')}
            </button>
          </div>

          {selectedVoiceNote ? (
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <FileAudio className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-white">{selectedVoiceNote.title}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>{format(parseISO(selectedVoiceNote.created_at), 'PP', { locale: dateLocale })}</span>
                        <span>{Math.round(selectedVoiceNote.duration_seconds / 60)} min</span>
                        <span>{Math.round(selectedVoiceNote.file_size_bytes / 1024 / 1024)} MB</span>
                      </div>
                    </div>
                  </div>
                  {selectedVoiceNote.description && (
                    <p className="mt-3 text-gray-600 dark:text-gray-400">{selectedVoiceNote.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleRemoveVoiceNote}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
              <FileAudio className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {t('schedc.noVoiceNote')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('schedc.noVoiceNoteHint')}
              </p>
              <button
                type="button"
                onClick={() => setShowVoiceNoteSelector(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg"
              >
                {t('scheduled.selectVoiceNote')}
              </button>
            </div>
          )}

          {/* Voice Note Selector Modal */}
          {showVoiceNoteSelector && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    {t('scheduled.selectVoiceNote')}
                  </h3>
                  <button
                    onClick={() => setShowVoiceNoteSelector(false)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {loadingVoiceNotes ? (
                  <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : voiceNotes.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <FileAudio className="w-16 h-16 text-gray-400 mb-4" />
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                      {t('schedc.noVoiceNotesFound')}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
                      {t('schedc.recordFirst')}
                    </p>
                    <Link
                      href="/usersDashboard/voice-notes/record"
                      className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                    >
                      {t('schedc.createVoiceNote')}
                    </Link>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto">
                    <div className="space-y-3">
                      {voiceNotes.map((note) => (
                        <button
                          key={note.id}
                          type="button"
                          onClick={() => handleVoiceNoteSelect(note)}
                          className="w-full p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <FileAudio className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-800 dark:text-white">{note.title}</h4>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                <span>{format(parseISO(note.created_at), 'PP', { locale: dateLocale })}</span>
                                <span>{Math.round(note.duration_seconds / 60)} min</span>
                                {note.is_permanent && (
                                  <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                                    <Shield className="w-3 h-3" />
                                    {t('common.permanent')}
                                  </span>
                                )}
                              </div>
                              {note.description && (
                                <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-2">
                                  {note.description}
                                </p>
                              )}
                            </div>
                            {formData.voiceNoteId === note.id && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Step 2: Recipient Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-green-500" />
                {t('schedc.chooseRecipient')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('schedc.recipientHint')}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Contact Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('schedc.fromContacts')}
              </label>
              {selectedContact ? (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <User className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 dark:text-white">{selectedContact.name}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            {selectedContact.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {selectedContact.phone}
                              </span>
                            )}
                            {selectedContact.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {selectedContact.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {selectedContact.relationship && (
                        <div className="mt-3">
                          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                            {selectedContact.relationship}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveContact}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowContactSelector(true)}
                  className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                >
                  <div className="text-center">
                    <Users className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                      {t('schedc.fromContacts')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('schedc.fromContactsHint')}
                    </p>
                  </div>
                </button>
              )}
            </div>

            {/* Or Separator */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-900 text-gray-500">{t('schedc.or')}</span>
              </div>
            </div>

            {/* Manual Entry */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('schedc.manualEntry')}
              </label>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('sched.deliveryMethod')}
                </label>
                <div className="flex gap-2">
                  {/* Email only — always available */}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, deliveryMethod: 'email' }))}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.deliveryMethod === 'email'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {t('schedc.emailOnly')}
                  </button>

                  {/* Call + SMS — premium only */}
                  <button
                    type="button"
                    onClick={() => isLegacyVault && setFormData(prev => ({ ...prev, deliveryMethod: 'phone' }))}
                    title={!isLegacyVault ? t('schedc.upgradeForCalls') : undefined}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.deliveryMethod === 'phone'
                        ? 'bg-blue-500 text-white'
                        : isLegacyVault
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {t('schedc.callSms')}
                  </button>

                  {/* Email + Call + SMS — premium only */}
                  <button
                    type="button"
                    onClick={() => isLegacyVault && setFormData(prev => ({ ...prev, deliveryMethod: 'both' }))}
                    title={!isLegacyVault ? t('schedc.upgradeForCalls') : undefined}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.deliveryMethod === 'both'
                        ? 'bg-purple-500 text-white'
                        : isLegacyVault
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {t('schedc.emailCallSms')}
                  </button>
                </div>

                {/* Upgrade prompt for non-premium users */}
                {!isLegacyVault && (
                  <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <span>⚡</span>
                    <Link href="/usersDashboard/billing" className="underline hover:no-underline">
                      {t('schedc.upgradeToVault')}
                    </Link>
                    {" "}{t('schedc.upgradeToVaultSuffix')}
                  </p>
                )}
              </div>

              {(formData.deliveryMethod === 'email' || formData.deliveryMethod === 'both') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('contacts.emailAddress')}
                  </label>
                  <input
                    type="email"
                    value={formData.recipientEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, recipientEmail: e.target.value }))}
                    placeholder="recipient@example.com"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {(formData.deliveryMethod === 'phone' || formData.deliveryMethod === 'both') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('schedc.phoneNumber')}
                  </label>
                  <input
                    type="tel"
                    value={formData.recipientPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, recipientPhone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Contact Selector Modal */}
          {showContactSelector && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    {t('schedc.selectContact')}
                  </h3>
                  <button
                    onClick={() => setShowContactSelector(false)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {loadingContacts ? (
                  <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : contacts.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <Users className="w-16 h-16 text-gray-400 mb-4" />
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                      {t('schedc.noContactsFound')}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
                      {t('schedc.addContactsFirst')}
                    </p>
                    <Link
                      href="/usersDashboard/contacts?add=1"
                      className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                    >
                      {t('contacts.addContact')}
                    </Link>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto">
                    <div className="space-y-3">
                      {contacts.map((contact) => (
                        <button
                          key={contact.id}
                          type="button"
                          onClick={() => handleContactSelect(contact)}
                          className="w-full p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                              <User className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-800 dark:text-white">{contact.name}</h4>
                              <div className="space-y-1 mt-1 text-sm text-gray-500">
                                {contact.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {contact.phone}
                                  </div>
                                )}
                                {contact.email && (
                                  <div className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {contact.email}
                                  </div>
                                )}
                              </div>
                              {contact.relationship && (
                                <div className="mt-2">
                                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                                    {contact.relationship}
                                  </span>
                                </div>
                              )}
                            </div>
                            {formData.recipientContactId === contact.id && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Step 3: Scheduling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                {t('schedc.scheduleDelivery')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('schedc.scheduleDeliveryHint')}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Quick Schedule */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('schedc.quickSchedule')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: t('schedc.tomorrowMorning'), hours: 24 },
                  { label: t('schedc.in2Days'), hours: 48 },
                  { label: t('schedc.nextWeek'), hours: 168 },
                  { label: t('schedc.nextMonth'), hours: 720 }
                ].map((option) => (
                  <button
                    key={option.hours}
                    type="button"
                    onClick={() => setQuickDate(option.hours)}
                    className="p-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <CalendarClock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(addDays(new Date(), option.hours / 24), lang === 'es' ? 'd MMM, HH:mm' : 'MMM d, h:mm a', { locale: dateLocale })}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date/Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('schedc.customDate')}
              </label>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t('schedc.suggestedTimes')}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {availableTimes.slice(0, 8).map((time, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, scheduledFor: time.toISOString() }))}
                      className={`p-2 rounded-lg text-sm text-center transition-colors ${
                        formData.scheduledFor && new Date(formData.scheduledFor).getTime() === time.getTime()
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {format(time, lang === 'es' ? 'd MMM' : 'MMM d', { locale: dateLocale })}<br />
                      {format(time, lang === 'es' ? 'HH:mm' : 'h:mm a')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recurring Option */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">{t('schedc.recurring')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('schedc.recurringHint')}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {formData.isRecurring && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('schedc.frequency')}
                      </label>
                      <select
                        value={formData.recurrence.type}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          recurrence: { ...prev.recurrence, type: e.target.value }
                        }))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                      >
                        <option value="none">{t('schedc.freqNone')}</option>
                        <option value="daily">{t('schedc.freqDaily')}</option>
                        <option value="weekly">{t('schedc.freqWeekly')}</option>
                        <option value="monthly">{t('schedc.freqMonthly')}</option>
                        <option value="yearly">{t('schedc.freqYearly')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('schedc.interval')}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={formData.recurrence.interval}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          recurrence: { ...prev.recurrence, interval: parseInt(e.target.value) }
                        }))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('schedc.endDate')}
                      </label>
                      <input
                        type="date"
                        value={formData.recurrence.endDate}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          recurrence: { ...prev.recurrence, endDate: e.target.value }
                        }))}
                        min={format(new Date(), "yyyy-MM-dd")}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('schedc.totalOccurrences')}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.recurrence.occurrences}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          recurrence: { ...prev.recurrence, occurrences: parseInt(e.target.value) }
                        }))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Step 4: Review & Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-500" />
                {t('schedc.reviewTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('schedc.reviewHint')}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Preview */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4">{t('schedc.preview')}</h3>
              
              {selectedVoiceNote ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl">
                    <FileAudio className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 dark:text-white">{selectedVoiceNote.title}</h4>
                      {selectedVoiceNote.description && (
                        <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedVoiceNote.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl">
                    <Users className="w-5 h-5 text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 dark:text-white">
                        {selectedContact 
                          ? t('schedc.to', { name: selectedContact.name })
                          : formData.recipientEmail || formData.recipientPhone
                            ? t('schedc.to', { name: formData.recipientEmail || formData.recipientPhone })
                            : t('schedc.noRecipientSelected')
                        }
                      </h4>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {t('schedc.via')}: {formData.deliveryMethod === 'both' ? t('schedc.emailAndPhone') : 
                               formData.deliveryMethod === 'email' ? t('contacts.email') : t('contacts.phone')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl">
                    <Calendar className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 dark:text-white">
                        {formData.scheduledFor 
                          ? t('schedc.scheduledFor', { date: format(new Date(formData.scheduledFor), dateTimePattern(lang), { locale: dateLocale }) })
                          : t('schedc.noDateSelected')
                        }
                      </h4>
                      {formData.isRecurring && formData.recurrence.type !== 'none' && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {t('schedc.recurEvery', { interval: formData.recurrence.interval, unit: t(`schedc.unit.${formData.recurrence.type}`) })}
                          {formData.recurrence.occurrences > 1 && 
                            ` • ${t('schedc.occurrencesCount', { count: formData.recurrence.occurrences })}`
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileAudio className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">{t('schedc.selectToPreview')}</p>
                </div>
              )}
            </div>

            {/* Custom Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('schedc.customMessage')}
              </label>
              <textarea
                value={formData.customMessage}
                onChange={(e) => setFormData(prev => ({ ...prev, customMessage: e.target.value }))}
                placeholder={t('schedc.customMessagePlaceholder')}
                rows="3"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

             {/* Tier Limitations */}
        {isLiteTier && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white">{t('sched.liteLimitTitle')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('schedc.liteLimitDesc')}
                </p>
                <Link
                  href="/usersDashboard/billing"
                  className="inline-block mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {t('dash.upgradePlan')} →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/usersDashboard/scheduled"
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-center transition-colors"
          >
            {t('common.cancel')}
          </Link>
          <button
            type="submit"
            disabled={loading || !formData.voiceNoteId || !formData.scheduledFor}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('schedc.scheduling')}
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5" />
                {t('dash.scheduleMessage')}
              </>
            )}
          </button>
        </div>
        </div>
        </motion.div>
      </form>
    </div>
  );
}