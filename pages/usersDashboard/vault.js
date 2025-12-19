// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\pages\usersDashboard\vault.js
import Layout from "../../components/dashboard/Layout";
import { motion } from "framer-motion";
import { 
  Shield,
  Lock,
  Clock,
  Calendar,
  Download,
  Share2,
  MoreVertical,
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  AlertTriangle,
  Key,
  Archive,
  Clock3,
  CheckCircle
} from "lucide-react";
import { useState } from "react";

export default function LegacyVault() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filters = [
    { id: "all", label: "All Items" },
    { id: "permanent", label: "Permanent" },
    { id: "wills", label: "Voice Wills" },
    { id: "scheduled", label: "Scheduled" },
    { id: "protected", label: "Protected" },
  ];

  const vaultItems = [
    {
      id: 1,
      title: "Family Legacy Message",
      description: "Message for my children and grandchildren",
      type: "permanent",
      size: "15.2 MB",
      createdAt: "Dec 5, 2024",
      expires: "Never",
      encrypted: true,
      status: "active",
      tags: ["family", "legacy", "permanent"],
    },
    {
      id: 2,
      title: "Voice Will - Estate",
      description: "Last will and testament voice recording",
      type: "will",
      size: "22.5 MB",
      createdAt: "Dec 1, 2024",
      expires: "Conditional",
      encrypted: true,
      status: "pending",
      tags: ["will", "legal", "estate"],
    },
    {
      id: 3,
      title: "Scheduled Message for Sarah",
      description: "Birthday message to be delivered in 2025",
      type: "scheduled",
      size: "8.7 MB",
      createdAt: "Nov 28, 2024",
      expires: "Jun 15, 2025",
      encrypted: true,
      status: "scheduled",
      tags: ["birthday", "scheduled", "family"],
    },
    {
      id: 4,
      title: "Life Lessons",
      description: "Personal wisdom and experiences",
      type: "permanent",
      size: "18.3 MB",
      createdAt: "Nov 20, 2024",
      expires: "Never",
      encrypted: true,
      status: "active",
      tags: ["wisdom", "life", "permanent"],
    },
    {
      id: 5,
      title: "Emergency Instructions",
      description: "Important information for emergencies",
      type: "will",
      size: "12.1 MB",
      createdAt: "Nov 15, 2024",
      expires: "Conditional",
      encrypted: true,
      status: "active",
      tags: ["emergency", "instructions", "important"],
    },
    {
      id: 6,
      title: "Anniversary Message",
      description: "For our 25th anniversary in 2026",
      type: "scheduled",
      size: "9.8 MB",
      createdAt: "Nov 10, 2024",
      expires: "Mar 20, 2026",
      encrypted: true,
      status: "scheduled",
      tags: ["anniversary", "love", "scheduled"],
    },
  ];

  const filteredItems = vaultItems.filter(item => {
    if (selectedFilter === "all") return true;
    return item.type === selectedFilter;
  }).filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const stats = [
    { label: "Total Items", value: "12", color: "from-blue-500 to-cyan-500" },
    { label: "Permanent", value: "6", color: "from-green-500 to-emerald-500" },
    { label: "Voice Wills", value: "3", color: "from-purple-500 to-pink-500" },
    { label: "Scheduled", value: "3", color: "from-orange-500 to-red-500" },
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
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Legacy Vault
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Secure your voice memories for eternity with bank-level encryption
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 
                           text-white rounded-xl hover:shadow-lg transition-all">
            <Plus className="w-4 h-4" />
            Add to Vault
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
                  <Shield className="w-5 h-5" />
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
                placeholder="Search vault items..."
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

      {/* Vault Items Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="glass rounded-2xl p-6 card-hover group"
          >
            {/* Item Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-gray-800 dark:text-white">
                    {item.title}
                  </h3>
                  {item.encrypted && (
                    <Lock className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 
                               rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Item Details */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Archive className="w-4 h-4" />
                  <span>Size: {item.size}</span>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  item.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                  item.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                  'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                }`}>
                  {item.status === 'active' && <CheckCircle className="w-3 h-3" />}
                  {item.status === 'pending' && <Clock3 className="w-3 h-3" />}
                  {item.status === 'scheduled' && <Calendar className="w-3 h-3" />}
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Created: {item.createdAt}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Expires: {item.expires}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 
                               text-white rounded-xl hover:shadow-lg transition-all 
                               flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                View Details
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <Download className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Security Info */}
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
            <Key className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
              Bank-Level Security
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your legacy vault is protected with AES-256 encryption, secure key management, 
              and automated backups. All data is encrypted at rest and in transit.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Lock, label: "AES-256 Encryption", color: "text-green-500" },
                { icon: Shield, label: "Secure Key Mgmt", color: "text-blue-500" },
                { icon: Archive, label: "Auto Backup", color: "text-purple-500" },
                { icon: AlertTriangle, label: "Access Logs", color: "text-yellow-500" },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <feature.icon className={`w-4 h-4 ${feature.color}`} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}