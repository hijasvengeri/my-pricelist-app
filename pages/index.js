

// import { useEffect, useState, useCallback, useMemo, useRef } from "react";
// // Ensure this path is correct for your Supabase client setup
// import { supabase } from "../lib/supabaseClient"; 
// import { Table, Image, Button, Space, Input, message, Pagination } from "antd";
// import Link from "next/link";

// // ---------------------------------------------
// // HELPER FUNCTIONS 
// // ---------------------------------------------

// /**
//  * Fetches a remote URL and converts the image data to a Base64 string.
//  */
// const urlToBase64 = async (url) => {
//   if (!url) return '';
//   try {
//     const response = await fetch(url);
//     const blob = await response.blob();
//     return new Promise((resolve) => {
//       const reader = new FileReader();
//       reader.onloadend = () => resolve(reader.result);
//       reader.readAsDataURL(blob);
//     });
//   } catch (e) {
//     console.error("Failed to convert image to Base64:", url, e);
//     return ''; // Return empty string on failure
//   }
// };

// /**
//  * Groups and sorts data, setting rowSpan for SL No and Item, while preserving all Brand data.
//  */
// const getGroupedData = (data) => {
//   let count = 0;
//   const groupedData = [];
    
//   // Sort by SL No, Item, then Brand for consistent grouping
//   const sortedData = [...data].sort((a, b) => {
//     if (a.sl_no !== b.sl_no) return a.sl_no - b.sl_no;
//     const aItems = a.items || '';
//     const bItems = b.items || '';
//     return aItems.localeCompare(bItems) || (a.brand || '').localeCompare(b.brand || '');
//   });

//   for (let i = 0; i < sortedData.length; i++) {
//     const currentItem = sortedData[i];
    
//     // Check if this item is the start of a new SL No/Item group
//     if (i === 0 || currentItem.sl_no !== sortedData[i - 1].sl_no || currentItem.items !== sortedData[i - 1].items) {
//       count = 1;
//       for (let j = i + 1; j < sortedData.length; j++) {
//         if (sortedData[j].sl_no === currentItem.sl_no && sortedData[j].items === currentItem.items) count++;
//         else break;
//       }
//       groupedData.push({ ...currentItem, rowSpan: count, isGroupStart: true }); 
//     } else {
//       groupedData.push({ ...currentItem, rowSpan: 0, isGroupStart: false }); 
//     }
//   }
//   return groupedData;
// };

// const formatPrice = (price) => {
//     const cleanPrice = String(price).replace(/[^\d.]/g, ''); 
//     const numericPrice = parseFloat(cleanPrice);

//     if (isNaN(numericPrice) || numericPrice <= 0) {
//       return '-';
//     }
//     return `${numericPrice}`; 
// };

// const formatGST = (gst) => (gst > 0 ? `${gst}%` : '-');

// // ---------------------------------------------
// // Ant Design Table Columns (for UI)
// // ---------------------------------------------

// const columns = [
//   // SL No and Item columns handle the row merge
//   { title: 'SL No', dataIndex: 'sl_no', key: 'sl_no', align: 'center', onCell: (record) => ({ rowSpan: record.rowSpan }), width: 50, fixed: 'left' },
//   { title: 'Item', dataIndex: 'items', key: 'items', align: 'center', onCell: (record) => ({ rowSpan: record.rowSpan }), render: (text, record) => record.rowSpan > 0 ? text : null, width: 120, fixed: 'left' },
//   // Brand is explicitly rendered on the homepage table
//   { title: 'Brand', dataIndex: 'brand', key: 'brand', align: 'center', width: 80, fixed: 'left', render: (text) => text || '-' },
//   { title: 'Single', dataIndex: 'single', key: 'single', align: 'center', render: formatPrice, width: 70 },
//   { title: '5+', dataIndex: 'qty_5_plus', key: 'qty_5_plus', align: 'center', render: formatPrice, width: 60 },
//   { title: '10+', dataIndex: 'qty_10_plus', key: 'qty_10_plus', align: 'center', render: formatPrice, width: 60 },
//   { title: '20+', dataIndex: 'qty_20_plus', key: 'qty_20_plus', align: 'center', render: formatPrice, width: 60 },
//   { title: '50+', dataIndex: 'qty_50_plus', key: 'qty_50_plus', align: 'center', render: formatPrice, width: 60 },
//   { title: '100+', dataIndex: 'qty_100_plus', key: 'qty_100_plus', align: 'center', render: formatPrice, width: 60 },
//   { title: 'GST', dataIndex: 'gst', key: 'gst', align: 'center', render: formatGST, width: 50 },
//   { title: 'MRP', dataIndex: 'mrp', key: 'mrp', align: 'center', render: formatPrice, width: 70 },
//   { title: 'Warranty', dataIndex: 'warranty', key: 'warranty', align: 'center', render: (w) => w || '-', width: 80 },
//   { title: 'Image', dataIndex: 'product_image', key: 'product_image', align: 'center', render: (imageUrl) => (imageUrl ? <Image src={imageUrl} alt="Product" style={{ maxWidth: '60px', maxHeight: '60px', objectFit: 'cover' }} /> : '-'), width: 80 },
// ];

// // ---------------------------------------------
// // CUSTOM HOOK: Group-Aware Paginator 
// // ---------------------------------------------
// const useGroupAwarePagination = (groupedData, currentPage, pageSizeHint) => {
//     const [pageBoundaries, setPageBoundaries] = useState([]);

//     useEffect(() => {
//         if (!groupedData || groupedData.length === 0) {
//             setPageBoundaries([]);
//             return;
//         }

//         const boundaries = [];
//         let startIndex = 0;
        
//         while (startIndex < groupedData.length) {
//             let pageEnd = startIndex;
//             const targetEndIndex = Math.min(startIndex + pageSizeHint, groupedData.length);

//             while (pageEnd < targetEndIndex) {
//                 if (groupedData[pageEnd].isGroupStart) {
//                     const groupSize = groupedData[pageEnd].rowSpan;
                    
//                     if (pageEnd + groupSize > targetEndIndex && pageEnd > startIndex) {
//                         break; 
//                     }
//                 }
//                 pageEnd++;
//             }
            
//             if (pageEnd < groupedData.length && !groupedData[pageEnd].isGroupStart) {
//                 while (pageEnd < groupedData.length && !groupedData[pageEnd].isGroupStart) {
//                     pageEnd++;
//                 }
//             }

//             if (pageEnd === startIndex) {
//                 pageEnd = targetEndIndex;
//             }

//             boundaries.push({ start: startIndex, end: pageEnd });
//             startIndex = pageEnd;
//         }

//         setPageBoundaries(boundaries);
//     }, [groupedData, pageSizeHint]);

//     const pageCount = pageBoundaries.length;
    
//     const pageIndex = currentPage - 1;
//     const currentBoundary = pageBoundaries[pageIndex];
    
//     const currentData = useMemo(() => {
//         if (!currentBoundary) return [];
//         return groupedData.slice(currentBoundary.start, currentBoundary.end);
//     }, [groupedData, currentBoundary]);

//     return { currentData, pageCount };
// };


// // ---------------------------------------------
// // Component
// // ---------------------------------------------

// export default function Home() {
//   const [allProducts, setAllProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [JsPDF, setJsPDF] = useState(null);
  
//   // STATE FOR SELECTION
//   const [selectedRowKeys, setSelectedRowKeys] = useState([]);
//   const [selectedRows, setSelectedRows] = useState([]); 

//   const visibleTableRef = useRef(null);
  
//   const [currentPage, setCurrentPage] = useState(1);
//   const PAGE_SIZE_HINT = 15; 


//   // Fetch products
//   const fetchProducts = useCallback(async () => {
//     setLoading(true);
//     const { data, error } = await supabase.from("products").select("*").order("sl_no", { ascending: true }).order("items", { ascending: true });
//     if (!error) setAllProducts(data.map(item => ({ ...item, key: item.id })));
//     setLoading(false);
//   }, []);

//   useEffect(() => { fetchProducts(); }, [fetchProducts]);

//   // Load jsPDF dynamically
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       import('jspdf').then(module => {
//         setJsPDF(() => module.jsPDF || module.default); 
//       });
//     }
//   }, []);

//   // Filtered products (clean list, no grouping props)
//   const allFilteredProducts = useMemo(() => 
//     allProducts.filter(product => !searchTerm || 
//         (product.items && product.items.toLowerCase().includes(searchTerm.toLowerCase())) || 
//         (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
//     )
//   , [allProducts, searchTerm]);
  
//   // Keys of all filtered products
//   const allFilteredKeys = useMemo(() => allFilteredProducts.map(item => item.key), [allFilteredProducts]);


//   // Filtered and grouped data (used for the visible Ant Design table)
//   const filteredAndGroupedData = useMemo(() => getGroupedData(allFilteredProducts), [allFilteredProducts]);

//   // USE THE CUSTOM HOOK for the displayed data
//   const { currentData: paginatedData, pageCount } = useGroupAwarePagination(
//       filteredAndGroupedData, 
//       currentPage, 
//       PAGE_SIZE_HINT
//   );
  
//   // Keys of all products currently visible on the table page
//   const visibleKeys = useMemo(() => paginatedData.map(item => item.key), [paginatedData]);

//   const handleSearch = (value) => {
//     setSearchTerm(value);
//     setCurrentPage(1); // Reset to page 1 on search
//   };

//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//   };
  
//   // --- GLOBAL SELECTION HANDLERS ---
  
//   const handleSelectAllFiltered = () => {
//     if (allFilteredKeys.length === 0) {
//       message.info("No items available in the filtered list to select.");
//       return;
//     }
    
//     // Explicitly set the keys to ALL filtered keys
//     setSelectedRowKeys(allFilteredKeys);
    
//     // Explicitly set the rows to ALL filtered products
//     setSelectedRows(allFilteredProducts);
    
//     message.success(`Selected all ${allFilteredKeys.length} items across all pages.`);
//   };

//   const handleClearSelection = () => {
//     setSelectedRowKeys([]);
//     setSelectedRows([]);
//     message.info("Selection cleared.");
//   };
  
//   // --- ROW SELECTION LOGIC (UPDATED FOR ROBUST PERSISTENCE) ---
//   // This logic ensures selections from previous pages are not lost when interacting with the current page.

//   const onSelectChange = (newSelectedRowKeys, newSelectedRows) => {
//     const previousSelectedKeys = new Set(selectedRowKeys);
//     const newKeysFromAntD = new Set(newSelectedRowKeys); // Keys returned by Ant Design for the change
    
//     let finalKeys = new Set(selectedRowKeys);
//     let changed = false;
    
//     // 1. Check all currently visible keys for additions/removals
//     visibleKeys.forEach(key => {
//         const wasSelected = previousSelectedKeys.has(key);
//         const isNowSelected = newKeysFromAntD.has(key);

//         if (isNowSelected && !wasSelected) {
//             // Key was added on the current page
//             finalKeys.add(key);
//             changed = true;
//         } else if (!isNowSelected && wasSelected) {
//             // Key was explicitly deselected on the current page
//             finalKeys.delete(key);
//             changed = true;
//         }
//     });

//     // 2. Fallback for unexpected full-page select/deselect behavior (e.g., header checkbox)
//     // If the local key comparison didn't detect changes, and AntD is returning a lot of keys, 
//     // we assume a full-page action might have occurred and reconcile the full set.
//     if (!changed && newSelectedRowKeys.length > 0) {
//         // Find keys in the new set that are NOT in the final set (keys added on this page that weren't tracked)
//         const keysToAdd = newSelectedRowKeys.filter(key => !finalKeys.has(key));
//         keysToAdd.forEach(key => finalKeys.add(key));
        
//         // Find keys in the previous set that are NOT in the new set (keys removed on this page that weren't tracked)
//         const keysToRemove = selectedRowKeys.filter(key => visibleKeys.includes(key) && !newKeysFromAntD.has(key));
//         keysToRemove.forEach(key => finalKeys.delete(key));
//     }


//     const finalSelectedKeysArray = Array.from(finalKeys);
    
//     // 3. Update Keys
//     setSelectedRowKeys(finalSelectedKeysArray);

//     // 4. Update Rows (Rebuild based on the robust key list)
//     const newKeysSet = new Set(finalSelectedKeysArray);
    
//     // Filter the full list of filtered products to get only the selected ones.
//     const updatedSelectedRows = allFilteredProducts.filter(product => newKeysSet.has(product.key));

//     setSelectedRows(updatedSelectedRows);
//   };

//   // Ant Design rowSelection object (NO onSelectAll here)
//   const rowSelection = {
//     selectedRowKeys,
//     onChange: onSelectChange,
//     columnWidth: 50,
//   };


//  // ---------------------------------------------
//  //  // --- PDF Generation ---
//  //  // ---------------------------------------------
//   const handleSaveAsPdf = async () => {
//     if (!JsPDF) { message.error("PDF library not ready."); return; }
//     if (selectedRows.length === 0) { message.error("No items selected to export. Use 'Select All Filtered' if needed."); return; }

//     setIsProcessing(true);
//     const key = 'pdf-process';
//     message.loading({ content: '1/3. Loading images for PDF...', key });

//     try {
//       // 1. Re-group the selected rows to apply the rowSpan logic for the PDF.
//       const groupedSelectedData = getGroupedData(selectedRows);
      
//       // 2. Pre-fetch images
//       const dataWithImages = await Promise.all(groupedSelectedData.map(async (row) => ({
//         ...row,
//         base64Image: row.product_image ? await urlToBase64(row.product_image) : ''
//       })));

//       message.loading({ content: '2/3. Initializing PDF libraries...', key });
      
//       // Dynamically import autoTable
//       const { default: autoTable } = await import('jspdf-autotable');

//       message.loading({ content: '3/3. Generating PDF...', key });

//       const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

//       const tableHead = [['SL No','Item','Brand','Single','5+','10+','20+','50+','100+','GST','MRP','Warranty','Image']];
      
//       // 3. Construct table body
//       const tableBody = dataWithImages.map(row => {
//           // Array for the non-merged columns (Brand through Image)
//           const nonMergedColumns = [
//               { content: row.brand || "-", rowSpan: 1 }, 
//               { content: formatPrice(row.single), rowSpan: 1 },
//               { content: formatPrice(row.qty_5_plus), rowSpan: 1 },
//               { content: formatPrice(row.qty_10_plus), rowSpan: 1 },
//               { content: formatPrice(row.qty_20_plus), rowSpan: 1 },
//               { content: formatPrice(row.qty_50_plus), rowSpan: 1 },
//               { content: formatPrice(row.qty_100_plus), rowSpan: 1 },
//               { content: formatGST(row.gst), rowSpan: 1 },
//               { content: formatPrice(row.mrp), rowSpan: 1 },
//               { content: row.warranty || "-", rowSpan: 1 },
//               // Image column: content is empty, data holds the base64 string
//               { content: row.product_image ? '' : '', data: row.base64Image, rowSpan: 1 } 
//           ];

//           if (row.rowSpan > 0) {
//               // FIRST ROW in group: Include the merged cells
//               return [
//                   { content: row.sl_no.toString(), rowSpan: row.rowSpan },
//                   { content: row.items || "-", rowSpan: row.rowSpan },
//                   ...nonMergedColumns
//               ];
//           } else {
//               // CONTINUATION ROW: Exclude the merged cells (Index 0 and 1)
//               return nonMergedColumns;
//           }
//       });

//       // 4. Call autoTable directly
//       autoTable(doc, {
//         head: tableHead,
//         body: tableBody,
//         startY: 20,
//         theme: 'grid',
        
//         // Global Styles
//         styles: { 
//             fontSize: 10, 
//             cellPadding: 2, 
//             valign: 'middle', 
//             halign: 'center', 
//             minCellHeight: 15 
//         },
//         headStyles: { 
//             fillColor: [240,240,240], 
//             textColor: 0, 
//             fontStyle: 'bold' 
//         },
//         showHead: 'everyPage',
//         rowPageBreak: 'avoid', 
        
//         willDrawCell: (data) => {
//           if (data.row.section === 'body' && (data.column.index === 0 || data.column.index === 1)) {
//               data.cell.styles.halign = 'center';
//               data.cell.styles.valign = 'middle';
//           }
//         },

//         // --- FIXED LOGIC FOR IMAGE DRAWING ---
//         didDrawCell: (data) => {
//             // The image column is always the 13th column in the final PDF table, which is index 12.
//             const imageColIndexInFinalTable = 12; 
            
//             const raw = data.cell.raw || {};
            
//             // Draw Base64 image data
//             if (data.column.index === imageColIndexInFinalTable && raw.data) {
//                 const base64Image = raw.data;
//                 if (base64Image) {
//                     const doc = data.doc;
//                     // Draw centered image
//                     const imgDim = Math.min(data.cell.width - 4, data.cell.height - 4);
//                     const xPos = data.cell.x + (data.cell.width / 2) - (imgDim / 2);
//                     const yPos = data.cell.y + (data.cell.height / 2) - (imgDim / 2);

//                     doc.addImage(base64Image, "JPEG", xPos, yPos, imgDim, imgDim);
//                 }
//             }
//         },
//         // ---------------------------
        
//         columnStyles: {
//             0: { cellWidth: 10, halign: 'center', valign: 'middle' }, 
//             1: { cellWidth: 35, halign: 'center', valign: 'middle' }, 
//             2: { cellWidth: 35, halign: 'center', valign: 'middle' }, 
//             3: { cellWidth: 18, halign: 'center', valign: 'middle' }, 
//             4: { cellWidth: 18, halign: 'center', valign: 'middle' }, 
//             5: { cellWidth: 18, halign: 'center', valign: 'middle' }, 
//             6: { cellWidth: 18, halign: 'center', valign: 'middle' }, 
//             7: { cellWidth: 18, halign: 'center', valign: 'middle' }, 
//             8: { cellWidth: 18, halign: 'center', valign: 'middle' }, 
//             9: { cellWidth: 18, halign: 'center', valign: 'middle' }, 
//             10: { cellWidth: 18, halign: 'center', valign: 'middle' }, 
//             11: { cellWidth: 20, halign: 'center', valign: 'middle' }, 
//             12: { cellWidth: 23, halign: 'center', valign: 'middle' } 
//         }
//       });

//       doc.save(`SelectedPriceList_${new Date().toISOString()}.pdf`);
//       message.success({ content: 'Selected items saved as PDF successfully!', key, duration: 2 });
//     } catch (error) {
//         console.error("PDF GENERATION CRASH DETAILS:", error);
//         message.error({ content: 'PDF generation failed. Check console.', key });
//     } finally { setIsProcessing(false); }
//   };

//   // ---------------------------------------------
//   // --- Share via Web / WhatsApp ---
//   // ---------------------------------------------
//   const handleShareResult = async () => {
//     if (selectedRows.length === 0) {
//       message.error("No items selected to share.");
//       return;
//     }
    
//     // 1. Create a simple text list of the selected items
//     const header = `*--- Selected Price List (${new Date().toLocaleDateString()}) ---*\n\n`;
    
//     // Sort selected rows
//     const sortedSelectedRows = [...selectedRows].sort((a, b) => {
//         if (a.sl_no !== b.sl_no) return a.sl_no - b.sl_no;
//         return (a.items || '').localeCompare(b.items || '') || (a.brand || '').localeCompare(b.brand || '');
//     });

//     const itemDetails = sortedSelectedRows.map((row, index) => {
//       const price = formatPrice(row.single);
//       const gst = formatGST(row.gst);
//       const mrp = formatPrice(row.mrp);
      
//       return `${index + 1}. *Item:* ${row.items} | *Brand:* ${row.brand || '-'}
//    *Price:* ${price} | *GST:* ${gst} | *MRP:* ${mrp} | *Warranty:* ${row.warranty || '-'}`;
//     }).join('\n\n');
    
//     const shareText = `${header}${itemDetails}`;

//     setIsProcessing(true);
//     message.loading({ content: 'Preparing message for share...', key: 'share' });

//     try {
//         if (navigator.share) {
//             await navigator.share({
//                 title: 'Selected Product Price List',
//                 text: shareText
//             });
//             message.success({ content: 'Result shared successfully!', key: 'share', duration: 2 });
//         } else {
//             // Fallback for non-Web Share API
//             const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
//             window.open(whatsappUrl, '_blank');
//             message.info({ content: 'Web Share not supported. WhatsApp link opened.', key: 'share', duration: 5 });
//         }
//     } catch (error) { 
//         console.error(error); 
//         message.error({ content: `Sharing failed: ${error.message}`, key: 'share' }); 
//     }
//     finally { setIsProcessing(false); }
//   };


//   const totalFixedWidth = columns.reduce((sum, col) => sum + (col.width || 0), 0);

//   // Calculate the actual row range being displayed for the showTotal prop
//   const totalFilteredRows = filteredAndGroupedData.length;
//   const currentPageDataSize = paginatedData.length;
//   const startRange = currentPageDataSize > 0 ? filteredAndGroupedData.indexOf(paginatedData[0]) + 1 : 0;
//   const endRange = startRange > 0 ? startRange + currentPageDataSize - 1 : 0;


//   // ---------------------------------------------
//   // --- Render ---
//   // ---------------------------------------------
//   return (
//     <div style={{ padding: 20 }}>
//       <h1>Product Price List</h1>
//       <Space style={{ marginBottom: 20, width: '100%', justifyContent: 'space-between' }}>
//         <Space size="middle">
//           <Link href="/add-product"><Button type="primary">+ Add New Product</Button></Link>
//           <Link href="/manage-products"><Button type="default">Manage Products</Button></Link>
//           <Link href="/manage-items"><Button type="dashed">Manage Item List</Button></Link>
          
//           {/* --- DEDICATED BUTTONS FOR GLOBAL SELECTION --- */}
//           <Button 
//             type="default" 
//             onClick={handleSelectAllFiltered} 
//             disabled={isProcessing || allFilteredKeys.length === 0 || selectedRows.length === allFilteredKeys.length}
//           >
//             Select All Filtered ({allFilteredKeys.length})
//           </Button>
//           <Button 
//             type="default" 
//             onClick={handleClearSelection} 
//             disabled={isProcessing || selectedRows.length === 0}
//           >
//             Clear Selection
//           </Button>
//           {/* --- END DEDICATED BUTTONS --- */}

//           <Button 
//             type="ghost" 
//             style={{ backgroundColor: 'green', color: 'white', borderColor: 'green' }} 
//             onClick={handleShareResult} 
//             loading={isProcessing} 
//             disabled={selectedRows.length === 0}
//           >
//             Share Selected ({selectedRows.length})
//           </Button>
//           <Button 
//             type="primary" 
//             danger 
//             onClick={handleSaveAsPdf} 
//             loading={isProcessing} 
//             disabled={selectedRows.length === 0 || !JsPDF}
//           >
//             PDF Selected ({selectedRows.length})
//           </Button>
//         </Space>
//         <Input.Search placeholder="Search by Item or Brand" allowClear onSearch={handleSearch} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: 300 }} />
//       </Space>

//       <div ref={visibleTableRef}>
//         <Table 
//             columns={columns} 
//             dataSource={paginatedData} 
//             loading={loading} 
//             rowKey="id" 
//             pagination={false} 
//             scroll={{ x: totalFixedWidth }} 
//             rowSelection={rowSelection} // Handles individual/visible selection with cross-page persistence
//         />
//       </div>
      
//       {/* Custom Pagination UI */}
//       {totalFilteredRows > 0 && (
//           <Pagination
//             current={currentPage}
//             total={pageCount} 
//             pageSize={1} 
//             onChange={handlePageChange}
//             showTotal={() => `${startRange}-${endRange} of ${totalFilteredRows} items (Group Aware)`}
//             style={{ marginTop: 20, textAlign: 'right' }}
//           />
//       )}

//     </div>
//   );
// }










// import { useEffect, useState, useCallback, useMemo, useRef } from "react";
// // Ensure this path is correct for your Supabase client setup
// import { supabase } from "../lib/supabaseClient"; 
// import { Table, Image, Button, Space, Input, message, Pagination } from "antd";
// import Link from "next/link";
// import styles from './pricelist.module.css'; // Import the new CSS module

// // ---------------------------------------------
// // HELPER FUNCTIONS 
// // ---------------------------------------------

// /**
//  * Fetches a remote URL and converts the image data to a Base64 string.
//  */
// const urlToBase64 = async (url) => {
//   if (!url) return '';
//   try {
//     // Note: Using fetch() requires the server to send CORS headers, which is crucial for
//     // both PDF generation (to load images) and html2canvas (to render images).
//     const response = await fetch(url);
//     const blob = await response.blob();
//     return new Promise((resolve) => {
//       const reader = new FileReader();
//       reader.onloadend = () => resolve(reader.result);
//       reader.readAsDataURL(blob);
//     });
//   } catch (e) {
//     console.error("Failed to convert image to Base64:", url, e);
//     return ''; // Return empty string on failure
//   }
// };

// /**
//  * Groups and sorts data, setting rowSpan for SL No and Item, while preserving all Brand data.
//  */
// const getGroupedData = (data) => {
//   let count = 0;
//   const groupedData = [];
    
//   // Sort by SL No, Item, then Brand for consistent grouping
//   const sortedData = [...data].sort((a, b) => {
//     if (a.sl_no !== b.sl_no) return a.sl_no - b.sl_no;
//     const aItems = a.items || '';
//     const bItems = b.items || '';
//     return aItems.localeCompare(bItems) || (a.brand || '').localeCompare(b.brand || '');
//   });

//   for (let i = 0; i < sortedData.length; i++) {
//     const currentItem = sortedData[i];
    
//     // Check if this item is the start of a new SL No/Item group
//     if (i === 0 || currentItem.sl_no !== sortedData[i - 1].sl_no || currentItem.items !== sortedData[i - 1].items) {
//       count = 1;
//       for (let j = i + 1; j < sortedData.length; j++) {
//         if (sortedData[j].sl_no === currentItem.sl_no && sortedData[j].items === currentItem.items) count++;
//         else break;
//       }
//       groupedData.push({ ...currentItem, rowSpan: count, isGroupStart: true }); 
//     } else {
//       groupedData.push({ ...currentItem, rowSpan: 0, isGroupStart: false }); 
//     }
//   }
//   return groupedData;
// };

// const formatPrice = (price) => {
//     const cleanPrice = String(price).replace(/[^\d.]/g, ''); 
//     const numericPrice = parseFloat(cleanPrice);

//     if (isNaN(numericPrice) || numericPrice <= 0) {
//       return '-';
//     }
//     return `${numericPrice}`; 
// };

// const formatGST = (gst) => (gst > 0 ? `${gst}%` : '-');

// // ---------------------------------------------
// // Ant Design Table Columns (for UI)
// // ---------------------------------------------

// const columns = [
//   { title: 'SL No', dataIndex: 'sl_no', key: 'sl_no', align: 'center', onCell: (record) => ({ rowSpan: record.rowSpan }), width: 50, fixed: 'left' },
//   { title: 'Item', dataIndex: 'items', key: 'items', align: 'center', onCell: (record) => ({ rowSpan: record.rowSpan }), render: (text, record) => record.rowSpan > 0 ? text : null, width: 120, fixed: 'left' },
//   { title: 'Brand', dataIndex: 'brand', key: 'brand', align: 'center', width: 80, fixed: 'left', render: (text) => text || '-' },
//   { title: 'Single', dataIndex: 'single', key: 'single', align: 'center', render: formatPrice, width: 70 },
//   { title: '5+', dataIndex: 'qty_5_plus', key: 'qty_5_plus', align: 'center', render: formatPrice, width: 60 },
//   { title: '10+', dataIndex: 'qty_10_plus', key: 'qty_10_plus', align: 'center', render: formatPrice, width: 60 },
//   { title: '20+', dataIndex: 'qty_20_plus', key: 'qty_20_plus', align: 'center', render: formatPrice, width: 60 },
//   { title: '50+', dataIndex: 'qty_50_plus', key: 'qty_50_plus', align: 'center', render: formatPrice, width: 60 },
//   { title: '100+', dataIndex: 'qty_100_plus', key: 'qty_100_plus', align: 'center', render: formatPrice, width: 60 },
//   { title: 'GST', dataIndex: 'gst', key: 'gst', align: 'center', render: formatGST, width: 50 },
//   { title: 'MRP', dataIndex: 'mrp', key: 'mrp', align: 'center', render: formatPrice, width: 70 },
//   { title: 'Warranty', dataIndex: 'warranty', key: 'warranty', align: 'center', render: (w) => w || '-', width: 80 },
//   { title: 'Image', dataIndex: 'product_image', key: 'product_image', align: 'center', render: (imageUrl) => (imageUrl ? <Image src={imageUrl} alt="Product" style={{ maxWidth: '60px', maxHeight: '60px', objectFit: 'cover' }} /> : '-'), width: 80 },
// ];

// // ---------------------------------------------
// // CUSTOM HOOK: Group-Aware Paginator (No change)
// // ---------------------------------------------
// const useGroupAwarePagination = (groupedData, currentPage, pageSizeHint) => {
//     const [pageBoundaries, setPageBoundaries] = useState([]);

//     useEffect(() => {
//         if (!groupedData || groupedData.length === 0) {
//             setPageBoundaries([]);
//             return;
//         }

//         const boundaries = [];
//         let startIndex = 0;
        
//         while (startIndex < groupedData.length) {
//             let pageEnd = startIndex;
//             const targetEndIndex = Math.min(startIndex + pageSizeHint, groupedData.length);

//             while (pageEnd < targetEndIndex) {
//                 if (groupedData[pageEnd].isGroupStart) {
//                     const groupSize = groupedData[pageEnd].rowSpan;
                    
//                     if (pageEnd + groupSize > targetEndIndex && pageEnd > startIndex) {
//                         break; 
//                     }
//                 }
//                 pageEnd++;
//             }
            
//             if (pageEnd < groupedData.length && !groupedData[pageEnd].isGroupStart) {
//                 while (pageEnd < groupedData.length && !groupedData[pageEnd].isGroupStart) {
//                     pageEnd++;
//                 }
//             }

//             if (pageEnd === startIndex) {
//                 pageEnd = targetEndIndex;
//             }

//             boundaries.push({ start: startIndex, end: pageEnd });
//             startIndex = pageEnd;
//         }

//         setPageBoundaries(boundaries);
//     }, [groupedData, pageSizeHint]);

//     const pageCount = pageBoundaries.length;
    
//     const pageIndex = currentPage - 1;
//     const currentBoundary = pageBoundaries[pageIndex];
    
//     const currentData = useMemo(() => {
//         if (!currentBoundary) return [];
//         return groupedData.slice(currentBoundary.start, currentBoundary.end);
//     }, [groupedData, currentBoundary]);

//     return { currentData, pageCount };
// };


// // ---------------------------------------------
// // Component
// // ---------------------------------------------

// export default function Home() {
//   const [allProducts, setAllProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [JsPDF, setJsPDF] = useState(null);
//   const [html2canvas, setHtml2Canvas] = useState(null); // NEW: State for html2canvas
  
//   // STATE FOR SELECTION
//   const [selectedRowKeys, setSelectedRowKeys] = useState([]);
//   const [selectedRows, setSelectedRows] = useState([]); 

//   const visibleTableRef = useRef(null);
//   const imagePreviewRef = useRef(null); // NEW: Ref for the hidden element to be converted
  
//   const [currentPage, setCurrentPage] = useState(1);
//   const PAGE_SIZE_HINT = 15; 


//   // Fetch products
//   const fetchProducts = useCallback(async () => {
//     setLoading(true);
//     const { data, error } = await supabase.from("products").select("*").order("sl_no", { ascending: true }).order("items", { ascending: true });
//     if (!error) setAllProducts(data.map(item => ({ ...item, key: item.id })));
//     setLoading(false);
//   }, []);

//   useEffect(() => { fetchProducts(); }, [fetchProducts]);

//   // Load libraries dynamically
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       import('jspdf').then(module => {
//         setJsPDF(() => module.jsPDF || module.default); 
//       });
//       import('html2canvas').then(module => { // NEW: Import html2canvas
//         setHtml2Canvas(() => module.default || module);
//       });
//     }
//   }, []);

//   // Filtered products (clean list, no grouping props)
//   const allFilteredProducts = useMemo(() => 
//     allProducts.filter(product => !searchTerm || 
//         (product.items && product.items.toLowerCase().includes(searchTerm.toLowerCase())) || 
//         (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
//     )
//   , [allProducts, searchTerm]);
  
//   // Keys of all filtered products
//   const allFilteredKeys = useMemo(() => allFilteredProducts.map(item => item.key), [allFilteredProducts]);


//   // Filtered and grouped data (used for the visible Ant Design table)
//   const filteredAndGroupedData = useMemo(() => getGroupedData(allFilteredProducts), [allFilteredProducts]);

//   // USE THE CUSTOM HOOK for the displayed data
//   const { currentData: paginatedData, pageCount } = useGroupAwarePagination(
//       filteredAndGroupedData, 
//       currentPage, 
//       PAGE_SIZE_HINT
//   );
  
//   // Keys of all products currently visible on the table page
//   const visibleKeys = useMemo(() => paginatedData.map(item => item.key), [paginatedData]);

//   const handleSearch = (value) => {
//     setSearchTerm(value);
//     setCurrentPage(1); // Reset to page 1 on search
//   };

//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//   };
  
//   // --- GLOBAL SELECTION HANDLERS ---
  
//   const handleSelectAllFiltered = () => {
//     if (allFilteredKeys.length === 0) {
//       message.info("No items available in the filtered list to select.");
//       return;
//     }
    
//     setSelectedRowKeys(allFilteredKeys);
//     setSelectedRows(allFilteredProducts);
    
//     message.success(`Selected all ${allFilteredKeys.length} items across all pages.`);
//   };

//   const handleClearSelection = () => {
//     setSelectedRowKeys([]);
//     setSelectedRows([]);
//     message.info("Selection cleared.");
//   };
  
//   // --- ROW SELECTION LOGIC (ROBUST CROSS-PAGE PERSISTENCE) ---

//   const onSelectChange = (newSelectedRowKeys, newSelectedRows) => {
//     const previousSelectedKeys = new Set(selectedRowKeys);
//     const newKeysFromAntD = new Set(newSelectedRowKeys); 
    
//     let finalKeys = new Set(selectedRowKeys);
//     let changed = false;
    
//     // 1. Check all currently visible keys for additions/removals
//     visibleKeys.forEach(key => {
//         const wasSelected = previousSelectedKeys.has(key);
//         const isNowSelected = newKeysFromAntD.has(key);

//         if (isNowSelected && !wasSelected) {
//             finalKeys.add(key);
//             changed = true;
//         } else if (!isNowSelected && wasSelected) {
//             finalKeys.delete(key);
//             changed = true;
//         }
//     });

//     // 2. Fallback for unexpected full-page select/deselect behavior
//     if (!changed && newSelectedRowKeys.length > 0) {
//         const keysToAdd = newSelectedRowKeys.filter(key => !finalKeys.has(key));
//         keysToAdd.forEach(key => finalKeys.add(key));
        
//         const keysToRemove = selectedRowKeys.filter(key => visibleKeys.includes(key) && !newKeysFromAntD.has(key));
//         keysToRemove.forEach(key => finalKeys.delete(key));
//     }

//     const finalSelectedKeysArray = Array.from(finalKeys);
    
//     // 3. Update Keys
//     setSelectedRowKeys(finalSelectedKeysArray);

//     // 4. Update Rows (Rebuild based on the robust key list)
//     const newKeysSet = new Set(finalSelectedKeysArray);
//     const updatedSelectedRows = allFilteredProducts.filter(product => newKeysSet.has(product.key));

//     setSelectedRows(updatedSelectedRows);
//   };

//   // Ant Design rowSelection object
//   const rowSelection = {
//     selectedRowKeys,
//     onChange: onSelectChange,
//     columnWidth: 50,
//   };


//  // ---------------------------------------------
//  //  // --- PDF Generation (No change) ---
//  //  // ---------------------------------------------
//   const handleSaveAsPdf = async () => {
//     if (!JsPDF) { message.error("PDF library not ready."); return; }
//     if (selectedRows.length === 0) { message.error("No items selected to export. Use 'Select All Filtered' if needed."); return; }

//     setIsProcessing(true);
//     const key = 'pdf-process';
//     message.loading({ content: '1/3. Loading images for PDF...', key });

//     try {
//       const groupedSelectedData = getGroupedData(selectedRows);
      
//       const dataWithImages = await Promise.all(groupedSelectedData.map(async (row) => ({
//         ...row,
//         base64Image: row.product_image ? await urlToBase64(row.product_image) : ''
//       })));

//       message.loading({ content: '2/3. Initializing PDF libraries...', key });
//       const { default: autoTable } = await import('jspdf-autotable');

//       message.loading({ content: '3/3. Generating PDF...', key });

//       const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

//       const tableHead = [['SL No','Item','Brand','Single','5+','10+','20+','50+','100+','GST','MRP','Warranty','Image']];
      
//       const tableBody = dataWithImages.map(row => {
//           const nonMergedColumns = [
//               { content: row.brand || "-", rowSpan: 1 }, 
//               { content: formatPrice(row.single), rowSpan: 1 },
//               { content: formatPrice(row.qty_5_plus), rowSpan: 1 },
//               { content: formatPrice(row.qty_10_plus), rowSpan: 1 },
//               { content: formatPrice(row.qty_20_plus), rowSpan: 1 },
//               { content: formatPrice(row.qty_50_plus), rowSpan: 1 },
//               { content: formatPrice(row.qty_100_plus), rowSpan: 1 },
//               { content: formatGST(row.gst), rowSpan: 1 },
//               { content: formatPrice(row.mrp), rowSpan: 1 },
//               { content: row.warranty || "-", rowSpan: 1 },
//               { content: row.product_image ? '' : '', data: row.base64Image, rowSpan: 1 } 
//           ];

//           if (row.rowSpan > 0) {
//               return [
//                   { content: row.sl_no.toString(), rowSpan: row.rowSpan },
//                   { content: row.items || "-", rowSpan: row.rowSpan },
//                   ...nonMergedColumns
//               ];
//           } else {
//               return nonMergedColumns;
//           }
//       });

//       autoTable(doc, {
//         head: tableHead,
//         body: tableBody,
//         startY: 20,
//         theme: 'grid',
//         styles: { fontSize: 10, cellPadding: 2, valign: 'middle', halign: 'center', minCellHeight: 15 },
//         headStyles: { fillColor: [240,240,240], textColor: 0, fontStyle: 'bold' },
//         showHead: 'everyPage',
//         rowPageBreak: 'avoid', 
        
//         willDrawCell: (data) => {
//           if (data.row.section === 'body' && (data.column.index === 0 || data.column.index === 1)) {
//               data.cell.styles.halign = 'center';
//               data.cell.styles.valign = 'middle';
//           }
//         },
//         didDrawCell: (data) => {
//             const imageColIndexInFinalTable = 12; 
//             const raw = data.cell.raw || {};
            
//             if (data.column.index === imageColIndexInFinalTable && raw.data) {
//                 const base64Image = raw.data;
//                 if (base64Image) {
//                     const doc = data.doc;
//                     const imgDim = Math.min(data.cell.width - 4, data.cell.height - 4);
//                     const xPos = data.cell.x + (data.cell.width / 2) - (imgDim / 2);
//                     const yPos = data.cell.y + (data.cell.height / 2) - (imgDim / 2);

//                     doc.addImage(base64Image, "JPEG", xPos, yPos, imgDim, imgDim);
//                 }
//             }
//         },
//         columnStyles: {
//             0: { cellWidth: 10, halign: 'center', valign: 'middle' }, 1: { cellWidth: 35, halign: 'center', valign: 'middle' }, 
//             2: { cellWidth: 35, halign: 'center', valign: 'middle' }, 3: { cellWidth: 18, halign: 'center', valign: 'middle' }, 
//             4: { cellWidth: 18, halign: 'center', valign: 'middle' }, 5: { cellWidth: 18, halign: 'center', valign: 'middle' }, 
//             6: { cellWidth: 18, halign: 'center', valign: 'middle' }, 7: { cellWidth: 18, halign: 'center', valign: 'middle' }, 
//             8: { cellWidth: 18, halign: 'center', valign: 'middle' }, 9: { cellWidth: 18, halign: 'center', valign: 'middle' }, 
//             10: { cellWidth: 18, halign: 'center', valign: 'middle' }, 11: { cellWidth: 20, halign: 'center', valign: 'middle' }, 
//             12: { cellWidth: 23, halign: 'center', valign: 'middle' } 
//         }
//       });

//       doc.save(`SelectedPriceList_${new Date().toISOString()}.pdf`);
//       message.success({ content: 'Selected items saved as PDF successfully!', key, duration: 2 });
//     } catch (error) {
//         console.error("PDF GENERATION CRASH DETAILS:", error);
//         message.error({ content: 'PDF generation failed. Check console.', key });
//     } finally { setIsProcessing(false); }
//   };

//   // ---------------------------------------------
//   // --- NEW: Share as Image (JPEG) ---
//   // ---------------------------------------------
//   const handleShareImage = async () => {
//     if (selectedRows.length === 0) {
//       message.error("No items selected to share.");
//       return;
//     }
//     if (!html2canvas) {
//         message.error("Image generation library not ready.");
//         return;
//     }

//     setIsProcessing(true);
//     const key = 'share-image-process';
//     message.loading({ content: '1/3. Preparing data for image...', key });
    
//     try {
//         const element = imagePreviewRef.current;
//         if (!element) {
//             message.error({ content: 'Failed to find rendering element.', key });
//             return;
//         }

//         // 2. Generate Canvas from HTML
//         message.loading({ content: '2/3. Converting to image...', key });
//         // NOTE: The hidden HTML element uses the CSS module for styling
//         const canvas = await html2canvas(element, {
//             scale: 2, 
//             useCORS: true, 
//             allowTaint: true,
//             backgroundColor: '#ffffff',
//             removeContainer: true // Important: Cleans up the temporary container used by html2canvas
//         });

//         // 3. Convert Canvas to Blob (JPEG format)
//         message.loading({ content: '3/3. Preparing file for sharing...', key });
//         const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9)); 
        
//         if (!blob) throw new Error("Failed to create image blob.");

//         const file = new File([blob], "PriceList.jpeg", { type: "image/jpeg" });
        
//         // 4. Use Web Share API to share the image file
//         if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
//             await navigator.share({
//                 files: [file],
//                 title: 'Selected Product Price List',
//                 text: `Price list image for ${new Date().toLocaleDateString()}`
//             });
//             message.success({ content: 'Image shared successfully!', key, duration: 2 });
//         } else {
//             // Fallback: Download the image file
//             const url = URL.createObjectURL(file);
//             const a = document.createElement('a');
//             a.href = url;
//             a.download = 'PriceList.jpeg';
//             document.body.appendChild(a);
//             a.click();
//             document.body.removeChild(a);
//             URL.revokeObjectURL(url);
//             message.info({ content: 'Sharing not supported. Image downloaded.', key, duration: 5 });
//         }

//     } catch (error) {
//         console.error("IMAGE SHARE CRASH DETAILS:", error);
//         message.error({ content: `Image sharing failed: ${error.message}`, key });
//     } finally { 
//         setIsProcessing(false); 
//     }
//   };

//   const totalFixedWidth = columns.reduce((sum, col) => sum + (col.width || 0), 0);

//   // Calculate the actual row range being displayed for the showTotal prop
//   const totalFilteredRows = filteredAndGroupedData.length;
//   const currentPageDataSize = paginatedData.length;
//   const startRange = currentPageDataSize > 0 ? filteredAndGroupedData.indexOf(paginatedData[0]) + 1 : 0;
//   const endRange = startRange > 0 ? startRange + currentPageDataSize - 1 : 0;


//   // ---------------------------------------------
//   // --- Render ---
//   // ---------------------------------------------
//   return (
//     <div style={{ padding: 20 }}>
//       <h1>Product Price List</h1>
//       <Space style={{ marginBottom: 20, width: '100%', justifyContent: 'space-between' }}>
//         <Space size="middle">
//           <Link href="/add-product"><Button type="primary">+ Add New Product</Button></Link>
//           <Link href="/manage-products"><Button type="default">Manage Products</Button></Link>
//           <Link href="/manage-items"><Button type="dashed">Manage Item List</Button></Link>
          
//           <Button 
//             type="default" 
//             onClick={handleSelectAllFiltered} 
//             disabled={isProcessing || allFilteredKeys.length === 0 || selectedRows.length === allFilteredKeys.length}
//           >
//             Select All Filtered ({allFilteredKeys.length})
//           </Button>
//           <Button 
//             type="default" 
//             onClick={handleClearSelection} 
//             disabled={isProcessing || selectedRows.length === 0}
//           >
//             Clear Selection
//           </Button>
          
//           {/* --- UPDATED: Share as Image --- */}
//           <Button 
//             type="ghost" 
//             style={{ backgroundColor: 'green', color: 'white', borderColor: 'green' }} 
//             onClick={handleShareImage} 
//             loading={isProcessing} 
//             disabled={selectedRows.length === 0 || !html2canvas}
//           >
//             Share Selected Image ({selectedRows.length})
//           </Button>
//           {/* --- END UPDATED --- */}

//           <Button 
//             type="primary" 
//             danger 
//             onClick={handleSaveAsPdf} 
//             loading={isProcessing} 
//             disabled={selectedRows.length === 0 || !JsPDF}
//           >
//             PDF Selected ({selectedRows.length})
//           </Button>
//         </Space>
//         <Input.Search placeholder="Search by Item or Brand" allowClear onSearch={handleSearch} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: 300 }} />
//       </Space>

//       {/* --- HIDDEN HTML TABLE FOR IMAGE GENERATION (MUST BE IN RENDER) --- */}
      

// <div ref={imagePreviewRef} style={{ position: 'absolute', top: '-9999px', left: '-9999px', padding: '10px', backgroundColor: 'white', width: '1200px' }}> {/* Increased width for more columns */}
//     <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#333' }}>Selected Price List</h2>
//     <table className={styles.imageTable}>
//         <thead>
//             <tr>
//                 {/* 13 COLUMNS IN TOTAL (INCLUDING MERGED) */}
//                 <th>SL No</th>
//                 <th>Item</th>
//                 <th>Brand</th>
//                 <th>Single</th>
//                 <th>5+</th>
//                 <th>10+</th>
//                 <th>20+</th>
//                 <th>50+</th>
//                 <th>100+</th>
//                 <th>GST</th>
//                 <th>MRP</th> {/* Re-added MRP here */}
//                 <th>Warranty</th>
//                 <th>Image</th>
//             </tr>
//         </thead>
//         <tbody>
//             {getGroupedData(selectedRows.sort((a, b) => a.sl_no - b.sl_no)).map((row, index) => (
//                 <tr key={row.key || index}>
//                     {/* SL NO (MERGED) */}
//                     <td rowSpan={row.rowSpan > 0 ? row.rowSpan : 1} style={{display: row.rowSpan === 0 ? 'none' : 'table-cell' }}>{row.sl_no}</td>
                    
//                     {/* ITEM (MERGED) */}
//                     <td rowSpan={row.rowSpan > 0 ? row.rowSpan : 1} style={{display: row.rowSpan === 0 ? 'none' : 'table-cell' }}>{row.items}</td>
                    
//                     {/* ALL OTHER COLUMNS (NOT MERGED) */}
//                     <td>{row.brand || '-'}</td>
//                     <td>{formatPrice(row.single)}</td>
//                     <td>{formatPrice(row.qty_5_plus)}</td>
//                     <td>{formatPrice(row.qty_10_plus)}</td>
//                     <td>{formatPrice(row.qty_20_plus)}</td>
//                     <td>{formatPrice(row.qty_50_plus)}</td>
//                     <td>{formatPrice(row.qty_100_plus)}</td>
//                     <td>{formatGST(row.gst)}</td>
//                     <td>{formatPrice(row.mrp)}</td> {/* Re-added MRP data */}
//                     <td>{row.warranty || '-'}</td>
//                     <td>
//                         {row.product_image && (
//                             <img 
//                                 src={row.product_image} 
//                                 alt="Product" 
//                                 style={{ width: '50px', height: '50px', objectFit: 'contain' }} 
//                                 crossOrigin="anonymous" 
//                             />
//                         )}
//                     </td>
//                 </tr>
//             ))}
//         </tbody>
//     </table>
// </div>
//       {/* --- END HIDDEN HTML TABLE --- */}


//       <div ref={visibleTableRef}>
//         <Table 
//             columns={columns} 
//             dataSource={paginatedData} 
//             loading={loading} 
//             rowKey="id" 
//             pagination={false} 
//             scroll={{ x: totalFixedWidth }} 
//             rowSelection={rowSelection} 
//         />
//       </div>
      
//       {/* Custom Pagination UI */}
//       {totalFilteredRows > 0 && (
//           <Pagination
//             current={currentPage}
//             total={pageCount} 
//             pageSize={1} 
//             onChange={handlePageChange}
//             showTotal={() => `${startRange}-${endRange} of ${totalFilteredRows} items (Group Aware)`}
//             style={{ marginTop: 20, textAlign: 'right' }}
//           />
//       )}

//     </div>
//   );
// }

















// import { useEffect, useState, useCallback, useMemo, useRef } from "react";
// // Ensure this path is correct for your Supabase client setup
// import { supabase } from "../lib/supabaseClient"; 
// import { Table, Image, Button, Space, Input, message, Pagination } from "antd";
// import Link from "next/link";
// import styles from './pricelist.module.css'; // Import the required CSS module

// // ===============================================
// // GLOBAL CONFIGURATION
// // ===============================================
// const PAGE_SIZE_HINT = 15;
// const IMAGE_PAGE_SIZE = 15;

// // ===============================================
// // HELPER FUNCTIONS 
// // ===============================================

// /**
//  * Fetches a remote URL and converts the image data to a Base64 string.
//  */
// const urlToBase64 = async (url) => {
//   if (!url) return '';
//   try {
//     const response = await fetch(url);
//     const blob = await response.blob();
//     return new Promise((resolve) => {
//       const reader = new FileReader();
//       reader.onloadend = () => resolve(reader.result);
//       reader.readAsDataURL(blob);
//     });
//   } catch (e) {
//     console.error("Failed to convert image to Base64:", url, e);
//     return ''; 
//   }
// };

// /**
//  * Groups and sorts data, setting rowSpan for SL No and Item.
//  */
// const getGroupedData = (data) => {
//   let count = 0;
//   const groupedData = [];
    
//   // Sort by SL No, Item, then Brand for consistent grouping
//   const sortedData = [...data].sort((a, b) => {
//     if (a.sl_no !== b.sl_no) return a.sl_no - b.sl_no;
//     const aItems = a.items || '';
//     const bItems = b.items || '';
//     return aItems.localeCompare(bItems) || (a.brand || '').localeCompare(b.brand || '');
//   });

//   for (let i = 0; i < sortedData.length; i++) {
//     const currentItem = sortedData[i];
    
//     // Check if this item is the start of a new SL No/Item group
//     if (i === 0 || currentItem.sl_no !== sortedData[i - 1].sl_no || currentItem.items !== sortedData[i - 1].items) {
//       count = 1;
//       for (let j = i + 1; j < sortedData.length; j++) {
//         if (sortedData[j].sl_no === currentItem.sl_no && sortedData[j].items === currentItem.items) count++;
//         else break;
//       }
//       groupedData.push({ ...currentItem, rowSpan: count, isGroupStart: true }); 
//     } else {
//       groupedData.push({ ...currentItem, rowSpan: 0, isGroupStart: false }); 
//     }
//   }
//   return groupedData;
// };

// const formatPrice = (price) => {
//     const cleanPrice = String(price).replace(/[^\d.]/g, ''); 
//     const numericPrice = parseFloat(cleanPrice);

//     if (isNaN(numericPrice) || numericPrice <= 0) {
//       return '-';
//     }
//     return `${numericPrice}`; 
// };

// const formatGST = (gst) => (gst > 0 ? `${gst}%` : '-');

// // ===============================================
// // Ant Design Table Columns (for UI)
// // ===============================================

// const columns = [
//   { title: 'SL No', dataIndex: 'sl_no', key: 'sl_no', align: 'center', onCell: (record) => ({ rowSpan: record.rowSpan }), width: 50, fixed: 'left' },
//   { title: 'Item', dataIndex: 'items', key: 'items', align: 'center', onCell: (record) => ({ rowSpan: record.rowSpan }), render: (text, record) => record.rowSpan > 0 ? text : null, width: 120, fixed: 'left' },
//   { title: 'Brand', dataIndex: 'brand', key: 'brand', align: 'center', width: 80, fixed: 'left', render: (text) => text || '-' },
//   { title: 'Single', dataIndex: 'single', key: 'single', align: 'center', render: formatPrice, width: 70 },
//   { title: '5+', dataIndex: 'qty_5_plus', key: 'qty_5_plus', align: 'center', render: formatPrice, width: 60 },
//   { title: '10+', dataIndex: 'qty_10_plus', key: 'qty_10_plus', align: 'center', render: formatPrice, width: 60 },
//   { title: '20+', dataIndex: 'qty_20_plus', key: 'qty_20_plus', align: 'center', render: formatPrice, width: 60 },
//   { title: '50+', dataIndex: 'qty_50_plus', key: 'qty_50_plus', align: 'center', render: formatPrice, width: 60 },
//   { title: '100+', dataIndex: 'qty_100_plus', key: 'qty_100_plus', align: 'center', render: formatPrice, width: 60 },
//   { title: 'GST', dataIndex: 'gst', key: 'gst', align: 'center', render: formatGST, width: 50 },
//   { title: 'MRP', dataIndex: 'mrp', key: 'mrp', align: 'center', render: formatPrice, width: 70 },
//   { title: 'Warranty', dataIndex: 'warranty', key: 'warranty', align: 'center', render: (w) => w || '-', width: 80 },
//   { title: 'Image', dataIndex: 'product_image', key: 'product_image', align: 'center', render: (imageUrl) => (imageUrl ? <Image src={imageUrl} alt="Product" style={{ maxWidth: '60px', maxHeight: '60px', objectFit: 'cover' }} /> : '-'), width: 80 },
// ];

// // ===============================================
// // CUSTOM HOOK: Group-Aware Paginator
// // ===============================================
// const useGroupAwarePagination = (groupedData, currentPage, pageSizeHint) => {
//     const [pageBoundaries, setPageBoundaries] = useState([]);

//     useEffect(() => {
//         if (!groupedData || groupedData.length === 0) {
//             setPageBoundaries([]);
//             return;
//         }

//         const boundaries = [];
//         let startIndex = 0;
        
//         while (startIndex < groupedData.length) {
//             let pageEnd = startIndex;
//             const targetEndIndex = Math.min(startIndex + pageSizeHint, groupedData.length);

//             while (pageEnd < targetEndIndex) {
//                 if (groupedData[pageEnd].isGroupStart) {
//                     const groupSize = groupedData[pageEnd].rowSpan;
                    
//                     if (pageEnd + groupSize > targetEndIndex && pageEnd > startIndex) {
//                         break; 
//                     }
//                 }
//                 pageEnd++;
//             }
            
//             if (pageEnd < groupedData.length && !groupedData[pageEnd].isGroupStart) {
//                 while (pageEnd < groupedData.length && !groupedData[pageEnd].isGroupStart) {
//                     pageEnd++;
//                 }
//             }

//             if (pageEnd === startIndex) {
//                 pageEnd = targetEndIndex;
//             }

//             boundaries.push({ start: startIndex, end: pageEnd });
//             startIndex = pageEnd;
//         }

//         setPageBoundaries(boundaries);
//     }, [groupedData, pageSizeHint]);

//     const pageCount = pageBoundaries.length;
    
//     const pageIndex = currentPage - 1;
//     const currentBoundary = pageBoundaries[pageIndex];
    
//     const currentData = useMemo(() => {
//         if (!currentBoundary) return [];
//         return groupedData.slice(currentBoundary.start, currentBoundary.end);
//     }, [groupedData, currentBoundary]);

//     return { currentData, pageCount };
// };


// // ===============================================
// // Component
// // ===============================================

// export default function Home() {
//   const [allProducts, setAllProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [JsPDF, setJsPDF] = useState(null);
//   const [html2canvas, setHtml2Canvas] = useState(null); 
  
//   // STATE FOR SELECTION
//   const [selectedRowKeys, setSelectedRowKeys] = useState([]);
//   const [selectedRows, setSelectedRows] = useState([]); 

//   const visibleTableRef = useRef(null);
//   const imagePreviewRef = useRef(null); 
  
//   const [currentPage, setCurrentPage] = useState(1);


//   // Fetch products
//   const fetchProducts = useCallback(async () => {
//     setLoading(true);
//     const { data, error } = await supabase.from("products").select("*").order("sl_no", { ascending: true }).order("items", { ascending: true });
//     if (!error) setAllProducts(data.map(item => ({ ...item, key: item.id })));
//     setLoading(false);
//   }, []);

//   useEffect(() => { fetchProducts(); }, [fetchProducts]);

//   // Load libraries dynamically
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       import('jspdf').then(module => {
//         setJsPDF(() => module.jsPDF || module.default); 
//       });
//       import('html2canvas').then(module => { 
//         setHtml2Canvas(() => module.default || module);
//       });
//       // JSZip intentionally excluded here
//     }
//   }, []);

//   // Filtered products (clean list, no grouping props)
//   const allFilteredProducts = useMemo(() => 
//     allProducts.filter(product => !searchTerm || 
//         (product.items && product.items.toLowerCase().includes(searchTerm.toLowerCase())) || 
//         (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
//     )
//   , [allProducts, searchTerm]);
  
//   // Keys of all filtered products
//   const allFilteredKeys = useMemo(() => allFilteredProducts.map(item => item.key), [allFilteredProducts]);

//   // Filtered and grouped data (used for the visible Ant Design table)
//   const filteredAndGroupedData = useMemo(() => getGroupedData(allFilteredProducts), [allFilteredProducts]);

//   // USE THE CUSTOM HOOK for the displayed data
//   const { currentData: paginatedData, pageCount } = useGroupAwarePagination(
//       filteredAndGroupedData, 
//       currentPage, 
//       PAGE_SIZE_HINT
//   );
  
//   // Keys of all products currently visible on the table page
//   const visibleKeys = useMemo(() => paginatedData.map(item => item.key), [paginatedData]);

//   const handleSearch = (value) => {
//     setSearchTerm(value);
//     setCurrentPage(1); // Reset to page 1 on search
//   };

//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//   };
  
//   // --- GLOBAL SELECTION HANDLERS ---
//   const handleSelectAllFiltered = () => {
//     if (allFilteredKeys.length === 0) {
//       message.info("No items available in the filtered list to select.");
//       return;
//     }
//     setSelectedRowKeys(allFilteredKeys);
//     setSelectedRows(allFilteredProducts);
//     message.success(`Selected all ${allFilteredKeys.length} items across all pages.`);
//   };

//   const handleClearSelection = () => {
//     setSelectedRowKeys([]);
//     setSelectedRows([]);
//     message.info("Selection cleared.");
//   };
  
//   // --- ROW SELECTION LOGIC (CROSS-PAGE PERSISTENCE) ---

//   const onSelectChange = (newSelectedRowKeys, newSelectedRows) => {
//     const previousSelectedKeys = new Set(selectedRowKeys);
//     const newKeysFromAntD = new Set(newSelectedRowKeys); 
    
//     let finalKeys = new Set(selectedRowKeys);
//     let changed = false;
    
//     visibleKeys.forEach(key => {
//         const wasSelected = previousSelectedKeys.has(key);
//         const isNowSelected = newKeysFromAntD.has(key);

//         if (isNowSelected && !wasSelected) {
//             finalKeys.add(key);
//             changed = true;
//         } else if (!isNowSelected && wasSelected) {
//             finalKeys.delete(key);
//             changed = true;
//         }
//     });

//     if (!changed && newSelectedRowKeys.length > 0) {
//         const keysToAdd = newSelectedRowKeys.filter(key => !finalKeys.has(key));
//         keysToAdd.forEach(key => finalKeys.add(key));
        
//         const keysToRemove = selectedRowKeys.filter(key => visibleKeys.includes(key) && !newKeysFromAntD.has(key));
//         keysToRemove.forEach(key => finalKeys.delete(key));
//     }

//     const finalSelectedKeysArray = Array.from(finalKeys);
    
//     setSelectedRowKeys(finalSelectedKeysArray);

//     const newKeysSet = new Set(finalSelectedKeysArray);
//     const updatedSelectedRows = allFilteredProducts.filter(product => newKeysSet.has(product.key));

//     setSelectedRows(updatedSelectedRows);
//   };

//   const rowSelection = {
//     selectedRowKeys,
//     onChange: onSelectChange,
//     columnWidth: 50,
//   };


//  // ---------------------------------------------
//  //  // --- PDF Generation ---
//  // ---------------------------------------------
//   const handleSaveAsPdf = async () => {
//     if (!JsPDF) { message.error("PDF library not ready."); return; }
//     if (selectedRows.length === 0) { message.error("No items selected to export."); return; }

//     setIsProcessing(true);
//     const key = 'pdf-process';
//     message.loading({ content: '1/3. Loading images for PDF...', key });

//     try {
//       const groupedSelectedData = getGroupedData(selectedRows);
      
//       const dataWithImages = await Promise.all(groupedSelectedData.map(async (row) => ({
//         ...row,
//         base64Image: row.product_image ? await urlToBase64(row.product_image) : ''
//       })));

//       message.loading({ content: '2/3. Initializing PDF libraries...', key });
//       const { default: autoTable } = await import('jspdf-autotable');

//       message.loading({ content: '3/3. Generating PDF...', key });

//       const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

//       const tableHead = [['SL No','Item','Brand','Single','5+','10+','20+','50+','100+','GST','MRP','Warranty','Image']];
      
//       const tableBody = dataWithImages.map(row => {
//           const nonMergedColumns = [
//               { content: row.brand || "-", rowSpan: 1 }, 
//               { content: formatPrice(row.single), rowSpan: 1 },
//               { content: formatPrice(row.qty_5_plus), rowSpan: 1 },
//               { content: formatPrice(row.qty_10_plus), rowSpan: 1 },
//               { content: formatPrice(row.qty_20_plus), rowSpan: 1 },
//               { content: formatPrice(row.qty_50_plus), rowSpan: 1 },
//               { content: formatPrice(row.qty_100_plus), rowSpan: 1 },
//               { content: formatGST(row.gst), rowSpan: 1 },
//               { content: formatPrice(row.mrp), rowSpan: 1 },
//               { content: row.warranty || "-", rowSpan: 1 },
//               { content: row.product_image ? '' : '', data: row.base64Image, rowSpan: 1 } 
//           ];

//           if (row.rowSpan > 0) {
//               return [
//                   { content: row.sl_no.toString(), rowSpan: row.rowSpan },
//                   { content: row.items || "-", rowSpan: row.rowSpan },
//                   ...nonMergedColumns
//               ];
//           } else {
//               return nonMergedColumns;
//           }
//       });

//       autoTable(doc, {
//         head: tableHead,
//         body: tableBody,
//         startY: 20,
//         theme: 'grid',
//         styles: { fontSize: 10, cellPadding: 2, valign: 'middle', halign: 'center', minCellHeight: 15 },
//         headStyles: { fillColor: [240,240,240], textColor: 0, fontStyle: 'bold' },
//         showHead: 'everyPage',
//         rowPageBreak: 'avoid', 
        
//         willDrawCell: (data) => {
//           if (data.row.section === 'body' && (data.column.index === 0 || data.column.index === 1)) {
//               data.cell.styles.halign = 'center';
//               data.cell.styles.valign = 'middle';
//           }
//         },
//         didDrawCell: (data) => {
//             const imageColIndexInFinalTable = 12; 
//             const raw = data.cell.raw || {};
            
//             if (data.column.index === imageColIndexInFinalTable && raw.data) {
//                 const doc = data.doc;
//                 const imgDim = Math.min(data.cell.width - 4, data.cell.height - 4);
//                 const xPos = data.cell.x + (data.cell.width / 2) - (imgDim / 2);
//                 const yPos = data.cell.y + (data.cell.height / 2) - (imgDim / 2);

//                 doc.addImage(raw.data, "JPEG", xPos, yPos, imgDim, imgDim);
//             }
//         },
//         columnStyles: {
//             0: { cellWidth: 10, halign: 'center', valign: 'middle' }, 1: { cellWidth: 35, halign: 'center', valign: 'middle' }, 
//             2: { cellWidth: 35, halign: 'center', valign: 'middle' }, 3: { cellWidth: 18, halign: 'center', valign: 'middle' }, 
//             4: { cellWidth: 18, halign: 'center', valign: 'middle' }, 5: { cellWidth: 18, halign: 'center', valign: 'middle' }, 
//             6: { cellWidth: 18, halign: 'center', valign: 'middle' }, 7: { cellWidth: 18, halign: 'center', valign: 'middle' }, 
//             8: { cellWidth: 18, halign: 'center', valign: 'middle' }, 9: { cellWidth: 18, halign: 'center', valign: 'middle' }, 
//             10: { cellWidth: 18, halign: 'center', valign: 'middle' }, 11: { cellWidth: 20, halign: 'center', valign: 'middle' }, 
//             12: { cellWidth: 23, halign: 'center', valign: 'middle' } 
//         }
//       });

//       doc.save(`SelectedPriceList_${new Date().toISOString()}.pdf`);
//       message.success({ content: 'Selected items saved as PDF successfully!', key, duration: 2 });
//     } catch (error) {
//         console.error("PDF GENERATION CRASH DETAILS:", error);
//         message.error({ content: 'PDF generation failed. Check console.', key });
//     } finally { setIsProcessing(false); }
//   };

//   // ---------------------------------------------
//   // --- Share as Paginated Image (JPEG) ---
//   // ---------------------------------------------
//   const handleShareImage = async () => {
//     if (selectedRows.length === 0) {
//       message.error("No items selected to share.");
//       return;
//     }
//     if (!html2canvas) {
//         message.error("Image generation library not ready.");
//         return;
//     }

//     setIsProcessing(true);
//     const key = 'share-image-process';
//     message.loading({ content: '1/3. Preparing data...', key });
    
//     // Sort and group the selected data (needed for pagination breaks)
//     const groupedSelectedData = getGroupedData(selectedRows.sort((a, b) => a.sl_no - b.sl_no));
    
//     const totalSelected = groupedSelectedData.length;
//     let pageCount = Math.ceil(totalSelected / IMAGE_PAGE_SIZE);
    
//     const imageFiles = [];

//     try {
//         const element = imagePreviewRef.current;
//         if (!element) {
//             message.error({ content: 'Failed to find rendering element.', key });
//             return;
//         }
        
//         // 1. Loop through pages and generate images
//         for (let i = 0; i < pageCount; i++) {
//             const startIndex = i * IMAGE_PAGE_SIZE;
//             const endIndex = Math.min(startIndex + IMAGE_PAGE_SIZE, totalSelected);
//             const pageData = groupedSelectedData.slice(startIndex, endIndex);

//             message.loading({ content: `2/3. Generating Image Page ${i + 1} of ${pageCount}...`, key });
            
//             // Manually set the content of the hidden ref for the current page
//             element.innerHTML = `
//                 <h2 style="text-align: center; margin-bottom: 10px; color: #333;">Selected Price List (Page ${i + 1} of ${pageCount})</h2>
//                 <table class="${styles.imageTable}">
//                     <thead>
//                         <tr>
//                             <th>SL No</th><th>Item</th><th>Brand</th><th>Single</th><th>5+</th><th>10+</th><th>20+</th><th>50+</th><th>100+</th><th>GST</th><th>MRP</th><th>Warranty</th><th>Image</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         ${pageData.map((row, idx) => `
//                             <tr key=${row.key || idx}>
//                                 <td rowspan="${row.rowSpan > 0 ? row.rowSpan : 1}" style="display: ${row.rowSpan === 0 ? 'none' : 'table-cell'};">${row.sl_no}</td>
//                                 <td rowspan="${row.rowSpan > 0 ? row.rowSpan : 1}" style="display: ${row.rowSpan === 0 ? 'none' : 'table-cell'};">${row.items}</td>
//                                 <td>${row.brand || '-'}</td>
//                                 <td>${formatPrice(row.single)}</td>
//                                 <td>${formatPrice(row.qty_5_plus)}</td>
//                                 <td>${formatPrice(row.qty_10_plus)}</td>
//                                 <td>${formatPrice(row.qty_20_plus)}</td>
//                                 <td>${formatPrice(row.qty_50_plus)}</td>
//                                 <td>${formatPrice(row.qty_100_plus)}</td>
//                                 <td>${formatGST(row.gst)}</td>
//                                 <td>${formatPrice(row.mrp)}</td>
//                                 <td>${row.warranty || '-'}</td>
//                                 <td>
//                                     ${row.product_image ? `<img src="${row.product_image}" alt="Product" style="width: 50px; height: 50px; object-fit: contain;" crossorigin="anonymous" />` : ''}
//                                 </td>
//                             </tr>
//                         `).join('')}
//                     </tbody>
//                 </table>
//             `;
            
//             // Convert to Canvas and then Blob
//             const canvas = await html2canvas(element, {
//                 scale: 2, 
//                 useCORS: true, 
//                 allowTaint: true,
//                 backgroundColor: '#ffffff',
//                 removeContainer: true
//             });

//             const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9)); 
//             if (!blob) throw new Error(`Failed to create image blob for page ${i + 1}.`);

//             const fileName = `PriceList_Page_${i + 1}.jpeg`;
//             const file = new File([blob], fileName, { type: "image/jpeg" });

//             imageFiles.push(file);
//         }
        
//         // 2. Attempt Multi-File Web Share (Primary Goal)
//         message.loading({ content: `3/3. Attempting to share ${pageCount} images directly...`, key });
        
//         if (navigator.share && navigator.canShare && navigator.canShare({ files: imageFiles })) {
//             await navigator.share({
//                 files: imageFiles,
//                 title: 'Paginated Product Price List',
//                 text: `Paginated price list (${pageCount} images) for ${new Date().toLocaleDateString()}`
//             });
//             message.success({ content: `${pageCount} images shared successfully!`, key, duration: 3 });
//         } 
        
//         // 3. Fallback: Provide individual download links
//         else {
//             message.warn({ 
//                 content: `Multi-file sharing not supported. Preparing ${pageCount} individual download links.`, 
//                 key, 
//                 duration: 5 
//             });

//             // Create download buttons HTML
//             const downloadLinks = imageFiles.map((file, index) => {
//                 const url = URL.createObjectURL(file);
//                 return `<p><a href="${url}" download="${file.name}" target="_blank" style="padding: 8px; margin: 4px; border: 1px solid blue; text-decoration: none; display: block;">Download Page ${index + 1} (${file.name})</a></p>`;
//             }).join('');

//             // Display the links in a temporary Ant Design message
//             message.info({
//                 content: (
//                     <div>
//                         <p style={{ fontWeight: 'bold' }}>To share, please download the pages individually:</p>
//                         <div dangerouslySetInnerHTML={{ __html: downloadLinks }} /> 
//                     </div>
//                 ),
//                 duration: 15,
//                 key: 'share-fallback'
//             });
            
//             // Clean up temporary URLs
//             setTimeout(() => {
//                 imageFiles.forEach(file => URL.revokeObjectURL(file.url));
//             }, 10000);
//         }

//     } catch (error) {
//         console.error("PAGINATED IMAGE SHARE CRASH DETAILS:", error);
//         message.error({ content: `Image sharing failed: ${error.message}`, key });
//     } finally { 
//         // Cleanup the temporary content in the hidden div
//         if (imagePreviewRef.current) {
//             imagePreviewRef.current.innerHTML = '';
//         }
//         setIsProcessing(false); 
//     }
//   };


//   const totalFixedWidth = columns.reduce((sum, col) => sum + (col.width || 0), 0);
//   const totalFilteredRows = filteredAndGroupedData.length;
//   const currentPageDataSize = paginatedData.length;
//   const startRange = currentPageDataSize > 0 ? filteredAndGroupedData.indexOf(paginatedData[0]) + 1 : 0;
//   const endRange = startRange > 0 ? startRange + currentPageDataSize - 1 : 0;


//   // ---------------------------------------------
//   // --- Render ---
//   // ---------------------------------------------
//   return (
//     <div style={{ padding: 20 }}>
//       <h1>Product Price List</h1>
//       <Space style={{ marginBottom: 20, width: '100%', justifyContent: 'space-between' }}>
//         <Space size="middle">
//           <Link href="/add-product"><Button type="primary">+ Add New Product</Button></Link>
//           <Link href="/manage-products"><Button type="default">Manage Products</Button></Link>
//           <Link href="/manage-items"><Button type="dashed">Manage Item List</Button></Link>
          
//           <Button 
//             type="default" 
//             onClick={handleSelectAllFiltered} 
//             disabled={isProcessing || allFilteredKeys.length === 0 || selectedRows.length === allFilteredKeys.length}
//           >
//             Select All Filtered ({allFilteredKeys.length})
//           </Button>
//           <Button 
//             type="default" 
//             onClick={handleClearSelection} 
//             disabled={isProcessing || selectedRows.length === 0}
//           >
//             Clear Selection
//           </Button>
          
//           <Button 
//             type="ghost" 
//             style={{ backgroundColor: 'green', color: 'white', borderColor: 'green' }} 
//             onClick={handleShareImage} 
//             loading={isProcessing} 
//             disabled={selectedRows.length === 0 || !html2canvas}
//           >
//             Share Selected Images ({selectedRows.length})
//           </Button>

//           <Button 
//             type="primary" 
//             danger 
//             onClick={handleSaveAsPdf} 
//             loading={isProcessing} 
//             disabled={selectedRows.length === 0 || !JsPDF}
//           >
//             PDF Selected ({selectedRows.length})
//           </Button>
//         </Space>
//         <Input.Search placeholder="Search by Item or Brand" allowClear onSearch={handleSearch} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: 300 }} />
//       </Space>

//       {/* --- HIDDEN HTML DIV FOR IMAGE GENERATION --- */}
//       <div ref={imagePreviewRef} style={{ position: 'absolute', top: '-9999px', left: '-9999px', padding: '10px', backgroundColor: 'white', width: '1200px' }}>
//           {/* Content is generated dynamically in handleShareImage loop */}
//       </div>
//       {/* --- END HIDDEN HTML DIV --- */}


//       <div ref={visibleTableRef}>
//         <Table 
//             columns={columns} 
//             dataSource={paginatedData} 
//             loading={loading} 
//             rowKey="id" 
//             pagination={false} 
//             scroll={{ x: totalFixedWidth }} 
//             rowSelection={rowSelection} 
//         />
//       </div>
      
//       {/* Custom Pagination UI */}
//       {totalFilteredRows > 0 && (
//           <Pagination
//             current={currentPage}
//             total={pageCount} 
//             pageSize={1} 
//             onChange={handlePageChange}
//             showTotal={() => `${startRange}-${endRange} of ${totalFilteredRows} items (Group Aware)`}
//             style={{ marginTop: 20, textAlign: 'right' }}
//           />
//       )}

//     </div>
//   );
// }

























// import { useEffect, useState, useCallback, useMemo, useRef } from "react";
// // Ensure this path is correct for your Supabase client setup
// import { supabase } from "../lib/supabaseClient"; 
// import { Table, Image, Button, Space, Input, message, Pagination } from "antd";
// import Link from "next/link";
// import styles from './pricelist.module.css'; // Import the required CSS module

// // ===============================================
// // GLOBAL CONFIGURATION
// // ===============================================
// const PAGE_SIZE_HINT = 15;
// const IMAGE_PAGE_SIZE = 15;

// // ===============================================
// // HELPER FUNCTIONS 
// // ===============================================

// /**
//  * Fetches a remote URL and converts the image data to a Base64 string.
//  */
// const urlToBase64 = async (url) => {
//   if (!url) return '';
//   try {
//     const response = await fetch(url);
//     const blob = await response.blob();
//     return new Promise((resolve) => {
//       const reader = new FileReader();
//       reader.onloadend = () => resolve(reader.result);
//       reader.readAsDataURL(blob);
//     });
//   } catch (e) {
//     console.error("Failed to convert image to Base64:", url, e);
//     return ''; 
//   }
// };

// /**
//  * Groups and sorts data, setting rowSpan for SL No and Item.
//  */
// const getGroupedData = (data) => {
//   let count = 0;
//   const groupedData = [];
    
//   // Sort by SL No, Item, then Brand for consistent grouping
//   const sortedData = [...data].sort((a, b) => {
//     if (a.sl_no !== b.sl_no) return a.sl_no - b.sl_no;
//     const aItems = a.items || '';
//     const bItems = b.items || '';
//     return aItems.localeCompare(bItems) || (a.brand || '').localeCompare(b.brand || '');
//   });

//   for (let i = 0; i < sortedData.length; i++) {
//     const currentItem = sortedData[i];
    
//     // Check if this item is the start of a new SL No/Item group
//     if (i === 0 || currentItem.sl_no !== sortedData[i - 1].sl_no || currentItem.items !== sortedData[i - 1].items) {
//       count = 1;
//       for (let j = i + 1; j < sortedData.length; j++) {
//         if (sortedData[j].sl_no === currentItem.sl_no && sortedData[j].items === currentItem.items) count++;
//         else break;
//       }
//       groupedData.push({ ...currentItem, rowSpan: count, isGroupStart: true }); 
//     } else {
//       groupedData.push({ ...currentItem, rowSpan: 0, isGroupStart: false }); 
//     }
//   }
//   return groupedData;
// };

// const formatPrice = (price) => {
//     const cleanPrice = String(price).replace(/[^\d.]/g, ''); 
//     const numericPrice = parseFloat(cleanPrice);

//     if (isNaN(numericPrice) || numericPrice <= 0) {
//       return '-';
//     }
//     return `${numericPrice}`; 
// };

// const formatGST = (gst) => (gst > 0 ? `${gst}%` : '-');

// /**
//  * Calculates page boundaries for a grouped dataset, ensuring merged groups
//  * are not split across pages (Used for Image Generation).
//  */
// const getGroupAwareImagePageBoundaries = (groupedData, pageSize) => {
//     if (!groupedData || groupedData.length === 0) return [];

//     const boundaries = [];
//     let startIndex = 0;
        
//     while (startIndex < groupedData.length) {
//         let pageEnd = startIndex;
//         const targetEndIndex = Math.min(startIndex + pageSize, groupedData.length);

//         while (pageEnd < targetEndIndex) {
//             const row = groupedData[pageEnd];
            
//             // Check if we hit the limit, AND the next item starts a group that won't fit entirely
//             if (row.isGroupStart && (pageEnd + row.rowSpan > targetEndIndex) && pageEnd > startIndex) {
//                 break; // Break before including the split group
//             }
//             pageEnd++;
//         }
        
//         // If the loop finished right before the start of a new group, or after a partial group
//         if (pageEnd < groupedData.length && !groupedData[pageEnd].isGroupStart) {
//             // Advance past the rest of the current group to avoid splitting it
//             while (pageEnd < groupedData.length && !groupedData[pageEnd].isGroupStart) {
//                 pageEnd++;
//             }
//         }
        
//         // Safety break if logic fails to advance
//         if (pageEnd === startIndex) {
//             pageEnd = targetEndIndex;
//         }

//         boundaries.push({ start: startIndex, end: pageEnd });
//         startIndex = pageEnd;
//     }
//     return boundaries;
// };


// // ===============================================
// // Ant Design Table Columns (for UI)
// // ===============================================

// const columns = [
//   { title: 'SL No', dataIndex: 'sl_no', key: 'sl_no', align: 'center', onCell: (record) => ({ rowSpan: record.rowSpan }), width: 50, fixed: 'left' },
//   { title: 'Item', dataIndex: 'items', key: 'items', align: 'center', onCell: (record) => ({ rowSpan: record.rowSpan }), render: (text, record) => record.rowSpan > 0 ? text : null, width: 120, fixed: 'left' },
//   { title: 'Brand', dataIndex: 'brand', key: 'brand', align: 'center', width: 80, fixed: 'left', render: (text) => text || '-' },
//   { title: 'Single', dataIndex: 'single', key: 'single', align: 'center', render: formatPrice, width: 70 },
//   { title: '5+', dataIndex: 'qty_5_plus', key: 'qty_5_plus', align: 'center', render: formatPrice, width: 60 },
//   { title: '10+', dataIndex: 'qty_10_plus', key: 'qty_10_plus', align: 'center', render: formatPrice, width: 60 },
//   { title: '20+', dataIndex: 'qty_20_plus', key: 'qty_20_plus', align: 'center', render: formatPrice, width: 60 },
//   { title: '50+', dataIndex: 'qty_50_plus', key: 'qty_50_plus', align: 'center', render: formatPrice, width: 60 },
//   { title: '100+', dataIndex: 'qty_100_plus', key: 'qty_100_plus', align: 'center', render: formatPrice, width: 60 },
//   { title: 'GST', dataIndex: 'gst', key: 'gst', align: 'center', render: formatGST, width: 50 },
//   { title: 'MRP', dataIndex: 'mrp', key: 'mrp', align: 'center', render: formatPrice, width: 70 },
//   { title: 'Warranty', dataIndex: 'warranty', key: 'warranty', align: 'center', render: (w) => w || '-', width: 80 },
//   { title: 'Image', dataIndex: 'product_image', key: 'product_image', align: 'center', render: (imageUrl) => (imageUrl ? <Image src={imageUrl} alt="Product" style={{ maxWidth: '60px', maxHeight: '60px', objectFit: 'cover' }} /> : '-'), width: 80 },
// ];

// // ===============================================
// // CUSTOM HOOK: Group-Aware Paginator (for Ant Table)
// // ===============================================
// const useGroupAwarePagination = (groupedData, currentPage, pageSizeHint) => {
//     const [pageBoundaries, setPageBoundaries] = useState([]);

//     useEffect(() => {
//         if (!groupedData || groupedData.length === 0) {
//             setPageBoundaries([]);
//             return;
//         }

//         const boundaries = [];
//         let startIndex = 0;
        
//         while (startIndex < groupedData.length) {
//             let pageEnd = startIndex;
//             const targetEndIndex = Math.min(startIndex + pageSizeHint, groupedData.length);

//             while (pageEnd < targetEndIndex) {
//                 if (groupedData[pageEnd].isGroupStart) {
//                     const groupSize = groupedData[pageEnd].rowSpan;
                    
//                     if (pageEnd + groupSize > targetEndIndex && pageEnd > startIndex) {
//                         break; 
//                     }
//                 }
//                 pageEnd++;
//             }
            
//             if (pageEnd < groupedData.length && !groupedData[pageEnd].isGroupStart) {
//                 while (pageEnd < groupedData.length && !groupedData[pageEnd].isGroupStart) {
//                     pageEnd++;
//                 }
//             }

//             if (pageEnd === startIndex) {
//                 pageEnd = targetEndIndex;
//             }

//             boundaries.push({ start: startIndex, end: pageEnd });
//             startIndex = pageEnd;
//         }

//         setPageBoundaries(boundaries);
//     }, [groupedData, pageSizeHint]);

//     const pageCount = pageBoundaries.length;
    
//     const pageIndex = currentPage - 1;
//     const currentBoundary = pageBoundaries[pageIndex];
    
//     const currentData = useMemo(() => {
//         if (!currentBoundary) return [];
//         return groupedData.slice(currentBoundary.start, currentBoundary.end);
//     }, [groupedData, currentBoundary]);

//     return { currentData, pageCount };
// };


// // ===============================================
// // Component
// // ===============================================

// export default function Home() {
//   const [allProducts, setAllProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [JsPDF, setJsPDF] = useState(null);
//   const [html2canvas, setHtml2Canvas] = useState(null); 
  
//   // STATE FOR SELECTION
//   const [selectedRowKeys, setSelectedRowKeys] = useState([]);
//   const [selectedRows, setSelectedRows] = useState([]); 

//   const visibleTableRef = useRef(null);
//   const imagePreviewRef = useRef(null); 
  
//   const [currentPage, setCurrentPage] = useState(1);


//   // Fetch products
//   const fetchProducts = useCallback(async () => {
//     setLoading(true);
//     const { data, error } = await supabase.from("products").select("*").order("sl_no", { ascending: true }).order("items", { ascending: true });
//     if (!error) setAllProducts(data.map(item => ({ ...item, key: item.id })));
//     setLoading(false);
//   }, []);

//   useEffect(() => { fetchProducts(); }, [fetchProducts]);

//   // Load libraries dynamically
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       import('jspdf').then(module => {
//         setJsPDF(() => module.jsPDF || module.default); 
//       });
//       import('html2canvas').then(module => { 
//         setHtml2Canvas(() => module.default || module);
//       });
//     }
//   }, []);

//   // Filtered products (clean list, no grouping props)
//   const allFilteredProducts = useMemo(() => 
//     allProducts.filter(product => !searchTerm || 
//         (product.items && product.items.toLowerCase().includes(searchTerm.toLowerCase())) || 
//         (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
//     )
//   , [allProducts, searchTerm]);
  
//   // Keys of all filtered products
//   const allFilteredKeys = useMemo(() => allFilteredProducts.map(item => item.key), [allFilteredProducts]);

//   // Filtered and grouped data (used for the visible Ant Design table)
//   const filteredAndGroupedData = useMemo(() => getGroupedData(allFilteredProducts), [allFilteredProducts]);

//   // USE THE CUSTOM HOOK for the displayed data
//   const { currentData: paginatedData, pageCount } = useGroupAwarePagination(
//       filteredAndGroupedData, 
//       currentPage, 
//       PAGE_SIZE_HINT
//   );
  
//   // Keys of all products currently visible on the table page
//   const visibleKeys = useMemo(() => paginatedData.map(item => item.key), [paginatedData]);

//   const handleSearch = (value) => {
//     setSearchTerm(value);
//     setCurrentPage(1); // Reset to page 1 on search
//   };

//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//   };
  
//   // --- GLOBAL SELECTION HANDLERS ---
//   const handleSelectAllFiltered = () => {
//     if (allFilteredKeys.length === 0) {
//       message.info("No items available in the filtered list to select.");
//       return;
//     }
//     setSelectedRowKeys(allFilteredKeys);
//     setSelectedRows(allFilteredProducts);
//     message.success(`Selected all ${allFilteredKeys.length} items across all pages.`);
//   };

//   const handleClearSelection = () => {
//     setSelectedRowKeys([]);
//     setSelectedRows([]);
//     message.info("Selection cleared.");
//   };
  
//   // --- ROW SELECTION LOGIC (CROSS-PAGE PERSISTENCE) ---

//   const onSelectChange = (newSelectedRowKeys, newSelectedRows) => {
//     const previousSelectedKeys = new Set(selectedRowKeys);
//     const newKeysFromAntD = new Set(newSelectedRowKeys); 
    
//     let finalKeys = new Set(selectedRowKeys);
//     let changed = false;
    
//     visibleKeys.forEach(key => {
//         const wasSelected = previousSelectedKeys.has(key);
//         const isNowSelected = newKeysFromAntD.has(key);

//         if (isNowSelected && !wasSelected) {
//             finalKeys.add(key);
//             changed = true;
//         } else if (!isNowSelected && wasSelected) {
//             finalKeys.delete(key);
//             changed = true;
//         }
//     });

//     if (!changed && newSelectedRowKeys.length > 0) {
//         const keysToAdd = newSelectedRowKeys.filter(key => !finalKeys.has(key));
//         keysToAdd.forEach(key => finalKeys.add(key));
        
//         const keysToRemove = selectedRowKeys.filter(key => visibleKeys.includes(key) && !newKeysFromAntD.has(key));
//         keysToRemove.forEach(key => finalKeys.delete(key));
//     }

//     const finalSelectedKeysArray = Array.from(finalKeys);
    
//     setSelectedRowKeys(finalSelectedKeysArray);

//     const newKeysSet = new Set(finalSelectedKeysArray);
//     const updatedSelectedRows = allFilteredProducts.filter(product => newKeysSet.has(product.key));

//     setSelectedRows(updatedSelectedRows);
//   };

//   const rowSelection = {
//     selectedRowKeys,
//     onChange: onSelectChange,
//     columnWidth: 50,
//   };


//  // ---------------------------------------------
//  //  // --- PDF Generation ---
//  // ---------------------------------------------
//   const handleSaveAsPdf = async () => {
//     if (!JsPDF) { message.error("PDF library not ready."); return; }
//     if (selectedRows.length === 0) { message.error("No items selected to export."); return; }

//     setIsProcessing(true);
//     const key = 'pdf-process';
//     message.loading({ content: '1/3. Loading images for PDF...', key });

//     try {
//       const groupedSelectedData = getGroupedData(selectedRows);
      
//       const dataWithImages = await Promise.all(groupedSelectedData.map(async (row) => ({
//         ...row,
//         base64Image: row.product_image ? await urlToBase64(row.product_image) : ''
//       })));

//       message.loading({ content: '2/3. Initializing PDF libraries...', key });
//       const { default: autoTable } = await import('jspdf-autotable');

//       message.loading({ content: '3/3. Generating PDF...', key });

//       const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

//       const tableHead = [['SL No','Item','Brand','Single','5+','10+','20+','50+','100+','GST','MRP','Warranty','Image']];
      
//       const tableBody = dataWithImages.map(row => {
//           const nonMergedColumns = [
//               { content: row.brand || "-", rowSpan: 1 }, 
//               { content: formatPrice(row.single), rowSpan: 1 },
//               { content: formatPrice(row.qty_5_plus), rowSpan: 1 },
//               { content: formatPrice(row.qty_10_plus), rowSpan: 1 },
//               { content: formatPrice(row.qty_20_plus), rowSpan: 1 },
//               { content: formatPrice(row.qty_50_plus), rowSpan: 1 },
//               { content: formatPrice(row.qty_100_plus), rowSpan: 1 },
//               { content: formatGST(row.gst), rowSpan: 1 },
//               { content: formatPrice(row.mrp), rowSpan: 1 },
//               { content: row.warranty || "-", rowSpan: 1 },
//               { content: row.product_image ? '' : '', data: row.base64Image, rowSpan: 1 } 
//           ];

//           if (row.rowSpan > 0) {
//               return [
//                   { content: row.sl_no.toString(), rowSpan: row.rowSpan },
//                   { content: row.items || "-", rowSpan: row.rowSpan },
//                   ...nonMergedColumns
//               ];
//           } else {
//               return nonMergedColumns;
//           }
//       });

//       autoTable(doc, {
//         head: tableHead,
//         body: tableBody,
//         startY: 20,
//         theme: 'grid',
//         styles: { fontSize: 10, cellPadding: 2, valign: 'middle', halign: 'center', minCellHeight: 15 },
//         headStyles: { fillColor: [240,240,240], textColor: 0, fontStyle: 'bold' },
//         showHead: 'everyPage',
//         rowPageBreak: 'avoid', 
        
//         willDrawCell: (data) => {
//           if (data.row.section === 'body' && (data.column.index === 0 || data.column.index === 1)) {
//               data.cell.styles.halign = 'center';
//               data.cell.styles.valign = 'middle';
//           }
//         },
//         didDrawCell: (data) => {
//             const imageColIndexInFinalTable = 12; 
//             const raw = data.cell.raw || {};
            
//             if (data.column.index === imageColIndexInFinalTable && raw.data) {
//                 const doc = data.doc;
//                 const imgDim = Math.min(data.cell.width - 4, data.cell.height - 4);
//                 const xPos = data.cell.x + (data.cell.width / 2) - (imgDim / 2);
//                 const yPos = data.cell.y + (data.cell.height / 2) - (imgDim / 2);

//                 doc.addImage(raw.data, "JPEG", xPos, yPos, imgDim, imgDim);
//             }
//         },
//         columnStyles: {
//             0: { cellWidth: 10, halign: 'center', valign: 'middle' }, 1: { cellWidth: 35, halign: 'center', valign: 'middle' }, 
//             2: { cellWidth: 35, halign: 'center', valign: 'middle' }, 3: { cellWidth: 18, halign: 'center', valign: 'middle' }, 
//             4: { cellWidth: 18, halign: 'center', valign: 'middle' }, 5: { cellWidth: 18, halign: 'center', valign: 'middle' }, 
//             6: { cellWidth: 18, halign: 'center', valign: 'middle' }, 7: { cellWidth: 18, halign: 'center', valign: 'middle' }, 
//             8: { cellWidth: 18, halign: 'center', valign: 'middle' }, 9: { cellWidth: 18, halign: 'center', valign: 'middle' }, 
//             10: { cellWidth: 18, halign: 'center', valign: 'middle' }, 11: { cellWidth: 20, halign: 'center', valign: 'middle' }, 
//             12: { cellWidth: 23, halign: 'center', valign: 'middle' } 
//         }
//       });

//       doc.save(`SelectedPriceList_${new Date().toISOString()}.pdf`);
//       message.success({ content: 'Selected items saved as PDF successfully!', key, duration: 2 });
//     } catch (error) {
//         console.error("PDF GENERATION CRASH DETAILS:", error);
//         message.error({ content: 'PDF generation failed. Check console.', key });
//     } finally { setIsProcessing(false); }
//   };

//   // ---------------------------------------------
//   // --- Share as Paginated Image (JPEG) ---
//   // ---------------------------------------------
//   const handleShareImage = async () => {
//     if (selectedRows.length === 0) {
//       message.error("No items selected to share.");
//       return;
//     }
//     if (!html2canvas) {
//         message.error("Image generation library not ready.");
//         return;
//     }

//     setIsProcessing(true);
//     const key = 'share-image-process';
//     message.loading({ content: '1/3. Preparing data...', key });
    
//     // Sort and group the selected data
//     const groupedSelectedData = getGroupedData(selectedRows.sort((a, b) => a.sl_no - b.sl_no));
    
//     // Calculate page boundaries using the new group-aware logic
//     const pageBoundaries = getGroupAwareImagePageBoundaries(groupedSelectedData, IMAGE_PAGE_SIZE);
//     const pageCount = pageBoundaries.length;
    
//     const imageFiles = [];

//     try {
//         const element = imagePreviewRef.current;
//         if (!element) {
//             message.error({ content: 'Failed to find rendering element.', key });
//             return;
//         }
        
//         // 1. Loop through pages and generate images
//         for (let i = 0; i < pageCount; i++) {
//             const { start: startIndex, end: endIndex } = pageBoundaries[i];
//             const pageData = groupedSelectedData.slice(startIndex, endIndex);

//             message.loading({ content: `2/3. Generating Image Page ${i + 1} of ${pageCount}...`, key });
            
//             // Manually set the content of the hidden ref for the current page
//             element.innerHTML = `
//                 <h2 style="text-align: center; margin-bottom: 10px; color: #333;">Selected Price List (Page ${i + 1} of ${pageCount})</h2>
//                 <table class="${styles.imageTable}">
//                     <thead>
//                         <tr>
//                             <th>SL No</th><th>Item</th><th>Brand</th><th>Single</th><th>5+</th><th>10+</th><th>20+</th><th>50+</th><th>100+</th><th>GST</th><th>MRP</th><th>Warranty</th><th>Image</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         ${pageData.map((row, idx) => `
//                             <tr key=${row.key || idx}>
//                                 <td rowspan="${row.rowSpan > 0 ? row.rowSpan : 1}" style="display: ${row.rowSpan === 0 ? 'none' : 'table-cell'};">${row.sl_no}</td>
//                                 <td rowspan="${row.rowSpan > 0 ? row.rowSpan : 1}" style="display: ${row.rowSpan === 0 ? 'none' : 'table-cell'};">${row.items}</td>
//                                 <td>${row.brand || '-'}</td>
//                                 <td>${formatPrice(row.single)}</td>
//                                 <td>${formatPrice(row.qty_5_plus)}</td>
//                                 <td>${formatPrice(row.qty_10_plus)}</td>
//                                 <td>${formatPrice(row.qty_20_plus)}</td>
//                                 <td>${formatPrice(row.qty_50_plus)}</td>
//                                 <td>${formatPrice(row.qty_100_plus)}</td>
//                                 <td>${formatGST(row.gst)}</td>
//                                 <td>${formatPrice(row.mrp)}</td>
//                                 <td>${row.warranty || '-'}</td>
//                                 <td>
//                                     ${row.product_image ? `<img src="${row.product_image}" alt="Product" style="width: 50px; height: 50px; object-fit: contain;" crossorigin="anonymous" />` : ''}
//                                 </td>
//                             </tr>
//                         `).join('')}
//                     </tbody>
//                 </table>
//             `;
            
//             // Convert to Canvas and then Blob
//             const canvas = await html2canvas(element, {
//                 scale: 2, 
//                 useCORS: true, 
//                 allowTaint: true,
//                 backgroundColor: '#ffffff',
//                 removeContainer: true
//             });

//             const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9)); 
//             if (!blob) throw new Error(`Failed to create image blob for page ${i + 1}.`);

//             const fileName = `PriceList_Page_${i + 1}.jpeg`;
//             const file = new File([blob], fileName, { type: "image/jpeg" });

//             imageFiles.push(file);
//         }
        
//         // 2. Attempt Multi-File Web Share (Primary Goal)
//         message.loading({ content: `3/3. Attempting to share ${pageCount} images directly...`, key });
        
//         if (navigator.share && navigator.canShare && navigator.canShare({ files: imageFiles })) {
//             await navigator.share({
//                 files: imageFiles,
//                 title: 'Paginated Product Price List',
//                 text: `Paginated price list (${pageCount} images) for ${new Date().toLocaleDateString()}`
//             });
//             message.success({ content: `${pageCount} images shared successfully!`, key, duration: 3 });
//         } 
        
//         // 3. Fallback: Provide individual download links
//         else {
//             message.warn({ 
//                 content: `Multi-file sharing not supported. Preparing ${pageCount} individual download links.`, 
//                 key, 
//                 duration: 5 
//             });

//             // Create download buttons HTML
//             const downloadLinks = imageFiles.map((file, index) => {
//                 const url = URL.createObjectURL(file);
//                 return `<p><a href="${url}" download="${file.name}" target="_blank" style="padding: 8px; margin: 4px; border: 1px solid blue; text-decoration: none; display: block;">Download Page ${index + 1} (${file.name})</a></p>`;
//             }).join('');

//             // Display the links in a temporary Ant Design message
//             message.info({
//                 content: (
//                     <div>
//                         <p style={{ fontWeight: 'bold' }}>To share, please download the pages individually:</p>
//                         <div dangerouslySetInnerHTML={{ __html: downloadLinks }} /> 
//                     </div>
//                 ),
//                 duration: 15,
//                 key: 'share-fallback'
//             });
            
//             // Clean up temporary URLs
//             setTimeout(() => {
//                 imageFiles.forEach(file => URL.revokeObjectURL(file.url));
//             }, 10000);
//         }

//     } catch (error) {
//         console.error("PAGINATED IMAGE SHARE CRASH DETAILS:", error);
//         message.error({ content: `Image sharing failed: ${error.message}`, key });
//     } finally { 
//         // Cleanup the temporary content in the hidden div
//         if (imagePreviewRef.current) {
//             imagePreviewRef.current.innerHTML = '';
//         }
//         setIsProcessing(false); 
//     }
//   };


//   const totalFixedWidth = columns.reduce((sum, col) => sum + (col.width || 0), 0);
//   const totalFilteredRows = filteredAndGroupedData.length;
//   const currentPageDataSize = paginatedData.length;
//   const startRange = currentPageDataSize > 0 ? filteredAndGroupedData.indexOf(paginatedData[0]) + 1 : 0;
//   const endRange = startRange > 0 ? startRange + currentPageDataSize - 1 : 0;


//   // ---------------------------------------------
//   // --- Render ---
//   // ---------------------------------------------
//   return (
//     <div style={{ padding: 20 }}>
//       <h1>Product Price List</h1>
//       <Space style={{ marginBottom: 20, width: '100%', justifyContent: 'space-between' }}>
//         <Space size="middle">
//           <Link href="/add-product"><Button type="primary">+ Add New Product</Button></Link>
//           <Link href="/manage-products"><Button type="default">Manage Products</Button></Link>
//           <Link href="/manage-items"><Button type="dashed">Manage Item List</Button></Link>
          
//           <Button 
//             type="default" 
//             onClick={handleSelectAllFiltered} 
//             disabled={isProcessing || allFilteredKeys.length === 0 || selectedRows.length === allFilteredKeys.length}
//           >
//             Select All Filtered ({allFilteredKeys.length})
//           </Button>
//           <Button 
//             type="default" 
//             onClick={handleClearSelection} 
//             disabled={isProcessing || selectedRows.length === 0}
//           >
//             Clear Selection
//           </Button>
          
//           <Button 
//             type="ghost" 
//             style={{ backgroundColor: 'green', color: 'white', borderColor: 'green' }} 
//             onClick={handleShareImage} 
//             loading={isProcessing} 
//             disabled={selectedRows.length === 0 || !html2canvas}
//           >
//             Share (Whastspp) ({selectedRows.length})
//           </Button>

//           <Button 
//             type="primary" 
//             danger 
//             onClick={handleSaveAsPdf} 
//             loading={isProcessing} 
//             disabled={selectedRows.length === 0 || !JsPDF}
//           >
//             PDF Selected ({selectedRows.length})
//           </Button>
//         </Space>
//         <Input.Search placeholder="Search by Item or Brand" allowClear onSearch={handleSearch} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: 250 }} />
//       </Space>

//       {/* --- HIDDEN HTML DIV FOR IMAGE GENERATION --- */}
//       {/* Content is generated dynamically in handleShareImage loop */}
//       <div ref={imagePreviewRef} style={{ position: 'absolute', top: '-9999px', left: '-9999px', padding: '10px', backgroundColor: 'white', width: '1200px' }}>
//       </div>
//       {/* --- END HIDDEN HTML DIV --- */}


//       <div ref={visibleTableRef}>
//         <Table 
//             columns={columns} 
//             dataSource={paginatedData} 
//             loading={loading} 
//             rowKey="id" 
//             pagination={false} 
//             scroll={{ x: totalFixedWidth }} 
//             rowSelection={rowSelection} 
//         />
//       </div>
      
//       {/* Custom Pagination UI */}
//       {totalFilteredRows > 0 && (
//           <Pagination
//             current={currentPage}
//             total={pageCount} 
//             pageSize={1} 
//             onChange={handlePageChange}
//             showTotal={() => `${startRange}-${endRange} of ${totalFilteredRows} items`}
//             style={{ marginTop: 20, textAlign: 'right' }}
//           />
//       )}

//     </div>
//   );
// }



















import { useEffect, useState, useCallback, useMemo, useRef } from "react";
// Ensure this path is correct for your Supabase client setup
import { supabase } from "../lib/supabaseClient"; 
import { Table, Image, Button, Space, Input, message, Pagination } from "antd";
import Link from "next/link";
// Assuming you have a styles file for image table CSS
import styles from './pricelist.module.css'; 

// ===============================================
// GLOBAL CONFIGURATION
// ===============================================
const PAGE_SIZE_HINT = 15;
const IMAGE_PAGE_SIZE = 15;

// 🚨 YOUR LOGO URL
const LOGO_URL = 'https://res.cloudinary.com/dusbkxi2q/image/upload/v1765445020/LOGO_black_gyzneu.png'; 
// ===============================================

// ===============================================
// HELPER FUNCTIONS 
// ===============================================

/**
 * Fetches a remote URL and converts the image data to a Base64 string.
 */
const urlToBase64 = async (url) => {
  if (!url) return '';
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("Failed to convert image to Base64:", url, e);
    return ''; 
  }
};

/**
 * Groups and sorts data, setting rowSpan for SL No and Item.
 */
const getGroupedData = (data) => {
  let count = 0;
  const groupedData = [];
    
  // Sort by SL No, Item, then Brand for consistent grouping
  const sortedData = [...data].sort((a, b) => {
    if (a.sl_no !== b.sl_no) return a.sl_no - b.sl_no;
    const aItems = a.items || '';
    const bItems = b.items || '';
    return aItems.localeCompare(bItems) || (a.brand || '').localeCompare(b.brand || '');
  });

  for (let i = 0; i < sortedData.length; i++) {
    const currentItem = sortedData[i];
    
    // Check if this item is the start of a new SL No/Item group
    if (i === 0 || currentItem.sl_no !== sortedData[i - 1].sl_no || currentItem.items !== sortedData[i - 1].items) {
      count = 1;
      for (let j = i + 1; j < sortedData.length; j++) {
        if (sortedData[j].sl_no === currentItem.sl_no && sortedData[j].items === currentItem.items) count++;
        else break;
      }
      groupedData.push({ ...currentItem, rowSpan: count, isGroupStart: true }); 
    } else {
      groupedData.push({ ...currentItem, rowSpan: 0, isGroupStart: false }); 
    }
  }
  return groupedData;
};

const formatPrice = (price) => {
    const cleanPrice = String(price).replace(/[^\d.]/g, ''); 
    const numericPrice = parseFloat(cleanPrice);

    if (isNaN(numericPrice) || numericPrice <= 0) {
      return '-';
    }
    return `${numericPrice}`; 
};

const formatGST = (gst) => (gst > 0 ? `${gst}%` : '-');

/**
 * Calculates page boundaries for a grouped dataset, ensuring merged groups
 * are not split across pages (Used for Image Generation).
 */
const getGroupAwareImagePageBoundaries = (groupedData, pageSize) => {
    if (!groupedData || groupedData.length === 0) return [];

    const boundaries = [];
    let startIndex = 0;
        
    while (startIndex < groupedData.length) {
        let pageEnd = startIndex;
        const targetEndIndex = Math.min(startIndex + pageSize, groupedData.length);

        while (pageEnd < targetEndIndex) {
            const row = groupedData[pageEnd];
            
            // Check if we hit the limit, AND the next item starts a group that won't fit entirely
            if (row.isGroupStart && (pageEnd + row.rowSpan > targetEndIndex) && pageEnd > startIndex) {
                break; // Break before including the split group
            }
            pageEnd++;
        }
        
        // If the loop finished right before the start of a new group, or after a partial group
        if (pageEnd < groupedData.length && !groupedData[pageEnd].isGroupStart) {
            // Advance past the rest of the current group to avoid splitting it
            while (pageEnd < groupedData.length && !groupedData[pageEnd].isGroupStart) {
                pageEnd++;
            }
        }
        
        // Safety break if logic fails to advance
        if (pageEnd === startIndex) {
            pageEnd = targetEndIndex;
        }

        boundaries.push({ start: startIndex, end: pageEnd });
        startIndex = pageEnd;
    }
    return boundaries;
};


// ===============================================
// Ant Design Table Columns (for UI)
// ===============================================

const columns = [
  { title: 'SL No', dataIndex: 'sl_no', key: 'sl_no', align: 'center', onCell: (record) => ({ rowSpan: record.rowSpan, className: record.rowSpan === 0 ? styles.mergedCellHidden : '' }), width: 50, fixed: 'left' },
  { title: 'Item', dataIndex: 'items', key: 'items', align: 'center', onCell: (record) => ({ rowSpan: record.rowSpan, className: record.rowSpan === 0 ? styles.mergedCellHidden : '' }), render: (text, record) => record.rowSpan > 0 ? text : null, width: 120, fixed: 'left' },
  { title: 'Brand', dataIndex: 'brand', key: 'brand', align: 'center', width: 80, fixed: 'left', render: (text) => text || '-' },
  { title: 'Single', dataIndex: 'single', key: 'single', align: 'center', render: formatPrice, width: 70 },
  { title: '5+', dataIndex: 'qty_5_plus', key: 'qty_5_plus', align: 'center', render: formatPrice, width: 60 },
  { title: '10+', dataIndex: 'qty_10_plus', key: 'qty_10_plus', align: 'center', render: formatPrice, width: 60 },
  { title: '20+', dataIndex: 'qty_20_plus', key: 'qty_20_plus', align: 'center', render: formatPrice, width: 60 },
  { title: '50+', dataIndex: 'qty_50_plus', key: 'qty_50_plus', align: 'center', render: formatPrice, width: 60 },
  { title: '100+', dataIndex: 'qty_100_plus', key: 'qty_100_plus', align: 'center', render: formatPrice, width: 60 },
  { title: 'GST', dataIndex: 'gst', key: 'gst', align: 'center', render: formatGST, width: 50 },
  { title: 'MRP', dataIndex: 'mrp', key: 'mrp', align: 'center', render: formatPrice, width: 70 },
  { title: 'Warranty', dataIndex: 'warranty', key: 'warranty', align: 'center', render: (w) => w || '-', width: 80 },
  { title: 'Image', dataIndex: 'product_image', key: 'product_image', align: 'center', render: (imageUrl) => (imageUrl ? <Image src={imageUrl} alt="Product" style={{ maxWidth: '60px', maxHeight: '60px', objectFit: 'cover' }} /> : '-'), width: 80 },
];

// ===============================================
// CUSTOM HOOK: Group-Aware Paginator (for Ant Table)
// ===============================================
const useGroupAwarePagination = (groupedData, currentPage, pageSizeHint) => {
    const [pageBoundaries, setPageBoundaries] = useState([]);

    useEffect(() => {
        if (!groupedData || groupedData.length === 0) {
            setPageBoundaries([]);
            return;
        }

        const boundaries = [];
        let startIndex = 0;
        
        while (startIndex < groupedData.length) {
            let pageEnd = startIndex;
            const targetEndIndex = Math.min(startIndex + pageSizeHint, groupedData.length);

            while (pageEnd < targetEndIndex) {
                if (groupedData[pageEnd].isGroupStart) {
                    const groupSize = groupedData[pageEnd].rowSpan;
                    
                    if (pageEnd + groupSize > targetEndIndex && pageEnd > startIndex) {
                        break; 
                    }
                }
                pageEnd++;
            }
            
            if (pageEnd < groupedData.length && !groupedData[pageEnd].isGroupStart) {
                while (pageEnd < groupedData.length && !groupedData[pageEnd].isGroupStart) {
                    pageEnd++;
                }
            }

            if (pageEnd === startIndex) {
                pageEnd = targetEndIndex;
            }

            boundaries.push({ start: startIndex, end: pageEnd });
            startIndex = pageEnd;
        }

        setPageBoundaries(boundaries);
    }, [groupedData, pageSizeHint]);

    const pageCount = pageBoundaries.length;
    
    const pageIndex = currentPage - 1;
    const currentBoundary = pageBoundaries[pageIndex];
    
    const currentData = useMemo(() => {
        if (!currentBoundary) return [];
        return groupedData.slice(currentBoundary.start, currentBoundary.end);
    }, [groupedData, currentBoundary]);

    return { currentData, pageCount };
};


// ===============================================
// Component
// ===============================================

export default function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [JsPDF, setJsPDF] = useState(null);
  const [html2canvas, setHtml2Canvas] = useState(null); 
  const [logoBase64, setLogoBase64] = useState(''); 
  
  // STATE FOR SELECTION
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]); 

  const visibleTableRef = useRef(null);
  const imagePreviewRef = useRef(null); 
  
  const [currentPage, setCurrentPage] = useState(1);


  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("sl_no", { ascending: true }).order("items", { ascending: true });
    if (!error) setAllProducts(data.map(item => ({ ...item, key: item.id })));
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Load libraries dynamically and load logo
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('jspdf').then(module => { setJsPDF(() => module.jsPDF || module.default); });
      import('html2canvas').then(module => { setHtml2Canvas(() => module.default || module); });
      
      // --- Load Logo ---
      const loadLogo = async () => {
          if (LOGO_URL) {
              const base64 = await urlToBase64(LOGO_URL);
              setLogoBase64(base64);
          }
      };
      loadLogo();
      // -------------------
    }
  }, []);

  // Filtered products (clean list, no grouping props)
  const allFilteredProducts = useMemo(() => 
    allProducts.filter(product => !searchTerm || 
        (product.items && product.items.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  , [allProducts, searchTerm]);
  
  // Keys of all filtered products
  const allFilteredKeys = useMemo(() => allFilteredProducts.map(item => item.key), [allFilteredProducts]);

  // Filtered and grouped data (used for the visible Ant Design table)
  const filteredAndGroupedData = useMemo(() => getGroupedData(allFilteredProducts), [allFilteredProducts]);

  // USE THE CUSTOM HOOK for the displayed data
  const { currentData: paginatedData, pageCount } = useGroupAwarePagination(
      filteredAndGroupedData, 
      currentPage, 
      PAGE_SIZE_HINT
  );
  
  // Keys of all products currently visible on the table page
  const visibleKeys = useMemo(() => paginatedData.map(item => item.key), [paginatedData]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); 
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  // --- GLOBAL SELECTION HANDLERS ---
  const handleSelectAllFiltered = () => {
    if (allFilteredKeys.length === 0) {
      message.info("No items available in the filtered list to select.");
      return;
    }
    setSelectedRowKeys(allFilteredKeys);
    setSelectedRows(allFilteredProducts);
    message.success(`Selected all ${allFilteredKeys.length} items across all pages.`);
  };

  const handleClearSelection = () => {
    setSelectedRowKeys([]);
    setSelectedRows([]);
    message.info("Selection cleared.");
  };
  
  // --- ROW SELECTION LOGIC (CROSS-PAGE PERSISTENCE) ---
  const onSelectChange = (newSelectedRowKeys, newSelectedRows) => {
    const previousSelectedKeys = new Set(selectedRowKeys);
    const newKeysFromAntD = new Set(newSelectedRowKeys); 
    
    let finalKeys = new Set(selectedRowKeys);
    let changed = false;
    
    visibleKeys.forEach(key => {
        const wasSelected = previousSelectedKeys.has(key);
        const isNowSelected = newKeysFromAntD.has(key);

        if (isNowSelected && !wasSelected) {
            finalKeys.add(key);
            changed = true;
        } else if (!isNowSelected && wasSelected) {
            finalKeys.delete(key);
            changed = true;
        }
    });

    if (!changed && newSelectedRowKeys.length > 0) {
        const keysToAdd = newSelectedRowKeys.filter(key => !finalKeys.has(key));
        keysToAdd.forEach(key => finalKeys.add(key));
        
        const keysToRemove = selectedRowKeys.filter(key => visibleKeys.includes(key) && !newKeysFromAntD.has(key));
        keysToRemove.forEach(key => finalKeys.delete(key));
    }

    const finalSelectedKeysArray = Array.from(finalKeys);
    
    setSelectedRowKeys(finalSelectedKeysArray);

    const newKeysSet = new Set(finalSelectedKeysArray);
    const updatedSelectedRows = allFilteredProducts.filter(product => newKeysSet.has(product.key));

    setSelectedRows(updatedSelectedRows);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    columnWidth: 50,
  };


 // ---------------------------------------------
 //  // --- PDF Generation with Watermark (Data is Crisp) ---
 // ---------------------------------------------
  const handleSaveAsPdf = async () => {
    if (!JsPDF) { message.error("PDF library not ready."); return; }
    if (selectedRows.length === 0) { message.error("No items selected to export."); return; }

    setIsProcessing(true);
    const key = 'pdf-process';
    message.loading({ content: '1/3. Loading images for PDF...', key });

    try {
      const groupedSelectedData = getGroupedData(selectedRows);
      
      const dataWithImages = await Promise.all(groupedSelectedData.map(async (row) => ({
        ...row,
        base64Image: row.product_image ? await urlToBase64(row.product_image) : ''
      })));

      message.loading({ content: '2/3. Initializing PDF libraries...', key });
      const { default: autoTable } = await import('jspdf-autotable');

      message.loading({ content: '3/3. Generating PDF...', key });

      const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      const tableHead = [['SL No','Item','Brand','Single','5+','10+','20+','50+','100+','GST','MRP','Warranty','Image']];
      
      const tableBody = dataWithImages.map(row => {
          const nonMergedColumns = [
              { content: row.brand || "-", rowSpan: 1 }, 
              { content: formatPrice(row.single), rowSpan: 1 },
              { content: formatPrice(row.qty_5_plus), rowSpan: 1 },
              { content: formatPrice(row.qty_10_plus), rowSpan: 1 },
              { content: formatPrice(row.qty_20_plus), rowSpan: 1 },
              { content: formatPrice(row.qty_50_plus), rowSpan: 1 },
              { content: formatPrice(row.qty_100_plus), rowSpan: 1 },
              { content: formatGST(row.gst), rowSpan: 1 },
              { content: formatPrice(row.mrp), rowSpan: 1 },
              { content: row.warranty || "-", rowSpan: 1 },
              { content: row.product_image ? '' : '', data: row.base64Image, rowSpan: 1 } 
          ];

          if (row.rowSpan > 0) {
              return [
                  { content: row.sl_no.toString(), rowSpan: row.rowSpan },
                  { content: row.items || "-", rowSpan: row.rowSpan },
                  ...nonMergedColumns
              ];
          } else {
              return nonMergedColumns;
          }
      });

      autoTable(doc, {
        head: tableHead,
        body: tableBody,
        startY: 20,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 2, valign: 'middle', halign: 'center', minCellHeight: 15 },
        headStyles: { fillColor: [240,240,240], textColor: 0, fontStyle: 'bold' },
        showHead: 'everyPage',
        rowPageBreak: 'avoid', 
        
        // --- PDF WATERMARK LOGIC ---
        didDrawPage: (data) => {
    if (logoBase64) {
        const logoWidth = 160; 
        const logoHeight = 80; 
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Position the logo in the center
        const x = (pageWidth / 2) - (logoWidth / 4);
        const y = (pageHeight / 2) - (logoHeight / 4);
        
        // Set low opacity for watermark effect
        doc.setGState(new doc.GState({opacity: 0.05}));
        
        // 🚨 CRITICAL CHANGE: Use the rotation parameter (the last argument) in addImage
        doc.addImage(
            logoBase64, 
            'PNG', 
            x, 
            y, 
            logoWidth, 
            logoHeight, 
            null, // alias
            null, // compression
            45    // 🚨 ROTATION ANGLE in degrees
        );
        
        // Reset opacity
        doc.setGState(new doc.GState({opacity: 1}));
    }
},
        // --- END PDF WATERMARK LOGIC ---
        
        willDrawCell: (data) => {
          if (data.row.section === 'body' && (data.column.index === 0 || data.column.index === 1)) {
              data.cell.styles.halign = 'center';
              data.cell.styles.valign = 'middle';
          }
        },
        didDrawCell: (data) => {
            const imageColIndexInFinalTable = 12; 
            const raw = data.cell.raw || {};
            
            if (data.column.index === imageColIndexInFinalTable && raw.data) {
                const doc = data.doc;
                const imgDim = Math.min(data.cell.width - 4, data.cell.height - 4);
                const xPos = data.cell.x + (data.cell.width / 2) - (imgDim / 2);
                const yPos = data.cell.y + (data.cell.height / 2) - (imgDim / 2);

                doc.addImage(raw.data, "JPEG", xPos, yPos, imgDim, imgDim);
            }
        },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center', valign: 'middle' }, 1: { cellWidth: 35, halign: 'center', valign: 'middle' }, 
            2: { cellWidth: 35, halign: 'center', valign: 'middle' }, 3: { cellWidth: 18, halign: 'center', valign: 'middle' }, 
            4: { cellWidth: 18, halign: 'center', valign: 'middle' }, 5: { cellWidth: 18, halign: 'center', valign: 'middle' }, 
            6: { cellWidth: 18, halign: 'center', valign: 'middle' }, 7: { cellWidth: 18, halign: 'center', valign: 'middle' }, 
            8: { cellWidth: 18, halign: 'center', valign: 'middle' }, 9: { cellWidth: 18, halign: 'center', valign: 'middle' }, 
            10: { cellWidth: 18, halign: 'center', valign: 'middle' }, 11: { cellWidth: 20, halign: 'center', valign: 'middle' }, 
            12: { cellWidth: 23, halign: 'center', valign: 'middle' } 
        }
      });

      doc.save(`SelectedPriceList_${new Date().toISOString()}.pdf`);
      message.success({ content: 'Selected items saved as PDF successfully!', key, duration: 2 });
    } catch (error) {
        console.error("PDF GENERATION CRASH DETAILS:", error);
        message.error({ content: 'PDF generation failed. Check console.', key });
    } finally { setIsProcessing(false); }
  };


  // ---------------------------------------------
  // --- Share as Paginated Image (FIXED: Crisp Data, Faded Logo) ---
  // ---------------------------------------------
  const handleShareImage = async () => {
    if (selectedRows.length === 0) { message.error("No items selected to share."); return; }
    if (!html2canvas) { message.error("Image generation library not ready."); return; }

    setIsProcessing(true);
    const key = 'share-image-process';
    message.loading({ content: '1/3. Preparing data...', key });
    
    const groupedSelectedData = getGroupedData(selectedRows.sort((a, b) => a.sl_no - b.sl_no));
    const pageBoundaries = getGroupAwareImagePageBoundaries(groupedSelectedData, IMAGE_PAGE_SIZE);
    const pageCount = pageBoundaries.length;
    const imageFiles = [];

    try {
        const element = imagePreviewRef.current;
        if (!element) { message.error({ content: 'Failed to find rendering element.', key }); return; }

        // --- IMAGE WATERMARK FIX (Reset Parent Styles) ---
        // Ensure the root element has no interfering styles like opacity or background image
        element.style.opacity = 1; 
        element.style.backgroundColor = '#ffffff'; 
        element.style.backgroundImage = 'none'; 
        // --- END FIX ---
        
        // 1. Loop through pages and generate images
        for (let i = 0; i < pageCount; i++) {
            const { start: startIndex, end: endIndex } = pageBoundaries[i];
            const pageData = groupedSelectedData.slice(startIndex, endIndex);

            message.loading({ content: `2/3. Generating Image Page ${i + 1} of ${pageCount}...`, key });
            
            // Manually set the content of the hidden ref for the current page
            element.innerHTML = `
                <h2 style="text-align: center; margin-bottom: 10px; color: #333;">Selected Price List (Page ${i + 1} of ${pageCount})</h2>
                
                ${logoBase64 ? `
                    <div style="
                        position: absolute; 
                        top: 0; 
                        left: 0; 
                        width: 100%; 
                        height: 100%; 
                        // background-image: url(${logoBase64});
                        background-repeat: no-repeat;
                        background-position: center center;
                        background-size: 300px;
                        opacity: 0.15; /* Logo is faint */
                        pointer-events: none;
                        z-index: 2; /* Low Z-index */
                    "></div>
                ` : ''}
                <div style="position: relative; z-index: 2; background-color: white; padding-top: 50px;">
                    <table class="${styles.imageTable}">
                        <thead>
                            <tr>
                                <th>SL No</th><th>Item</th><th>Brand</th><th>Single</th><th>5+</th><th>10+</th><th>20+</th><th>50+</th><th>100+</th><th>GST</th><th>MRP</th><th>Warranty</th><th>Image</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pageData.map((row, idx) => `
                                <tr key=${row.key || idx}>
                                    <td rowspan="${row.rowSpan > 0 ? row.rowSpan : 1}" style="display: ${row.rowSpan === 0 ? 'none' : 'table-cell'};">${row.sl_no}</td>
                                    <td rowspan="${row.rowSpan > 0 ? row.rowSpan : 1}" style="display: ${row.rowSpan === 0 ? 'none' : 'table-cell'};">${row.items}</td>
                                    <td>${row.brand || '-'}</td>
                                    <td>${formatPrice(row.single)}</td>
                                    <td>${formatPrice(row.qty_5_plus)}</td>
                                    <td>${formatPrice(row.qty_10_plus)}</td>
                                    <td>${formatPrice(row.qty_20_plus)}</td>
                                    <td>${formatPrice(row.qty_50_plus)}</td>
                                    <td>${formatPrice(row.qty_100_plus)}</td>
                                    <td>${formatGST(row.gst)}</td>
                                    <td>${formatPrice(row.mrp)}</td>
                                    <td>${row.warranty || '-'}</td>
                                    <td>
                                        ${row.product_image ? `<img src="${row.product_image}" alt="Product" style="width: 50px; height: 50px; object-fit: contain;" crossorigin="anonymous" />` : ''}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            
            // Convert to Canvas and then Blob
            const canvas = await html2canvas(element, {
                scale: 2, 
                useCORS: true, 
                allowTaint: true,
                backgroundColor: '#ffffff',
                removeContainer: false 
            });

            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9)); 
            if (!blob) throw new Error(`Failed to create image blob for page ${i + 1}.`);

            const fileName = `PriceList_Page_${i + 1}.jpeg`;
            const file = new File([blob], fileName, { type: "image/jpeg" });

            imageFiles.push(file);
        }
        
        // 2. Attempt Multi-File Web Share (Primary Goal)
        message.loading({ content: `3/3. Attempting to share ${pageCount} images directly...`, key });
        
        if (navigator.share && navigator.canShare && navigator.canShare({ files: imageFiles })) {
            await navigator.share({
                files: imageFiles,
                title: 'Paginated Product Price List',
                text: `Paginated price list (${pageCount} images) for ${new Date().toLocaleDateString()}`
            });
            message.success({ content: `${pageCount} images shared successfully!`, key, duration: 3 });
        } 
        
        // 3. Fallback: Provide individual download links
        else {
            message.warn({ 
                content: `Multi-file sharing not supported. Preparing ${pageCount} individual download links.`, 
                key, 
                duration: 5 
            });

            const downloadLinks = imageFiles.map((file, index) => {
                const url = URL.createObjectURL(file);
                return `<p><a href="${url}" download="${file.name}" target="_blank" style="padding: 8px; margin: 4px; border: 1px solid blue; text-decoration: none; display: block;">Download Page ${index + 1} (${file.name})</a></p>`;
            }).join('');

            message.info({
                content: (
                    <div>
                        <p style={{ fontWeight: 'bold' }}>To share, please download the pages individually:</p>
                        <div dangerouslySetInnerHTML={{ __html: downloadLinks }} /> 
                    </div>
                ),
                duration: 15,
                key: 'share-fallback'
            });
            
            setTimeout(() => { imageFiles.forEach(file => URL.revokeObjectURL(file.url)); }, 10000);
        }

    } catch (error) {
        console.error("PAGINATED IMAGE SHARE CRASH DETAILS:", error);
        message.error({ content: `Image sharing failed: ${error.message}`, key });
    } finally { 
        // Cleanup the temporary content and styles
        if (imagePreviewRef.current) {
            imagePreviewRef.current.innerHTML = '';
            // Reset custom styles
            imagePreviewRef.current.style.backgroundImage = 'none';
            imagePreviewRef.current.style.opacity = 1;
        }
        setIsProcessing(false); 
    }
  };


  const totalFixedWidth = columns.reduce((sum, col) => sum + (col.width || 0), 0);
  const totalFilteredRows = filteredAndGroupedData.length;
  const currentPageDataSize = paginatedData.length;
  const startRange = currentPageDataSize > 0 ? filteredAndGroupedData.indexOf(paginatedData[0]) + 1 : 0;
  const endRange = startRange > 0 ? startRange + currentPageDataSize - 1 : 0;


  // ---------------------------------------------
  // --- Render ---
  // ---------------------------------------------
  return (
    <div style={{ padding: 20 }}>
      <h1>Product Price List</h1>
      <Space style={{ marginBottom: 20, width: '100%', justifyContent: 'space-between' }}>
        <Space size="middle">
          <Link href="/add-product"><Button type="primary">+ Add New Product</Button></Link>
          <Link href="/manage-products"><Button type="default">Manage Products</Button></Link>
          <Link href="/manage-items"><Button type="dashed">Manage Item List</Button></Link>
          
          <Button 
            type="default" 
            onClick={handleSelectAllFiltered} 
            disabled={isProcessing || allFilteredKeys.length === 0 || selectedRows.length === allFilteredKeys.length}
          >
            Select All Filtered ({allFilteredKeys.length})
          </Button>
          <Button 
            type="default" 
            onClick={handleClearSelection} 
            disabled={isProcessing || selectedRows.length === 0}
          >
            Clear Selection
          </Button>
          
          <Button 
            type="ghost" 
            style={{ backgroundColor: 'green', color: 'white', borderColor: 'green' }} 
            onClick={handleShareImage} 
            loading={isProcessing} 
            disabled={selectedRows.length === 0 || !html2canvas}
          >
            Share Whatsapp ({selectedRows.length})
          </Button>

          <Button 
            type="primary" 
            danger 
            onClick={handleSaveAsPdf} 
            loading={isProcessing} 
            disabled={selectedRows.length === 0 || !JsPDF}
          >
            Save as PDF ({selectedRows.length})
          </Button>
        </Space>
        <Input.Search placeholder="Search by Item or Brand" allowClear onSearch={handleSearch} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: 200 }} />
      </Space>

      {/* --- HIDDEN HTML DIV FOR IMAGE GENERATION (IMPORTANT: position: relative) --- */}
      <div 
        ref={imagePreviewRef} 
        style={{ 
            position: 'absolute', 
            top: '-9999px', 
            left: '-9999px', 
            padding: '10px', 
            backgroundColor: 'white', 
            width: '1200px',
            position: 'relative' /* CRITICAL: Allows absolute positioning of the watermark */
        }}
      >
      </div>
      {/* --- END HIDDEN HTML DIV --- */}


      <div ref={visibleTableRef}>
        <Table 
            className={styles.responsivePriceTable}
            columns={columns} 
            dataSource={paginatedData} 
            loading={loading} 
            rowKey="id" 
            pagination={false} 
            scroll={{ x: 'max-content' }} 
            rowSelection={rowSelection} 
        />
      </div>
      
      {/* Custom Pagination UI */}
      {totalFilteredRows > 0 && (
          <Pagination
            current={currentPage}
            total={pageCount} 
            pageSize={1} 
            onChange={handlePageChange}
            showTotal={() => `${startRange}-${endRange} of ${totalFilteredRows} items (Group Aware)`}
            style={{ marginTop: 20, textAlign: 'right' }}
          />
      )}

    </div>
  );
}





















