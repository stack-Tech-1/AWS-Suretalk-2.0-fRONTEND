import Layout from "../../components/dashboard/Layout";
import { motion } from "framer-motion";
import { Mic, Users, Headphones, Calendar, ArrowUpRight, Play } from "lucide-react";

export default function DashboardHome() {
  const stats = [
    {
      label: "Voice Notes",
      value: "12",
      change: "+2",
      icon: <Mic className="w-5 h-5" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Contacts",
      value: "5/9",
      change: "+1",
      icon: <Users className="w-5 h-5" />,
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Storage Used",
      value: "2.1 GB",
      change: "+0.3 GB",
      icon: <Headphones className="w-5 h-5" />,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Scheduled",
      value: "3",
      change: "+1",
      icon: <Calendar className="w-5 h-5" />,
      color: "from-orange-500 to-red-500",
    },
  ];

  const recentNotes = [
    {
      id: 1,
      title: "Meeting Notes",
      date: "2 hours ago",
      duration: "3:45",
      status: "active",
    },
    {
      id: 2,
      title: "Birthday Message",
      date: "Yesterday",
      duration: "1:20",
      status: "scheduled",
    },
    {
      id: 3,
      title: "Project Update",
      date: "3 days ago",
      duration: "2:15",
      status: "active",
    },
    {
      id: 4,
      title: "Family Message",
      date: "1 week ago",
      duration: "4:30",
      status: "legacy",
    },
  ];

  return (
    <Layout type="user">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, John! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your SureTalk account today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} 
                            flex items-center justify-center`}>
                <div className="text-white">
                  {stat.icon}
                </div>
              </div>
              <div className="flex items-center text-green-500 text-sm font-medium">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                {stat.change}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Voice Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Voice Notes</h2>
              <button className="text-brand-600 hover:text-brand-700 text-sm font-medium">
                View All →
              </button>
            </div>
            
            <div className="space-y-4">
              {recentNotes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-center justify-between p-4 rounded-lg 
                           hover:bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                      <Headphones className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{note.title}</h3>
                      <p className="text-sm text-gray-500">{note.date} • {note.duration}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium
                      ${note.status === 'active' ? 'bg-green-100 text-green-800' :
                        note.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'}`}>
                      {note.status}
                    </span>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Play className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 
                               rounded-lg border border-gray-200 hover:border-brand-500 
                               hover:bg-brand-50 transition-all">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center 
                               justify-center mr-4">
                    <Mic className="w-5 h-5 text-brand-600" />
                  </div>
                  <span className="font-medium">Record New Note</span>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400" />
              </button>
              
              <button className="w-full flex items-center justify-between p-4 
                               rounded-lg border border-gray-200 hover:border-purple-500 
                               hover:bg-purple-50 transition-all">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center 
                               justify-center mr-4">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="font-medium">Add Contact</span>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400" />
              </button>
              
              <button className="w-full flex items-center justify-between p-4 
                               rounded-lg border border-gray-200 hover:border-green-500 
                               hover:bg-green-50 transition-all">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center 
                               justify-center mr-4">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="font-medium">Schedule Message</span>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Plan Status */}
          <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl p-6">
            <h2 className="text-white text-xl font-bold mb-4">Your Plan</h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-medium">SureTalk Essential</span>
                <span className="text-white/80 text-sm">$4.99/mo</span>
              </div>
              <div className="text-white/80 text-sm mb-4">
                5 of 9 contacts used • 12 voice notes
              </div>
              <div className="w-full bg-white/30 rounded-full h-2 mb-2">
                <div className="bg-white h-2 rounded-full" style={{ width: '55%' }}></div>
              </div>
              <div className="flex justify-between text-white/60 text-xs">
                <span>Usage: 55%</span>
                <span>Upgrade for more</span>
              </div>
            </div>
            <button className="w-full mt-4 bg-white text-brand-600 py-3 rounded-lg 
                             font-medium hover:bg-gray-100 transition-colors">
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}