"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Phone,
  Mail,
  Shield,
  MessageSquare,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  Calendar,
  FileText,
  Loader2,
  AlertCircle,
  Check,
  X,
  User
} from "lucide-react";
import { api } from "@/utils/api";
import { toast } from "@/components/ui/Toast";
import Link from "next/link";

const RELATIONSHIP_OPTIONS = [
  "friend",
  "family",
  "work",
  "beneficiary",
  "other"
];

export default function ContactDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [contact, setContact] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    email: "",
    relationship: "",
    isBeneficiary: false,
    canReceiveMessages: true,
    notes: ""
  });

  useEffect(() => {
    fetchContact();
  }, [id]);

  const fetchContact = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getContact(id);
      if (response.success) {
        const c = response.data;
        setContact(c);
        setEditForm({
          name: c.name || "",
          phone: c.phone || "",
          email: c.email || "",
          relationship: c.relationship || "",
          isBeneficiary: c.is_beneficiary || false,
          canReceiveMessages: c.can_receive_messages !== false,
          notes: c.notes || ""
        });
      } else {
        throw new Error(response.error || "Contact not found");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editForm.name.trim() || !editForm.phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }
    try {
      setSaving(true);
      const response = await api.updateContact(id, {
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        email: editForm.email.trim() || undefined,
        relationship: editForm.relationship || undefined,
        isBeneficiary: editForm.isBeneficiary,
        canReceiveMessages: editForm.canReceiveMessages,
        notes: editForm.notes.trim() || undefined
      });
      if (response.success) {
        setContact(response.data);
        setIsEditing(false);
        toast.success("Contact updated successfully");
      } else {
        throw new Error(response.error || "Failed to update contact");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await api.deleteContact(id);
      if (response.success) {
        toast.success("Contact deleted");
        router.push("/usersDashboard/contacts");
      } else {
        throw new Error(response.error || "Failed to delete contact");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggleBeneficiary = async () => {
    const newVal = !contact.is_beneficiary;
    try {
      const response = await api.updateContact(id, { isBeneficiary: newVal });
      if (response.success) {
        setContact(prev => ({ ...prev, is_beneficiary: newVal }));
        toast.success(newVal ? "Added as beneficiary" : "Removed from beneficiaries");
      }
    } catch {
      toast.error("Failed to update beneficiary status");
    }
  };

  const handleToggleMessages = async () => {
    const newVal = !contact.can_receive_messages;
    try {
      const response = await api.updateContact(id, { canReceiveMessages: newVal });
      if (response.success) {
        setContact(prev => ({ ...prev, can_receive_messages: newVal }));
        toast.success(newVal ? "Contact can now receive messages" : "Contact cannot receive messages");
      }
    } catch {
      toast.error("Failed to update message status");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Unknown";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric"
    });
  };

  const relationshipColor = (rel) => {
    switch (rel) {
      case "family":     return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400";
      case "work":       return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
      case "beneficiary":return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
      default:           return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !contact) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/usersDashboard/contacts"
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-brand-500 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Contacts
        </Link>
        <div className="card p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-300">{error || "Contact not found"}</p>
          <button
            onClick={fetchContact}
            className="mt-4 px-4 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const displayRelationship = contact.relationship || "friend";

  // ── Main ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Back link */}
      <Link
        href="/usersDashboard/contacts"
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-brand-500 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Contacts
      </Link>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {contact.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{contact.name}</h1>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${relationshipColor(displayRelationship)}`}>
                {displayRelationship.charAt(0).toUpperCase() + displayRelationship.slice(1)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Edit contact"
              >
                <Edit2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete contact"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleToggleBeneficiary}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              contact.is_beneficiary
                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500"
            }`}
            title="Toggle beneficiary status"
          >
            <Shield className="w-4 h-4" />
            {contact.is_beneficiary ? "Beneficiary" : "Not a beneficiary"}
          </button>

          <button
            onClick={handleToggleMessages}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              contact.can_receive_messages
                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                : "bg-red-100 dark:bg-red-900/30 text-red-500"
            }`}
            title="Toggle message receiving"
          >
            {contact.can_receive_messages
              ? <><UserCheck className="w-4 h-4" /> Can receive messages</>
              : <><UserX className="w-4 h-4" /> Cannot receive messages</>
            }
          </button>
        </div>
      </motion.div>

      {/* Details / Edit form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 dark:text-white">Contact Information</h2>
          {isEditing && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({
                    name: contact.name || "",
                    phone: contact.phone || "",
                    email: contact.email || "",
                    relationship: contact.relationship || "",
                    isBeneficiary: contact.is_beneficiary || false,
                    canReceiveMessages: contact.can_receive_messages !== false,
                    notes: contact.notes || ""
                  });
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
              <input
                type="text"
                value={editForm.name}
                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={editForm.email}
                onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Relationship</label>
              <select
                value={editForm.relationship}
                onChange={e => setEditForm(f => ({ ...f, relationship: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Select relationship</option>
                {RELATIONSHIP_OPTIONS.map(r => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea
                value={editForm.notes}
                onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.isBeneficiary}
                  onChange={e => setEditForm(f => ({ ...f, isBeneficiary: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Beneficiary</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.canReceiveMessages}
                  onChange={e => setEditForm(f => ({ ...f, canReceiveMessages: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Can receive messages</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{contact.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{contact.email || "No email"}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <User className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{displayRelationship.charAt(0).toUpperCase() + displayRelationship.slice(1)}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <span>Added {formatDate(contact.created_at)}</span>
            </div>
            {contact.notes && (
              <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <p className="text-sm">{contact.notes}</p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Actions */}
      {!isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push(`/usersDashboard/voice-notes/record?contact=${contact.id}`)}
              disabled={!contact.can_receive_messages}
              className="flex items-center gap-2 px-4 py-2 border-2 border-brand-500 text-brand-600 dark:text-brand-400 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title={!contact.can_receive_messages ? "This contact cannot receive messages" : ""}
            >
              <MessageSquare className="w-4 h-4" />
              Send Message
            </button>
          </div>
        </motion.div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-xl"
          >
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Delete Contact</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete <strong>{contact.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
