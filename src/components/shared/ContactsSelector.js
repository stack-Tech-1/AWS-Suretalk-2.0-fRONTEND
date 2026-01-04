"use client";
import { useState, useEffect } from 'react';
import {
  Search,
  User,
  Mail,
  Phone,
  Check,
  X,
  Users,
  Plus
} from 'lucide-react';
import { api } from '@/utils/api';

export default function ContactsSelector({
  selectedContacts = [],
  onContactsChange,
  multiple = true,
  maxSelection = null,
  showEmail = true,
  showPhone = true,
  showAddContact = true
}) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Fetch contacts
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await api.getContacts({ page: 1, limit: 100 });
      if (response.success) {
        setContacts(response.data.contacts || []);
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(searchLower) ||
      (contact.email && contact.email.toLowerCase().includes(searchLower)) ||
      (contact.phone && contact.phone.includes(searchLower))
    );
  });

  // Handle contact selection
  const toggleContactSelection = (contact) => {
    if (!multiple) {
      // Single selection mode
      onContactsChange([contact]);
      return;
    }

    const isSelected = selectedContacts.some(c => c.id === contact.id);
    let newSelection;

    if (isSelected) {
      newSelection = selectedContacts.filter(c => c.id !== contact.id);
    } else {
      if (maxSelection && selectedContacts.length >= maxSelection) {
        alert(`Maximum ${maxSelection} contacts can be selected`);
        return;
      }
      newSelection = [...selectedContacts, contact];
    }

    onContactsChange(newSelection);
  };

  // Handle adding new contact
  const handleAddContact = async () => {
    if (!newContact.name.trim() || (!newContact.email && !newContact.phone)) {
      alert('Please provide at least a name and email or phone');
      return;
    }

    try {
      const response = await api.createContact(newContact);
      if (response.success) {
        // Add to local list
        setContacts(prev => [response.data, ...prev]);
        
        // Select the new contact
        toggleContactSelection(response.data);
        
        // Reset form
        setNewContact({ name: '', email: '', phone: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Failed to add contact:', error);
      alert('Failed to add contact. Please try again.');
    }
  };

  // Remove selected contact
  const removeSelectedContact = (contactId) => {
    const newSelection = selectedContacts.filter(c => c.id !== contactId);
    onContactsChange(newSelection);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading contacts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selected Contacts Display */}
      {selectedContacts.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Selected Contacts ({selectedContacts.length})
            </span>
            {selectedContacts.length > 0 && multiple && (
              <button
                onClick={() => onContactsChange([])}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedContacts.map(contact => (
              <div
                key={contact.id}
                className="inline-flex items-center gap-2 px-3 py-1 bg-brand-100 dark:bg-brand-900/30 
                         text-brand-600 dark:text-brand-400 rounded-full text-sm"
              >
                <User className="w-3 h-3" />
                <span>{contact.name}</span>
                <button
                  onClick={() => removeSelectedContact(contact.id)}
                  className="hover:text-brand-800 dark:hover:text-brand-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="search"
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Add New Contact */}
      {showAddContact && (
        <div className="mb-4">
          {showAddForm ? (
            <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Name *"
                  value={newContact.name}
                  onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              
              {showEmail && (
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={newContact.email}
                    onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              )}
              
              {showPhone && (
                <div>
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={handleAddContact}
                  className="flex-1 px-3 py-2 bg-brand-500 text-white rounded hover:bg-brand-600"
                >
                  Add Contact
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded 
                           hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 
                       border-2 border-dashed border-gray-300 dark:border-gray-600 
                       rounded-lg hover:border-brand-500 hover:bg-gray-50 dark:hover:bg-gray-800 
                       transition-colors text-gray-600 dark:text-gray-400"
            >
              <Plus className="w-4 h-4" />
              Add New Contact
            </button>
          )}
        </div>
      )}

      {/* Contacts List */}
      <div className="max-h-64 overflow-y-auto space-y-2">
        {filteredContacts.length === 0 ? (
          <div className="text-center py-4">
            <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-500">No contacts found</p>
          </div>
        ) : (
          filteredContacts.map(contact => {
            const isSelected = selectedContacts.some(c => c.id === contact.id);
            
            return (
              <div
                key={contact.id}
                onClick={() => toggleContactSelection(contact)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                }`}
              >
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isSelected
                      ? 'bg-brand-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {isSelected ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 dark:text-white truncate">
                    {contact.name}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    {contact.email && showEmail && (
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Mail className="w-3 h-3" />
                        {contact.email}
                      </span>
                    )}
                    {contact.phone && showPhone && (
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Phone className="w-3 h-3" />
                        {contact.phone}
                      </span>
                    )}
                  </div>
                </div>
                
                {isSelected && (
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}