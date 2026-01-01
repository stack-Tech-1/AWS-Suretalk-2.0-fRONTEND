"use client"
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "../../../../../utils/api";
import Link from "next/link";
import {
  ArrowLeft, ThumbsUp, ThumbsDown, BookOpen, Tag, Calendar,
  Eye, ChevronRight, Home, HelpCircle, FileText, Share2,
  Copy, Printer, Download, MessageSquare, User, Clock
} from "lucide-react";

export default function UserArticleDetail() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [voted, setVoted] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Breadcrumb items
  const breadcrumbs = [
    { label: "Dashboard", href: "/usersDashboard", icon: <Home className="w-4 h-4" /> },
    { label: "Help & Support", href: "/usersDashboard/helpandsupport", icon: <HelpCircle className="w-4 h-4" /> },
    { label: "Knowledge Base", href: "/usersDashboard/helpandsupport", icon: <FileText className="w-4 h-4" /> },
    { label: "Article", icon: <BookOpen className="w-4 h-4" />, current: true }
  ];

  useEffect(() => {
    fetchArticle();
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      
      const kbData = await api.getKnowledgeBase({ limit: 50 });
      const foundArticle = kbData.data.articles.find(a => a.id === articleId);
      
      if (foundArticle) {
        setArticle(foundArticle);
        
        // Find related articles (same category)
        const related = kbData.data.articles
          .filter(a => a.id !== articleId && a.category === foundArticle.category)
          .slice(0, 3);
        setRelatedArticles(related);
      } else {
        router.push('/usersDashboard/helpandsupport');
      }

    } catch (error) {
      console.error("Fetch article error:", error);
      
      // Fallback data for development
      if (process.env.NODE_ENV === 'development') {
        setArticle({
          id: articleId,
          title: "How to Record Your First Voice Note",
          content: `# Getting Started with Voice Notes

Welcome to SureTalk! Here's how to create your first voice note:

## Step 1: Open the Recording Interface
Click the + button in the bottom right corner of your dashboard to open the recording interface.

## Step 2: Record Your Message
1. Press and hold the record button to start recording
2. Speak clearly into your microphone
3. Release the button to stop recording
4. You can preview your recording before saving

## Step 3: Save Your Note
After recording, you can:
- Add a title to your voice note
- Select recipients from your contacts
- Choose storage options (Standard or Permanent)
- Add tags for easy organization

## Tips & Best Practices
- Record in a quiet environment
- Speak clearly and at a normal pace
- Keep messages under 5 minutes for best quality
- Use headphones for better audio quality

## Troubleshooting
If you're having trouble recording:
1. Check microphone permissions in your browser
2. Ensure you're using a supported browser (Chrome, Firefox, Safari)
3. Try using a different microphone
4. Clear your browser cache and try again

Need more help? Contact our support team for assistance.`,
          category: "getting-started",
          tags: ["recording", "beginner", "tutorial", "voice notes"],
          views: 1245,
          helpful_votes: 89,
          not_helpful_votes: 3,
          created_at: new Date(Date.now() - 86400000),
          updated_at: new Date(Date.now() - 43200000),
        });
        
        setRelatedArticles([
          {
            id: "2",
            title: "Understanding Your Storage Limits",
            category: "getting-started",
            views: 876,
            created_at: new Date(Date.now() - 172800000)
          },
          {
            id: "3",
            title: "Managing Your Contacts",
            category: "getting-started",
            views: 543,
            created_at: new Date(Date.now() - 259200000)
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (helpful) => {
    if (voted) return;
    
    try {
      await api.voteOnArticle(articleId, helpful);
      setVoted(true);
      
      setArticle(prev => ({
        ...prev,
        helpful_votes: helpful ? prev.helpful_votes + 1 : prev.helpful_votes,
        not_helpful_votes: !helpful ? prev.not_helpful_votes + 1 : prev.not_helpful_votes
      }));
      
    } catch (error) {
      console.error("Vote error:", error);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = article.title;
    
    let shareUrl = '';
    switch(platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 86400) return 'Today';
    if (seconds < 172800) return 'Yesterday';
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
    return formatDate(date);
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

  if (!article) {
    return (
      <div className="text-center py-16">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Article Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">The requested article could not be found.</p>
        <button
          onClick={() => router.push('/usersDashboard/helpandsupport')}
          className="px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl hover:shadow-lg transition-all"
        >
          Back to Knowledge Base
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
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.push('/usersDashboard/helpandsupport')}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Updated {timeAgo(article.updated_at)}
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {article.views?.toLocaleString() || 0} views
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span className="capitalize">{article.category}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {article.tags?.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 
                       rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Article Content */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass rounded-2xl p-8"
          >
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ 
                __html: article.content
                  .replace(/\n/g, '<br>')
                  .replace(/#{1,6}\s+(.+)/g, (match, p1) => {
                    const level = match.match(/#/g)?.length || 1;
                    return `<h${level} class="scroll-mt-20">${p1}</h${level}>`;
                  })
                  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.+?)\*/g, '<em>$1</em>')
                  .replace(/`(.+?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">$1</code>')
                  .replace(/\n-\s+(.+)/g, '<li>$1</li>')
                  .replace(/\n>\s+(.+)/g, '<blockquote class="border-l-4 border-brand-500 pl-4 italic">$1</blockquote>')
              }} />
            </div>
          </motion.div>

          {/* Feedback Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 glass rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Was this article helpful?
            </h3>
            
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => handleVote(true)}
                disabled={voted}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  voted 
                    ? 'bg-green-500 text-white' 
                    : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                Yes ({article.helpful_votes || 0})
              </button>
              
              <button
                onClick={() => handleVote(false)}
                disabled={voted}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  voted 
                    ? 'bg-red-500 text-white' 
                    : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200'
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
                No ({article.not_helpful_votes || 0})
              </button>
            </div>
            
            {voted && (
              <p className="text-green-600 dark:text-green-400 text-sm">
                Thank you for your feedback!
              </p>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Table of Contents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Table of Contents</h3>
            
            <nav className="space-y-2">
              {article.content
                .split('\n')
                .filter(line => line.startsWith('## '))
                .map((heading, index) => {
                  const text = heading.replace('## ', '').replace('### ', '').replace('#### ', '');
                  const level = heading.match(/#/g)?.length || 2;
                  const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  
                  return (
                    <a
                      key={index}
                      href={`#${slug}`}
                      className={`block text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 
                               dark:hover:text-brand-400 transition-colors ${
                                 level > 2 ? 'pl-4' : ''
                               }`}
                    >
                      {text}
                    </a>
                  );
                })}
            </nav>
          </motion.div>

          {/* Share & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Share & Actions</h3>
            
            <div className="space-y-3">
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 
                           text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/30 
                           transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share this article
                </button>
                
                {showShareMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowShareMenu(false)}
                    />
                    <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl 
                                  shadow-2xl border border-gray-200 dark:border-gray-700 z-50 p-2">
                      <button
                        onClick={() => handleShare('copy')}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 
                                 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        Copy link
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 
                                 dark:hover:bg-gray-700 transition-colors"
                      >
                        <span className="text-blue-400">𝕏</span>
                        Share on Twitter
                      </button>
                      <button
                        onClick={() => handleShare('facebook')}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 
                                 dark:hover:bg-gray-700 transition-colors"
                      >
                        <span className="text-blue-600">f</span>
                        Share on Facebook
                      </button>
                    </div>
                  </>
                )}
              </div>
              
              <button
                onClick={() => window.print()}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 
                         text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 
                         transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print this article
              </button>
              
              <button
                onClick={() => {
                  const blob = new Blob([article.content], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${article.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/20 
                         text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/30 
                         transition-colors"
              >
                <Download className="w-4 h-4" />
                Download as Markdown
              </button>
            </div>
          </motion.div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Related Articles</h3>
              
              <div className="space-y-3">
                {relatedArticles.map((related) => (
                  <button
                    key={related.id}
                    onClick={() => router.push(`/usersDashboard/helpandsupport/articles/${related.id}`)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
                             transition-colors"
                  >
                    <div className="font-medium text-gray-800 dark:text-white mb-1 line-clamp-2">
                      {related.title}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {related.views?.toLocaleString() || 0}
                      </span>
                      <span>•</span>
                      <span>{timeAgo(related.created_at)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Need More Help? */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="p-6 bg-gradient-to-r from-brand-600 to-accent-500 rounded-2xl"
          >
            <div className="text-white">
              <h3 className="font-bold mb-2">Still need help?</h3>
              <p className="text-sm opacity-90 mb-4">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/usersDashboard/helpandsupport?new=true')}
                  className="flex-1 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-lg 
                           hover:bg-white/30 transition-all text-sm"
                >
                  Contact Support
                </button>
                <button
                  onClick={() => router.push('/usersDashboard/helpandsupport')}
                  className="flex-1 px-3 py-2 bg-white text-brand-600 rounded-lg 
                           hover:bg-gray-100 transition-all text-sm"
                >
                  Browse More Articles
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}