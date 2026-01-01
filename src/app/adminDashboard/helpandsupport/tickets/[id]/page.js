"use client"
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "../../../../../utils/api";
import Link from "next/link";
import {
  ArrowLeft, MessageSquare, User, Tag, Calendar, Clock,
  AlertCircle, CheckCircle, XCircle, Mail, MoreVertical,
  ChevronRight, Home, HelpCircle, Edit, Download, Copy,
  Check, ThumbsUp, ThumbsDown, Send, Paperclip, Users,
  Settings, Shield
} from "lucide-react";

export default function AdminTicketDetail() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState(null);
  const [responses, setResponses] = useState([]);
  const [internalResponses, setInternalResponses] = useState([]);
  const [newResponse, setNewResponse] = useState('');
  const [newInternalNote, setNewInternalNote] = useState('');
  const [showInternalNote, setShowInternalNote] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  const [status, setStatus] = useState('open');
  const [assignTo, setAssignTo] = useState('');
  const [admins, setAdmins] = useState([]);
  const messagesEndRef = useRef(null);

  // Breadcrumb items
  const breadcrumbs = [
    { label: "Dashboard", href: "/adminDashboard", icon: <Home className="w-4 h-4" /> },
    { label: "Help & Support", href: "/adminDashboard/helpandsupport", icon: <HelpCircle className="w-4 h-4" /> },
    { label: "Tickets", href: "/adminDashboard/helpandsupport", icon: <MessageSquare className="w-4 h-4" /> },
    { label: "Ticket Details", icon: <AlertCircle className="w-4 h-4" />, current: true }
  ];

  useEffect(() => {
    fetchTicketDetails();
    fetchAdmins();
  }, [ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [responses]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      
      const profile = await api.getProfile();
      if (!profile.data.is_admin || profile.data.admin_status !== 'approved') {
        router.replace('/admin/login');
        return;
      }

      const ticketData = await api.getAdminTicketDetails(ticketId);
      setTicket(ticketData.data.ticket);
      setResponses(ticketData.data.responses || []);
      setInternalResponses(ticketData.data.internal_responses || []);
      setInternalNotes(ticketData.data.ticket.internal_notes || '');
      setStatus(ticketData.data.ticket.status);
      setAssignTo(ticketData.data.ticket.assigned_to || '');

    } catch (error) {
      console.error("Fetch ticket details error:", error);
      
      // Fallback data for development
      if (process.env.NODE_ENV === 'development') {
        setTicket({
          id: ticketId,
          ticket_number: "ST-2024-12345",
          subject: "Can't upload voice note",
          description: "When I try to upload a voice note, I get an error message saying 'Upload failed'. I've tried multiple times and it's not working.",
          user_name: "John Doe",
          user_email: "john@example.com",
          user_phone: "+1 (555) 123-4567",
          priority: "high",
          status: "in_progress",
          category: "technical",
          created_at: new Date(Date.now() - 7200000),
          updated_at: new Date(Date.now() - 3600000),
          assigned_to_name: "Admin User",
          internal_notes: "User seems to have large file size. Need to check storage limits.",
          assigned_to: "admin-uuid"
        });
        
        setResponses([
          {
            id: "1",
            message: "Hello John, I understand you're having trouble uploading voice notes. Can you please tell me the file size you're trying to upload?",
            user_name: "Support Agent",
            created_at: new Date(Date.now() - 3600000),
            is_internal: false
          },
          {
            id: "2",
            message: "The file is about 50MB. Is that too large?",
            user_name: "John Doe",
            created_at: new Date(Date.now() - 1800000),
            is_internal: false
          }
        ]);
        
        setInternalResponses([
          {
            id: "3",
            message: "User is on Essential plan with 100MB limit. 50MB should be fine. Need to check S3 configuration.",
            user_name: "Support Agent",
            created_at: new Date(Date.now() - 3500000),
            is_internal: true
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      // Fetch all admins for assignment
      const usersData = await api.getAdminUsers({ limit: 100 });
      const adminUsers = usersData.data.users.filter(user => user.is_admin);
      setAdmins(adminUsers);
    } catch (error) {
      console.error("Fetch admins error:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendResponse = async (isInternal = false) => {
    try {
      const message = isInternal ? newInternalNote : newResponse;
      if (!message.trim()) return;

      await api.adminRespondToTicket(ticketId, message, isInternal);
      
      if (isInternal) {
        setInternalResponses(prev => [...prev, {
          id: Date.now().toString(),
          message,
          user_name: "You",
          created_at: new Date(),
          is_internal: true
        }]);
        setNewInternalNote('');
        setShowInternalNote(false);
      } else {
        setResponses(prev => [...prev, {
          id: Date.now().toString(),
          message,
          user_name: "You",
          created_at: new Date(),
          is_internal: false
        }]);
        setNewResponse('');
      }

      // Refresh ticket to get updated status
      fetchTicketDetails();

    } catch (error) {
      console.error("Send response error:", error);
      alert('Failed to send response. Please try again.');
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await api.updateTicketStatus(ticketId, newStatus);
      setStatus(newStatus);
      fetchTicketDetails();
    } catch (error) {
      console.error("Update status error:", error);
      alert('Failed to update status.');
    }
  };

  const handleAssignTicket = async (adminId) => {
    try {
      await api.assignTicket(ticketId, adminId);
      setAssignTo(adminId);
      fetchTicketDetails();
    } catch (error) {
      console.error("Assign ticket error:", error);
      alert('Failed to assign ticket.');
    }
  };

  const handleSaveInternalNotes = async () => {
    try {
      await api.updateTicketNotes(ticketId, internalNotes);
      setEditingNotes(false);
      fetchTicketDetails();
    } catch (error) {
      console.error("Save notes error:", error);
      alert('Failed to save notes.');
    }
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
          onClick={() => router.push('/adminDashboard/helpandsupport')}
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

      {/* Header with Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => router.push('/adminDashboard/helpandsupport')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${getStatusColor(status)}`}>
                    {getStatusIcon(status)}
                    {status.replace('_', ' ')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {ticket.ticket_number}
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {ticket.subject}
                </h1>
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">{ticket.user_name}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {ticket.user_email}
                  </span>
                  {ticket.user_phone && (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {ticket.user_phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select
                value={status}
                onChange={(e) => handleUpdateStatus(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                         focus:border-transparent transition-all"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            <div className="relative">
              <select
                value={assignTo}
                onChange={(e) => handleAssignTicket(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                         focus:border-transparent transition-all min-w-[150px]"
              >
                <option value="">Unassigned</option>
                <option value="me">Assign to me</option>
                {admins.map(admin => (
                  <option key={admin.id} value={admin.id}>
                    {admin.full_name}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={() => setShowInternalNote(!showInternalNote)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 
                       text-white rounded-lg hover:shadow-lg transition-all"
            >
              Add Internal Note
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Ticket Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Ticket Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Ticket Details</h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div>
                <div className="text-sm text-gray-500 mb-1">Priority</div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(ticket.priority)}`} />
                  <span className="capitalize font-medium">{ticket.priority}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Category</div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="capitalize font-medium">{ticket.category}</span>
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
                    <span className="font-semibold text-gray-800 dark:text-white">{ticket.user_name}</span>
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
                  className={`flex gap-4 ${response.user_name !== ticket.user_name ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center
                    ${response.user_name !== ticket.user_name 
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                      : 'bg-gradient-to-br from-brand-500 to-accent-500'}`}>
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className={`flex-1 ${response.user_name !== ticket.user_name ? 'text-right' : ''}`}>
                    <div className={`flex items-center gap-2 mb-2 ${response.user_name !== ticket.user_name ? 'justify-end' : ''}`}>
                      <span className="font-semibold text-gray-800 dark:text-white">{response.user_name}</span>
                      <span className="text-sm text-gray-500">{formatDate(response.created_at)}</span>
                    </div>
                    <div className={`rounded-2xl p-4 ${
                      response.user_name !== ticket.user_name 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-tr-none' 
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
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <textarea
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                placeholder="Type your response to the user..."
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
                  onClick={() => handleSendResponse(false)}
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
          </motion.div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Internal Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-white">Internal Notes</h3>
              <button
                onClick={() => setEditingNotes(!editingNotes)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
            
            {editingNotes ? (
              <div>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                           focus:border-transparent transition-all resize-none text-sm"
                  placeholder="Add internal notes about this ticket..."
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSaveInternalNotes}
                    className="px-3 py-1 bg-gradient-to-r from-brand-500 to-accent-500 
                             text-white rounded-lg text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingNotes(false)}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 
                             text-gray-700 dark:text-gray-300 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">
                {internalNotes || 'No internal notes yet.'}
              </p>
            )}
          </motion.div>

          {/* Internal Notes History */}
          {internalResponses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Internal Notes History</h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {internalResponses.map((note) => (
                  <div key={note.id} className="border-l-2 border-purple-500 pl-4">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm text-gray-800 dark:text-white">
                        {note.user_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {timeAgo(note.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {note.message}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleUpdateStatus('resolved')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 
                         text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 
                         transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Mark as Resolved
              </button>
              
              <button
                onClick={() => handleUpdateStatus('closed')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 
                         text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 
                         transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Close Ticket
              </button>
              
              <button
                onClick={() => navigator.clipboard.writeText(ticket.ticket_number)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 
                         text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 
                         transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy Ticket ID
              </button>
              
              <button
                onClick={() => window.open(`mailto:${ticket.user_email}?subject=Re: ${ticket.subject} (${ticket.ticket_number})`)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 
                         text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 
                         transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email User
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Internal Note Modal */}
      {showInternalNote && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowInternalNote(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                  Add Internal Note
                </h3>
                <textarea
                  value={newInternalNote}
                  onChange={(e) => setNewInternalNote(e.target.value)}
                  placeholder="Add a private note for the support team..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                           focus:border-transparent transition-all resize-none"
                  autoFocus
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setShowInternalNote(false)}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 
                             text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 
                             dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSendResponse(true)}
                    disabled={!newInternalNote.trim()}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 
                             text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}