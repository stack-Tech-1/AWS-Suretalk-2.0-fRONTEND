import { motion } from "framer-motion";
import { 
  Mic, 
  Play, 
  Pause, 
  Download, 
  Share2, 
  Trash2, 
  Star, 
  StarOff,
  Filter,
  Search,
  Calendar,
  Clock,
  Volume2,
  MoreVertical,
  Plus,
  Headphones,
  Tag,
  Lock
} from "lucide-react";
import { useState } from "react";

export default function VoiceNotes() {
  const [playingAudio, setPlayingAudio] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filters = [
    { id: "all", label: "All Notes" },
    { id: "favorites", label: "Favorites" },
    { id: "recent", label: "Recent" },
    { id: "legacy", label: "Legacy" },
    { id: "work", label: "Work" },
    { id: "personal", label: "Personal" },
  ];

  const voiceNotes = [
    {
      id: 1,
      title: "Birthday Message for Mom",
      duration: "2:45",
      date: "Today, 10:30 AM",
      size: "3.2 MB",
      favorite: true,
      type: "personal",
      tags: ["family", "birthday"],
      protected: false,
    },
    {
      id: 2,
      title: "Project Meeting Notes",
      duration: "5:12",
      date: "Yesterday, 3:15 PM",
      size: "7.1 MB",
      favorite: false,
      type: "work",
      tags: ["work", "meeting"],
      protected: false,
    },
    {
      id: 3,
      title: "Voice Will - Important",
      duration: "8:30",
      date: "Dec 5, 2024",
      size: "12.4 MB",
      favorite: true,
      type: "legacy",
      tags: ["will", "important"],
      protected: true,
    },
    {
      id: 4,
      title: "Daily Journal Entry",
      duration: "1:23",
      date: "Dec 4, 2024",
      size: "2.1 MB",
      favorite: false,
      type: "personal",
      tags: ["journal"],
      protected: false,
    },
    {
      id: 5,
      title: "Client Feedback",
      duration: "4:15",
      date: "Dec 3, 2024",
      size: "5.8 MB",
      favorite: true,
      type: "work",
      tags: ["client", "feedback"],
      protected: false,
    },
    {
      id: 6,
      title: "Family Legacy Message",
      duration: "6:45",
      date: "Dec 2, 2024",
      size: "9.3 MB",
      favorite: false,
      type: "legacy",
      tags: ["family", "legacy"],
      protected: true,
    },
  ];

  const filteredNotes = voiceNotes.filter(note => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "favorites") return note.favorite;
    if (selectedFilter === "recent") return note.id <= 3;
    return note.type === selectedFilter;
  }).filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
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
              Voice Notes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage and organize your voice recordings
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 
                           text-white rounded-xl hover:shadow-lg transition-all">
            <Plus className="w-4 h-4" />
            New Recording
          </button>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                placeholder="Search notes, tags, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                         focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Filter dropdown */}
          <div className="relative">
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                          bg-white dark:bg-gray-800 cursor-pointer">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {filters.find(f => f.id === selectedFilter)?.label}
              </span>
            </div>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mt-4">
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
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Notes</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">24</p>
            </div>
            <Mic className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Duration</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">2h 45m</p>
            </div>
            <Clock className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Favorites</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">8</p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Protected</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">3</p>
            </div>
            <Lock className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </motion.div>

      {/* Voice Notes Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="glass rounded-2xl p-6 card-hover"
          >
            {/* Note Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-gray-800 dark:text-white truncate">
                    {note.title}
                  </h3>
                  {note.protected && (
                    <Lock className="w-4 h-4 text-purple-500" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {note.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Volume2 className="w-3 h-3" />
                    {note.duration}
                  </span>
                  <span>{note.size}</span>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                {note.favorite ? (
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                ) : (
                  <StarOff className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {note.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 
                           rounded-full text-xs flex items-center gap-1"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Player Controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPlayingAudio(playingAudio === note.id ? null : note.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  playingAudio === note.id
                    ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {playingAudio === note.id ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Play
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" title="Download">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" title="Share">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 rounded-lg" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            {playingAudio === note.id && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-brand-500 to-accent-500 h-2 rounded-full"
                    style={{ width: '45%' }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>0:00</span>
                  <span>{note.duration}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredNotes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Headphones className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            No voice notes found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          <button className="px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 
                           text-white rounded-xl hover:shadow-lg transition-all">
            Record Your First Note
          </button>
        </motion.div>
      )}
    </Layout>
  );
}