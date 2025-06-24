// src/components/History.jsx (or wherever it is located)

import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext'; // Ensure this path is correct
import {
  History as HistoryIcon,
  Trash2,
  Copy,
  Download,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Loader2,
  Search,
  Filter,
  X,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchHistory as apiFetchHistory, deleteHistoryItem as apiDeleteHistoryItem, clearAllHistory as apiClearAllHistory } from '../lib/api';

const History = () => {
  // 1. CORRECTLY destructure `currentUser` and rename it to `user`
  const { currentUser: user, loading: authLoading } = useAuth();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true); // This is for the history page's own loading state
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStyle, setFilterStyle] = useState('all');
  const [clearingAll, setClearingAll] = useState(false);

  const styles = [
    { id: 'all', name: 'All Styles', icon: '🎨' },
    { id: 'creative', name: 'Creative', icon: '✨' },
    { id: 'funny', name: 'Funny', icon: '😄' },
    { id: 'poetic', name: 'Poetic', icon: '🎭' },
    { id: 'marketing', name: 'Marketing', icon: '📈' },
    { id: 'social', name: 'Social Media', icon: '📱' },
    { id: 'artistic', name: 'Artistic', icon: '🎨' },
    { id: 'custom', name: 'Custom', icon: '💭' }
  ];

  // 2. Use a robust useEffect to fetch data only when ready
  useEffect(() => {
    // Only fetch if authentication is complete AND we have a logged-in user
    if (!authLoading && user) {
      console.log("[History.jsx] Auth complete and user found. Fetching history...");
      fetchHistory(user);
    }
    // If auth is complete but there's no user, stop loading and show empty state
    else if (!authLoading && !user) {
      console.log("[History.jsx] Auth complete, no user found. Clearing state.");
      setLoading(false);
      setHistory([]);
    }
  }, [user, authLoading]); // This effect runs whenever the user or auth loading state changes

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => setCopySuccess(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  const fetchHistory = async (currentUser) => {
    setLoading(true);
    setError(null);
    try {
      const token = await currentUser.getIdToken();
      // Use the new, clean API function
      const data = await apiFetchHistory(token); 
      setHistory(data.history || []);
    } catch (err) {
      setError(`Failed to load history: ${err.message}`);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (historyId) => {
    if (!user) return;
    setDeleteLoading(historyId);
    try {
      const token = await user.getIdToken();
      await apiDeleteHistoryItem(historyId, token); // Use the new function
      setHistory(prev => prev.filter(item => item.id !== historyId));
    } catch (err) {
      setError(`Failed to delete: ${err.message}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleClearAllHistory = async () => {
    if (!user || !window.confirm('Are you sure you want to delete all history?')) return;
    setClearingAll(true);
    try {
      const token = await user.getIdToken();
      await apiClearAllHistory(token); // Use the new function
      setHistory([]);
    } catch (err) {
      setError(`Failed to clear history: ${err.message}`);
    } finally {
      setClearingAll(false);
    }
  };

  // ... your other helper functions like handleCopyCaption, handleDownloadImage, formatDate are fine ...
  const handleCopyCaption = async (caption, itemId) => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopySuccess(itemId);
    } catch (err) {
      setError('Failed to copy caption to clipboard');
    }
  };

  const handleDownloadImage = (imageUrl, filename = 'caption-image') => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // NEW / CORRECTED for IST

const formatDate = (dateString) => {
  if (!dateString) return 'Just now';

  // As before, ensure the input string is treated as UTC.
  // The database timestamp from Render will be in UTC.
  if (!dateString.endsWith('Z')) {
    dateString = dateString.replace(' ', 'T') + 'Z';
  }

  const date = new Date(dateString);

  // Define the options for formatting.
  // CRUCIAL: Add the `timeZone` option and set it to 'Asia/Kolkata'.
  const options = {
    timeZone: 'Asia/Kolkata', // This forces the output to be in IST
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true // Use AM/PM format
  };

  // Now, create the formatter with the specified options.
  const formatter = new Intl.DateTimeFormat('en-US', options);

  // Format the date. This will now be in IST.
  return formatter.format(date);
};

  const filteredHistory = history.filter(item => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' ||
      item.enhanced_caption?.toLowerCase().includes(searchTermLower) ||
      item.custom_description?.toLowerCase().includes(searchTermLower);

    const matchesStyle = filterStyle === 'all' || item.style === filterStyle;

    return matchesSearch && matchesStyle;
  });

  // The rest of your JSX can remain largely the same.
  // This initial loading state is important.
  if (authLoading || loading) {
    return (
      <div className="relative z-10 w-full flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        <p className="text-neutral-400">Loading your caption history...</p>
      </div>
    );
  }

  // The rest of your return statement for displaying the history page
  // ... (All the JSX you had before for the history page UI) ...
  return (
    <div className="relative z-10 w-full px-4 flex flex-col items-center justify-start gap-6 py-10 min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center w-full max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text mb-4 py-2">
          Caption History
        </h1>
        <p className="text-neutral-400 text-lg">View and manage all your generated captions</p>
      </motion.div>
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-4xl bg-red-900/20 border border-red-500 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
      {history.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="w-full max-w-4xl bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input type="text" placeholder="Search captions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors" />
              {searchTerm && (<button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white"><X className="h-4 w-4" /></button>)}
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-neutral-400" />
              <select value={filterStyle} onChange={(e) => setFilterStyle(e.target.value)} className="bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors">
                {styles.map(style => (<option key={style.id} value={style.id}>{style.icon} {style.name}</option>))}
              </select>
            </div>
            <button onClick={handleClearAllHistory} disabled={clearingAll} className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm">
              {clearingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Clear All
            </button>
          </div>
          <div className="mt-3 text-sm text-neutral-400">
            Showing {filteredHistory.length} of {history.length} captions
          </div>
        </motion.div>
      )}
      <div className="w-full max-w-4xl">
        <AnimatePresence>
          {filteredHistory.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <HistoryIcon className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-400 mb-2">{history.length === 0 ? 'No Caption History' : 'No Results Found'}</h3>
              <p className="text-neutral-500">{history.length === 0 ? 'Start generating captions to see them here!' : 'Try adjusting your search or filter criteria.'}</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((item, index) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, delay: index * 0.05 }} className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-lg overflow-hidden hover:border-neutral-600 transition-colors">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="lg:w-48 flex-shrink-0">
                        <div className="relative group">
                          <img src={item.image_url} alt="Generated caption" className="w-full h-32 lg:h-28 object-cover rounded-lg border border-neutral-600" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <button onClick={() => handleDownloadImage(item.image_url, `caption-${item.id}`)} className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors" title="Download Image"><Download className="h-4 w-4 text-white" /></button>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                            <span className="text-lg">{styles.find(s => s.id === item.style)?.icon || '✨'}</span>
                            <span className="font-medium text-purple-400 capitalize">{item.style} Style</span>
                            <div className="flex items-center gap-1 text-sm text-neutral-500">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(item.created_at)}</span>
                            </div>
                          </div>
                          <button onClick={() => handleDeleteItem(item.id)} disabled={deleteLoading === item.id} className="p-1 text-neutral-500 hover:text-red-400 transition-colors disabled:opacity-50" title="Delete">
                            {deleteLoading === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </button>
                        </div>
                        <div className="bg-neutral-900/50 rounded-lg p-4 mb-3 border border-neutral-600/50">
                          <p className="text-white leading-relaxed">{item.enhanced_caption}</p>
                        </div>
                        {item.custom_description && (
                          <div className="bg-purple-900/20 rounded-lg p-3 mb-3 border border-purple-500/20">
                            <div className="flex items-center gap-2 mb-1"><MessageSquare className="h-4 w-4 text-purple-400" /><span className="text-xs text-purple-400 font-medium">Custom Request:</span></div>
                            <p className="text-purple-200 text-sm">{item.custom_description}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleCopyCaption(item.enhanced_caption, item.id)} className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors text-sm">
                            {copySuccess === item.id ? (<><CheckCircle2 className="h-4 w-4 text-green-400" /> <span className="text-green-400">Copied!</span></>) : (<><Copy className="h-4 w-4" /> <span>Copy</span></>)}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default History;