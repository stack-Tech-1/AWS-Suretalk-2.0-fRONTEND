"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  UserPlus, 
  Search, 
  Phone, 
  Mail, 
  MessageSquare, 
  MoreVertical,
  Edit,
  Trash2,
  Star,
  Filter,
  Calendar,
  Loader2,
  AlertCircle,
  Shield,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  Users,
  Plus
} from "lucide-react";
import { api } from "@/utils/api";
import { useAnalytics } from "@/hooks/useAnalytics.client";
//import ContactsSelector from "@/components/shared/ContactsSelector";

export default function Contacts() {
  const router = useRouter();
  const analytics = useAnalytics();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({
    totalContacts: 0,
    contactLimit: 9,
    beneficiaries: 0,
    canReceiveMessages: 0,
    remainingContacts: 0,
    tier: 'ESSENTIAL'
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0
  });
  
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedContactForMessage, setSelectedContactForMessage] = useState(null);

  // New contact form state
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    email: "",
    relationship: "",
    isBeneficiary: false,
    canReceiveMessages: true,
    notes: ""
  });

  // Fetch contacts data
  const fetchContacts = async (page = 1, search = searchQuery) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: pagination.limit
      };

      if (search) {
        params.search = search;
      }

      // Fetch contacts with pagination
      const response = await api.getContacts(params);
      
      if (response.success) {
        const contactsData = response.data.contacts || [];
        const paginationData = response.data.pagination || {};
        
        // Format contacts for display
        const formattedContacts = contactsData.map(contact => {
          // Determine type based on relationship and beneficiary status
          let type = "friend";
          if (contact.relationship) {
            type = contact.relationship;
          } else if (contact.is_beneficiary) {
            type = "beneficiary";
          }

          // Calculate last contact time
          let lastContact = "Never";
          if (contact.updated_at) {
            const updatedDate = new Date(contact.updated_at);
            const now = new Date();
            const diffTime = Math.abs(now - updatedDate);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) lastContact = "Today";
            else if (diffDays === 1) lastContact = "Yesterday";
            else if (diffDays < 7) lastContact = `${diffDays} days ago`;
            else if (diffDays < 30) lastContact = `${Math.floor(diffDays / 7)} weeks ago`;
            else lastContact = `${Math.floor(diffDays / 30)} months ago`;
          }

          return {
            id: contact.id,
            name: contact.name,
            phone: contact.phone,
            email: contact.email || "No email",
            type: type,
            relationship: contact.relationship,
            isBeneficiary: contact.is_beneficiary || false,
            canReceiveMessages: contact.can_receive_messages !== false,
            lastContact: lastContact,
            notes: contact.notes,
            createdAt: contact.created_at,
            updatedAt: contact.updated_at,
            favorite: false // Will be updated from voice notes interactions
          };
        });

        setContacts(formattedContacts);
        setPagination({
          page: paginationData.page || page,
          limit: paginationData.limit || pagination.limit,
          total: paginationData.total || 0,
          totalPages: paginationData.totalPages || 1
        });

        // Fetch contact statistics
        fetchContactStats();

        // Record analytics
        analytics.recordEvent('page_view', {
          page: 'contacts',
          search: search ? 'yes' : 'no',
          pageNumber: page
        });

        analytics.recordEvent('contact_added', {
          contactName: response.data.name,
          hasEmail: !!response.data.email,
          isBeneficiary: response.data.is_beneficiary
        });

      } else {
        throw new Error(response.error || 'Failed to fetch contacts');
      }

    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      setError('Failed to load contacts. Please try again.');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch contact statistics
  const fetchContactStats = async () => {
    try {
      const response = await api.getContactStats();
      if (response.success) {
        setStats({
          totalContacts: response.data.total_contacts || 0,
          contactLimit: response.data.contact_limit || 9,
          beneficiaries: response.data.beneficiaries || 0,
          canReceiveMessages: response.data.can_receive_messages || 0,
          remainingContacts: response.data.remaining_contacts || 0,
          tier: response.data.tier || 'ESSENTIAL'
        });
      }
    } catch (error) {
      console.warn('Failed to fetch contact stats:', error);
    }
  };

  // Create new contact
  const handleCreateContact = async () => {
    try {
      setLoading(true);
      
      const response = await api.createContact(newContact);
      
      if (response.success) {
        // Reset form
        setNewContact({
          name: "",
          phone: "",
          email: "",
          relationship: "",
          isBeneficiary: false,
          canReceiveMessages: true,
          notes: ""
        });
        
        // Close modal
        setShowAddModal(false);
        
        // Refresh contacts list
        await fetchContacts();
        
        // Record analytics
        analytics.recordEvent('contact_added', {
          contactName: response.data.name,
          hasEmail: !!response.data.email,
          isBeneficiary: response.data.is_beneficiary
        });
        
        alert('Contact added successfully!');
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Failed to create contact:', error);
      alert(`Failed to add contact: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update contact
  const handleUpdateContact = async (contactId, updates) => {
    try {
      const response = await api.updateContact(contactId, updates);
      
      if (response.success) {
        // Update local state
        setContacts(prevContacts =>
          prevContacts.map(contact =>
            contact.id === contactId ? { ...contact, ...updates } : contact
          )
        );
        
        // Refresh stats
        await fetchContactStats();
        
        analytics.recordEvent('contact_updated', { contactId });
        
        return true;
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Failed to update contact:', error);
      alert(`Failed to update contact: ${error.message}`);
      return false;
    }
  };

  // Delete contact
  const handleDeleteContact = async (contactId) => {
    try {
      const response = await api.deleteContact(contactId);
      
      if (response.success) {
        // Remove from local state
        setContacts(prevContacts =>
          prevContacts.filter(contact => contact.id !== contactId)
        );
        
        // Update stats
        await fetchContactStats();
        
        // Record analytics
        analytics.recordEvent('contact_deleted', { contactId });
        
        setShowDeleteModal(false);
        setContactToDelete(null);
        
        alert('Contact deleted successfully!');
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Failed to delete contact:', error);
      alert(`Failed to delete contact: ${error.message}`);
    }
  };

  // Toggle beneficiary status
  const handleToggleBeneficiary = async (contact) => {
    const success = await handleUpdateContact(contact.id, {
      isBeneficiary: !contact.isBeneficiary
    });
    
    if (success) {
      alert(`Contact ${!contact.isBeneficiary ? 'added to' : 'removed from'} beneficiaries`);
    }
  };

  // Toggle message receiving
  const handleToggleMessageReceiving = async (contact) => {
    const success = await handleUpdateContact(contact.id, {
      canReceiveMessages: !contact.canReceiveMessages
    });
    
    if (success) {
      alert(`Contact ${!contact.canReceiveMessages ? 'can now' : 'cannot'} receive messages`);
    }
  };

  // Send message to contact
  const handleSendMessage = (contact) => {
    // Navigate to voice notes with pre-selected contact
    router.push(`/usersDashboard/voice-notes/record?contact=${contact.id}`);
    
    analytics.recordEvent('contact_message_initiated', {
      contactId: contact.id,
      contactName: contact.name
    });
  };

  // View contact details
  const handleViewContactDetails = (contact) => {
    router.push(`/usersDashboard/contacts/${contact.id}`);
  };

  // Bulk operations
  const toggleBulkMode = () => {
    setBulkMode(!bulkMode);
    setSelectedContacts([]);
  };

  const toggleContactSelection = (contactId) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedContacts.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedContacts.length} selected contact(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete each contact
      for (const contactId of selectedContacts) {
        await api.deleteContact(contactId);
      }

      // Record analytics
      analytics.recordEvent('contacts_bulk_deleted', {
        count: selectedContacts.length
      });

      // Refresh data
      await fetchContacts();
      await fetchContactStats();

      // Clear selection
      setSelectedContacts([]);
      setBulkMode(false);

      alert(`${selectedContacts.length} contact(s) deleted successfully`);

    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('Failed to delete contacts. Please try again.');
    }
  };

  const handleBulkToggleBeneficiary = async () => {
    if (selectedContacts.length === 0) return;
    
    const firstContact = contacts.find(c => c.id === selectedContacts[0]);
    if (!firstContact) return;
    
    const newBeneficiaryStatus = !firstContact.isBeneficiary;
    
    try {
      // Update each contact
      for (const contactId of selectedContacts) {
        await api.updateContact(contactId, { isBeneficiary: newBeneficiaryStatus });
      }

      // Record analytics
      analytics.recordEvent('contacts_bulk_beneficiary_updated', {
        count: selectedContacts.length,
        action: newBeneficiaryStatus ? 'added' : 'removed'
      });

      // Refresh data
      await fetchContacts();

      // Clear selection
      setSelectedContacts([]);
      setBulkMode(false);

      alert(`${selectedContacts.length} contact(s) ${newBeneficiaryStatus ? 'added to' : 'removed from'} beneficiaries`);

    } catch (error) {
      console.error('Bulk beneficiary update error:', error);
      alert('Failed to update contacts. Please try again.');
    }
  };

  const handleBulkToggleMessageReceiving = async () => {
    if (selectedContacts.length === 0) return;
    
    const firstContact = contacts.find(c => c.id === selectedContacts[0]);
    if (!firstContact) return;
    
    const newMessageStatus = !firstContact.canReceiveMessages;
    
    try {
      // Update each contact
      for (const contactId of selectedContacts) {
        await api.updateContact(contactId, { canReceiveMessages: newMessageStatus });
      }

      // Record analytics
      analytics.recordEvent('contacts_bulk_message_status_updated', {
        count: selectedContacts.length,
        action: newMessageStatus ? 'enabled' : 'disabled'
      });

      // Refresh data
      await fetchContacts();

      // Clear selection
      setSelectedContacts([]);
      setBulkMode(false);

      alert(`${selectedContacts.length} contact(s) ${newMessageStatus ? 'can now' : 'cannot'} receive messages`);

    } catch (error) {
      console.error('Bulk message status update error:', error);
      alert('Failed to update contacts. Please try again.');
    }
  };

  // Handle search with debouncing
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchContacts(1, searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Initial data fetch
  useEffect(() => {
    fetchContacts();
  }, []);

  // Loading state
  if (loading && contacts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Contacts
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {stats.totalContacts === 0 
                ? 'Add and manage your contacts'
                : `Manage ${stats.totalContacts} contact${stats.totalContacts !== 1 ? 's' : ''}`
              }
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {!bulkMode && contacts.length > 0 && (
              <button
                onClick={toggleBulkMode}
                className="flex items-center gap-2 px-4 py-2 border-2 border-brand-500 
                         text-brand-600 dark:text-brand-400 rounded-xl hover:bg-brand-50 
                         dark:hover:bg-brand-900/20 transition-colors"
              >
                <Users className="w-4 h-4" />
                Select Multiple
              </button>
            )}
            
            <button
              onClick={() => setShowAddModal(true)}
              disabled={stats.remainingContacts <= 0}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 
                       text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 
                       disabled:cursor-not-allowed"
              title={stats.remainingContacts <= 0 ? `Contact limit reached (${stats.contactLimit} max)` : ''}
            >
              <UserPlus className="w-4 h-4" />
              Add Contact
            </button>
          </div>
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-red-800 dark:text-red-300">Error Loading Contacts</h3>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
              <button
                onClick={() => fetchContacts()}
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Bulk Operations */}
      {bulkMode && selectedContacts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-brand-500 to-accent-500 rounded-2xl"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">{selectedContacts.length}</span>
              </div>
              <div className="text-white">
                <p className="font-medium">{selectedContacts.length} contact(s) selected</p>
                <p className="text-sm opacity-90">Perform actions on all selected contacts</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleBulkToggleBeneficiary}
                className="px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 
                         transition-colors flex items-center gap-2 text-sm"
              >
                <Shield className="w-3 h-3" />
                Toggle Beneficiary
              </button>
              
              <button
                onClick={handleBulkToggleMessageReceiving}
                className="px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 
                         transition-colors flex items-center gap-2 text-sm"
              >
                <MessageSquare className="w-3 h-3" />
                Toggle Messages
              </button>
              
              <button
                onClick={handleBulkDelete}
                className="px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 
                         transition-colors flex items-center gap-2 text-sm"
              >
                <Trash2 className="w-3 h-3" />
                Delete Selected
              </button>
              
              <button
                onClick={toggleBulkMode}
                className="px-3 py-2 bg-white text-brand-600 rounded-lg hover:bg-gray-100 
                         transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search and Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                placeholder="Search contacts by name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                         focus:border-transparent transition-all"
                disabled={loading}
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Contact Stats */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Contact Limit</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-800 dark:text-white">
                    {stats.totalContacts}/{stats.contactLimit}
                  </span>
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        stats.totalContacts >= stats.contactLimit
                          ? 'bg-red-500'
                          : stats.totalContacts >= stats.contactLimit * 0.8
                          ? 'bg-yellow-500'
                          : 'bg-gradient-to-r from-brand-500 to-accent-500'
                      }`}
                      style={{ width: `${Math.min(100, (stats.totalContacts / stats.contactLimit) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <UserPlus className="w-8 h-8 text-blue-500" />
            </div>
            {stats.remainingContacts <= 0 && (
              <p className="text-xs text-red-500 mt-2">Contact limit reached. Please upgrade to add more.</p>
            )}
          </div>

          {/* Additional Stats */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Beneficiaries</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {stats.beneficiaries}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Can receive Legacy Vault messages
                </p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contacts Grid */}
      {loading && contacts.length > 0 ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-brand-500 animate-spin mr-2" />
          <span className="text-gray-600 dark:text-gray-400">Loading more contacts...</span>
        </div>
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className={`glass rounded-2xl p-6 card-hover group relative ${
              selectedContacts.includes(contact.id) ? 'ring-2 ring-brand-500 ring-offset-2' : ''
            }`}
            onClick={(e) => {
              if (bulkMode && !e.target.closest('button')) {
                toggleContactSelection(contact.id);
              }
            }}
          >
            {/* Bulk selection checkbox */}
            {bulkMode && (
              <div className="absolute top-4 right-4">
                <input
                  type="checkbox"
                  checked={selectedContacts.includes(contact.id)}
                  onChange={() => toggleContactSelection(contact.id)}
                  className="w-5 h-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
              </div>
            )}

            {/* Contact Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 
                              flex items-center justify-center">
                  <span className="font-bold text-white text-lg">
                    {contact.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800 dark:text-white">
                      {contact.name}
                    </h3>
                    {contact.isBeneficiary && (
                      <Shield className="w-4 h-4 text-purple-500" title="Beneficiary" />
                    )}
                    {!contact.canReceiveMessages && (
                      <UserX className="w-4 h-4 text-red-500" title="Cannot receive messages" />
                    )}
                  </div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1
                    ${contact.type === 'family' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                      contact.type === 'work' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                      contact.type === 'beneficiary' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                      'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}>
                    {contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}
                  </span>
                </div>
              </div>
              {!bulkMode && (
                <button 
                  onClick={() => handleViewContactDetails(contact)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  title="View details"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{contact.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{contact.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Last updated: {contact.lastContact}</span>
              </div>
              {contact.notes && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">{contact.notes}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {!bulkMode && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleSendMessage(contact)}
                  className="flex-1 px-4 py-2 border-2 border-brand-500 text-brand-600 dark:text-brand-400 
                           rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors 
                           flex items-center justify-center gap-2"
                  disabled={!contact.canReceiveMessages}
                  title={!contact.canReceiveMessages ? "This contact cannot receive messages" : ""}
                >
                  <MessageSquare className="w-4 h-4" />
                  Message
                </button>
                <button 
                  onClick={() => handleToggleBeneficiary(contact)}
                  className={`p-2 rounded-lg transition-colors ${
                    contact.isBeneficiary 
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  title={contact.isBeneficiary ? "Remove from beneficiaries" : "Add as beneficiary"}
                >
                  <Shield className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleToggleMessageReceiving(contact)}
                  className={`p-2 rounded-lg transition-colors ${
                    !contact.canReceiveMessages 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  title={contact.canReceiveMessages ? "Disable messages" : "Enable messages"}
                >
                  {contact.canReceiveMessages ? (
                    <UserCheck className="w-4 h-4" />
                  ) : (
                    <UserX className="w-4 h-4" />
                  )}
                </button>
                <button 
                  onClick={() => {
                    setContactToDelete(contact);
                    setShowDeleteModal(true);
                  }}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 rounded-lg"
                  title="Delete contact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </motion.div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center justify-center gap-4 mt-8"
        >
          <button
            onClick={() => fetchContacts(pagination.page - 1)}
            disabled={pagination.page <= 1 || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => fetchContacts(pageNum)}
                  disabled={loading}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    pagination.page === pageNum
                      ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            {pagination.totalPages > 5 && pagination.page < pagination.totalPages - 2 && (
              <>
                <span className="text-gray-500">...</span>
                <button
                  onClick={() => fetchContacts(pagination.totalPages)}
                  disabled={loading}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {pagination.totalPages}
                </button>
              </>
            )}
          </div>
          
          <button
            onClick={() => fetchContacts(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && contacts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            {searchQuery ? 'No contacts found' : 'No contacts yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {searchQuery 
              ? "Try adjusting your search to find what you're looking for."
              : "Add contacts to send voice messages and schedule Legacy Vault deliveries."
            }
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            disabled={stats.remainingContacts <= 0}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-500 
                     text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            Add Your First Contact
          </button>
        </motion.div>
      )}

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Add New Contact</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <span className="text-xl">×</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Relationship
                </label>
                <select
                  value={newContact.relationship}
                  onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Select relationship</option>
                  <option value="family">Family</option>
                  <option value="friend">Friend</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">Beneficiary</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">Can receive Legacy Vault messages</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newContact.isBeneficiary}
                      onChange={(e) => setNewContact(prev => ({ ...prev, isBeneficiary: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                                 peer-checked:after:translate-x-full peer-checked:after:border-white 
                                 after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                                 peer-checked:bg-purple-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">Can Receive Messages</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">Allow voice messages to this contact</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newContact.canReceiveMessages}
                      onChange={(e) => setNewContact(prev => ({ ...prev, canReceiveMessages: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                                 peer-checked:after:translate-x-full peer-checked:after:border-white 
                                 after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                                 peer-checked:bg-brand-500"></div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={newContact.notes}
                  onChange={(e) => setNewContact(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full h-24 p-3 rounded-lg border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Add any notes about this contact..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateContact}
                  disabled={loading || !newContact.name || !newContact.phone}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-500 
                           text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Adding...
                    </>
                  ) : (
                    'Add Contact'
                  )}
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 
                           text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 
                           dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && contactToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                Delete Contact
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete <span className="font-semibold">{contactToDelete.name}</span>? 
                This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleDeleteContact(contactToDelete.id)}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 
                           transition-colors font-medium"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setContactToDelete(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 
                           text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 
                           dark:hover:bg-gray-800 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}