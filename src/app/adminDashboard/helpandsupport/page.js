"use client"
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../utils/api";
import Link from "next/link";
import {
  HelpCircle, MessageSquare, FileText, Users, BarChart3,
  Search, Filter, AlertCircle, Clock, CheckCircle, XCircle,
  ChevronRight, Home, Eye, Mail, User, Tag, Calendar,
  TrendingUp, Shield, Settings, Download, Plus,
  RefreshCw, MoreVertical, ArrowUpRight
} from "lucide-react";

export default function AdminHelpSupport() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('tickets');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all'
  });

  // Breadcrumb items
  const breadcrumbs = [
    { label: "Dashboard", href: "/adminDashboard", icon: <Home className="w-4 h-4" /> },
    { label: "Help & Support", href: "/adminDashboard/helpandsupport", icon: <HelpCircle className="w-4 h-4" />, current: true }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab, filters]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const profile = await api.getProfile();
      if (!profile.data.is_admin || profile.data.admin_status !== 'approved') {
        router.replace('/admin/login');
        return;
      }

      if (activeTab === 'tickets') {
        const [supportStats, ticketsData] = await Promise.all([
          api.getSupportStats(),
          api.getAdminSupportTickets(filters)
        ]);
        
        setStats(supportStats.data);
        setTickets(ticketsData.data.tickets || []);
        
      } else if (activeTab === 'knowledge-base') {
        const [kbStats, kbData] = await Promise.all([
          api.getKBStats(),
          api.getAdminKnowledgeBase()
        ]);
        
        setStats(kbStats.data);
        setKnowledgeBase(kbData.data.articles || []);
      }

    } catch (error) {
      console.error("Fetch data error:", error);
      
      // Fallback data for development
      if (process.env.NODE_ENV === 'development') {
        setStats({
          total_tickets: 156,
          open_tickets: 24,
          in_progress_tickets: 12,
          avg_resolution_seconds: 86400,
          today_tickets: 8
        });
        
        setTickets([
          {
            id: "1",
            ticket_number: "ST-2024-12345",
            subject: "Can't upload voice note",
            user_name: "John Doe",
            priority: "high",
            status: "open",
            category: "technical",
            created_at: new Date(Date.now() - 7200000),
            response_count: 2
          },
          {
            id: "2",
            ticket_number: "ST-2024-12346",
            subject: "Billing issue with subscription",
            user_name: "Sarah Smith",
            priority: "medium",
            status: "in_progress",
            category: "billing",
            created_at: new Date(Date.now() - 86400000),
            response_count: 5
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
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

  // Stats cards data
  const statsCards = stats ? [
    {
      label: "Total Tickets",
      value: stats.total_tickets?.toLocaleString() || "0",
      change: "+12%",
      trend: "up",
      icon: <MessageSquare className="w-5 h-5" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Open Tickets",
      value: stats.open_tickets?.toLocaleString() || "0",
      change: "-3%",
      trend: "down",
      icon: <AlertCircle className="w-5 h-5" />,
      color: "from-orange-500 to-red-500",
    },
    {
      label: "Avg Resolution",
      value: formatTime(stats.avg_resolution_seconds) || "N/A",
      change: "-15%",
      trend: "down",
      icon: <Clock className="w-5 h-5" />,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Today's Tickets",
      value: stats.today_tickets?.toLocaleString() || "0",
      change: "+8%",
      trend: "up",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "from-purple-500 to-pink-500",
    },
  ] : [];

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
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Help & Support Center
                </h1>
                {loading && (
                  <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                )}
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Manage support tickets, knowledge base, and user assistance
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => router.push('/adminDashboard/helpandsupport/knowledge-base/new')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 
                       text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              New Article
            </button>
            <button 
              onClick={fetchDashboardData}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 
                       text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 
                       transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {statsCards.map((stat, index) => (
          <div 
            key={index}
            className="glass rounded-xl p-6 card-hover"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10`}>
                <div className={`bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>
                  {stat.icon}
                </div>
              </div>
              <div className={`flex items-center text-sm font-medium px-2 py-1 rounded-full
                ${stat.trend === 'up' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 
                  'text-red-600 bg-red-50 dark:bg-red-900/20'}`}>
                <TrendingUp className={`w-4 h-4 mr-1 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                {stat.change}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{stat.value}</h3>
            <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
          </div>
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
            onClick={() => setActiveTab('tickets')}
            className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-all ${
              activeTab === 'tickets'
                ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-b-0 text-brand-600 dark:text-brand-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Support Tickets ({stats?.total_tickets || 0})
            </div>
          </button>
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
              Knowledge Base ({stats?.published_articles || 0})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-all ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-b-0 text-brand-600 dark:text-brand-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </div>
          </button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                placeholder={`Search ${activeTab === 'tickets' ? 'tickets...' : 'articles...'}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                         focus:border-transparent transition-all"
              />
            </div>
          </div>
          {activeTab === 'tickets' && (
            <div className="flex flex-wrap gap-2">
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                         focus:border-transparent transition-all"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                         focus:border-transparent transition-all"
              >
                <option value="all">All Priority</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          )}
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
              <RefreshCw className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading {activeTab}...</p>
            </div>
          </div>
        ) : activeTab === 'tickets' ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Ticket
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      User
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Priority
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Category
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Responses
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Created
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tickets.map((ticket) => (
                    <tr 
                      key={ticket.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-800 dark:text-white">
                            {ticket.ticket_number}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                            {ticket.subject}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 
                                        flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800 dark:text-white">
                              {ticket.user_name || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {ticket.user_email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(ticket.priority)}`} />
                          <span className="capitalize">{ticket.priority}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium w-fit ${getStatusColor(ticket.status)}`}>
                          {getStatusIcon(ticket.status)}
                          {ticket.status.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Tag className="w-3 h-3" />
                          {ticket.category}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-gray-400" />
                          <span>{ticket.response_count || 0}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {timeAgo(ticket.created_at)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => router.push(`/adminDashboard/helpandsupport/tickets/${ticket.id}`)}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            title="View Ticket"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => router.push(`/adminDashboard/helpandsupport/tickets/${ticket.id}?reply=true`)}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            title="Reply"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {tickets.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <HelpCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  No tickets found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchQuery ? 'Try adjusting your search.' : 'All support tickets are handled!'}
                </p>
              </div>
            )}
          </>
        ) : activeTab === 'knowledge-base' ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {knowledgeBase.map((article) => (
                <div 
                  key={article.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 
                           hover:border-brand-500 dark:hover:border-brand-400 transition-all 
                           hover:shadow-lg hover:scale-[1.02]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium 
                      ${article.published ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                      {article.published ? 'Published' : 'Draft'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Eye className="w-4 h-4" />
                      {article.views?.toLocaleString() || 0}
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-800 dark:text-white mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {article.content.replace(/<[^>]*>/g, '')}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags?.slice(0, 3).map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 
                                 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-500">
                      {timeAgo(article.updated_at)}
                    </div>
                    <button 
                      onClick={() => router.push(`/adminDashboard/helpandsupport/knowledge-base/${article.id}`)}
                      className="flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:text-brand-700"
                    >
                      Edit
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
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
                  Create your first knowledge base article to help users.
                </p>
                <button 
                  onClick={() => router.push('/adminDashboard/helpandsupport/knowledge-base/new')}
                  className="px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-500 
                           text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Create First Article
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
              Support Analytics
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass rounded-xl p-6">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-4">
                  Ticket Categories
                </h4>
                <div className="space-y-4">
                  {stats?.categories?.map((cat) => (
                    <div key={cat.category}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-700 dark:text-gray-300 capitalize">{cat.category}</span>
                        <span className="font-medium">{cat.count} tickets</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
                          style={{ width: `${(cat.count / stats.total_tickets) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="glass rounded-xl p-6">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-4">
                  Performance Metrics
                </h4>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700 dark:text-gray-300">Avg Response Time</span>
                      <span className="font-medium">{formatTime(stats?.avg_resolution_seconds)}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                        style={{ width: '65%' }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700 dark:text-gray-300">Resolution Rate</span>
                      <span className="font-medium">
                        {stats ? Math.round(((stats.resolved_tickets + stats.closed_tickets) / stats.total_tickets) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        style={{ width: `${stats ? Math.round(((stats.resolved_tickets + stats.closed_tickets) / stats.total_tickets) * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700 dark:text-gray-300">Customer Satisfaction</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: '92%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}