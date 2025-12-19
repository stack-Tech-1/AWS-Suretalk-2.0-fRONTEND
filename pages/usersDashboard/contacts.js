// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\pages\usersDashboard\contacts.js
import Layout from "../../components/dashboard/Layout";
import { motion } from "framer-motion";
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
  Calendar
} from "lucide-react";
import { useState } from "react";

export default function Contacts() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const contacts = [
    {
      id: 1,
      name: "Sarah Johnson",
      phone: "+1 (555) 123-4567",
      email: "sarah@example.com",
      type: "family",
      lastMessage: "Birthday message",
      lastContact: "2 days ago",
      favorite: true,
    },
    {
      id: 2,
      name: "Michael Chen",
      phone: "+1 (555) 987-6543",
      email: "michael@example.com",
      type: "work",
      lastMessage: "Project update",
      lastContact: "1 week ago",
      favorite: true,
    },
    {
      id: 3,
      name: "Emily Wilson",
      phone: "+1 (555) 456-7890",
      email: "emily@example.com",
      type: "friend",
      lastMessage: "Voice note",
      lastContact: "3 days ago",
      favorite: false,
    },
    {
      id: 4,
      name: "Robert Brown",
      phone: "+1 (555) 234-5678",
      email: "robert@example.com",
      type: "family",
      lastMessage: "Legacy message",
      lastContact: "1 month ago",
      favorite: true,
    },
    {
      id: 5,
      name: "Jessica Davis",
      phone: "+1 (555) 876-5432",
      email: "jessica@example.com",
      type: "work",
      lastMessage: "Meeting notes",
      lastContact: "2 weeks ago",
      favorite: false,
    },
    {
      id: 6,
      name: "David Miller",
      phone: "+1 (555) 345-6789",
      email: "david@example.com",
      type: "friend",
      lastMessage: "Personal message",
      lastContact: "5 days ago",
      favorite: false,
    },
  ];

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout type="user">
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
              Manage your contacts for voice messages (7/9 contacts used)
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 
                           text-white rounded-xl hover:shadow-lg transition-all">
            <UserPlus className="w-4 h-4" />
            Add Contact
          </button>
        </div>
      </motion.div>

      {/* Search and Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              />
            </div>
          </div>

          {/* Contact Stats */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Contact Limit</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-800 dark:text-white">7/9</span>
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-brand-500 to-accent-500 h-2 rounded-full"
                      style={{ width: '78%' }}
                    ></div>
                  </div>
                </div>
              </div>
              <UserPlus className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contacts Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className="glass rounded-2xl p-6 card-hover group"
          >
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
                    {contact.favorite && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1
                    ${contact.type === 'family' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                      contact.type === 'work' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                      'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}>
                    {contact.type}
                  </span>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-5 h-5" />
              </button>
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
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">{contact.lastMessage}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{contact.lastContact}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button className="flex-1 px-4 py-2 border-2 border-brand-500 text-brand-600 dark:text-brand-400 
                               rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors 
                               flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Message
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredContacts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            No contacts found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your search or add a new contact.
          </p>
          <button className="px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 
                           text-white rounded-xl hover:shadow-lg transition-all">
            Add Your First Contact
          </button>
        </motion.div>
      )}
    </Layout>
  );
}