"use client"
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "../../../../../utils/api";
import Link from "next/link";
import {
  ArrowLeft, Save, Eye, Trash2, FileText, Tag, Globe,
  Lock, Upload, Image, Video, Link as LinkIcon, 
  ChevronRight, Home, HelpCircle, Bold, Italic,
  List, ListOrdered, Heading, Quote, Code,
  X, Check, Calendar, User, BarChart3, TrendingUp, ThumbsUp, ThumbsDown, Plus
} from "lucide-react";

export default function AdminKnowledgeBaseEditor() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id;
  const isNew = articleId === 'new';
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [article, setArticle] = useState({
    title: '',
    content: '',
    category: 'getting-started',
    tags: [],
    published: true
  });
  const [newTag, setNewTag] = useState('');
  const [stats, setStats] = useState(null);
  const [preview, setPreview] = useState(false);
  const editorRef = useRef(null);

  // Categories
  const categories = [
    { id: 'getting-started', label: 'Getting Started', color: 'bg-blue-500' },
    { id: 'voice-notes', label: 'Voice Notes', color: 'bg-green-500' },
    { id: 'billing', label: 'Billing & Plans', color: 'bg-purple-500' },
    { id: 'security', label: 'Security & Privacy', color: 'bg-red-500' },
    { id: 'account', label: 'Account Settings', color: 'bg-yellow-500' },
    { id: 'technical', label: 'Technical Issues', color: 'bg-indigo-500' },
    { id: 'general', label: 'General', color: 'bg-gray-500' },
  ];

  // Breadcrumb items
  const breadcrumbs = [
    { label: "Dashboard", href: "/adminDashboard", icon: <Home className="w-4 h-4" /> },
    { label: "Help & Support", href: "/adminDashboard/helpandsupport", icon: <HelpCircle className="w-4 h-4" /> },
    { label: "Knowledge Base", href: "/adminDashboard/helpandsupport", icon: <FileText className="w-4 h-4" /> },
    { label: isNew ? "New Article" : "Edit Article", icon: <FileText className="w-4 h-4" />, current: true }
  ];

  useEffect(() => {
    if (!isNew) {
      fetchArticle();
    }
  }, [articleId, isNew]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      
      const profile = await api.getProfile();
      if (!profile.data.is_admin || profile.data.admin_status !== 'approved') {
        router.replace('/admin/login');
        return;
      }

      const kbData = await api.getAdminKnowledgeBase();
      const foundArticle = kbData.data.articles.find(a => a.id === articleId);
      
      if (foundArticle) {
        setArticle({
          title: foundArticle.title,
          content: foundArticle.content,
          category: foundArticle.category,
          tags: foundArticle.tags || [],
          published: foundArticle.published
        });
        
        if (!isNew) {
          const kbStats = await api.getKBStats();
          setStats(kbStats.data);
        }
      } else {
        router.push('/adminDashboard/helpandsupport');
      }

    } catch (error) {
      console.error("Fetch article error:", error);
      
      // Fallback data for development
      if (process.env.NODE_ENV === 'development' && !isNew) {
        setArticle({
          title: "How to Record Your First Voice Note",
          content: "# Getting Started with Voice Notes\n\nWelcome to SureTalk! Here's how to create your first voice note:\n\n## Step 1: Open the Recording Interface\nClick the + button in the bottom right corner of your dashboard.\n\n## Step 2: Record Your Message\nPress and hold the record button to start recording. Release to stop.\n\n## Step 3: Save Your Note\nAdd a title, select recipients, and choose storage options.\n\n## Tips & Best Practices\n- Record in a quiet environment\n- Speak clearly and at a normal pace\n- Keep messages under 5 minutes for best quality",
          category: "getting-started",
          tags: ["recording", "beginner", "tutorial"],
          published: true
        });
        
        setStats({
          total_views: 1245,
          helpful_votes: 89,
          not_helpful_votes: 3,
          published_at: new Date(Date.now() - 86400000)
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (!article.title.trim() || !article.content.trim()) {
        alert('Please fill in title and content');
        return;
      }

      if (isNew) {
        await api.createArticle(article);
        alert('Article created successfully!');
      } else {
        await api.updateArticle(articleId, article);
        alert('Article updated successfully!');
      }
      
      router.push('/adminDashboard/helpandsupport');

    } catch (error) {
      console.error("Save article error:", error);
      alert('Failed to save article. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    try {
      await api.deleteArticle(articleId);
      alert('Article deleted successfully!');
      router.push('/adminDashboard/helpandsupport');
    } catch (error) {
      console.error("Delete article error:", error);
      alert('Failed to delete article.');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !article.tags.includes(newTag.trim())) {
      setArticle({
        ...article,
        tags: [...article.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setArticle({
      ...article,
      tags: article.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  };

  const formatText = (format) => {
    if (!editorRef.current) return;
    
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = article.content.substring(start, end);
    
    let formattedText = '';
    let newCursorPos = start;
    
    switch(format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        newCursorPos = start + 2;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        newCursorPos = start + 1;
        break;
      case 'h2':
        formattedText = `\n## ${selectedText}\n`;
        newCursorPos = start + 3;
        break;
      case 'h3':
        formattedText = `\n### ${selectedText}\n`;
        newCursorPos = start + 4;
        break;
      case 'ul':
        formattedText = `\n- ${selectedText}`;
        newCursorPos = start + 2;
        break;
      case 'ol':
        formattedText = `\n1. ${selectedText}`;
        newCursorPos = start + 3;
        break;
      case 'quote':
        formattedText = `\n> ${selectedText}\n`;
        newCursorPos = start + 2;
        break;
      case 'code':
        formattedText = `\n\`\`\`\n${selectedText}\n\`\`\`\n`;
        newCursorPos = start + 4;
        break;
    }
    
    const newContent = article.content.substring(0, start) + formattedText + article.content.substring(end);
    
    setArticle({
      ...article,
      content: newContent
    });
    
    // Restore cursor position after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos + selectedText.length);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading article...</p>
        </div>
      </div>
    );
  }

  return (
    <div onKeyDown={handleKeyDown}>
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/adminDashboard/helpandsupport')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {isNew ? 'Create New Article' : 'Edit Article'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {isNew ? 'Create a new knowledge base article' : 'Edit and update article content'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setPreview(!preview)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 
                       text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 
                       transition-colors"
            >
              <Eye className="w-4 h-4" />
              {preview ? 'Edit' : 'Preview'}
            </button>
            
            {!isNew && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 border-2 border-red-300 dark:border-red-600 
                         text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 
                         transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 
                       text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isNew ? 'Publish Article' : 'Save Changes'}
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor/Preview Column */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass rounded-2xl overflow-hidden"
          >
            {/* Title Input */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                value={article.title}
                onChange={(e) => setArticle({...article, title: e.target.value})}
                placeholder="Article Title"
                className="w-full text-2xl font-bold bg-transparent border-none outline-none 
                         text-gray-800 dark:text-white placeholder-gray-500"
              />
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {isNew ? 'New article' : `Last updated: ${new Date().toLocaleDateString()}`}
                </div>
                <div className="flex items-center gap-2">
                  {article.published ? (
                    <>
                      <Globe className="w-4 h-4" />
                      <span>Published</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Draft</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Editor/Preview */}
            <div className="p-6">
              {preview ? (
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ 
                    __html: article.content
                      .replace(/\n/g, '<br>')
                      .replace(/#{1,6}\s+(.+)/g, (match, p1) => {
                        const level = match.match(/#/g)?.length || 1;
                        return `<h${level}>${p1}</h${level}>`;
                      })
                      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.+?)\*/g, '<em>$1</em>')
                      .replace(/`(.+?)`/g, '<code>$1</code>')
                      .replace(/\n-\s+(.+)/g, '<li>$1</li>')
                      .replace(/\n>\s+(.+)/g, '<blockquote>$1</blockquote>')
                  }} />
                </div>
              ) : (
                <>
                  {/* Formatting Toolbar */}
                  <div className="flex flex-wrap gap-2 mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <button
                      onClick={() => handleFormat('h2')}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      title="Heading 2"
                    >
                      <Heading className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFormat('h3')}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      title="Heading 3"
                    >
                      <Heading className="w-4 h-4 text-sm" />
                    </button>
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                    <button
                      onClick={() => handleFormat('bold')}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      title="Bold"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFormat('italic')}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      title="Italic"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                    <button
                      onClick={() => handleFormat('ul')}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      title="Bulleted List"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFormat('ol')}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      title="Numbered List"
                    >
                      <ListOrdered className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                    <button
                      onClick={() => handleFormat('quote')}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      title="Quote"
                    >
                      <Quote className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFormat('code')}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      title="Code Block"
                    >
                      <Code className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Content Editor */}
                  <textarea
                    ref={editorRef}
                    value={article.content}
                    onChange={(e) => setArticle({...article, content: e.target.value})}
                    placeholder="Start writing your article here... (Markdown supported)"
                    rows={20}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                             focus:border-transparent transition-all resize-none font-mono text-sm"
                  />
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Publishing Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setArticle({...article, published: true})}
                    className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                      article.published 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Globe className="w-4 h-4" />
                      Published
                    </div>
                  </button>
                  <button
                    onClick={() => setArticle({...article, published: false})}
                    className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                      !article.published 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4" />
                      Draft
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setArticle({...article, category: cat.id})}
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        article.category === cat.id
                          ? `${cat.color} text-white`
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Tags</h3>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add a tag"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 
                         focus:border-transparent transition-all text-sm"
              />
              <button
                onClick={handleAddTag}
                className="px-3 py-2 bg-gradient-to-r from-brand-500 to-accent-500 
                         text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-200 dark:bg-gray-700 
                           text-gray-700 dark:text-gray-300 rounded-full text-sm"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stats (for existing articles) */}
          {!isNew && stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Article Statistics</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Views</span>
                  </div>
                  <span className="font-semibold">{stats.total_views?.toLocaleString() || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Helpful Votes</span>
                  </div>
                  <span className="font-semibold text-green-600">{stats.helpful_votes || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ThumbsDown className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Not Helpful</span>
                  </div>
                  <span className="font-semibold text-red-600">{stats.not_helpful_votes || 0}</span>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500">
                    Last published: {new Date(stats.published_at).toLocaleDateString()}
                  </div>
                </div>
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
                onClick={() => {
                  const wordCount = article.content.split(/\s+/).length;
                  const charCount = article.content.length;
                  alert(`Word Count: ${wordCount}\nCharacter Count: ${charCount}`);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 
                         text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 
                         transition-colors text-sm"
              >
                <BarChart3 className="w-4 h-4" />
                Check Word Count
              </button>
              
              <button
                onClick={() => {
                  const url = `${window.location.origin}/help/article/${articleId}`;
                  navigator.clipboard.writeText(url);
                  alert('Article URL copied to clipboard!');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 
                         text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/30 
                         transition-colors text-sm"
              >
                <LinkIcon className="w-4 h-4" />
                Copy Article URL
              </button>
              
              <button
                onClick={() => {
                  const markdown = `# ${article.title}\n\n${article.content}`;
                  navigator.clipboard.writeText(markdown);
                  alert('Markdown copied to clipboard!');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/20 
                         text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/30 
                         transition-colors text-sm"
              >
                <FileText className="w-4 h-4" />
                Copy as Markdown
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="fixed bottom-6 right-6 z-10"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/adminDashboard/helpandsupport')}
            className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 
                     text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 
                     dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-500 
                     text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 
                     flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isNew ? 'Publish Article' : 'Save Changes'}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}