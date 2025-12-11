// /pages/api/product-image-upload.js

import cloudinary from "../../lib/cloudinary"; 
import formidable from "formidable"; 

// IMPORTANT: Disable Next.js's default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to handle the formidable parsing
const parseForm = (req) => {
  return new Promise((resolve, reject) => {
    const form = formidable({ 
      multiples: false, 
      maxFileSize: 5 * 1024 * 1024 // 5MB limit
    });
    
    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error("Formidable Parsing Error:", err);
        if (err.httpCode === 413) {
          return reject(new Error("File size exceeds the 5MB limit."));
        }
        return reject(err);
      }
      // Ensure we get the single file object for the 'image' field
      const imageFiles = files.image; 
      const file = (imageFiles && imageFiles.length > 0) ? imageFiles[0] : null;

      resolve(file); // Only return the file object
    });
  });
};


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
      // 1. Parse the incoming form data to get the file
      const file = await parseForm(req);
      
      if (!file || !file.filepath) {
          return res.status(400).json({ error: "No image file provided." });
      }
      
      // 2. Upload the file to Cloudinary using the file's temporary path
      const uploadResponse = await cloudinary.uploader.upload(file.filepath, {
        folder: 'product_images', 
        unique_filename: true,
      });
      
      const imageUrl = uploadResponse.secure_url; 

      // 3. Return the public URL to the frontend
      return res.status(200).json({ imageUrl });

  } catch (err) {
      console.error("Image Upload API Error:", err);
      let errorMessage = err.message || "Image upload failed due to a server error.";
      
      return res.status(500).json({ error: errorMessage });
  }
}