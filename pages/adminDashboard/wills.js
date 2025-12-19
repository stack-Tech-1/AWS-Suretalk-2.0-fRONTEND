// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\pages\adminDashboard\wills.js
import Layout from "../../components/dashboard/Layout";
import { motion } from "framer-motion";
import { 
  FileText,
  Search,
  Filter,
  MoreVertical,
  User,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Play,
  Download,
  Trash2,
  Lock,
  Unlock
} from "lucide-react";
import { useState } from "react";

export default function VoiceWills() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filters = [
    { id: "all", label: "All Wills" },
    { id: "pending", label: "Pending" },
    { id: "released", label: "Released" },
    { id: "locked", label: "Locked" },
    { id: "expired", label: "Expired" },
  ];

  const wills = [
    {
      id: 1,
      title: "Last Will & Testament",
      user: "John Doe",
      createdAt: "Dec 5, 2024",
      expires: "Conditional",
      status: "pending",
      size: "22.5 MB",
      beneficiaries: 3,
      encrypted: true,
    },
    {
      id: 2,
      title: "Estate Instructions",
      user: "Sarah Smith",
      createdAt: "Dec 1, 2024",
      expires: "Dec 1, 2025",
      status: "locked",
      size: "18.7 MB",
      beneficiaries: 2,
      encrypted: true,
    },
    {
      id: 3,
      title: "Family Legacy",
      user: "Michael Chen",
      createdAt: "Nov 28, 2024",
      expires: "Never",
      status: "released",
      size: "15.2 MB",
      beneficiaries: 5,
      encrypted: true,
    },
    {
      id: 4,
      title: "Business Succession",
      user: "Emma Wilson",
      createdAt: "Nov 20, 2024",
      expires: "Nov 20, 2025",
      status: "pending",
      size: "25.1 MB",
      beneficiaries: 2,
      encrypted: true,
    },
    {
      id: 5,
      title: "Personal Messages",
      user: "Robert Brown",
      createdAt: "Nov 15, 2024",
      expires: "Conditional",
      status: "expired",
      size: "12.8 MB",
      beneficiaries: 4,
      encrypted: true,
    },
    {
      id: 6,
      title: "Emergency Instructions",
      user: "Jessica Davis",
      createdAt: "Nov 10, 2024",
      expires: "Never",
      status: "locked",
      size: "9.5 MB",
      beneficiaries: 1,
      encrypted: true,
    },
  ];

  const filteredWills = wills.filter(will => {
    if (selectedFilter === "all") return true;
    return will.status === selectedFilter;
  }).filter(will => 
    will.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    will.user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: "Total Wills", value: "42", color: "from-blue-500 to-cyan-500" },
    { label: "Pending Release", value: "8", color: "from-yellow-500 to-orange-500" },
    { label: "Released", value: "24", color: "from-green-500 to-emerald-500" },
    { label: "Locked", value: "10", color: "from-purple-500 to-pink-500" },
  ];

  return (
    <Layout type="admin">
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
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Voice Wills
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and review all voice wills in the system
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 
                           text-white rounded-xl hover:shadow-lg transition-all">
            <Eye className="w-4 h-4" />
            Review All
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10`}>
                <div className={`bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>
                  <FileText className="w-5 h-5" />
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
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                placeholder="Search wills by title or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                         focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedFilter === filter.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Wills Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredWills.map((will) => (
          <div
            key={will.id}
            className="glass rounded-2xl p-6 card-hover group"
          >
            {/* Will Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-gray-800 dark:text-white">
                    {will.title}
                  </h3>
                  {will.encrypted && (
                    <Lock className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{will.user}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{will.createdAt}</span>
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Will Details */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  will.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                  will.status === 'released' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                  will.status === 'locked' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                  'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                }`}>
                  {will.status === 'pending' && <Clock className="w-3 h-3" />}
                  {will.status === 'released' && <CheckCircle className="w-3 h-3" />}
                  {will.status === 'locked' && <Shield className="w-3 h-3" />}
                  {will.status === 'expired' && <AlertTriangle className="w-3 h-3" />}
                  {will.status.charAt(0).toUpperCase() + will.status.slice(1)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Expires</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">{will.expires}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Size</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">{will.size}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Beneficiaries</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">{will.beneficiaries}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {will.status === 'pending' ? (
                <button className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 
                                 text-white rounded-xl hover:shadow-lg transition-all 
                                 flex items-center justify-center gap-2">
                  <Unlock className="w-4 h-4" />
                  Release Now
                </button>
              ) : will.status === 'locked' ? (
                <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 
                                 text-white rounded-xl hover:shadow-lg transition-all 
                                 flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" />
                  View Details
                </button>
              ) : (
                <button className="flex-1 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 
                                 text-white rounded-xl hover:shadow-lg transition-all 
                                 flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" />
                  View Record
                </button>
              )}
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <Play className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <Download className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredWills.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            No voice wills found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your search or filters.
          </p>
        </div>
      )}

      {/* Legal Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8 p-6 bg-gradient-to-r from-purple-900/10 to-pink-900/10 
                   dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 
                   dark:border-purple-800"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
              Legal & Compliance Notice
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              Voice wills are sensitive legal documents. Only authorized administrators with proper 
              clearance should access or release these documents. All access is logged and monitored 
              for compliance purposes.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>All access is logged</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-500" />
                <span>Encrypted storage</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-purple-500" />
                <span>Multi-party verification required</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}