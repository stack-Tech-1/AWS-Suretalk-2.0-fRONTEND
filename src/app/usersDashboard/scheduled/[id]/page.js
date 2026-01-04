// /app/usersDashboard/scheduled/[id]/page.js
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
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  X,
  Share2,
  Download,
  Copy,
  Eye,
  Bell,
  RefreshCw,
  CalendarClock,
  FileText,
  Shield,
  Zap,
  ExternalLink,
  MessageSquare,
  MoreVertical
} from "lucide-react";
import { api } from "@/utils/api";
import { format, parseISO, formatDistanceToNow, isAfter, isBefore } from "date-fns";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function ScheduledMessageDetail() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [voiceNote, setVoiceNote] = useState(null);
  const [contact, setContact] = useState(null);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDownloadUrl, setShowDownloadUrl] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Load message details
  useEffect(() => {
    loadMessageDetails();
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

  // Handle cancel message
  const handleCancelMessage = async () => {
    try {
      setActionLoading("cancel");
      
      const response = await api.cancelScheduledMessage(params.id);
      
      if (response.success) {
        toast.success("Message cancelled successfully");
        setMessage(prev => ({ ...prev, delivery_status: "cancelled" }));
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error("Failed to cancel message:", error);
      toast.error(error.message || "Failed to cancel message");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle update status
  const handleUpdateStatus = async (newStatus) => {
    try {
      setActionLoading("status");
      
      // Here you would call the actual API endpoint
      // For now, update locally
      setMessage(prev => ({ ...prev, delivery_status: newStatus }));
      toast.success(`Status updated to ${newStatus}`);
      
      // Refresh details
      await loadMessageDetails();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle send test
  const handleSendTest = async () => {
    try {
      setActionLoading("test");
      
      const response = await api.sendTestMessage({
        voiceNoteId: message.voice_note_id,
        recipientEmail: message.recipient_email,
        recipientPhone: message.recipient_phone,
        deliveryMethod: message.delivery_method
      });
      
      if (response.success) {
        toast.success("Test message sent successfully");
      }
    } catch (error) {
      console.error("Failed to send test:", error);
      toast.error(error.message || "Failed to send test");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle copy info
  const handleCopyInfo = async () => {
    const info = `Message: ${message.voice_note_title || "Voice Message"}
Recipient: ${contact?.name || message.recipient_email || message.recipient_phone}
Scheduled: ${format(parseISO(message.scheduled_for), "MMM d, yyyy • h:mm a")}
Status: ${message.delivery_status}
Message ID: ${message.id}`;
    
    try {
      await navigator.clipboard.writeText(info);
      toast.success("Message info copied to clipboard");
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy info");
    }
  };

  // Handle get download URL
  const handleGetDownloadUrl = async () => {
    try {
      if (message.voiceNoteDownloadUrl) {
        setShowDownloadUrl(message.voiceNoteDownloadUrl);
      } else if (voiceNote?.s3_key && voiceNote?.s3_bucket) {
        const response = await api.getDownloadUrl(
          voiceNote.s3_key,
          voiceNote.s3_bucket,
          3600
        );
        setShowDownloadUrl(response.data?.url || response.downloadUrl);
      }
    } catch (error) {
      console.error("Failed to get download URL:", error);
      toast.error("Failed to get download URL");
    }
  };

  // Get status info
  const getStatusInfo = (status) => {
    const scheduledDate = message?.scheduled_for ? parseISO(message.scheduled_for) : null;
    const isUpcoming = scheduledDate && isAfter(scheduledDate, new Date());
    const isPastDue = scheduledDate && isBefore(scheduledDate, new Date()) && status === "scheduled";

    switch (status) {
      case "scheduled":
        if (isPastDue) {
          return {
            icon: AlertCircle,
            color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
            label: "Past Due"
          };
        }
        return {
          icon: isUpcoming ? CalendarClock : Clock,
          color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
          label: isUpcoming ? "Upcoming" : "Scheduled"
        };
      case "delivered":
        return {
          icon: CheckCircle,
          color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
          label: "Delivered"
        };
      case "failed":
        return {
          icon: AlertCircle,
          color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
          label: "Failed"
        };
      case "cancelled":
        return {
          icon: X,
          color: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
          label: "Cancelled"
        };
      case "testing":
        return {
          icon: Bell,
          color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
          label: "Testing"
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
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
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
  const canEdit = message.delivery_status === "scheduled";

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <Link
              href="/usersDashboard/scheduled"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl mt-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  {message.voice_note_title || "Scheduled Message"}
                </h1>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                  <statusInfo.icon className="w-4 h-4" />
                  {statusInfo.label}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Scheduled for {format(scheduledDate, "MMM d, yyyy • h:mm a")}
                {isUpcoming && ` • ${formatDistanceToNow(scheduledDate, { addSuffix: true })}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyInfo}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
              title="Copy Info"
            >
              <Copy className="w-5 h-5" />
            </button>
            {canEdit && (
              <Link
                href={`/usersDashboard/scheduled/${params.id}/edit`}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                title="Edit"
              >
                <Edit className="w-5 h-5" />
              </Link>
            )}
            {canCancel && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 rounded-xl"
                title="Cancel"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {["overview", "details", "activity"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab === "overview" && "Overview"}
                {tab === "details" && "Details"}
                {tab === "activity" && "Activity"}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {activeTab === "overview" && (
            <>
              {/* Message Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">Message Details</h2>
                  <div className={deliveryMethodInfo.color + " flex items-center gap-1 px-3 py-1 rounded-full"}>
                    <deliveryMethodInfo.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{deliveryMethodInfo.label}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Voice Note */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <FileAudio className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 dark:text-white">
                              {message.voice_note_title || "Voice Message"}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Voice Note
                            </p>
                          </div>
                        </div>
                        {voiceNote?.description && (
                          <p className="text-gray-600 dark:text-gray-400 mt-2">{voiceNote.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3">
                          {voiceNote && (
                            <>
                              <span className="text-sm text-gray-500">
                                {Math.round(voiceNote.duration_seconds / 60)} min
                              </span>
                              <span className="text-sm text-gray-500">
                                {format(parseISO(voiceNote.created_at), "MMM d, yyyy")}
                              </span>
                              {voiceNote.is_permanent && (
                                <span className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400">
                                  <Shield className="w-3 h-3" />
                                  Permanent
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      {message.voice_note_id && (
                        <Link
                          href={`/usersDashboard/voice-notes/${message.voice_note_id}`}
                          className="ml-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                          title="View Voice Note"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleGetDownloadUrl}
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        <Download className="w-4 h-4" />
                        Get Download Link
                      </button>
                    </div>
                  </div>

                  {/* Recipient */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <User className="w-5 h-5 text-green-500" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 dark:text-white">
                              {contact?.name || message.recipient_email || message.recipient_phone || "Recipient"}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {contact ? "Contact" : "Manual Recipient"}
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
                        
                        {contact?.relationship && (
                          <div className="mt-3">
                            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                              {contact.relationship}
                            </span>
                          </div>
                        )}
                      </div>
                      {contact && (
                        <Link
                          href={`/usersDashboard/contacts/${contact.id}`}
                          className="ml-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                          title="View Contact"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Calendar className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-white">Schedule</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Delivery timing
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Scheduled For</span>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {format(scheduledDate, "MMM d, yyyy • h:mm a")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Created On</span>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {format(parseISO(message.created_at), "MMM d, yyyy • h:mm a")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Time Zone</span>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {Intl.DateTimeFormat().resolvedOptions().timeZone}
                        </span>
                      </div>
                      {isUpcoming && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CalendarClock className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-blue-600 dark:text-blue-400">
                              Delivering {formatDistanceToNow(scheduledDate, { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Custom Message */}
                  {message.custom_message && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                          <MessageSquare className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 dark:text-white">Custom Message</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Additional note included
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{message.custom_message}</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Actions Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Actions</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {canEdit && (
                    <Link
                      href={`/usersDashboard/scheduled/${params.id}/edit`}
                      className="p-4 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Edit className="w-5 h-5 text-blue-500" />
                        <div>
                          <h3 className="font-medium text-gray-800 dark:text-white">Edit Message</h3>
                          <p className="text-sm text-gray-500">Update schedule or recipient</p>
                        </div>
                      </div>
                    </Link>
                  )}

                  {canCancel && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="p-4 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Trash2 className="w-5 h-5 text-red-500" />
                        <div>
                          <h3 className="font-medium text-gray-800 dark:text-white">Cancel Message</h3>
                          <p className="text-sm text-gray-500">Stop scheduled delivery</p>
                        </div>
                      </div>
                    </button>
                  )}

                  <button
                    onClick={handleSendTest}
                    disabled={!canEdit || actionLoading === "test"}
                    className="p-4 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-purple-500" />
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-white">Send Test</h3>
                        <p className="text-sm text-gray-500">Test delivery to yourself</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={handleCopyInfo}
                    className="p-4 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Copy className="w-5 h-5 text-gray-500" />
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-white">Copy Info</h3>
                        <p className="text-sm text-gray-500">Copy message details</p>
                      </div>
                    </div>
                  </button>
                </div>
              </motion.div>
            </>
          )}

          {activeTab === "details" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Technical Details</h2>
              
              <div className="space-y-6">
                {/* Message Metadata */}
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white mb-4">Message Metadata</h3>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                    <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {JSON.stringify(message.metadata || {}, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Delivery Information */}
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white mb-4">Delivery Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">Message ID</span>
                      <code className="text-sm font-mono text-gray-800 dark:text-gray-300">{message.id}</code>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">Voice Note ID</span>
                      <code className="text-sm font-mono text-gray-800 dark:text-gray-300">{message.voice_note_id || "N/A"}</code>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">Contact ID</span>
                      <code className="text-sm font-mono text-gray-800 dark:text-gray-300">{message.recipient_contact_id || "N/A"}</code>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">Delivery Attempts</span>
                      <span className="font-medium text-gray-800 dark:text-white">{message.delivery_attempts || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Error Log */}
                {message.error_message && (
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white mb-4">Error Information</h3>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-800 dark:text-red-300">Delivery Error</h4>
                          <p className="text-sm text-red-700 dark:text-red-400 mt-1">{message.error_message}</p>
                          {message.last_attempt_at && (
                            <p className="text-xs text-red-600 dark:text-red-500 mt-2">
                              Last attempt: {format(parseISO(message.last_attempt_at), "MMM d, yyyy • h:mm a")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "activity" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Activity Log</h2>
              
              <div className="space-y-6">
                {/* Timeline */}
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                  
                  <div className="space-y-8">
                    {/* Created */}
                    <div className="relative">
                      <div className="absolute left-4 -translate-x-1/2 w-4 h-4 rounded-full bg-green-500" />
                      <div className="ml-10">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-800 dark:text-white">Message Scheduled</h3>
                          <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                            Created
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Message was scheduled for delivery
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(parseISO(message.created_at), "MMM d, yyyy • h:mm a")}
                        </p>
                      </div>
                    </div>

                    {/* Updated */}
                    {message.updated_at !== message.created_at && (
                      <div className="relative">
                        <div className="absolute left-4 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-500" />
                        <div className="ml-10">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-800 dark:text-white">Message Updated</h3>
                            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                              Updated
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Message details were updated
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(parseISO(message.updated_at), "MMM d, yyyy • h:mm a")}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Status Changes */}
                    {message.delivered_at && (
                      <div className="relative">
                        <div className="absolute left-4 -translate-x-1/2 w-4 h-4 rounded-full bg-green-500" />
                        <div className="ml-10">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-800 dark:text-white">Message Delivered</h3>
                            <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                              Delivered
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Message was successfully delivered to recipient
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(parseISO(message.delivered_at), "MMM d, yyyy • h:mm a")}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Scheduled Time */}
                    <div className="relative">
                      <div className="absolute left-4 -translate-x-1/2 w-4 h-4 rounded-full bg-purple-500" />
                      <div className="ml-10">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-800 dark:text-white">Scheduled Delivery Time</h3>
                          <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                            Scheduled
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Message is scheduled for delivery
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(scheduledDate, "MMM d, yyyy • h:mm a")}
                          {isUpcoming && ` • ${formatDistanceToNow(scheduledDate, { addSuffix: true })}`}
                        </p>
                      </div>
                    </div>

                    {/* Last Attempt */}
                    {message.last_attempt_at && (
                      <div className="relative">
                        <div className="absolute left-4 -translate-x-1/2 w-4 h-4 rounded-full bg-yellow-500" />
                        <div className="ml-10">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-800 dark:text-white">Delivery Attempt</h3>
                            <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full">
                              Attempt #{message.delivery_attempts || 1}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Delivery attempt was made
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(parseISO(message.last_attempt_at), "MMM d, yyyy • h:mm a")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Status Overview</h3>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${statusInfo.color}`}>
                <div className="flex items-center gap-3">
                  <statusInfo.icon className="w-6 h-6" />
                  <div>
                    <h4 className="font-bold text-lg">{statusInfo.label}</h4>
                    <p className="text-sm opacity-90">
                      {message.delivery_status === "scheduled" && isUpcoming
                        ? "Scheduled for future delivery"
                        : message.delivery_status === "scheduled"
                        ? "Past due - awaiting delivery"
                        : message.delivery_status === "delivered"
                        ? "Successfully delivered"
                        : message.delivery_status === "failed"
                        ? "Delivery failed"
                        : message.delivery_status === "cancelled"
                        ? "Delivery cancelled"
                        : "Unknown status"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Delivery Method</span>
                  <div className="flex items-center gap-1">
                    <deliveryMethodInfo.icon className="w-4 h-4" />
                    <span className="font-medium">{deliveryMethodInfo.label}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Delivery Attempts</span>
                  <span className="font-medium">{message.delivery_attempts || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Created</span>
                  <span className="font-medium">{format(parseISO(message.created_at), "MMM d, yyyy")}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
                  <span className="font-medium">{format(parseISO(message.updated_at), "MMM d, yyyy")}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              {canEdit && (
                <Link
                  href={`/usersDashboard/scheduled/${params.id}/edit`}
                  className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                  <span className="font-medium">Edit Message</span>
                </Link>
              )}

              {canCancel && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-left"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="font-medium">Cancel Message</span>
                </button>
              )}

              <button
                onClick={handleSendTest}
                disabled={!canEdit || actionLoading === "test"}
                className="w-full flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left disabled:opacity-50"
              >
                <Bell className="w-5 h-5" />
                <span className="font-medium">Send Test</span>
              </button>

              <button
                onClick={handleCopyInfo}
                className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <Copy className="w-5 h-5" />
                <span className="font-medium">Copy Info</span>
              </button>

              <Link
                href="/usersDashboard/scheduled"
                className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to List</span>
              </Link>
            </div>
          </motion.div>

          {/* Related Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Related</h3>
            
            <div className="space-y-3">
              {message.voice_note_id && (
                <Link
                  href={`/usersDashboard/voice-notes/${message.voice_note_id}`}
                  className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <FileAudio className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">View Voice Note</p>
                    <p className="text-sm text-gray-500">Original recording</p>
                  </div>
                </Link>
              )}

              {contact && (
                <Link
                  href={`/usersDashboard/contacts/${contact.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <User className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">View Contact</p>
                    <p className="text-sm text-gray-500">Recipient details</p>
                  </div>
                </Link>
              )}

              <Link
                href="/usersDashboard/scheduled/create"
                className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <Plus className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Schedule New</p>
                  <p className="text-sm text-gray-500">Create another message</p>
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

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
                Keep Scheduled
              </button>
              <button
                onClick={handleCancelMessage}
                disabled={actionLoading === "cancel"}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {actionLoading === "cancel" ? (
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

      {/* Download URL Modal */}
      {showDownloadUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Download Link</h3>
              <button
                onClick={() => setShowDownloadUrl(null)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This link will expire in 1 hour. Copy it to share with others:
            </p>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-4">
              <code className="text-sm break-all text-gray-800 dark:text-gray-300">{showDownloadUrl}</code>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(showDownloadUrl);
                  toast.success("Link copied to clipboard");
                }}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                Copy Link
              </button>
              <button
                onClick={() => window.open(showDownloadUrl, '_blank')}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Open Link
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}