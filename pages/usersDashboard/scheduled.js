// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\pages\usersDashboard\scheduled.js
import Layout from "../../components/dashboard/Layout";
import { motion } from "framer-motion";
import { 
  Calendar,
  Clock,
  User,
  Bell,
  Edit,
  Trash2,
  Play,
  Pause,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Mail,
  MoreVertical
} from "lucide-react";
import { useState } from "react";

export default function ScheduledMessages() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filters = [
    { id: "all", label: "All Messages" },
    { id: "upcoming", label: "Upcoming" },
    { id: "sent", label: "Sent" },
    { id: "failed", label: "Failed" },
    { id: "paused", label: "Paused" },
  ];

  const messages = [
    {
      id: 1,
      title: "Birthday Surprise",
      recipient: "Sarah Johnson",
      scheduledFor: "Jun 15, 2025 • 10:00 AM",
      status: "scheduled",
      type: "birthday",
      method: "phone",
      createdAt: "Dec 5, 2024",
    },
    {
      id: 2,
      title: "Anniversary Message",
      recipient: "Michael Chen",
      scheduledFor: "Mar 20, 2026 • 2:30 PM",
      status: "scheduled",
      type: "anniversary",
      method: "phone",
      createdAt: "Dec 1, 2024",
    },
    {
      id: 3,
      title: "Project Completion",
      recipient: "Team Members",
      scheduledFor: "Jan 15, 2025 • 9:00 AM",
      status: "upcoming",
      type: "work",
      method: "email",
      createdAt: "Nov 28, 2024",
    },
    {
      id: 4,
      title: "Christmas Greeting",
      recipient: "Family Group",
      scheduledFor: "Dec 25, 2024 • 8:00 AM",
      status: "sent",
      type: "holiday",
      method: "phone",
      createdAt: "Nov 20, 2024",
    },
    {
      id: 5,
      title: "Legacy Instructions",
      recipient: "Executor",
      scheduledFor: "Conditional",
      status: "paused",
      type: "legacy",
      method: "email",
      createdAt: "Nov 15, 2024",
    },
    {
      id: 6,
      title: "Meeting Reminder",
      recipient: "Client",
      scheduledFor: "Jan 10, 2025 • 3:00 PM",
      status: "failed",
      type: "work",
      method: "phone",
      createdAt: "Nov 10, 2024",
    },
  ];

  const filteredMessages = messages.filter(message => {
    if (selectedFilter === "all") return true;
    return message.status === selectedFilter;
  }).filter(message => 
    message.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.recipient.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: "Total Scheduled", value: "8", color: "from-blue-500 to-cyan-500" },
    { label: "Upcoming", value: "3", color: "from-green-500 to-emerald-500" },
    { label: "Sent", value: "4", color: "from-purple-500 to-pink-500" },
    { label: "Failed", value: "1", color: "from-orange-500 to-red-500" },
  ];

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
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Scheduled Messages
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Plan and schedule voice messages to be delivered at future dates
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 
                           text-white rounded-xl hover:shadow-lg transition-all">
            <Plus className="w-4 h-4" />
            Schedule Message
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="glass rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10`}>
                <div className={`bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                         focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedFilter === filter.id
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Messages Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Message
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Recipient
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Scheduled For
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMessages.map((message) => (
                <tr key={message.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-4 px-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded ${
                          message.method === 'phone' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'
                        }`}>
                          {message.method === 'phone' ? (
                            <Bell className="w-4 h-4 text-blue-500" />
                          ) : (
                            <Mail className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <h4 className="font-medium text-gray-800 dark:text-white">
                          {message.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          message.type === 'birthday' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' :
                          message.type === 'anniversary' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                          message.type === 'work' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                          'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        }`}>
                          {message.type}
                        </span>
                        <span className="text-xs text-gray-500">{message.createdAt}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">{message.recipient}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">{message.scheduledFor}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium w-fit ${
                      message.status === 'scheduled' || message.status === 'upcoming' ? 
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                      message.status === 'sent' ? 
                        'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                      message.status === 'failed' ? 
                        'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {message.status === 'sent' && <CheckCircle className="w-3 h-3" />}
                      {message.status === 'failed' && <AlertCircle className="w-3 h-3" />}
                      {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {message.status === 'scheduled' || message.status === 'upcoming' ? (
                        <>
                          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                            <Pause className="w-4 h-4" />
                          </button>
                        </>
                      ) : message.status === 'paused' ? (
                        <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                          <Play className="w-4 h-4" />
                        </button>
                      ) : null}
                      <button className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredMessages.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No scheduled messages found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search or schedule a new message.
            </p>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 
                             text-white rounded-xl hover:shadow-lg transition-all">
              Schedule Your First Message
            </button>
          </div>
        )}
      </motion.div>
    </Layout>
  );
}