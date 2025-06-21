import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Download, RefreshCw, AlertCircle, CheckCircle2, Palette, Sparkles, MessageSquare, X } from "lucide-react";
import { useAuth } from './../lib/AuthContext';

// Make sure these paths are correct relative to Dashboard.jsx
import { FileUpload } from "./ui/file-upload";
import { uploadToCloudinary } from "../lib/utils";

const Dashboard = () => {
  // All state related to the caption generator
  const [captionGenerated, setCaptionGenerated] = useState(false);
  const [captionText, setCaptionText] = useState('');
  const [basicCaption, setBasicCaption] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('creative');
  const [availableStyles, setAvailableStyles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const [uploaderFiles, setUploaderFiles] = useState([]);

  // New state for custom description
  const [customDescription, setCustomDescription] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const { currentUser: user, loading: authLoading } = useAuth();

  // Load available styles on component mount
  useEffect(() => {
    const fetchStyles = async () => {
      try {
        const response = await fetch("http://localhost:8000/caption-styles");
        const data = await response.json();
        setAvailableStyles(data.styles);
      } catch (error) {
        console.error("Error fetching styles:", error);
        // Fallback styles if API fails
        setAvailableStyles([
          { id: "creative", name: "Creative", description: "Engaging and imaginative" },
          { id: "funny", name: "Funny", description: "Humorous and witty" },
          { id: "poetic", name: "Poetic", description: "Beautiful and literary" },
          { id: "marketing", name: "Marketing", description: "Compelling and attention-grabbing" },
          { id: "social", name: "Social Media", description: "Perfect for social platforms" },
          { id: "artistic", name: "Artistic", description: "Sophisticated and refined" },
          { id: "custom", name: "Custom", description: "Describe your own style" }
        ]);
      }
    };
    fetchStyles();
  }, []);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle style selection and show/hide custom input
  useEffect(() => {
    if (selectedStyle === 'custom') {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      setCustomDescription('');
    }
  }, [selectedStyle]);

  // All handler functions for the caption generator
  const handleFileUpload = async (files) => {
    try {
      const file = files[0];
      if (!file) return;

      setError(null);
      setUploadLoading(true);
      setUploadProgress(0);
      setCaptionGenerated(false);
      setCaptionText('');
      setBasicCaption('');

      const imageUrl = await uploadToCloudinary(file, (progress) => {
        setUploadProgress(progress);
      });

      console.log("Uploaded to Cloudinary:", imageUrl);
      setImageUrl(imageUrl);
      setUploadedFile(file);
      setUploadProgress(100);

      setTimeout(() => {
        setUploadLoading(false);
        setUploadProgress(0);
      }, 500);

    } catch (error) {
      console.error("Upload error:", error);
      setError(`Upload failed: ${error.message}`);
      setUploadLoading(false);
      setUploadProgress(0);
      setImageUrl(null);
      setUploadedFile(null);
    }
  };

  // In Dashboard.jsx

  const handleGenerateCaption = async () => {
    if (!imageUrl) {
      setError("Please upload an image first."); // Also set an error for user feedback
      return;
    }

    if (!user) {
      setError("You must be logged in to generate captions.");
      return;
    }

    if (selectedStyle === 'custom' && !customDescription.trim()) {
      setError("Please describe what kind of caption you want for the custom style.");
      return;
    }
    setLoading(true);
    setCaptionGenerated(false);
    setError(null);

    try {
      const token = await user.getIdToken();
      console.log("Token received:", token.substring(0, 30) + "..."); // Log a snippet of the token

      const requestBody = {
        image_url: imageUrl,
        style: selectedStyle,
        custom_description: selectedStyle === 'custom' ? customDescription.trim() : null
      };

      console.log("Sending request to backend with body:", requestBody);

      // Go to the "Network" tab in your browser dev tools now!
      const response = await fetch("http://localhost:8000/generate-caption", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log("Backend responded with status:", response.status);
      const res = await response.json();
      console.log("Backend response data:", res);

      if (!response.ok) {
        // This will now catch errors like 401, 404, 500 etc.
        throw new Error(res.detail || "An error occurred on the server.");
      }

      console.log("SUCCESS: Setting caption text.");
      setCaptionText(res.enhanced_caption || res.caption);
      setBasicCaption(res.basic_caption || res.caption);
      setCaptionGenerated(true);

    } catch (err) {
      // Checkpoint 4: If anything goes wrong, we'll see it here.
      console.error("--- CATCH BLOCK TRIGGERED ---");
      console.error("The error is:", err);
      setError(`Caption generation failed: ${err.message}`);
      setCaptionText("");
      setBasicCaption("");
      setCaptionGenerated(false);
    } finally {
      // Checkpoint 5: This will always run, no matter what.
      console.log("--- FINALLY BLOCK --- Setting loading to false.");
      setLoading(false);
    }
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(captionText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      setError("Failed to copy caption to clipboard");
    }
  };

  const handleReset = () => {
    setImageUrl(null);
    setUploadedFile(null);
    setCaptionGenerated(false);
    setCaptionText('');
    setBasicCaption('');
    setCustomDescription('');
    setSelectedStyle('creative');
    setShowCustomInput(false);
    setError(null);
    setUploadProgress(0);
    setUploaderFiles([]);
  };

  const handleDownloadImage = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = uploadedFile?.name || 'downloaded-image';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStyleIcon = (styleId) => {
    const icons = {
      creative: "✨",
      funny: "😄",
      poetic: "🎭",
      marketing: "📈",
      social: "📱",
      artistic: "🎨",
      custom: "💭"
    };
    return icons[styleId] || "✨";
  };

  const getCurrentStyleName = () => {
    return availableStyles.find(s => s.id === selectedStyle)?.name || selectedStyle;
  };

  return (
    // This is the wrapper that was inside <motion.main>
    <div className="relative z-10 w-full px-4 flex flex-col items-center justify-start gap-8 py-10 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text mb-4 py-2">
          Caption-It-All
        </h1>
        <p className="text-neutral-400 text-lg max-w-2xl">
          Upload your image and let AI create perfect captions for your social media posts
        </p>
      </motion.div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl bg-red-900/20 border border-red-500 rounded-lg p-4 flex items-center gap-3"
          >
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Upload Section */}
      <div className="w-full max-w-3xl p-1 rounded-xl border-2 border-blue-400 shadow-[0_0_15px_3px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_5px_rgba(59,130,246,0.6)] transition duration-300 ease-in-out">
        <FileUpload
          files={uploaderFiles}
          setFiles={setUploaderFiles}
          onChange={handleFileUpload}
        />
      </div>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploadLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md"
          >
            <div className="bg-neutral-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-300">Uploading...</span>
                <span className="text-sm text-blue-400">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-neutral-700 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploaded Image Preview */}
      <AnimatePresence>
        {imageUrl && !uploadLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md relative group"
          >
            <img
              src={imageUrl}
              alt="Uploaded"
              className="w-full h-auto rounded-lg shadow-lg border border-neutral-700"
            />
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleDownloadImage}
                className="p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
                title="Download Image"
              >
                <Download className="h-4 w-4 text-white" />
              </button>
              <button
                onClick={handleReset}
                className="p-2 bg-red-600/50 backdrop-blur-sm rounded-full hover:bg-red-600/70 transition-colors"
                title="Remove Image"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
            <div className="mt-2 text-xs text-neutral-400 text-center">
              {uploadedFile?.name} • {uploadedFile && (uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Style Selection */}
      <AnimatePresence>
        {imageUrl && !uploadLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl"
          >
            <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-medium text-white">Choose Caption Style</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableStyles.map((style) => (
                  <motion.button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-4 rounded-lg border transition-all text-left ${selectedStyle === style.id
                        ? 'border-purple-400 bg-purple-900/30 text-white'
                        : 'border-neutral-600 bg-neutral-800/30 text-neutral-300 hover:border-neutral-500'
                      }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getStyleIcon(style.id)}</span>
                      <span className="font-medium">{style.name}</span>
                    </div>
                    <p className="text-xs text-neutral-400">{style.description}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Description Input */}
      <AnimatePresence>
        {showCustomInput && imageUrl && !uploadLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl"
          >
            <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-medium text-white">Describe Your Caption Style</h3>
                </div>
                <button
                  onClick={() => setSelectedStyle('creative')}
                  className="p-1 hover:bg-neutral-700 rounded-full transition-colors"
                  title="Close custom input"
                >
                  <X className="h-4 w-4 text-neutral-400" />
                </button>
              </div>
              <div className="space-y-3">
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Describe what kind of caption you want... (e.g., 'motivational quote for fitness', 'romantic caption for couple photo', 'professional caption for business post')"
                  className="w-full h-24 bg-neutral-800/50 border border-neutral-600 rounded-lg p-3 text-white placeholder-neutral-400 resize-none focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                  maxLength={200}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-neutral-400">
                    Be specific about tone, emotion, or purpose for better results
                  </p>
                  <span className="text-xs text-neutral-500">
                    {customDescription.length}/200
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate Caption Button */}
      {imageUrl && !uploadLoading && (
        <motion.button
          className="p-[3px] relative disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleGenerateCaption}
          disabled={!imageUrl || authLoading || loading || uploadLoading || (selectedStyle === 'custom' && !customDescription.trim())}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
          <div className="px-8 py-3 bg-black rounded-[6px] relative group transition duration-200 text-white hover:bg-transparent flex items-center gap-2">
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating {getCurrentStyleName()} Caption...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate {getCurrentStyleName()} Caption
              </>
            )}
          </div>
        </motion.button>
      )}

      {/* Generated Caption */}
      <AnimatePresence>
        {captionGenerated && captionText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/50 p-6 rounded-xl text-white max-w-2xl w-full shadow-2xl backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                {getStyleIcon(selectedStyle)} {getCurrentStyleName()} Caption
              </h2>
              <button
                onClick={handleCopyCaption}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors text-sm"
                title="Copy to Clipboard"
              >
                {copySuccess ? (<><CheckCircle2 className="h-4 w-4 text-green-400" /> Copied!</>) : (<><Copy className="h-4 w-4" /> Copy</>)}
              </button>
            </div>
            <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20 mb-4">
              <p className="text-purple-100 leading-relaxed text-lg">{captionText}</p>
            </div>
            {selectedStyle === 'custom' && customDescription && (
              <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-500/20 mt-3">
                <p className="text-xs text-purple-400 mb-1">Your Custom Request:</p>
                <p className="text-purple-200 text-sm">{customDescription}</p>
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleGenerateCaption}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Generate New
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Section */}
      <div className="space-y-6 text-center max-w-2xl w-full">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-neutral-800/50 backdrop-blur-sm p-6 rounded-lg border border-neutral-700">
            <h4 className="text-lg font-medium mb-3 text-purple-400">✨ Features</h4>
            <ul className="text-sm text-neutral-300 space-y-2 text-left">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>AI-powered caption generation</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>Multiple caption styles</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>Custom description support</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>Secure cloud image storage</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>One-click copy to clipboard</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>Complete caption history</li>
            </ul>
          </div>
          <div className="bg-neutral-800/50 backdrop-blur-sm p-6 rounded-lg border border-neutral-700">
            <h4 className="text-lg font-medium mb-3 text-blue-400">🚀 How it works</h4>
            <div className="text-sm text-neutral-300 space-y-2 text-left">
              <div className="flex items-start gap-3"><span className="text-blue-400 font-medium">1.</span><span>Upload your image</span></div>
              <div className="flex items-start gap-3"><span className="text-blue-400 font-medium">2.</span><span>Choose style or describe custom</span></div>
              <div className="flex items-start gap-3"><span className="text-blue-400 font-medium">3.</span><span>Generate & copy your caption</span></div>
              <div className="flex items-start gap-3"><span className="text-blue-400 font-medium">3.</span><span>Click on Generate New for multiple captions</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-4 mt-8 border-t border-neutral-800 w-full max-w-2xl">
        <p>© 2025 AI Caption Generator • Built with ❤️ for creators</p>
        <p className="text-xs mt-1 text-gray-600">Powered by AI • Secure • Fast • Free</p>
      </footer>
    </div>
  );
};

export default Dashboard;