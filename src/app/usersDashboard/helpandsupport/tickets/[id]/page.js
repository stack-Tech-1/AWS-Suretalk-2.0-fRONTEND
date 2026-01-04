"use client"
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "../../../../../utils/api";
import Link from "next/link";
import {
  ArrowLeft, MessageSquare, User, Tag, Calendar, Clock,
  AlertCircle, CheckCircle, XCircle, Mail, Paperclip,
  ChevronRight, Home, HelpCircle, Send, Copy, ThumbsUp,
  ThumbsDown, RefreshCw
} from "lucide-react";

export default function UserTicketDetail() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState(null);
  const [responses, setResponses] = useState([]);
  const [newResponse, setNewResponse] = useState('');
  const messagesEndRef = useRef(null);

  // Breadcrumb items
  const breadcrumbs = [
    { label: "Dashboard", href: "/usersDashboard", icon: <Home className="w-4 h-4" /> },
    { label: "Help & Support", href: "/usersDashboard/helpandsupport", icon: <HelpCircle className="w-4 h-4" /> },
    { label: "My Tickets", href: "/usersDashboard/helpandsupport", icon: <MessageSquare className="w-4 h-4" /> },
    { label: "Ticket Details", icon: <AlertCircle className="w-4 h-4" />, current: true }
  ];

  useEffect(() => {
    fetchTicketDetails();
  }, [ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [responses]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      
      const ticketData = await api.getTicketDetails(ticketId);
      setTicket(ticketData.data.ticket);
      setResponses(ticketData.data.responses || []);

    } catch (error) {
      console.error("Fetch ticket details error:", error);
      
      // Fallback data for development
      if (process.env.NODE_ENV === 'development') {
        setTicket({
          id: ticketId,
          ticket_number: "ST-2024-12345",
          subject: "Can't upload voice note",
          description: "When I try to upload a voice note, I get an error message saying 'Upload failed'. I've tried multiple times and it's not working.",
          priority: "high",
          status: "in_progress",
          category: "technical",
          created_at: new Date(Date.now() - 7200000),
          updated_at: new Date(Date.now() - 3600000),
        });
        
        setResponses([
          {
            id: "1",
            message: "Hello John, I understand you're having trouble uploading voice notes. Can you please tell me the file size you're trying to upload?",
            user_name: "Support Agent",
            created_at: new Date(Date.now() - 3600000),
          },
          {
            id: "2",
            message: "The file is about 50MB. Is that too large?",
            user_name: "John Doe",
            created_at: new Date(Date.now() - 1800000),
          },
          {
            id: "3",
            message: "50MB should be fine. Could you try clearing your browser cache and trying again? If that doesn't work, please let us know what browser you're using.",
            user_name: "Support Agent",
            created_at: new Date(Date.now() - 900000),
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendResponse = async () => {
    try {
      if (!newResponse.trim()) return;

      await api.respondToTicket(ticketId, newResponse);
      
      setResponses(prev => [...prev, {
        id: Date.now().toString(),
        message: newResponse,
        user_name: "You",
        created_at: new Date(),
      }]);
      
      setNewResponse('');
      fetchTicketDetails();

    } catch (error) {
      console.error("Send response error:", error);
      alert('Failed to send response. Please try again.');
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

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Ticket Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">The requested ticket could not be found.</p>
        <button
          onClick={() => router.push('/usersDashboard/helpandsupport')}
          className="px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl hover:shadow-lg transition-all"
        >
          Back to Tickets
        </button>
      </div>
    );
  }

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
                {crumb.href ? (
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
                ) : (
                  <span className="flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400">
                    {crumb.icon}
                    {crumb.label}
                  </span>
                )}
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
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => router.push('/usersDashboard/helpandsupport')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${getStatusColor(ticket.status)}`}>
                    {getStatusIcon(ticket.status)}
                    {ticket.status.replace('_', ' ')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {ticket.ticket_number}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(ticket.ticket_number);
                      alert('Ticket number copied to clipboard!');
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    title="Copy ticket number"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {ticket.subject}
                </h1>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div>
                <div className="text-sm text-gray-500 mb-1">Priority</div>
                <div className="font-medium capitalize">{ticket.priority}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Category</div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="font-medium capitalize">{ticket.category}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Created</div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{formatDate(ticket.created_at)}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Last Updated</div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{timeAgo(ticket.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={fetchTicketDetails}
            className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 
                     text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 
                     transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Ticket Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass rounded-2xl p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Your Request</h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>
          </motion.div>

          {/* Conversation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Conversation</h2>
            
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
              {/* User's initial message */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex-shrink-0 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-800 dark:text-white">You</span>
                    <span className="text-sm text-gray-500">{formatDate(ticket.created_at)}</span>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none p-4">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {ticket.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Responses */}
              {responses.map((response) => (
                <div 
                  key={response.id}
                  className={`flex gap-4 ${response.user_name === 'You' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center
                    ${response.user_name === 'You' 
                      ? 'bg-gradient-to-br from-brand-500 to-accent-500' 
                      : 'bg-gradient-to-br from-blue-500 to-cyan-500'}`}>
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className={`flex-1 ${response.user_name === 'You' ? 'text-right' : ''}`}>
                    <div className={`flex items-center gap-2 mb-2 ${response.user_name === 'You' ? 'justify-end' : ''}`}>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {response.user_name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(response.created_at)}
                      </span>
                    </div>
                    <div className={`rounded-2xl p-4 ${
                      response.user_name === 'You' 
                        ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-tr-none' 
                        : 'bg-gray-100 dark:bg-gray-800 rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-wrap">{response.message}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              <div ref={messagesEndRef} />
            </div>

            {/* New Response Input */}
            {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <textarea
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  placeholder="Type your response..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                           focus:border-transparent transition-all resize-none"
                />
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                      <Paperclip className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <button
                    onClick={handleSendResponse}
                    disabled={!newResponse.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-brand-500 to-accent-500 
                             text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 
                             disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send Response
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Helpful Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Helpful Information</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white mb-1">Response Time</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Our team typically responds within 24 hours during business days.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white mb-1">Keep the Conversation Going</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Please respond promptly to keep the conversation active and resolve your issue faster.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => window.open(`mailto:support@suretalk.com?subject=Re: ${ticket.subject} (${ticket.ticket_number})`)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 
                         text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/30 
                         transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email Support
              </button>
              
              <button
                onClick={() => navigator.clipboard.writeText(ticket.ticket_number)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 
                         text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 
                         transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy Ticket Number
              </button>
              
              <button
                onClick={() => router.push('/usersDashboard/helpandsupport')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-brand-100 dark:bg-brand-900/20 
                         text-brand-600 dark:text-brand-400 hover:bg-brand-200 dark:hover:bg-brand-900/30 
                         transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to My Tickets
              </button>
            </div>
          </motion.div>

          {/* Status Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Ticket Status</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Current Status:</span>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                  {ticket.status.replace('_', ' ')}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Created:</span>
                <span className="font-medium">{timeAgo(ticket.created_at)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Last Update:</span>
                <span className="font-medium">{timeAgo(ticket.updated_at)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Responses:</span>
                <span className="font-medium">{responses.length}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Banner */}
      {ticket.status === 'resolved' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 p-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-6 h-6" />
                <h3 className="text-lg font-bold">Ticket Resolved</h3>
              </div>
              <p className="opacity-90">
                Your support ticket has been marked as resolved. If you need further assistance, 
                please reply to this ticket or create a new one.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setNewResponse('I need more help with this issue.')}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl 
                         hover:bg-white/30 transition-all"
              >
                Request More Help
              </button>
              <button
                onClick={() => router.push('/usersDashboard/helpandsupport?new=true')}
                className="px-4 py-2 bg-white text-green-600 rounded-xl hover:bg-gray-100 
                         transition-all"
              >
                Create New Ticket
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}