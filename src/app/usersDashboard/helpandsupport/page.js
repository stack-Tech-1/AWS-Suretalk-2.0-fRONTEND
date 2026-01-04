"use client"
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../utils/api";
import Link from "next/link";
import {
  HelpCircle, MessageSquare, FileText, Search, Plus,
  AlertCircle, CheckCircle, Clock, XCircle, ChevronRight,
  Home, Mail, Tag, Calendar, User, ThumbsUp, ThumbsDown,
  BookOpen, Headphones, Shield, CreditCard, Settings
} from "lucide-react";

export default function UserHelpSupport() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('knowledge-base');
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicketData, setNewTicketData] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium'
  });

  // Breadcrumb items
  const breadcrumbs = [
    { label: "Dashboard", href: "/usersDashboard", icon: <Home className="w-4 h-4" /> },
    { label: "Help & Support", href: "/usersDashboard/helpandsupport", icon: <HelpCircle className="w-4 h-4" />, current: true }
  ];

  // FAQ categories
  const categories = [
    { id: 'getting-started', label: 'Getting Started', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'voice-notes', label: 'Voice Notes', icon: <Headphones className="w-5 h-5" /> },
    { id: 'billing', label: 'Billing & Plans', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'security', label: 'Security & Privacy', icon: <Shield className="w-5 h-5" /> },
    { id: 'account', label: 'Account Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'my-tickets') {
        const ticketsData = await api.getUserTickets();
        setTickets(ticketsData.data.tickets || []);
      } else if (activeTab === 'knowledge-base') {
        const kbData = await api.getKnowledgeBase();
        setKnowledgeBase(kbData.data.articles || []);
      }

    } catch (error) {
      console.error("Fetch data error:", error);
      
      // Fallback data for development
      if (process.env.NODE_ENV === 'development') {
        setTickets([
          {
            id: "1",
            ticket_number: "ST-2024-12345",
            subject: "Can't upload voice note",
            priority: "high",
            status: "open",
            category: "technical",
            created_at: new Date(Date.now() - 7200000),
            response_count: 2,
            last_response: new Date(Date.now() - 3600000)
          },
          {
            id: "2",
            ticket_number: "ST-2024-12346",
            subject: "Billing issue with subscription",
            priority: "medium",
            status: "in_progress",
            category: "billing",
            created_at: new Date(Date.now() - 86400000),
            response_count: 5,
            last_response: new Date(Date.now() - 43200000)
          }
        ]);
        
        setKnowledgeBase([
          {
            id: "1",
            title: "How to Record Your First Voice Note",
            content: "Learn how to create and save your first voice note on SureTalk...",
            category: "getting-started",
            tags: ["recording", "beginner", "tutorial"],
            views: 1245,
            helpful_votes: 89,
            not_helpful_votes: 3,
            created_at: new Date(Date.now() - 86400000)
          },
          {
            id: "2",
            title: "Understanding Your Storage Limits",
            content: "Learn about storage limits for each plan and how to manage your voice notes...",
            category: "billing",
            tags: ["storage", "limits", "plans"],
            views: 876,
            helpful_votes: 67,
            not_helpful_votes: 2,
            created_at: new Date(Date.now() - 172800000)
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    try {
      if (!newTicketData.subject || !newTicketData.description) {
        alert('Please fill in all required fields');
        return;
      }

      await api.createSupportTicket(newTicketData);
      alert('Support ticket created successfully! Our team will respond within 24 hours.');
      
      setShowNewTicket(false);
      setNewTicketData({
        subject: '',
        description: '',
        category: 'general',
        priority: 'medium'
      });
      
      setActiveTab('my-tickets');
      fetchData();
      
    } catch (error) {
      console.error('Create ticket error:', error);
      alert('Failed to create support ticket. Please try again.');
    }
  };

  const timeAgo = (date) => {
    if (!date) return 'No responses yet';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'bg-red-100 text-red-600';
      case 'in_progress': return 'bg-yellow-100 text-yellow-600';
      case 'resolved': return 'bg-green-100 text-green-600';
      case 'closed': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'open': return <AlertCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Help & Support
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Find answers, submit tickets, and get help with SureTalk
            </p>
          </div>
          <button 
            onClick={() => setShowNewTicket(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 
                     text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            New Support Ticket
          </button>
        </div>
      </motion.div>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowNewTicket(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  Create Support Ticket
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      value={newTicketData.subject}
                      onChange={(e) => setNewTicketData({...newTicketData, subject: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                               bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                               focus:border-transparent transition-all"
                      placeholder="Briefly describe your issue"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        value={newTicketData.category}
                        onChange={(e) => setNewTicketData({...newTicketData, category: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                                 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                                 focus:border-transparent transition-all"
                      >
                        <option value="general">General</option>
                        <option value="technical">Technical</option>
                        <option value="billing">Billing</option>
                        <option value="account">Account</option>
                        <option value="feature_request">Feature Request</option>
                        <option value="bug">Bug Report</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Priority
                      </label>
                      <select
                        value={newTicketData.priority}
                        onChange={(e) => setNewTicketData({...newTicketData, priority: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                                 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                                 focus:border-transparent transition-all"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={newTicketData.description}
                      onChange={(e) => setNewTicketData({...newTicketData, description: e.target.value})}
                      rows={6}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                               bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                               focus:border-transparent transition-all resize-none"
                      placeholder="Please provide detailed information about your issue..."
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowNewTicket(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 
                             text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 
                             dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateTicket}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-brand-500 to-accent-500 
                             text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    Submit Ticket
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Quick Help Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => {
              setActiveTab('knowledge-base');
              // You could filter by category here
            }}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 
                     dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all 
                     hover:scale-[1.02] group"
          >
            <div className="p-3 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 
                          mb-3 group-hover:scale-110 transition-transform">
              <div className="text-white">
                {category.icon}
              </div>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
              {category.label}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('knowledge-base')}
            className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-all ${
              activeTab === 'knowledge-base'
                ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-b-0 text-brand-600 dark:text-brand-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Knowledge Base
            </div>
          </button>
          <button
            onClick={() => setActiveTab('my-tickets')}
            className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-all ${
              activeTab === 'my-tickets'
                ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-b-0 text-brand-600 dark:text-brand-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              My Tickets ({tickets.length})
            </div>
          </button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-8"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="search"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                     bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                     focus:border-transparent transition-all"
          />
        </div>
      </motion.div>

      {/* Content Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="glass rounded-2xl overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          </div>
        ) : activeTab === 'knowledge-base' ? (
          <div className="p-6">
            <div className="space-y-6">
              {knowledgeBase.map((article) => (
                <div 
                  key={article.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 
                           hover:border-brand-500 dark:hover:border-brand-400 transition-all 
                           hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                        {categories.find(c => c.id === article.category)?.icon || <FileText className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-white">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="capitalize">{article.category}</span>
                          <span>•</span>
                          <span>{article.views?.toLocaleString() || 0} views</span>
                          <span>•</span>
                          <span>{timeAgo(article.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => {
                          // Vote helpful
                          api.voteOnArticle(article.id, true);
                        }}
                        className="flex items-center gap-1 text-green-600 hover:text-green-700"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{article.helpful_votes || 0}</span>
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {article.content.substring(0, 200)}...
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags?.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 
                                 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => router.push(`/usersDashboard/helpandsupport/articles/${article.id}`)}
                    className="text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium"
                  >
                    Read full article →
                  </button>
                </div>
              ))}
            </div>
            
            {knowledgeBase.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  No articles found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your search or contact support for help.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div 
                  key={ticket.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 
                           hover:border-brand-500 dark:hover:border-brand-400 transition-all 
                           hover:shadow-lg"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {getStatusIcon(ticket.status)}
                          {ticket.status.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ticket.ticket_number}
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-800 dark:text-white">
                        {ticket.subject}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-500">
                        {timeAgo(ticket.last_response)}
                      </div>
                      <button 
                        onClick={() => router.push(`/usersDashboard/helpandsupport/tickets/${ticket.id}`)}
                        className="px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 
                                 text-white rounded-lg hover:shadow-lg transition-all"
                      >
                        View
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">Category:</span>
                      <span className="font-medium capitalize">{ticket.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">Responses:</span>
                      <span className="font-medium">{ticket.response_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">Created:</span>
                      <span className="font-medium">{timeAgo(ticket.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {tickets.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  No support tickets yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Submit a ticket to get help from our support team.
                </p>
                <button 
                  onClick={() => setShowNewTicket(true)}
                  className="px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-500 
                           text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Create Your First Ticket
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Quick Contact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-8 p-6 bg-gradient-to-r from-brand-600 to-accent-500 rounded-2xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-white">
            <h3 className="text-lg font-bold mb-2">Need more help?</h3>
            <p className="opacity-90">
              Our support team is available 24/7 to assist you.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowNewTicket(true)}
              className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl 
                       hover:bg-white/30 transition-all font-medium"
            >
              Contact Support
            </button>
            <button 
              onClick={() => window.open('mailto:support@suretalk.com', '_blank')}
              className="px-6 py-3 bg-white text-brand-600 rounded-xl hover:bg-gray-100 
                       transition-all font-medium"
            >
              Email Us
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}