// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\pages\adminDashboard\users.js
import Layout from "../../components/dashboard/Layout";
import { motion } from "framer-motion";
import { 
  Users,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Shield,
  CreditCard,
  TrendingUp,
  ChevronDown,
  UserPlus,
  Download,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { useState } from "react";

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filters = [
    { id: "all", label: "All Users" },
    { id: "premium", label: "Premium" },
    { id: "essential", label: "Essential" },
    { id: "lite", label: "Lite" },
    { id: "active", label: "Active" },
    { id: "inactive", label: "Inactive" },
  ];

  const users = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
      plan: "premium",
      status: "active",
      joined: "Jan 15, 2024",
      lastActive: "2 hours ago",
      storage: "2.4 GB",
      revenue: "$9.99",
    },
    {
      id: 2,
      name: "Sarah Smith",
      email: "sarah@example.com",
      phone: "+1 (555) 987-6543",
      plan: "essential",
      status: "active",
      joined: "Feb 28, 2024",
      lastActive: "1 day ago",
      storage: "1.2 GB",
      revenue: "$4.99",
    },
    {
      id: 3,
      name: "Michael Chen",
      email: "michael@example.com",
      phone: "+1 (555) 456-7890",
      plan: "lite",
      status: "active",
      joined: "Mar 10, 2024",
      lastActive: "3 days ago",
      storage: "0.8 GB",
      revenue: "$0.00",
    },
    {
      id: 4,
      name: "Emma Wilson",
      email: "emma@example.com",
      phone: "+1 (555) 234-5678",
      plan: "premium",
      status: "inactive",
      joined: "Apr 5, 2024",
      lastActive: "2 weeks ago",
      storage: "3.1 GB",
      revenue: "$9.99",
    },
    {
      id: 5,
      name: "Robert Brown",
      email: "robert@example.com",
      phone: "+1 (555) 876-5432",
      plan: "essential",
      status: "active",
      joined: "May 20, 2024",
      lastActive: "Now",
      storage: "1.8 GB",
      revenue: "$4.99",
    },
    {
      id: 6,
      name: "Jessica Davis",
      email: "jessica@example.com",
      phone: "+1 (555) 345-6789",
      plan: "lite",
      status: "inactive",
      joined: "Jun 15, 2024",
      lastActive: "1 month ago",
      storage: "0.5 GB",
      revenue: "$0.00",
    },
  ];

  const filteredUsers = users.filter(user => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "active") return user.status === "active";
    if (selectedFilter === "inactive") return user.status === "inactive";
    return user.plan === selectedFilter;
  }).filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.includes(searchQuery)
  );

  const stats = [
    { label: "Total Users", value: "1,247", change: "+12%", color: "from-blue-500 to-cyan-500" },
    { label: "Premium Users", value: "312", change: "+8%", color: "from-purple-500 to-pink-500" },
    { label: "MRR", value: "$4,256", change: "+18%", color: "from-green-500 to-emerald-500" },
    { label: "Active Today", value: "89", change: "-3%", color: "from-orange-500 to-red-500" },
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
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                User Management
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Manage all SureTalk users, subscriptions, and account details
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border-2 border-brand-500 
                             text-brand-600 dark:text-brand-400 rounded-xl hover:bg-brand-50 
                             dark:hover:bg-brand-900/20 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 
                             text-white rounded-xl hover:shadow-lg transition-all">
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          </div>
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10`}>
                <div className={`bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div className={`flex items-center text-sm font-medium ${
              stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${stat.change.startsWith('+') ? '' : 'rotate-180'}`} />
              {stat.change}
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
                placeholder="Search users by name, email, or phone..."
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
                    ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Users Table */}
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
                  User
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Contact
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Plan
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Storage
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Revenue
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 
                                    flex items-center justify-center">
                        <span className="font-bold text-white text-sm">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white">{user.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">Joined {user.joined}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{user.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium w-fit ${
                      user.plan === 'premium' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                      user.plan === 'essential' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                      'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      {user.plan === 'premium' && <Shield className="w-3 h-3" />}
                      {user.plan === 'essential' && <CreditCard className="w-3 h-3" />}
                      {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium w-fit ${
                      user.status === 'active' ? 
                        'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                        'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    }`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{user.lastActive}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-700 dark:text-gray-300">{user.storage}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-medium text-gray-800 dark:text-white">{user.revenue}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
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
        {filteredUsers.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No users found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </motion.div>
    </Layout>
  );
}