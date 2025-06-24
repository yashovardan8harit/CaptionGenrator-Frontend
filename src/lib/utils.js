import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";

// This function remains unchanged
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Uploads a file to Cloudinary using signed upload (from FastAPI backend)
 * @param {File} file 
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<string>} image URL
 */
export const uploadToCloudinary = async (file, onProgress = null) => {
  try {
    // Your file validation is perfect and remains unchanged
    if (!file) {
      throw new Error("No file provided");
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error("File size too large. Maximum allowed size is 10MB.");
    }
    if (!file.type.startsWith('image/')) {
      throw new Error("Please upload only image files");
    }

    console.log("Starting upload process for file:", file.name);

    // ==========================================================
    // THIS IS THE CORRECTED PART
    // ==========================================================
    // 1. Read the dynamic backend URL from environment variables
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    // 2. Get signature & credentials from the DYNAMIC backend URL
    console.log(`Fetching signature from backend at ${API_BASE_URL}...`);
    const { data } = await axios.get(`${API_BASE_URL}/generate-signature`);
    // ==========================================================
    
    console.log("Signature received:", {
      api_key: data.api_key,
      cloud_name: data.cloud_name,
      timestamp: data.timestamp
    });

    // The rest of the function remains exactly the same as your original file
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", data.api_key);
    formData.append("timestamp", data.timestamp);
    formData.append("signature", data.signature);
    formData.append("folder", "uploads");

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${data.cloud_name}/image/upload`;
    console.log("Uploading to Cloudinary URL:", cloudinaryUrl);

    const response = await axios.post(cloudinaryUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.lengthComputable && onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          if (typeof onProgress === 'function') {
            onProgress(percentCompleted);
          }
        }
      },
      timeout: 30000,
    });

    console.log("Upload successful:", response.data);
    return response.data.secure_url;

  } catch (err) {
    // Your excellent error handling remains unchanged
    console.error("Cloudinary upload error:", err);
    if (err.response) {
      const errorMessage = err.response.data?.error?.message || 
                          err.response.data?.message || 
                          `Upload failed with status ${err.response.status}`;
      throw new Error(errorMessage);
    } else if (err.request) {
      throw new Error("Network error: Could not connect to upload service");
    } else if (err.code === 'ECONNABORTED') {
      throw new Error("Upload timeout: The file is taking too long to upload");
    } else {
      throw new Error(err.message || "Unknown upload error occurred");
    }
  }
};

/**
 * This alternative upload method is unchanged.
 */
export const uploadToCloudinaryUnsigned = async (file, uploadPreset, cloudName) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData
    );
    
    return response.data.secure_url;
  } catch (error) {
    console.error("Unsigned upload error:", error);
    throw error;
  }
};