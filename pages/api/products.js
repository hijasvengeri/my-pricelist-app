


// // pages/api/products.js

// import { supabase } from "@/lib/supabaseClient";
// import formidable from "formidable";
// import fs from "fs";
// // 💡 NEW: Import Cloudinary SDK
// const cloudinary = require('cloudinary').v2;

// // 💡 NEW: Configure Cloudinary using environment variables
// // Ensure these environment variables are set in your .env.local file
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });


// // Crucial: Disable Next.js body parser
// export const config = {
//   api: { bodyParser: false },
// };

// // Helper function to reliably extract a single string value
// const getSingleValue = (field) => {
//   if (Array.isArray(field)) {
//     return field[0];
//   }
//   return field ?? "";
// };

// export default async function handler(req, res) {
//   const method = req.method.toUpperCase(); 

//   // --- GET Request: Fetch all products ---
//   if (method === "GET") {
//     try {
//       const { data, error } = await supabase.from("products").select("*");
      
//       if (error) {
//         console.error("LOG 2 (GET): Supabase Fetch Error:", error.message);
//         return res.status(500).json({ error: error.message });
//       }
      
//       console.log(`LOG 2 (GET): Successfully fetched ${data.length} products.`);
//       return res.status(200).json(data);
//     } catch (err) {
//       console.error("LOG 3 (GET): Server Error:", err.message);
//       return res.status(500).json({ error: "Internal Server Error during GET." });
//     }
//   }

//   // --- POST Request: Add a new product and upload image ---
//   if (method === "POST") {
//     console.log("LOG 1.1 (Backend): Identified as POST request. Starting formidable parsing."); 
    
//     const form = formidable({ multiples: false });

//     form.parse(req, async (err, fields, files) => {
      
//       if (err) {
//         console.error("LOG 2 (POST): Formidable Parse Error:", err.message);
//         return res.status(500).json({ error: "Failed to parse form data." });
//       }
//       console.log("LOG 2 (POST): Formidable parsed fields (raw):", fields);

//       let imageUrl = "";
      
//       try {
//         // 1. 💡 NEW: Image Upload to Cloudinary
//         if (files.image) {
//           const file = Array.isArray(files.image) ? files.image[0] : files.image; 

//           if (!file || !file.filepath) {
//             console.error("LOG 3 (POST): Invalid file object after parsing.");
//             return res.status(400).json({ error: "No valid image file found." });
//           }

//           console.log(`LOG 3 (POST): Starting upload to Cloudinary from temp path: ${file.filepath}`);

//           // Upload the temporary file path directly to Cloudinary
//           const uploadResult = await cloudinary.uploader.upload(file.filepath, {
//             folder: "my-pricelist/products" // Organize images in a specific folder
//           });
          
//           // Use the secure URL returned by Cloudinary
//           imageUrl = uploadResult.secure_url; 
          
//           console.log(`LOG 4 (POST): Image upload to Cloudinary successful. URL: ${imageUrl}`);
//         }

//         // 2. Prepare Product Data for Database Insertion
//         const productFields = {};
//         for (const [key, value] of Object.entries(fields)) {
//             productFields[key] = getSingleValue(value);
            
//             // Convert known numeric fields to actual numbers
//             const numericKeys = ['sl_no', 'single', 'qty_5_plus', 'qty_10_plus', 'qty_20_plus', 'qty_50_plus', 'qty_100_plus', 'gst', 'mrp'];
//             if (numericKeys.includes(key) && productFields[key] !== "") {
//               productFields[key] = parseFloat(productFields[key]);
//             } else if (numericKeys.includes(key) && productFields[key] === "") {
//               productFields[key] = null; // Set empty numbers to null for database
//             }
//         }
        
//         // Combine fields and the Cloudinary URL
//         const newProduct = { ...productFields, product_image: imageUrl };

//         console.log("LOG 5 (POST): Data prepared for DB insert:", newProduct);

//         // 3. Insert Data into Supabase Table
//         // The only possible failure here is a database schema error or RLS policy violation on the TABLE.
//         const { data: insertData, error: insertError } = await supabase
//           .from("products") 
//           .insert([newProduct])
//           .select(); 

//         if (insertError) {
//             throw new Error(`Database insert failed: ${insertError.message}`);
//         }
        
//         console.log("LOG 6 (POST): Database insert successful.");

//         return res.status(201).json(insertData[0]);

//       } catch (error) {
//         console.error("LOG 7 (POST): Catch Block - Final Error:", error.message);
//         // No cleanup is needed as the Cloudinary file is now public and safe.
//         return res.status(500).json({ error: error.message || "An unexpected error occurred." });
//       }
//     });

//     return; // Prevent Next.js from prematurely closing the response
//   }

//   // --- Handle Other Methods ---
//   console.error(`LOG 8 (Backend): Falling through to Method Not Allowed for method: ${method}`);
//   return res.status(405).json({ error: "Method not allowed" });
// }





























// // pages/api/products.js

// import { supabase } from "@/lib/supabaseClient";
// import formidable from "formidable";
// import { v2 as cloudinary } from 'cloudinary'; // Cloudinary SDK

// // Configure Cloudinary using environment variables
// // Ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET
// // are set in your .env.local file.
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });


// // CRITICAL: Disable Next.js body parser for formidable to work with file uploads
// export const config = {
//   api: { bodyParser: false },
// };

// // Helper function to reliably extract a single string/number value from formidable fields
// const getSingleValue = (field) => {
//   if (Array.isArray(field)) {
//     return field[0];
//   }
//   return field ?? "";
// };

// export default async function handler(req, res) {
//   const method = req.method.toUpperCase(); 

//   // =========================================================================
//   // --- GET Request: Fetch all products or Metadata for the form ---
//   // =========================================================================
//   if (method === "GET") {
//     const { action } = req.query;

//     try {
//       if (action === "metadata") {
        
//         // Fetch ALL products (we need their SL_No and Item to calculate the next sequential number in the frontend)
//         const { data: allProductsData, error: allProductsError } = await supabase
//           .from("products")
//           .select("id, sl_no, items"); // 'items' column contains the item_name_fk value

//         if (allProductsError) {
//           throw new Error(`Supabase error fetching products for metadata: ${allProductsError.message}`);
//         }

//         // Return all product data to the frontend
//         return res.status(200).json({ allProducts: allProductsData });
      
//       } else {
//         // Default: Fetch all products for the homepage table
//         const { data, error } = await supabase.from("products").select("*").order("sl_no", { ascending: true });
        
//         if (error) {
//           console.error("LOG (GET/All): Supabase Fetch Error:", error.message);
//           return res.status(500).json({ error: error.message });
//         }
        
//         return res.status(200).json(data);
//       }
//     } catch (err) {
//       console.error("LOG (GET): Server Error:", err.message);
//       return res.status(500).json({ error: "Internal Server Error during GET." });
//     }
//   }

//   // =========================================================================
//   // --- POST Request: Add a new product and upload image ---
//   // =========================================================================
//   if (method === "POST") {
//     console.log("LOG (POST): Starting formidable parsing."); 
    
//     // Configure formidable
//     const form = formidable({ multiples: false });

//     form.parse(req, async (err, fields, files) => {
      
//       if (err) {
//         console.error("LOG (POST): Formidable Parse Error:", err.message);
//         return res.status(500).json({ error: "Failed to parse form data." });
//       }

//       let imageUrl = "";
      
//       try {
//         // 1. Image Upload to Cloudinary
//         if (files.image) {
//           const file = Array.isArray(files.image) ? files.image[0] : files.image; 

//           if (file?.filepath) {
//             console.log(`LOG (POST): Starting upload to Cloudinary from temp path: ${file.filepath}`);

//             const uploadResult = await cloudinary.uploader.upload(file.filepath, {
//               folder: "my-pricelist/products" // Folder for organization
//             });
            
//             imageUrl = uploadResult.secure_url; 
//             console.log(`LOG (POST): Image upload successful. URL: ${imageUrl}`);
//           }
//         }

//         // 2. Prepare Product Data for Database Insertion
//         const productFields = {};
//         for (const [key, value] of Object.entries(fields)) {
//             productFields[key] = getSingleValue(value);
            
//             // --- Type Conversion for Numeric Fields ---
//             const numericKeys = ['sl_no', 'single', 'qty_5_plus', 'qty_10_plus', 'qty_20_plus', 'qty_50_plus', 'qty_100_plus', 'mrp', 'gst'];
//             if (numericKeys.includes(key)) {
//               const val = productFields[key];
//               productFields[key] = (val !== null && val !== undefined && val !== "") 
//                 ? parseFloat(val) 
//                 : null; // Use null for empty numeric fields
//             }
//         }
        
//         // Combine fields and the Cloudinary URL
//         const newProduct = { ...productFields, product_image: imageUrl || null };

//         console.log("LOG (POST): Data prepared for DB insert:", newProduct);

//         // 3. Insert Data into Supabase Table
//         // NOTE: The 'items' field must contain the string item_name that was selected/created.
//         const { data: insertData, error: insertError } = await supabase
//           .from("products") 
//           .insert([newProduct])
//           .select(); 

//         if (insertError) {
//             throw new Error(`Database insert failed: ${insertError.message}`);
//         }
        
//         console.log("LOG (POST): Database insert successful.");

//         // Successfully return the inserted record
//         return res.status(201).json(insertData[0]);

//       } catch (error) {
//         console.error("LOG (POST): Catch Block - Final Error:", error.message);
//         return res.status(500).json({ error: error.message || "An unexpected error occurred during product submission." });
//       }
//     });

//     // CRITICAL: Return here to prevent Next.js from prematurely closing the response
//     return; 
//   }

//   // --- Handle Other Methods ---
//   return res.status(405).json({ error: "Method not allowed" });
// }













// // pages/api/products.js

// import { supabase } from "@/lib/supabaseClient";
// import formidable from "formidable";
// import { v2 as cloudinary } from 'cloudinary'; // Import Cloudinary SDK

// // Configure Cloudinary using environment variables
// // Ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET
// // are set in your .env.local file.
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// // --- CRITICAL: Disable Next.js body parser for formidable to work with file uploads ---
// export const config = {
//   api: { bodyParser: false },
// };

// // Helper function to reliably extract a single string/number value from formidable fields
// const getSingleValue = (field) => {
//   if (Array.isArray(field)) {
//     return field[0];
//   }
//   return field ?? "";
// };

// export default async function handler(req, res) {
//   const method = req.method.toUpperCase(); 

//   // =========================================================================
//   // --- GET Request: Fetch all products or Metadata for the form ---
//   // =========================================================================
//   if (method === "GET") {
//     const { action } = req.query;

//     try {
//       if (action === "metadata") {
        
//         // 1. Fetch ALL products (we need their SL_No and Item to calculate the next sequential number)
//         // Only select the required fields to keep the response light
//         const { data: allProductsData, error: allProductsError } = await supabase
//           .from("products")
//           .select("id, sl_no, items"); 

//         if (allProductsError) {
//           throw new Error(`Supabase error fetching products for metadata: ${allProductsError.message}`);
//         }

//         // Extract unique item names from the fetched data
//         const uniqueItems = [...new Set(allProductsData.map(item => item.items).filter(Boolean))];

//         // Return all necessary data to the frontend for calculation
//         console.log(`LOG (GET/Metadata): Found ${uniqueItems.length} unique items.`);
//         return res.status(200).json({ allProducts: allProductsData, uniqueItems });
      
//       } else {
//         // Default: Fetch all products for the homepage table
//         const { data, error } = await supabase.from("products").select("*").order("sl_no", { ascending: true });
        
//         if (error) {
//           console.error("LOG (GET/All): Supabase Fetch Error:", error.message);
//           return res.status(500).json({ error: error.message });
//         }
        
//         console.log(`LOG (GET/All): Successfully fetched ${data.length} products.`);
//         return res.status(200).json(data);
//       }
//     } catch (err) {
//       console.error("LOG (GET): Server Error:", err.message);
//       return res.status(500).json({ error: "Internal Server Error during GET." });
//     }
//   }

//   // =========================================================================
//   // --- POST Request: Add a new product and upload image ---
//   // =========================================================================
//   if (method === "POST") {
//     console.log("LOG (POST): Identified as POST request. Starting formidable parsing."); 
    
//     // Configure formidable
//     const form = formidable({ multiples: false });

//     form.parse(req, async (err, fields, files) => {
      
//       if (err) {
//         console.error("LOG (POST): Formidable Parse Error:", err.message);
//         return res.status(500).json({ error: "Failed to parse form data." });
//       }

//       let imageUrl = "";
      
//       try {
//         // 1. Image Upload to Cloudinary
//         if (files.image) {
//           // Get the single file object (formidable returns an array or single object)
//           const file = Array.isArray(files.image) ? files.image[0] : files.image; 

//           if (file?.filepath) {
//             console.log(`LOG (POST): Starting upload to Cloudinary from temp path: ${file.filepath}`);

//             const uploadResult = await cloudinary.uploader.upload(file.filepath, {
//               folder: "my-pricelist/products" // Folder for organization
//             });
            
//             // Get the secure URL from Cloudinary
//             imageUrl = uploadResult.secure_url; 
            
//             console.log(`LOG (POST): Image upload successful. URL: ${imageUrl}`);
//           }
//         }

//         // 2. Prepare Product Data for Database Insertion
//         const productFields = {};
//         for (const [key, value] of Object.entries(fields)) {
//             productFields[key] = getSingleValue(value);
            
//             // --- Type Conversion ---
//             const numericKeys = ['sl_no', 'single', 'qty_5_plus', 'qty_10_plus', 'qty_20_plus', 'qty_50_plus', 'qty_100_plus', 'mrp', 'gst'];
//             if (numericKeys.includes(key)) {
//               const val = productFields[key];
//               productFields[key] = (val !== null && val !== undefined && val !== "") 
//                 ? parseFloat(val) 
//                 : null; // Use null for empty numeric fields
//             }
//         }
        
//         // Combine fields and the Cloudinary URL
//         const newProduct = { ...productFields, product_image: imageUrl || null };

//         console.log("LOG (POST): Data prepared for DB insert:", newProduct);

//         // 3. Insert Data into Supabase Table
//         const { data: insertData, error: insertError } = await supabase
//           .from("products") 
//           .insert([newProduct])
//           .select(); 

//         if (insertError) {
//             throw new Error(`Database insert failed: ${insertError.message}`);
//         }
        
//         console.log("LOG (POST): Database insert successful.");

//         // Successfully return the inserted record
//         return res.status(201).json(insertData[0]);

//       } catch (error) {
//         console.error("LOG (POST): Catch Block - Final Error:", error.message);
//         // Return a 500 status with the error message
//         return res.status(500).json({ error: error.message || "An unexpected error occurred during product submission." });
//       }
//     });

//     // CRITICAL: Return here to prevent Next.js from prematurely closing the response
//     return; 
//   }

//   // --- Handle Other Methods ---
//   console.error(`LOG (API): Falling through to Method Not Allowed for method: ${method}`);
//   return res.status(405).json({ error: "Method not allowed" });
// }










// pages/api/products.js (FINALIZED)

import { supabase } from "@/lib/supabaseClient";
import cloudinary from "../../lib/cloudinary"; // Using relative path for robustness
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
      maxFileSize: 5 * 1024 * 1024 
    });
    
    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error("Formidable Parsing Error:", err);
        return reject(err);
      }
      resolve({ fields, files });
    });
  });
};

export default async function handler(req, res) {
  const method = req.method.toUpperCase();

  // --- GET logic (Metadata) ---
  if (method === "GET") {
    if (req.query.action === 'metadata') {
        const { data: allProducts, error } = await supabase.from('products').select('items, sl_no');
        if (error) {
            console.error("Supabase Metadata Error:", error);
            return res.status(500).json({ error: 'Failed to fetch product metadata.' });
        }
        return res.status(200).json({ allProducts });
    }
    return res.status(400).json({ error: "Invalid GET action." });
  }


  // =========================================================================
  // --- POST: Handle Product Creation with Cloudinary Upload ---
  // =========================================================================
  if (method === "POST") {
    let imageUrl = null;
    let fields;
    let file;

    try {
      console.log("LOG (POST): Starting formidable parsing.");

      const result = await parseForm(req);
      fields = result.fields;
      
      // Access file using the "image" key
      const imageFiles = result.files.image; 
      file = (imageFiles && imageFiles.length > 0) ? imageFiles[0] : null;

      if (!file) {
          console.log("LOG (POST): No file object found in formidable results. Skipping Cloudinary upload.");
      } else {
          console.log(`LOG (POST): File detected. Name: ${file.originalFilename}, Size: ${file.size}, Path: ${file.filepath}`);
      }

      // 2. Upload image to Cloudinary if a file exists
      if (file && file.filepath) {
        const uploadResponse = await cloudinary.uploader.upload(file.filepath, {
          folder: 'product_images', 
          unique_filename: true,
        });
        
        imageUrl = uploadResponse.secure_url; 
        console.log("LOG (POST): Cloudinary URL:", imageUrl); 
      }
      
      // 3. Prepare Supabase payload
      // Use [0] to extract the string value from Formidable's array output
      const payload = {
        items: fields.items[0], 
        sl_no: parseInt(fields.sl_no[0]), 
        brand: fields.brand[0],
        warranty: fields.warranty[0] || null,
        gst: parseFloat(fields.gst[0]) || 0,
        mrp: parseFloat(fields.mrp[0]) || 0,
        single: parseFloat(fields.single[0]) || 0,
        'qty_5_plus': parseFloat(fields.qty_5_plus[0]) || 0,
        'qty_10_plus': parseFloat(fields.qty_10_plus[0]) || 0,
        'qty_20_plus': parseFloat(fields.qty_20_plus[0]) || 0,
        'qty_50_plus': parseFloat(fields.qty_50_plus[0]) || 0,
        'qty_100_plus': parseFloat(fields.qty_100_plus[0]) || 0,
        product_image: imageUrl, // Saved to DB
      };

      console.log("LOG (POST): Data prepared for DB insert:", payload); 

      // 4. Insert data into Supabase
      const { data, error } = await supabase
        .from("products")
        .insert([payload])
        .select();

      if (error) {
        console.error("Supabase Insert Error:", error);
        return res.status(500).json({ error: error.message });
      }

      console.log("LOG (POST): Database insert successful.");
      return res.status(201).json(data[0]);

    } catch (err) {
      console.error("POST/Product Catch Block Error:", err);
      let errorMessage = "Failed to process product submission. Check server logs.";
      
      return res.status(500).json({ error: errorMessage });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}