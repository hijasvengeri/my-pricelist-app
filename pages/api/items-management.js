// pages/api/items-management.js

import { supabase } from "@/lib/supabaseClient";

export default async function handler(req, res) {
    const method = req.method.toUpperCase();

    // =========================================================================
    // --- GET: Fetch items, SL No List, and MAX List SL No ---
    // =========================================================================
    if (method === "GET") {
        try {
            const { data, error } = await supabase
                .from("items_list") 
                .select("item_name, sl_no_list") 
                .order("item_name", { ascending: true });

            if (error) {
                console.error("LOG (GET/Items): Supabase Fetch Error:", error.message);
                return res.status(500).json({ error: "Database error during item fetch." });
            }

            const maxListSlNo = data.reduce((max, item) => {
                const currentSlNo = item.sl_no_list;
                return (typeof currentSlNo === 'number' && !isNaN(currentSlNo) && currentSlNo > max) ? currentSlNo : max;
            }, 0);

            const itemDetails = data.map(item => ({
                item_name: item.item_name,
                sl_no_list: item.sl_no_list
            }));
            
            const uniqueItemNames = data.map(item => item.item_name).filter(Boolean);
            
            console.log(`LOG (GET/Items): Fetched ${uniqueItemNames.length} item details.`);
            
            return res.status(200).json({ 
                uniqueItemNames, 
                maxListSlNo,
                itemDetails 
            });

        } catch (err) {
            console.error("LOG (GET/Items): Server Error:", err.message);
            return res.status(500).json({ error: "Internal Server Error during item fetch." });
        }
    }

    // --- POST: Create a new unique item name with its List SL No ---
    if (method === "POST") {
        const { item_name, sl_no_list } = req.body;
        
        if (!item_name || typeof sl_no_list !== 'number' || item_name.trim() === '') {
            return res.status(400).json({ error: "Item name and valid List SL No are required." });
        }

        try {
            const trimmedItemName = item_name.trim();

            const { data, error } = await supabase
                .from("items_list") 
                .insert([{ item_name: trimmedItemName, sl_no_list: sl_no_list }]) 
                .select(); 

            if (error) {
                if (error.code === '23505') { 
                    return res.status(409).json({ error: `Item '${trimmedItemName}' already exists.` });
                }
                console.error("LOG (POST/Items): Supabase Insert Error:", error.message);
                return res.status(500).json({ error: error.message });
            }

            return res.status(201).json(data[0]);

        } catch (err) {
            console.error("LOG (POST/Items): Server Error:", err.message);
            return res.status(500).json({ error: "Internal Server Error during item creation." });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}