

// import { useEffect, useState, useCallback, useMemo, useRef } from "react";
// // Ensure this path is correct for your Supabase client setup
// import { supabase } from "../lib/supabaseClient"; 
// import { Table, Image, Button, Space, Input, message, Pagination } from "antd";
// import Link from "next/link";
// // Assuming you have a styles file for image table CSS
// import styles from './pricelist.module.css'; 
// import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';


// // ===============================================
// // GLOBAL CONFIGURATION
// // ===============================================
// const PAGE_SIZE_HINT = 15;
// const IMAGE_PAGE_SIZE = 15;

// // 🚨 YOUR LOGO URL
// const LOGO_URL = 'https://res.cloudinary.com/dusbkxi2q/image/upload/v1765445020/LOGO_black_gyzneu.png'; 
// // ===============================================

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
//   const [logoBase64, setLogoBase64] = useState(''); 

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

//   // useEffect(() => { fetchProducts(); }, [fetchProducts]);


// // --- 🚀 AUTOLOAD (REALTIME) LOGIC INTEGRATED HERE ---
//   useEffect(() => { 
//     fetchProducts(); 

//     const channel = supabase
//       .channel('realtime-products-home')
//       .on('postgres_changes', 
//         { event: '*', schema: 'public', table: 'products' }, 
//         (payload) => {
//           console.log('Realtime update:', payload);
//           fetchProducts(); 
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [fetchProducts]);



//   // Load libraries dynamically and load logo
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       import('jspdf').then(module => { setJsPDF(() => module.jsPDF || module.default); });
//       import('html2canvas').then(module => { setHtml2Canvas(() => module.default || module); });

//       // --- Load Logo ---
//       const loadLogo = async () => {
//           if (LOGO_URL) {
//               const base64 = await urlToBase64(LOGO_URL);
//               setLogoBase64(base64);
//           }
//       };
//       loadLogo();
//       // -------------------
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
//     setCurrentPage(1); 
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
//  //  // --- PDF Generation with Watermark (Data is Crisp) ---
//  // ---------------------------------------------









// const handleSaveAsPdf = async () => {
//     if (!JsPDF) { message.error("PDF library not ready."); return; }
//     if (selectedRows.length === 0) { message.error("No items selected to export."); return; }

//     setIsProcessing(true);
//     const key = 'pdf-process';
//     message.loading({ content: 'Generating PDF with Strict Pagination...', key });

//     try {
//         const { default: autoTable } = await import('jspdf-autotable');
//         const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

//         // 1. Native JS Grouping
//         const sortedData = [...selectedRows].sort((a, b) => a.sl_no - b.sl_no);
//         const rawGroups = sortedData.reduce((acc, obj) => {
//             const id = obj.sl_no;
//             if (!acc[id]) acc[id] = [];
//             acc[id].push(obj);
//             return acc;
//         }, {});

//         const itemIndexMap = []; 
//         const tableHead = [['SL No','Item','Brand','Single','5+','10+','20+','50+','100+','GST','MRP','Warranty','Image']];

//         let currentY = 15;
//         const pageHeight = doc.internal.pageSize.height;
//         const marginBottom = 25; // Increased margin for safety
//         const rowHeight = 14; 
//         const headerHeight = 10;

//         const groupKeys = Object.keys(rawGroups).sort((a, b) => Number(a) - Number(b));

//         for (const slNo of groupKeys) {
//             const groupRows = rawGroups[slNo];
//             const totalGroupHeight = groupRows.length * rowHeight;
//             const availableSpace = pageHeight - currentY - marginBottom;

//             // --- STRICT PAGINATION LOGIC ---
//             // If the group height is more than available space, move to next page
//             // EXCEPT if the group is bigger than a WHOLE page (then it must start and overflow)
//             if (totalGroupHeight > availableSpace) {
//                 // If it can fit on a fresh page, move it. 
//                 // If it's too big for even a fresh page, move it to a fresh page anyway to start it.
//                 doc.addPage();
//                 currentY = 15;
//             }

//             const bodyData = await Promise.all(groupRows.map(async (row) => {
//                 const base64 = row.product_image ? await urlToBase64(row.product_image) : '';
//                 return [
//                     { content: row.sl_no.toString() }, 
//                     { content: row.items || "-" },   
//                     { content: row.brand || "-" },
//                     { content: formatPrice(row.single) },
//                     { content: formatPrice(row.qty_5_plus) },
//                     { content: formatPrice(row.qty_10_plus) },
//                     { content: formatPrice(row.qty_20_plus) },
//                     { content: formatPrice(row.qty_50_plus) },
//                     { content: formatPrice(row.qty_100_plus) },
//                     { content: formatGST(row.gst) },
//                     { content: formatPrice(row.mrp) },
//                     { content: row.warranty || "-" },
//                     { content: '', data: base64 }
//                 ];
//             }));

//             autoTable(doc, {
//                 head: currentY === 15 ? tableHead : [],
//                 body: bodyData,
//                 startY: currentY,
//                 theme: 'grid',
//                 styles: { fontSize: 8, cellPadding: 1, valign: 'middle', halign: 'center', minCellHeight: rowHeight },
//                 columnStyles: { 
//                     0: { cellWidth: 10 }, 1: { cellWidth: 35 }, 2: { cellWidth: 45 },
//                     3: { cellWidth: 18 }, 4: { cellWidth: 18 }, 5: { cellWidth: 18 },
//                     6: { cellWidth: 18 }, 7: { cellWidth: 18 }, 8: { cellWidth: 18 },
//                     9: { cellWidth: 12 }, 10: { cellWidth: 18 }, 11: { cellWidth: 18 }, 
//                     12: { cellWidth: 20 } 
//                 },
//                 didParseCell: (data) => {
//                     // Repeat labels logic: show SL/Item on first row of any page
//                     if (data.section === 'body' && (data.column.index === 0 || data.column.index === 1)) {
//                         if (data.row.index !== 0) {
//                             data.cell.text = [""]; 
//                         }
//                     }
//                 },
//                 didDrawCell: (data) => {
//                     if (data.section === 'body' && data.column.index === 1 && data.cell.text[0] !== "") {
//                         if (!itemIndexMap.find(e => e.item === data.cell.text[0])) {
//                             itemIndexMap.push({ 
//                                 slNo: data.row.cells[0].text[0], 
//                                 item: data.cell.text[0], 
//                                 pageNo: doc.internal.getNumberOfPages() 
//                             });
//                         }
//                     }
//                     if (data.column.index === 12 && data.cell.raw.data) {
//                         const imgDim = Math.min(data.cell.width - 2, data.cell.height - 2);
//                         doc.addImage(data.cell.raw.data, "JPEG", data.cell.x + (data.cell.width/2) - (imgDim/2), data.cell.y + (data.cell.height/2) - (imgDim/2), imgDim, imgDim);
//                     }
//                 },
//                 didDrawPage: (data) => {
//                     if (logoBase64) {
//                         doc.saveGraphicsState();
//                         doc.setGState(new doc.GState({opacity: 0.05}));
//                         doc.addImage(logoBase64, 'PNG', 60, 60, 160, 80, null, null, 45);
//                         doc.restoreGraphicsState();
//                     }
//                 }
//             });
//             currentY = doc.lastAutoTable.finalY;
//         }

//         // 3. INDEX GENERATION
//         const dataPagesCount = doc.internal.getNumberOfPages();
//         const tempDoc = new JsPDF({ orientation: 'landscape' });
//         autoTable(tempDoc, { body: itemIndexMap.map(e => [e.slNo, e.item, '0']), startY: 30 });
//         const indexPagesCount = tempDoc.internal.getNumberOfPages();

//         doc.addPage();
//         doc.setFontSize(18);
//         doc.text("Index / Table of Contents", 148, 20, { align: 'center' });
//         autoTable(doc, {
//             startY: 30,
//             head: [['SL No', 'Product Name', 'Page']],
//             body: itemIndexMap.map(e => [
//                 { content: e.slNo }, 
//                 { content: e.item }, 
//                 { content: `Page ${e.pageNo + indexPagesCount}`, pageTarget: e.pageNo + indexPagesCount }
//             ]),
//             theme: 'striped',
//             didDrawCell: (data) => {
//                 if (data.section === 'body' && data.column.index === 2) {
//                     const target = data.cell.raw.pageTarget;
//                     if (target) doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { pageNumber: target });
//                 }
//             }
//         });

//         for (let i = 0; i < indexPagesCount; i++) {
//             doc.movePage(doc.internal.getNumberOfPages(), 1);
//         }

//         // 4. FOOTERS
//         const totalPages = doc.internal.getNumberOfPages();
//         for (let i = 1; i <= totalPages; i++) {
//             doc.setPage(i);
//             doc.setFontSize(10);
//             doc.setTextColor(150);
//             doc.text(`Page ${i} of ${totalPages}`, 280, 200, { align: 'right' });
//         }

//         doc.save(`PriceList_Final_NoSplitGroups.pdf`);
//         message.success({ content: 'PDF Generated: Groups moved to fresh pages!', key });

//     } catch (error) {
//         console.error("PDF Error:", error);
//         message.error({ content: 'Failed to generate PDF', key });
//     } finally { setIsProcessing(false); }
// };





//   // ---------------------------------------------
//   // --- Share as Paginated Image (FIXED: Crisp Data, Faded Logo) ---
//   // ---------------------------------------------
//   const handleShareImage = async () => {
//     if (selectedRows.length === 0) { message.error("No items selected to share."); return; }
//     if (!html2canvas) { message.error("Image generation library not ready."); return; }

//     setIsProcessing(true);
//     const key = 'share-image-process';
//     message.loading({ content: '1/3. Preparing data...', key });

//     const groupedSelectedData = getGroupedData(selectedRows.sort((a, b) => a.sl_no - b.sl_no));
//     const pageBoundaries = getGroupAwareImagePageBoundaries(groupedSelectedData, IMAGE_PAGE_SIZE);
//     const pageCount = pageBoundaries.length;
//     const imageFiles = [];

//     try {
//         const element = imagePreviewRef.current;
//         if (!element) { message.error({ content: 'Failed to find rendering element.', key }); return; }

//         // --- IMAGE WATERMARK FIX (Reset Parent Styles) ---
//         // Ensure the root element has no interfering styles like opacity or background image
//         element.style.opacity = 1; 
//         element.style.backgroundColor = '#ffffff'; 
//         element.style.backgroundImage = 'none'; 
//         // --- END FIX ---

//         // 1. Loop through pages and generate images
//         for (let i = 0; i < pageCount; i++) {
//             const { start: startIndex, end: endIndex } = pageBoundaries[i];
//             const pageData = groupedSelectedData.slice(startIndex, endIndex);

//             message.loading({ content: `2/3. Generating Image Page ${i + 1} of ${pageCount}...`, key });

//             // Manually set the content of the hidden ref for the current page
//             element.innerHTML = `
//                 <h2 style="text-align: center; margin-bottom: 10px; color: #333;">Selected Price List (Page ${i + 1} of ${pageCount})</h2>

//                 ${logoBase64 ? `
//                     <div style="
//                         position: absolute; 
//                         top: 0; 
//                         left: 0; 
//                         width: 100%; 
//                         height: 100%; 
//                         // background-image: url(${logoBase64});
//                         background-repeat: no-repeat;
//                         background-position: center center;
//                         background-size: 300px;
//                         opacity: 0.15; /* Logo is faint */
//                         pointer-events: none;
//                         z-index: 2; /* Low Z-index */
//                     "></div>
//                 ` : ''}
//                 <div style="position: relative; z-index: 2; background-color: white; padding-top: 50px;">
//                     <table class="${styles.imageTable}">
//                         <thead>
//                             <tr style="background-color: #f8f9fa !important;">
//             <th style="width: 60px;">SL No</th>
//             <th style="width: 250px; text-align: left; padding-left: 15px;">Item</th>
//             <th style="width: 250px;">Brand</th>
//             <th>Single</th>
//             <th>5+</th>
//             <th>10+</th>
//             <th>20+</th>
//             <th>50+</th>
//             <th>100+</th>
//             <th>GST</th>
//             <th>MRP</th>
//             <th>Warranty</th>
//             <th style="width: 80px;">Image</th>
//         </tr>
//                         </thead>
//                         <tbody>
//                             ${pageData.map((row, idx) => `
//                                 <tr key=${row.key || idx}>
//                                     <td rowspan="${row.rowSpan > 0 ? row.rowSpan : 1}" style="display: ${row.rowSpan === 0 ? 'none' : 'table-cell'};">${row.sl_no}</td>
//                                     <td rowspan="${row.rowSpan > 0 ? row.rowSpan : 1}" style="display: ${row.rowSpan === 0 ? 'none' : 'table-cell'};">${row.items}</td>
//                                     <td>${row.brand || '-'}</td>
//                                     <td>${formatPrice(row.single)}</td>
//                                     <td>${formatPrice(row.qty_5_plus)}</td>
//                                     <td>${formatPrice(row.qty_10_plus)}</td>
//                                     <td>${formatPrice(row.qty_20_plus)}</td>
//                                     <td>${formatPrice(row.qty_50_plus)}</td>
//                                     <td>${formatPrice(row.qty_100_plus)}</td>
//                                     <td>${formatGST(row.gst)}</td>
//                                     <td>${formatPrice(row.mrp)}</td>
//                                     <td>${row.warranty || '-'}</td>
//                                     <td>
//                                         ${row.product_image ? `<img src="${row.product_image}" alt="Product" style="width: 50px; height: 50px; object-fit: contain;" crossorigin="anonymous" />` : ''}
//                                     </td>
//                                 </tr>
//                             `).join('')}
//                         </tbody>
//                     </table>
//                 </div>
//             `;

//             // Convert to Canvas and then Blob
//             const canvas = await html2canvas(element, {
//                 scale: 3, 
//                 useCORS: true, 
//                 allowTaint: true,
//                 backgroundColor: '#ffffff',
//                 removeContainer: false 
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

//             const downloadLinks = imageFiles.map((file, index) => {
//                 const url = URL.createObjectURL(file);
//                 return `<p><a href="${url}" download="${file.name}" target="_blank" style="padding: 8px; margin: 4px; border: 1px solid blue; text-decoration: none; display: block;">Download Page ${index + 1} (${file.name})</a></p>`;
//             }).join('');

//             message.info({
//                 content: (
//                     <div>
//                         <p style={{ fontWeight: 'normal' }}>To share, please download the pages individually:</p>
//                         <div dangerouslySetInnerHTML={{ __html: downloadLinks }} /> 
//                     </div>
//                 ),
//                 duration: 15,
//                 key: 'share-fallback'
//             });

//             setTimeout(() => { imageFiles.forEach(file => URL.revokeObjectURL(file.url)); }, 10000);
//         }

//     } catch (error) {
//         console.error("PAGINATED IMAGE SHARE CRASH DETAILS:", error);
//         message.error({ content: `Image sharing failed: ${error.message}`, key });
//     } finally { 
//         // Cleanup the temporary content and styles
//         if (imagePreviewRef.current) {
//             imagePreviewRef.current.innerHTML = '';
//             // Reset custom styles
//             imagePreviewRef.current.style.backgroundImage = 'none';
//             imagePreviewRef.current.style.opacity = 1;
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
//             Share Whatsapp ({selectedRows.length})
//           </Button>

//           <Button 
//             type="primary" 
//             danger 
//             onClick={handleSaveAsPdf} 
//             loading={isProcessing} 
//             disabled={selectedRows.length === 0 || !JsPDF}
//           >
//             Save as PDF ({selectedRows.length})
//           </Button>
//         </Space>
//         <Input.Search placeholder="Search by Item or Brand" allowClear onSearch={handleSearch} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: 200 }} />
//       </Space>

//       {/* --- HIDDEN HTML DIV FOR IMAGE GENERATION (IMPORTANT: position: relative) --- */}
//       <div 
//         ref={imagePreviewRef} 
//         style={{ 
//             position: 'absolute', 
//             top: '-9999px', 
//             left: '-9999px', 
//             padding: '10px', 
//             backgroundColor: 'white', 
//             width: '1200px',
//             position: 'relative' /* CRITICAL: Allows absolute positioning of the watermark */
//         }}
//       >
//       </div>
//       {/* --- END HIDDEN HTML DIV --- */}


//       <div ref={visibleTableRef}>
//         <Table 
//             className={styles.responsivePriceTable}
//             columns={columns} 
//             dataSource={paginatedData} 
//             loading={loading} 
//             rowKey="id" 
//             pagination={false} 
//             scroll={{ x: 'max-content' }} 
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
// // Assuming you have a styles file for image table CSS
// import styles from './pricelist.module.css'; 
// import dynamic from 'next/dynamic';
// import { pdf } from '@react-pdf/renderer';
// import PriceListDocument from './PriceListDocument'; // Import your template
// import { PDFDocument, PDFName } from "pdf-lib";





// // ===============================================
// // GLOBAL CONFIGURATION
// // ===============================================
// const PAGE_SIZE_HINT = 15;
// const IMAGE_PAGE_SIZE = 15;

// // 🚨 YOUR LOGO URL
// const LOGO_URL = 'https://res.cloudinary.com/dusbkxi2q/image/upload/v1765445020/LOGO_black_gyzneu.png'; 
// // ===============================================

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

//   const sortedData = [...data].sort((a, b) => {
//     if (a.sl_no !== b.sl_no) return a.sl_no - b.sl_no;
//     const aItems = a.items || '';
//     const bItems = b.items || '';
//     return aItems.localeCompare(bItems) || (a.brand || '').localeCompare(b.brand || '');
//   });

//   for (let i = 0; i < sortedData.length; i++) {
//     const currentItem = sortedData[i];
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
//     if (isNaN(numericPrice) || numericPrice <= 0) return '-';
//     return `${numericPrice}`; 
// };

// // const formatGST = (gst) => (gst > 0 ? `${gst}%` : '-');

// const formatGST = (gst) => {
//   const numericGst = parseFloat(gst);
//   if (isNaN(numericGst) || numericGst <= 0) return '-';
//   return `${numericGst}%`;
// };

// const getGroupAwareImagePageBoundaries = (groupedData, pageSize) => {
//     if (!groupedData || groupedData.length === 0) return [];
//     const boundaries = [];
//     let startIndex = 0;
//     while (startIndex < groupedData.length) {
//         let pageEnd = startIndex;
//         const targetEndIndex = Math.min(startIndex + pageSize, groupedData.length);
//         while (pageEnd < targetEndIndex) {
//             const row = groupedData[pageEnd];
//             if (row.isGroupStart && (pageEnd + row.rowSpan > targetEndIndex) && pageEnd > startIndex) break;
//             pageEnd++;
//         }
//         if (pageEnd < groupedData.length && !groupedData[pageEnd].isGroupStart) {
//             while (pageEnd < groupedData.length && !groupedData[pageEnd].isGroupStart) pageEnd++;
//         }
//         if (pageEnd === startIndex) pageEnd = targetEndIndex;
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
//   { title: 'Image', dataIndex: 'product_image', key: 'product_image', align: 'center', render: (imageUrl) => (imageUrl ? <Image src={imageUrl} alt="Product" style={{ maxWidth: '60px', maxHeight: '60px', objectFit: 'cover' }} crossOrigin="anonymous" /> : '-'), width: 80 },
// ];

// const useGroupAwarePagination = (groupedData, currentPage, pageSizeHint) => {
//     const [pageBoundaries, setPageBoundaries] = useState([]);
//     useEffect(() => {
//         if (!groupedData || groupedData.length === 0) { setPageBoundaries([]); return; }
//         const boundaries = [];
//         let startIndex = 0;
//         while (startIndex < groupedData.length) {
//             let pageEnd = startIndex;
//             const targetEndIndex = Math.min(startIndex + pageSizeHint, groupedData.length);
//             while (pageEnd < targetEndIndex) {
//                 if (groupedData[pageEnd].isGroupStart) {
//                     const groupSize = groupedData[pageEnd].rowSpan;
//                     if (pageEnd + groupSize > targetEndIndex && pageEnd > startIndex) break; 
//                 }
//                 pageEnd++;
//             }
//             if (pageEnd < groupedData.length && !groupedData[pageEnd].isGroupStart) {
//                 while (pageEnd < groupedData.length && !groupedData[pageEnd].isGroupStart) pageEnd++;
//             }
//             if (pageEnd === startIndex) pageEnd = targetEndIndex;
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

// export default function Home() {
//   const [allProducts, setAllProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [JsPDF, setJsPDF] = useState(null);
//   const [html2canvas, setHtml2Canvas] = useState(null); 
//   const [logoBase64, setLogoBase64] = useState(''); 
//   const [selectedRowKeys, setSelectedRowKeys] = useState([]);
//   const [selectedRows, setSelectedRows] = useState([]); 

//   const visibleTableRef = useRef(null);
//   const imagePreviewRef = useRef(null); 
//   const [currentPage, setCurrentPage] = useState(1);

//   const fetchProducts = useCallback(async () => {
//     setLoading(true);
//     const { data, error } = await supabase.from("products").select("*").order("sl_no", { ascending: true }).order("items", { ascending: true });
//     if (!error) setAllProducts(data.map(item => ({ ...item, key: item.id })));
//     setLoading(false);
//   }, []);

//   useEffect(() => { 
//     fetchProducts(); 
//     const channel = supabase.channel('realtime-products-home').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => { fetchProducts(); }).subscribe();
//     return () => { supabase.removeChannel(channel); };
//   }, [fetchProducts]);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       import('jspdf').then(module => { setJsPDF(() => module.jsPDF || module.default); });
//       import('html2canvas').then(module => { setHtml2Canvas(() => module.default || module); });
//       const loadLogo = async () => { if (LOGO_URL) { const base64 = await urlToBase64(LOGO_URL); setLogoBase64(base64); } };
//       loadLogo();
//     }
//   }, []);

//   const allFilteredProducts = useMemo(() => 
//     allProducts.filter(p => !searchTerm || p.items?.toLowerCase().includes(searchTerm.toLowerCase()) || p.brand?.toLowerCase().includes(searchTerm.toLowerCase()))
//   , [allProducts, searchTerm]);

//   const allFilteredKeys = useMemo(() => allFilteredProducts.map(item => item.key), [allFilteredProducts]);
//   const filteredAndGroupedData = useMemo(() => getGroupedData(allFilteredProducts), [allFilteredProducts]);

//   const { currentData: paginatedData, pageCount } = useGroupAwarePagination(filteredAndGroupedData, currentPage, PAGE_SIZE_HINT);
//   const visibleKeys = useMemo(() => paginatedData.map(item => item.key), [paginatedData]);

//   const handleSearch = (value) => { setSearchTerm(value); setCurrentPage(1); };
//   const handlePageChange = (page) => { setCurrentPage(page); };

//   const handleSelectAllFiltered = () => {
//     setSelectedRowKeys(allFilteredKeys);
//     setSelectedRows(allFilteredProducts);
//     message.success(`Selected ${allFilteredKeys.length} items.`);
//   };

//   const handleClearSelection = () => { setSelectedRowKeys([]); setSelectedRows([]); message.info("Cleared."); };

//   const onSelectChange = (keys, rows) => {
//       setSelectedRowKeys(keys);
//       setSelectedRows(rows);
//   };

//   const rowSelection = { selectedRowKeys, onChange: onSelectChange, columnWidth: 50 };

//   // --- EXACT PDF FUNCTION FIX ---
// // const handleSaveAsPdf = async () => {
// //   setIsProcessing(true);
// //   try {
// //     const groupedData = getGroupedData(selectedRows);

// //     // Non-fixed logic: Only identifies start/end of real data groups
// //     const processedData = groupedData.map((row, index) => {
// //       const nextRow = groupedData[index + 1];

// //       // If the next row is a different item or doesn't exist, it's the end of a group
// //       const isEndOfGroup = !nextRow || nextRow.isGroupStart;

// //       return { 
// //         ...row, 
// //         isEndOfGroup: isEndOfGroup 
// //       };
// //     });

// //     const blob = await pdf(<PriceListDocument data={processedData} />).toBlob();
// //     const url = URL.createObjectURL(blob);
// //     const link = document.createElement('a');
// //     link.href = url;
// //     link.download = `PriceList.pdf`;
// //     link.click();
// //     URL.revokeObjectURL(url);
// //   } catch (err) {
// //     console.error("PDF Generation failed:", err);
// //   } finally {
// //     setIsProcessing(false);
// //   }
// // };











// const handleSaveAsPdf = async () => {
//   setIsProcessing(true);
//   const discoveredPages = {}; 

//   // Function to capture page numbers
//   const onDiscoverPage = (name, pageNum) => {
//     if (!discoveredPages[name]) {
//       discoveredPages[name] = pageNum;
//     }
//   };

//   try {
//     const groupedData = getGroupedData(selectedRows);

//     // --- PASS 1 ---
//     const discoveryInstance = pdf(
//       <PriceListDocument data={groupedData} onDiscoverPage={onDiscoverPage} actualPageMap={null} />
//     );
//     await discoveryInstance.toBlob(); // Force layout engine to run

//     // IMPORTANT: A small pause to let the JS event loop finish all 'render' callbacks
//     await new Promise(r => setTimeout(r, 300));

//     // --- PASS 2 ---
//     const finalInstance = pdf(
//       <PriceListDocument data={groupedData} actualPageMap={discoveredPages} onDiscoverPage={null} />
//     );
//     const finalBlob = await finalInstance.toBlob();

//     // --- TRIGGER DOWNLOAD ---
//     const url = URL.createObjectURL(finalBlob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = `PriceList_${Date.now()}.pdf`;
//     document.body.appendChild(link); // Must append to body for some browsers
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);

//     message.success("Success!");
//   } catch (err) {
//     console.error("PDF Error:", err);
//     message.error("PDF generation failed. Check console for image errors.");
//   } finally {
//     setIsProcessing(false);
//   }
// };















//   const handleShareImage = async () => {
//     // (Your existing handleShareImage logic stays exactly here)
//     if (selectedRows.length === 0) return;
//     setIsProcessing(true);
//     // ... all your existing logic for whatsapp sharing ...
//     setIsProcessing(false);
//   };

//   const totalFilteredRows = filteredAndGroupedData.length;
//   const currentPageDataSize = paginatedData.length;
//   const startRange = currentPageDataSize > 0 ? filteredAndGroupedData.indexOf(paginatedData[0]) + 1 : 0;
//   const endRange = startRange > 0 ? startRange + currentPageDataSize - 1 : 0;

//   return (
//     <div style={{ padding: 20 }}>
//       <h1>Product Price List</h1>
//       <Space style={{ marginBottom: 20, width: '100%', justifyContent: 'space-between' }}>
//         <Space size="middle">
//           <Link href="/add-product"><Button type="primary">+ Add New Product</Button></Link>
//           <Link href="/manage-products"><Button type="default">Manage Products</Button></Link>
//           <Link href="/manage-items"><Button type="dashed">Manage Item List</Button></Link>
//           <Button onClick={handleSelectAllFiltered} disabled={isProcessing || allFilteredKeys.length === 0}>Select All Filtered ({allFilteredKeys.length})</Button>
//           <Button onClick={handleClearSelection} disabled={isProcessing || selectedRows.length === 0}>Clear Selection</Button>
//           <Button type="ghost" style={{ backgroundColor: 'green', color: 'white', borderColor: 'green' }} onClick={handleShareImage} loading={isProcessing} disabled={selectedRows.length === 0}>Share Whatsapp ({selectedRows.length})</Button>
//           <Button type="primary" danger onClick={handleSaveAsPdf} loading={isProcessing} disabled={selectedRows.length === 0 || !JsPDF}>Save as PDF ({selectedRows.length})</Button>
//         </Space>
//         <Input.Search placeholder="Search by Item or Brand" allowClear onSearch={handleSearch} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: 200 }} />
//       </Space>

//       <div ref={imagePreviewRef} style={{ position: 'absolute', top: '-9999px', left: '-9999px', padding: '10px', backgroundColor: 'white', width: '1200px' }}></div>

//       {/* FIX: Ensure the ref is attached to the div surrounding the table */}
//       <div ref={visibleTableRef}>
//         <Table 
//             className={styles.responsivePriceTable}
//             columns={columns} 
//             dataSource={paginatedData} 
//             loading={loading} 
//             rowKey="id" 
//             pagination={false} 
//             scroll={{ x: 'max-content' }} 
//             rowSelection={rowSelection} 
//             bordered
//         />
//       </div>

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













////===========/////////==========working  code below/////////===========/////////========//







// import { useEffect, useState, useCallback, useMemo, useRef } from "react";
// // Ensure this path is correct for your Supabase client setup
// import { supabase } from "../lib/supabaseClient"; 
// import { Table, Image, Button, Space, Input, message, Pagination } from "antd";
// import Link from "next/link";
// // Assuming you have a styles file for image table CSS
// import styles from './pricelist.module.css'; 
// import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';


// // ===============================================
// // GLOBAL CONFIGURATION
// // ===============================================
// const PAGE_SIZE_HINT = 15;
// const IMAGE_PAGE_SIZE = 15;

// // 🚨 YOUR LOGO URL
// const LOGO_URL = 'https://res.cloudinary.com/dusbkxi2q/image/upload/v1769493205/product_images/dlq4igdaovrf23qnb6gn.png'; 
// // ===============================================

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
//   const [logoBase64, setLogoBase64] = useState(''); 

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

//   // useEffect(() => { fetchProducts(); }, [fetchProducts]);


// // --- 🚀 AUTOLOAD (REALTIME) LOGIC INTEGRATED HERE ---
//   useEffect(() => { 
//     fetchProducts(); 

//     const channel = supabase
//       .channel('realtime-products-home')
//       .on('postgres_changes', 
//         { event: '*', schema: 'public', table: 'products' }, 
//         (payload) => {
//           console.log('Realtime update:', payload);
//           fetchProducts(); 
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [fetchProducts]);



//   // Load libraries dynamically and load logo
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       import('jspdf').then(module => { setJsPDF(() => module.jsPDF || module.default); });
//       import('html2canvas').then(module => { setHtml2Canvas(() => module.default || module); });

//       // --- Load Logo ---
//       const loadLogo = async () => {
//           if (LOGO_URL) {
//               const base64 = await urlToBase64(LOGO_URL);
//               setLogoBase64(base64);
//           }
//       };
//       loadLogo();
//       // -------------------
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
//     setCurrentPage(1); 
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
//  //  // --- PDF Generation with Watermark (Data is Crisp) ---
//  // ---------------------------------------------







// // const handleSaveAsPdf = async () => {
// //   if (!JsPDF) return message.error("PDF library not ready");
// //   if (!selectedRows.length) return message.error("No items selected");

// //   setIsProcessing(true);

// //   try {
// //     const { default: autoTable } = await import("jspdf-autotable");
// //     const doc = new JsPDF("landscape", "mm", "a4", true);

// //     // 1. PREPARE DATA & GROUPS
// //     const tableData = [...selectedRows].sort((a, b) => Number(a.sl_no) - Number(b.sl_no));
// //     const grouped = {};
// //     tableData.forEach(r => {
// //       const k = `${r.sl_no}__${r.items}`;
// //       if (!grouped[k]) grouped[k] = [];
// //       grouped[k].push(r);
// //     });

// //     // 2. BUILD BODY ROWS WITH EMBEDDED IMAGE DATA
// //     const bodyRows = [];
// //     Object.values(grouped).forEach(group => {
// //       group.forEach((row, i) => {
// //         const tableRow = [];
// //         if (i === 0) {
// //           tableRow.push({ content: row.sl_no, rowSpan: group.length });
// //           tableRow.push({ content: row.items, rowSpan: group.length });
// //         }

// //         // Define the row structure
// //         const rowData = [
// //           row.brand || "-",
// //           formatPrice(row.single),
// //           formatPrice(row.qty_5_plus),
// //           formatPrice(row.qty_10_plus),
// //           formatPrice(row.qty_20_plus),
// //           formatPrice(row.qty_50_plus),
// //           formatPrice(row.qty_100_plus),
// //           formatGST(row.gst),
// //           formatPrice(row.mrp),
// //           row.warranty || "-",
// //           { content: "", _image: row.image } // Store image directly in cell object
// //         ];

// //         tableRow.push(...rowData);
// //         bodyRows.push(tableRow);
// //       });
// //     });

// //     // 3. CALCULATE INDEX PAGES (To avoid starting data on Page 1)
// //     const allUniqueItems = Object.keys(grouped).map(k => k.split('__')[1]).sort((a, b) => a.localeCompare(b));
// //     const itemsPerIndexPage = 32 * 2; 
// //     const totalIndexPages = Math.ceil(allUniqueItems.length / itemsPerIndexPage);
// //     const cleanItemName = (row.items || "").replace(/\n/g, " ").trim();

// //     // Create blank pages for the index so data starts later
// //     for (let i = 0; i < totalIndexPages; i++) {
// //       if (i > 0) doc.addPage();
// //     }
// //     doc.addPage(); // Move to next page for data

// //     const indexMap = {};

// //     // 4. DRAW MAIN DATA TABLE
// //     autoTable(doc, {
// //       head: [["SL","Item","Brand","Single","5+","10+","20+","50+","100+","GST","MRP","Warranty","Photo"]],
// //       body: bodyRows,
// //       startY: 15,
// //       theme: "grid",
// //       styles: { fontSize: 7.5, halign: "center", valign: "middle", cellPadding: 1.5 },
// //       headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: "bold" },
// //       columnStyles: {
// //         0: { cellWidth: 10 }, 1: { cellWidth: 45 }, 2: { cellWidth: 35 },
// //         12: { cellWidth: 22 } // Photo column
// //       },
// //       didDrawCell: data => {
// //         // Record page number for the Index
// //         if (data.section === "body" && data.column.index === 1 && data.cell.raw?.content) {
// //           const itemName = data.cell.raw.content;
// //           if (!indexMap[itemName]) indexMap[itemName] = doc.internal.getCurrentPageInfo().pageNumber;
// //         }

// //         // Render Image from cell metadata
// //         if (data.section === 'body' && data.column.index === 12) {
// //           const imgData = data.cell.raw?._image;
// //           if (imgData) {
// //             try {
// //               doc.addImage(imgData, 'JPEG', data.cell.x + 2, data.cell.y + 1, 18, 13, undefined, 'FAST');
// //             } catch (e) {
// //               console.error("Image Draw Error", e);
// //             }
// //           }
// //         }
// //       },
// //       didDrawPage: () => {
// //         if (logoBase64) {
// //           doc.saveGraphicsState();
// //           doc.setGState(new doc.GState({ opacity: 0.06 }));
// //           doc.addImage(logoBase64, "PNG", 90, 70, 120, 60, undefined, 'FAST');
// //           doc.restoreGraphicsState();
// //         }
// //       }
// //     });

// //     // 5. FILL THE INDEX PAGES AT THE START
// //     for (let i = 0; i < totalIndexPages; i++) {
// //       doc.setPage(i + 1);
// //       doc.setFontSize(16).text("Product Index", 148, 15, { align: "center" });

// //       const startIdx = i * itemsPerIndexPage;
// //       const pageItems = allUniqueItems.slice(startIdx, startIdx + itemsPerIndexPage);
// //       const mid = Math.ceil(pageItems.length / 2);

// //       const indexBody = [];
// //       for (let j = 0; j < mid; j++) {
// //         const left = pageItems[j];
// //         const right = pageItems[j + mid];

// //         indexBody.push([
// //           left ? `${left} ${".".repeat(Math.max(2, 55 - left.length))} ${indexMap[left] || ""}` : "",
// //           right ? `${right} ${".".repeat(Math.max(2, 55 - right.length))} ${indexMap[right] || ""}` : ""
// //         ]);
// //       }

// //       autoTable(doc, {
// //         startY: 25,
// //         body: indexBody,
// //         styles: { fontSize: 9 },
// //         columnStyles: { 0: { cellWidth: 130 }, 1: { cellWidth: 130 } },
// //         didDrawCell: data => {
// //           const txt = data.cell.text[0];
// //           const match = txt?.match(/(\d+)$/);
// //           if (match) {
// //             doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { pageNumber: Number(match[1]) });
// //           }
// //         }
// //       });
// //     }

// //     // 6. FINAL NUMBERING
// //     const total = doc.internal.getNumberOfPages();
// //     for (let i = 1; i <= total; i++) {
// //       doc.setPage(i);
// //       doc.setFontSize(9).text(`Page ${i} of ${total}`, 285, 205, { align: "right" });
// //     }

// //     doc.save("PriceList_With_Index.pdf");
// //     message.success("PDF Generated Successfully");

// //   } catch (err) {
// //     console.error(err);
// //     message.error("PDF generation failed");
// //   } finally {
// //     setIsProcessing(false);
// //   }
// // };


















// // const handleSaveAsPdf = async () => {
// //   if (!JsPDF) return message.error("PDF library not ready");
// //   if (!selectedRows.length) return message.error("No items selected");

// //   setIsProcessing(true);

// //   try {
// //     const { default: autoTable } = await import("jspdf-autotable");
// //     const doc = new JsPDF("landscape", "mm", "a4", true);

// //     // 1. PREPARE DATA & GROUPS
// //     const tableData = [...selectedRows].sort((a, b) => Number(a.sl_no) - Number(b.sl_no));
// //     const grouped = {};
// //     tableData.forEach(r => {
// //       const k = `${r.sl_no}__${r.items}`;
// //       if (!grouped[k]) grouped[k] = [];
// //       grouped[k].push(r);
// //     });

// //     // 2. BUILD BODY ROWS WITH EMBEDDED IMAGE DATA
// //     const bodyRows = [];
// //     Object.values(grouped).forEach(group => {
// //       group.forEach((row, i) => {
// //         const tableRow = [];
// //         if (i === 0) {
// //           tableRow.push({ content: row.sl_no, rowSpan: group.length });
// //           tableRow.push({ content: row.items, rowSpan: group.length });
// //         }

// //         // Define the row structure
// //         const rowData = [
// //           row.brand || "-",
// //           formatPrice(row.single),
// //           formatPrice(row.qty_5_plus),
// //           formatPrice(row.qty_10_plus),
// //           formatPrice(row.qty_20_plus),
// //           formatPrice(row.qty_50_plus),
// //           formatPrice(row.qty_100_plus),
// //           formatGST(row.gst),
// //           formatPrice(row.mrp),
// //           row.warranty || "-",
// //           { content: "", _image: row.image } // Store image directly in cell object
// //         ];

// //         tableRow.push(...rowData);
// //         bodyRows.push(tableRow);
// //       });
// //     });

// //     // 3. CALCULATE INDEX PAGES (To avoid starting data on Page 1)




// //     // const allUniqueItems = Object.keys(grouped).map(k => k.split('__')[1]).sort((a, b) => a.localeCompare(b));
// //     // const itemsPerIndexPage = 32 * 2; 
// //     // const totalIndexPages = Math.ceil(allUniqueItems.length / itemsPerIndexPage);
// //     // const cleanItemName = (row.items || "").replace(/\n/g, " ").trim();

// //     // // Create blank pages for the index so data starts later
// //     // for (let i = 0; i < totalIndexPages; i++) {
// //     //   if (i > 0) doc.addPage();
// //     // }
// //     // doc.addPage(); // Move to next page for data

// //     // const indexMap = {};





// //               // const allUniqueItems = Object.keys(grouped)
// //               //     .map(k => k.split('__')[1].replace(/\n/g, " ").trim()) 
// //               //     .sort((a, b) => a.localeCompare(b));

// //               //   const itemsPerIndexPage = 32 * 2; 
// //               //   const totalIndexPages = Math.ceil(allUniqueItems.length / itemsPerIndexPage);

// //               //   for (let i = 0; i < totalIndexPages; i++) {
// //               //     if (i > 0) doc.addPage();
// //               //   }
// //               //   doc.addPage(); 

// //               //   const indexMap = {};







// // // 3. CALCULATE INDEX VARIABLES (CRITICAL FIX: Variables must be defined here)
// //     const allUniqueItems = Object.keys(grouped)
// //       .map(k => k.split('__')[1].replace(/\n/g, " ").trim()) 
// //       .sort((a, b) => a.localeCompare(b));

// //     const itemsPerIndexPage = 32 * 2; 
// //     const totalIndexPages = Math.ceil(allUniqueItems.length / itemsPerIndexPage);
// //     const indexMap = {};

// //     // Create blank pages at the start for the index
// //     for (let i = 0; i < totalIndexPages; i++) {
// //       if (i > 0) doc.addPage();
// //     }
// //     doc.addPage(); // Move to next page to start the data table









// //     // 4. DRAW MAIN DATA TABLE
// //     autoTable(doc, {
// //       head: [["SL","Item","Brand","Single","5+","10+","20+","50+","100+","GST","MRP","Warranty","Photo"]],
// //       body: bodyRows,
// //       startY: 15,
// //       theme: "grid",
// //       styles: { fontSize: 7.5, halign: "center", valign: "middle", cellPadding: 1.5 },
// //       headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: "bold" },
// //       columnStyles: {
// //         0: { cellWidth: 10 }, 1: { cellWidth: 45 }, 2: { cellWidth: 35 },
// //         12: { cellWidth: 22 } // Photo column
// //       },
// //       didDrawCell: data => {
// //         // Record page number for the Index
// //         if (data.section === "body" && data.column.index === 1 && data.cell.raw?.content) {
// //           const itemName = data.cell.raw.content;
// //           if (!indexMap[itemName]) indexMap[itemName] = doc.internal.getCurrentPageInfo().pageNumber;
// //         }

// //         // Render Image from cell metadata
// //         if (data.section === 'body' && data.column.index === 12) {
// //           const imgData = data.cell.raw?._image;
// //           if (imgData) {
// //             try {
// //               doc.addImage(imgData, 'JPEG', data.cell.x + 2, data.cell.y + 1, 18, 13, undefined, 'FAST');
// //             } catch (e) {
// //               console.error("Image Draw Error", e);
// //             }
// //           }
// //         }
// //       },
// //       didDrawPage: () => {
// //         if (logoBase64) {
// //           doc.saveGraphicsState();
// //           doc.setGState(new doc.GState({ opacity: 0.06 }));
// //           doc.addImage(logoBase64, "PNG", 90, 70, 120, 60, undefined, 'FAST');
// //           doc.restoreGraphicsState();
// //         }
// //       }
// //     });






// //   //  // 5. FILL THE INDEX PAGES (Now that indexMap is populated)
// //   //   for (let i = 0; i < totalIndexPages; i++) {
// //   //     doc.setPage(i + 1);
// //   //     doc.setFontSize(14).text("Product Index", 148, 15, { align: "center" });

// //   //     const startIdx = i * itemsPerIndexPage;
// //   //     const pageItems = allUniqueItems.slice(startIdx, startIdx + itemsPerIndexPage);
// //   //     const mid = Math.ceil(pageItems.length / 2);

// //   //     const indexBody = [];
// //   //     for (let j = 0; j < mid; j++) {
// //   //       const left = pageItems[j];
// //   //       const right = pageItems[j + mid];

// //   //       const getP = (it) => it ? (indexMap[it] || "") : "";

// //   //       // RIGHT ALIGNMENT & DOT FILL LOGIC
// //   //       const formatLine = (name) => {
// //   //         if (!name) return "";
// //   //         const pNo = getP(name).toString();
// //   //         // Adjust 60 based on your preference for width
// //   //         const dots = ".".repeat(Math.max(2, 60 - name.length - pNo.length));
// //   //         return `${name} ${dots} ${pNo}`;
// //   //       };

// //   //       indexBody.push([formatLine(left), formatLine(right)]);
// //   //     }

// //   //     autoTable(doc, {
// //   //       startY: 25,
// //   //       body: indexBody,
// //   //       theme: 'plain',
// //   //       // Courier is used for perfect dot alignment
// //   //       styles: { cellPadding: 2, valign: 'middle',fontSize: 8.5, font: "courier", minCellHeight: 9 }, 
// //   //       columnStyles: { 0: { cellWidth: 135 }, 1: { cellWidth: 135 } },
// //   //       didDrawCell: data => {
// //   //         const txt = data.cell.text[0];
// //   //         const match = txt?.match(/(\d+)$/);
// //   //         if (match) {
// //   //           doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { pageNumber: Number(match[1]) });
// //   //         }
// //   //       }
// //   //     });
// //   //   }






// //   // 5. FILL THE INDEX PAGES AT THE START
// // for (let i = 0; i < totalIndexPages; i++) {
// //     doc.setPage(i + 1);
// //     doc.setFontSize(16).text("Product Index", 148, 15, { align: "center" });

// //     const startIdx = i * itemsPerIndexPage;
// //     const pageItems = allUniqueItems.slice(startIdx, startIdx + itemsPerIndexPage);
// //     const mid = Math.ceil(pageItems.length / 2);

// //     const indexBody = [];
// //     for (let j = 0; j < mid; j++) {
// //         const left = pageItems[j];
// //         const right = pageItems[j + mid];

// //         // Use + totalIndexPages if your mapping doesn't account for the added index pages
// //         const getP = (it) => it ? (indexMap[it] || "") : "";

// //         const formatLine = (name) => {
// //             if (!name) return "";
// //             const clean = name.replace(/\n/g, " ").trim();
// //             const pNo = getP(name).toString();
// //             // Use Courier-friendly spacing (approx 60 chars wide)
// //             const dots = ".".repeat(Math.max(2, 60 - clean.length - pNo.length));
// //             return `${clean} ${dots} ${pNo}`;
// //         };

// //         indexBody.push([formatLine(left), formatLine(right)]);
// //     }

// //     // --- CRITICAL CHANGE: This autoTable call is INSIDE the loop ---
// //     // This forces a fresh table on every page with consistent startY
// //     autoTable(doc, {
// //         startY: 25, 
// //         body: indexBody,
// //         theme: 'plain',
// //         pageBreak: "avoid",
// //         styles: { 
// //             cellPadding: 2, 
// //             valign: 'middle', 
// //             fontSize: 8.5, 
// //             font: "courier", 
// //             minCellHeight: 9 // Forces the line spacing you want

// //         }, 
// //         columnStyles: { 0: { cellWidth: 135 }, 1: { cellWidth: 135 } },
// //         // IMPORTANT: tell jspdf not to automatically create new pages 
// //         // because we are managing pages manually in this loop
// //         tableWidth: 'wrap',
// //         didDrawCell: data => {
// //             const txt = data.cell.text[0];
// //             const match = txt?.match(/(\d+)$/);
// //             if (match) {
// //                 doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { pageNumber: Number(match[1]) });
// //             }
// //         }
// //     });
// // }







// //     // 6. FINAL NUMBERING
// //     const total = doc.internal.getNumberOfPages();
// //     for (let i = 1; i <= total; i++) {
// //       doc.setPage(i);
// //       doc.setFontSize(9).text(`Page ${i} of ${total}`, 285, 205, { align: "right" });
// //     }

// //     doc.save("PriceList_With_Index.pdf");
// //     message.success("PDF Generated Successfully");

// //   } catch (err) {
// //     console.error(err);
// //     message.error("PDF generation failed");
// //   } finally {
// //     setIsProcessing(false);
// //   }
// // };










// // const handleSaveAsPdf = async () => {
// //   if (!JsPDF) return message.error("PDF library not ready");
// //   if (!selectedRows.length) return message.error("No items selected");

// //   setIsProcessing(true);
// //   const key = 'pdf-process';
// //   message.loading({ content: 'Preparing High-Quality PDF...', key });

// //   try {
// //     const { default: autoTable } = await import("jspdf-autotable");
// //     const doc = new JsPDF("landscape", "mm", "a4", true);
// //     const indexMap = {};

// //     // 1. PREPARE DATA
// //     const tableData = [...selectedRows].sort((a, b) => Number(a.sl_no) - Number(b.sl_no));
// //     const grouped = {};
// //     tableData.forEach(r => {
// //       const k = `${r.sl_no}__${r.items}`;
// //       if (!grouped[k]) grouped[k] = [];
// //       grouped[k].push(r);
// //     });

// //     const bodyRows = [];
// //     Object.values(grouped).forEach(group => {
// //       group.forEach((row, i) => {
// //         const tableRow = [];
// //         if (i === 0) {
// //           tableRow.push({ content: row.sl_no, rowSpan: group.length });
// //           tableRow.push({ content: row.items, rowSpan: group.length });
// //         }
// //         tableRow.push(...[
// //           row.brand || "-",
// //           formatPrice(row.single),
// //           formatPrice(row.qty_5_plus),
// //           formatPrice(row.qty_10_plus),
// //           formatPrice(row.qty_20_plus),
// //           formatPrice(row.qty_50_plus),
// //           formatPrice(row.qty_100_plus),
// //           formatGST(row.gst),
// //           formatPrice(row.mrp),
// //           row.warranty || "-",
// //           { content: "", _image: row.image }
// //         ]);
// //         bodyRows.push(tableRow);
// //       });
// //     });

// //     // 2. INDEX PRE-CALCULATION
// //     const allUniqueItems = Object.keys(grouped)
// //       .map(k => k.split('__')[1].replace(/\n/g, " ").trim())
// //       .sort((a, b) => a.localeCompare(b));

// //     const itemsPerIndexPage = 30 * 2; // 30 rows per column
// //     const rowsPerPage = 30;
// //     const totalIndexPages = Math.ceil(allUniqueItems.length / itemsPerIndexPage);

// //     // Create blank pages for index
// //     for (let i = 0; i < totalIndexPages; i++) { if (i > 0) doc.addPage(); }
// //     doc.addPage(); 

// //     // 3. DRAW MAIN DATA TABLE
// //     autoTable(doc, {
// //       head: [["SL","Item","Brand","Single","5+","10+","20+","50+","100+","GST","MRP","Warranty","Photo"]],
// //       body: bodyRows,
// //       startY: 15,
// //       theme: "grid",
// //       styles: { fontSize: 7.5, halign: "center", valign: "middle", cellPadding: 1.5 },
// //       headStyles: { fillColor: [33, 150, 243], textColor: 255 },
// //       columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 45 }, 12: { cellWidth: 22 } },


// //       didDrawCell: data => {
// //         if (data.section === "body" && data.column.index === 1 && data.cell.raw?.content) {
// //           const cleanName = data.cell.raw.content.replace(/\n/g, " ").trim();
// //           if (!indexMap[cleanName]) indexMap[cleanName] = doc.internal.getCurrentPageInfo().pageNumber;
// //         }
// //         if (data.section === 'body' && data.column.index === 12 && data.cell.raw?._image) {
// //           try { doc.addImage(data.cell.raw._image, 'JPEG', data.cell.x + 2, data.cell.y + 1, 18, 13, undefined, 'FAST'); } catch (e) {}
// //         }
// //       }
// //     });

// //    // 4. FILL THE INDEX PAGES (Corrected Column Logic)
// //     for (let i = 0; i < totalIndexPages; i++) {
// //       doc.setPage(i + 1);
// //       doc.setFont("helvetica", "bold").setFontSize(16).text("Product Index", 148, 15, { align: "center" });

// //       const startIdx = i * itemsPerIndexPage;
// //       const pageItems = allUniqueItems.slice(startIdx, startIdx + itemsPerIndexPage);

// //       const indexBody = [];
// //       // NEW LOGIC: Loop through rows (max 30) and pick items for Left and Right columns
// //       for (let j = 0; j < rowsPerPage; j++) {
// //         const left = pageItems[j]; // Item 1, 2, 3...
// //         const right = pageItems[j + rowsPerPage]; // Item 31, 32, 33...

// //         if (!left && !right) break; // End of list

// //         const formatLine = (name) => {
// //           if (!name) return "";
// //           const pNo = (indexMap[name] || "").toString();
// //           // Adjust dots for Courier font
// //           const dots = ".".repeat(Math.max(2, 58 - name.length - pNo.length));
// //           return `${name} ${dots} ${pNo}`;
// //         };

// //         indexBody.push([formatLine(left), formatLine(right)]);
// //       }

// //       autoTable(doc, {
// //         startY: 25,
// //         body: indexBody,
// //         theme: 'plain',
// //         styles: { fontSize: 8.5, font: "courier", cellPadding: 2, minCellHeight: 9 },
// //         columnStyles: { 0: { cellWidth: 135 }, 1: { cellWidth: 135 } },
// //         didDrawCell: data => {
// //           const txt = data.cell.text[0];
// //           const match = txt?.match(/(\d+)$/);
// //           if (match) {
// //             doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { pageNumber: Number(match[1]) });
// //           }
// //         }
// //       });
// //     }

// //     // 5. FINAL NUMBERING
// //     const total = doc.internal.getNumberOfPages();
// //     for (let i = 1; i <= total; i++) {
// //       doc.setPage(i);
// //       doc.setFont("helvetica", "normal").setFontSize(9).text(`Page ${i} of ${total}`, 285, 205, { align: "right" });
// //     }

// //     doc.save("EXOR_PriceList_Final.pdf");
// //     message.success({ content: "PDF Generated Successfully", key });

// //   } catch (err) {
// //     console.error(err);
// //     message.error({ content: "Generation Failed", key });
// //   } finally {
// //     setIsProcessing(false);
// //   }
// // };


















// // const handleSaveAsPdf = async () => {
// //   if (!JsPDF) return message.error("PDF library not ready");
// //   if (!selectedRows.length) return message.error("No items selected");

// //   setIsProcessing(true);
// //   const key = 'pdf-process';
// //   message.loading({ content: 'Generating Single-Column Index PDF...', key });

// //   try {
// //     const { default: autoTable } = await import("jspdf-autotable");
// //     const doc = new JsPDF("landscape", "mm", "a4", true);
// //     const indexMap = {};

// //     // 1. DATA PREPARATION
// //     const tableData = [...selectedRows].sort((a, b) => Number(a.sl_no) - Number(b.sl_no));
// //     const grouped = {};
// //     tableData.forEach(r => {
// //       const k = `${r.sl_no}__${r.items}`;
// //       if (!grouped[k]) grouped[k] = [];
// //       grouped[k].push(r);
// //     });

// //     const bodyRows = [];
// //     Object.values(grouped).forEach(group => {
// //       group.forEach((row, i) => {
// //         const tableRow = [];
// //         if (i === 0) {
// //           tableRow.push({ content: row.sl_no, rowSpan: group.length });
// //           tableRow.push({ content: row.items, rowSpan: group.length });
// //         }
// //         tableRow.push(...[
// //           row.brand || "-",
// //           formatPrice(row.single),
// //           formatPrice(row.qty_5_plus),
// //           formatPrice(row.qty_10_plus),
// //           formatPrice(row.qty_20_plus),
// //           formatPrice(row.qty_50_plus),
// //           formatPrice(row.qty_100_plus),
// //           formatGST(row.gst),
// //           formatPrice(row.mrp),
// //           row.warranty || "-",
// //           { content: "", _image: row.image }
// //         ]);
// //         bodyRows.push(tableRow);
// //       });
// //     });

// //     // 2. INDEX CALCULATIONS (1 COLUMN)
// //     const allUniqueItems = Object.keys(grouped)
// //       .map(k => k.split('__')[1].replace(/\n/g, " ").trim())
// //       .sort((a, b) => a.localeCompare(b));

// //     const rowsPerPage = 18; // Reduced to 18 for very clear spacing
// //     const totalIndexPages = Math.ceil(allUniqueItems.length / rowsPerPage);

// //     // Create blank pages
// //     for (let i = 0; i < totalIndexPages; i++) { if (i > 0) doc.addPage(); }
// //     doc.addPage(); 

// //     // 3. DRAW MAIN TABLE (POPULATE MAP)
// //     autoTable(doc, {
// //       head: [["SL","Item","Brand","Single","5+","10+","20+","50+","100+","GST","MRP","Warranty","Photo"]],
// //       body: bodyRows,
// //       startY: 15,
// //       theme: "grid",
// //       minCellHeight: 25,
// //       styles: { fontSize: 7.5, halign: "center", valign: "middle", cellPadding: 1.5 },
// //       headStyles: { fillColor: [33, 150, 243], textColor: 255 },
// //       columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 45 }, 12: { cellWidth: 22 } },
// //       didDrawCell: data => {
// //         if (data.section === "body" && data.column.index === 1 && data.cell.raw?.content) {
// //           const cleanName = data.cell.raw.content.replace(/\n/g, " ").trim();
// //           if (!indexMap[cleanName]) indexMap[cleanName] = doc.internal.getCurrentPageInfo().pageNumber;
// //         }
// //         if (data.section === 'body' && data.column.index === 12 && data.cell.raw?._image) {
// //           try { doc.addImage(data.cell.raw._image, 'JPEG', data.cell.x + 2, data.cell.y + 1, 18, 13, undefined, 'FAST'); } catch (e) {}
// //         }
// //       }
// //     });

// //     // // 4. FILL THE INDEX PAGES (SINGLE COLUMN)
// //     // for (let i = 0; i < totalIndexPages; i++) {
// //     //   doc.setPage(i + 1);
// //     //   doc.setFont("helvetica", "bold").setFontSize(18).text("Product Index", 148, 15, { align: "center" });

// //     //   const startIdx = i * rowsPerPage;
// //     //   const pageItems = allUniqueItems.slice(startIdx, startIdx + rowsPerPage);

// //     //   const indexBody = pageItems.map(name => {
// //     //     const pNo = (indexMap[name] || "").toString();
// //     //     // Dot leader logic for a wide single column (approx 120 chars)
// //     //     const dots = ".".repeat(Math.max(5, 120 - name.length - pNo.length));
// //     //     return [`${name} ${dots} ${pNo}`];
// //     //   });

// //     //   autoTable(doc, {
// //     //     startY: 30,
// //     //     body: indexBody,
// //     //     theme: 'plain',
// //     //     styles: { 
// //     //       fontSize: 10, 
// //     //       font: "courier", 
// //     //       cellPadding: 3, 
// //     //       minCellHeight: 10 // Extra height for perfect spacing
// //     //     },
// //     //     columnStyles: { 0: { cellWidth: 270 } }, // Full width of page
// //     //     didDrawCell: data => {
// //     //       const txt = data.cell.text[0];
// //     //       const match = txt?.match(/(\d+)$/);
// //     //       if (match) {
// //     //         doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { pageNumber: Number(match[1]) });
// //     //       }
// //     //     }
// //     //   });
// //     // }





// //       // 4. FILL THE INDEX PAGES
// //     for (let i = 0; i < totalIndexPages; i++) {
// //       doc.setPage(i + 1);

// //       // Reset the internal autoTable cursor so it doesn't "remember" previous page heights
// //       if (doc.lastAutoTable) doc.lastAutoTable.finalY = 0; 

// //       doc.setFont("helvetica", "bold").setFontSize(16);
// //       doc.text("Product Index", 148, 15, { align: "center" });

// //       const startIdx = i * rowsPerPage;
// //       const pageItems = allUniqueItems.slice(startIdx, startIdx + rowsPerPage);

// //       const indexBody = pageItems.map(name => {
// //         const pNo = (indexMap[name] || "").toString();
// //         // Calculate dots for a single column (Landscape width)
// //         const dots = ".".repeat(Math.max(5, 115 - name.length - pNo.length));
// //         return [`${name} ${dots} ${pNo}`];
// //       });

// //       autoTable(doc, {
// //         startY: 25,           // Force exactly 25mm from top on EVERY page
// //         body: indexBody,
// //         theme: 'plain',
// //         styles: { 
// //           fontSize: 9.5, 
// //           font: "courier", 
// //           cellPadding: 3,     // Vertical spacing fix
// //           minCellHeight: 10,  // Forces rows to be tall and even
// //           valign: 'middle'
// //         },
// //         columnStyles: { 0: { cellWidth: 260 } },
// //         margin: { left: 20 },
// //         showHead: 'never',
// //         // This stops the table from trying to calculate "remaining space" from Page 1
// //         pageBreak: 'avoid',   
// //         didDrawCell: data => {
// //           const txt = data.cell.text[0];
// //           const match = txt?.match(/(\d+)$/);
// //           if (match) {
// //             doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { pageNumber: Number(match[1]) });
// //           }
// //         }
// //       });
// //     }





// //     // 5. FINAL NUMBERING
// //     const total = doc.internal.getNumberOfPages();
// //     for (let i = 1; i <= total; i++) {
// //       doc.setPage(i);
// //       doc.setFont("helvetica", "normal").setFontSize(9).text(`Page ${i} of ${total}`, 285, 205, { align: "right" });
// //     }

// //     doc.save("Simplified_Index.pdf");
// //     message.success({ content: "PDF Generated Successfully", key });

// //   } catch (err) {
// //     console.error(err);
// //     message.error({ content: "Error: " + err.message, key });
// //   } finally {
// //     setIsProcessing(false);
// //   }
// // };










// // //working index

// // const handleSaveAsPdf = async () => {
// //   if (!JsPDF) return message.error("PDF library not ready");
// //   if (!selectedRows.length) return message.error("No items selected");

// //   setIsProcessing(true);
// //   const key = 'pdf-process';
// //   message.loading({ content: 'Generating 100% Fixed PDF...', key });

// //   try {
// //     const { default: autoTable } = await import("jspdf-autotable");

// //     // --- STEP 1: DATA BUFFER (Main Pricing Table) ---
// //     const dataDoc = new JsPDF("landscape", "mm", "a4", true);
// //     const indexMap = {};
// //     const tableData = [...selectedRows].sort((a, b) => Number(a.sl_no) - Number(b.sl_no));

// //     const grouped = {};
// //     tableData.forEach(r => {
// //       const k = `${r.sl_no}__${r.items}`;
// //       if (!grouped[k]) grouped[k] = [];
// //       grouped[k].push(r);
// //     });

// //     const bodyRows = [];
// //     Object.values(grouped).forEach(group => {
// //       group.forEach((row, i) => {
// //         const tableRow = [];
// //         if (i === 0) {
// //           tableRow.push({ content: row.sl_no, rowSpan: group.length });
// //           tableRow.push({ content: row.items, rowSpan: group.length });
// //         }
// //         tableRow.push(...[
// //           row.brand || "-", formatPrice(row.single), formatPrice(row.qty_5_plus),
// //           formatPrice(row.qty_10_plus), formatPrice(row.qty_20_plus), formatPrice(row.qty_50_plus),
// //           formatPrice(row.qty_100_plus), formatGST(row.gst), formatPrice(row.mrp),
// //           row.warranty || "-", { content: "", _image: row.image }
// //         ]);
// //         bodyRows.push(tableRow);
// //       });
// //     });

// //     autoTable(dataDoc, {
// //       head: [["SL","Item","Brand","Single","5+","10+","20+","50+","100+","GST","MRP","Warranty","Photo"]],
// //       body: bodyRows,
// //       startY: 15,
// //       theme: "grid",
// //       styles: { fontSize: 7.5, halign: "center", valign: "middle", cellPadding: 1.5 },
// //       headStyles: { fillColor: [33, 150, 243], textColor: 255 },
// //       columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 45 }, 12: { cellWidth: 22 } },
// //       didDrawCell: data => {
// //         if (data.section === "body" && data.column.index === 1 && data.cell.raw?.content) {
// //           const cleanName = data.cell.raw.content.replace(/\n/g, " ").trim();
// //           if (!indexMap[cleanName]) indexMap[cleanName] = dataDoc.internal.getCurrentPageInfo().pageNumber;
// //         }
// //         if (data.section === 'body' && data.column.index === 12 && data.cell.raw?._image) {
// //           try { dataDoc.addImage(data.cell.raw._image, 'JPEG', data.cell.x + 2, data.cell.y + 1, 18, 13, undefined, 'FAST'); } catch (e) {}
// //         }
// //       }
// //     });

// //     // --- STEP 2: INDEX BUFFER (Manual Drawing - No Table Engine) ---
// //     const indexDoc = new JsPDF("landscape", "mm", "a4", true);
// //     const allUniqueItems = Object.keys(grouped)
// //       .map(k => k.split('__')[1].replace(/\n/g, " ").trim())
// //       .sort((a, b) => a.localeCompare(b));

// //     const rowsPerPage = 18;
// //     const totalIndexPages = Math.ceil(allUniqueItems.length / rowsPerPage);

// //     for (let i = 0; i < totalIndexPages; i++) {
// //       if (i > 0) indexDoc.addPage();

// //       // Header
// //       indexDoc.setFont("helvetica", "bold").setFontSize(18);
// //       indexDoc.text("Product Index", 148, 15, { align: "center" });

// //       const startIdx = i * rowsPerPage;
// //       const pageItems = allUniqueItems.slice(startIdx, startIdx + rowsPerPage);

// //       indexDoc.setFont("courier", "normal").setFontSize(10);
// //       let yPos = 30; // Strict starting position

// //       pageItems.forEach((name) => {
// //         const pNo = indexMap[name] ? (indexMap[name] + totalIndexPages).toString() : "";

// //         // Manual Dot Leader Logic
// //         const dots = ".".repeat(Math.max(5, 115 - name.length - pNo.length));
// //         const lineText = `${name} ${dots} ${pNo}`;

// //         indexDoc.text(lineText, 20, yPos);

// //         // Clickable Link Area
// //         if (pNo) {
// //           indexDoc.link(20, yPos - 5, 260, 8, { pageNumber: Number(pNo) });
// //         }
// //         yPos += 9.5; // Constant row height prevents overriding
// //       });
// //     }

// //     // --- STEP 3: FINAL MERGE ---
// //     const finalDoc = new JsPDF("landscape", "mm", "a4", true);

// //     // Copy Index Pages
// //     for (let i = 1; i <= totalIndexPages; i++) {
// //       if (i > 1) finalDoc.addPage();
// //       finalDoc.internal.pages[i] = indexDoc.internal.pages[i];
// //     }

// //     // Copy Data Pages
// //     const dataPageCount = dataDoc.internal.getNumberOfPages();
// //     for (let i = 1; i <= dataPageCount; i++) {
// //       finalDoc.addPage();
// //       finalDoc.internal.pages[totalIndexPages + i] = dataDoc.internal.pages[i];
// //     }

// //     // --- STEP 4: GLOBAL PAGE NUMBERING ---
// //     const total = finalDoc.internal.getNumberOfPages();
// //     for (let i = 1; i <= total; i++) {
// //       finalDoc.setPage(i);
// //       finalDoc.setFont("helvetica", "normal").setFontSize(9);
// //       finalDoc.text(`Page ${i} of ${total}`, 285, 205, { align: "right" });
// //     }

// //     finalDoc.save("EXOR_Master_PriceList.pdf");
// //     message.success({ content: "PDF Generated Successfully", key });

// //   } catch (err) {
// //     console.error(err);
// //     message.error({ content: "Error: " + err.message, key });
// //   } finally {
// //     setIsProcessing(false);
// //   }
// // };








// // //index working with 2 column


// // const handleSaveAsPdf = async () => {
// //   if (!JsPDF) return message.error("PDF library not ready");
// //   if (!selectedRows.length) return message.error("No items selected");

// //   setIsProcessing(true);
// //   const key = 'pdf-process';
// //   message.loading({ content: 'Generating 100% Fixed PDF...', key });

// //   try {
// //     const { default: autoTable } = await import("jspdf-autotable");

// //     // --- STEP 1: DATA BUFFER (Main Pricing Table) ---
// //     const dataDoc = new JsPDF("landscape", "mm", "a4", true);
// //     const indexMap = {};
// //     const tableData = [...selectedRows].sort((a, b) => Number(a.sl_no) - Number(b.sl_no));

// //     const grouped = {};
// //     tableData.forEach(r => {
// //       const k = `${r.sl_no}__${r.items}`;
// //       if (!grouped[k]) grouped[k] = [];
// //       grouped[k].push(r);
// //     });

// //     const bodyRows = [];
// //     Object.values(grouped).forEach(group => {
// //       group.forEach((row, i) => {
// //         const tableRow = [];
// //         if (i === 0) {
// //           tableRow.push({ content: row.sl_no, rowSpan: group.length });
// //           tableRow.push({ content: row.items, rowSpan: group.length });
// //         }
// //         tableRow.push(...[
// //           row.brand || "-", formatPrice(row.single), formatPrice(row.qty_5_plus),
// //           formatPrice(row.qty_10_plus), formatPrice(row.qty_20_plus), formatPrice(row.qty_50_plus),
// //           formatPrice(row.qty_100_plus), formatGST(row.gst), formatPrice(row.mrp),
// //           row.warranty || "-", { content: "", _image: row.image }
// //         ]);
// //         bodyRows.push(tableRow);
// //       });
// //     });

// //     autoTable(dataDoc, {
// //       head: [["SL","Item","Brand","Single","5+","10+","20+","50+","100+","GST","MRP","Warranty","Photo"]],
// //       body: bodyRows,
// //       startY: 15,
// //       theme: "grid",
// //       styles: { fontSize: 7.5, halign: "center", valign: "middle", cellPadding: 1.5 },
// //       headStyles: { fillColor: [33, 150, 243], textColor: 255 },
// //       columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 45 }, 12: { cellWidth: 22 } },
// //       didDrawCell: data => {
// //         if (data.section === "body" && data.column.index === 1 && data.cell.raw?.content) {
// //           const cleanName = data.cell.raw.content.replace(/\n/g, " ").trim();
// //           if (!indexMap[cleanName]) indexMap[cleanName] = dataDoc.internal.getCurrentPageInfo().pageNumber;
// //         }
// //         if (data.section === 'body' && data.column.index === 12 && data.cell.raw?._image) {
// //           try { dataDoc.addImage(data.cell.raw._image, 'JPEG', data.cell.x + 2, data.cell.y + 1, 18, 13, undefined, 'FAST'); } catch (e) {}
// //         }
// //       }
// //     });

// //     // --- STEP 2: GENERATE INDEX PAGES (2-Column Manual Drawing) ---
// //     const indexDoc = new JsPDF("landscape", "mm", "a4", true);
// //     const allUniqueItems = Object.keys(grouped)
// //       .map(k => k.split('__')[1].replace(/\n/g, " ").trim())
// //       .sort((a, b) => a.localeCompare(b));

// //     // Settings for 2 columns
// //     const rowsPerPage = 18; // 18 rows per column = 36 items per page
// //     const col1X = 15;       // Starting X for left column
// //     const col2X = 155;      // Starting X for right column (middle of page)
// //     const rowHeight = 9.5;  
// //     const totalItemsPerPage = rowsPerPage * 2;
// //     const totalIndexPages = Math.ceil(allUniqueItems.length / totalItemsPerPage);

// //     for (let i = 0; i < totalIndexPages; i++) {
// //       if (i > 0) indexDoc.addPage();

// //       // Header
// //       indexDoc.setFont("helvetica", "bold").setFontSize(18);
// //       indexDoc.text("Product Index", 148, 15, { align: "center" });

// //       const startIdx = i * totalItemsPerPage;
// //       const pageItems = allUniqueItems.slice(startIdx, startIdx + totalItemsPerPage);

// //       indexDoc.setFont("courier", "normal").setFontSize(9);

// //       pageItems.forEach((name, index) => {
// //         // Determine if item goes in Column 1 or Column 2
// //         const isColumn2 = index >= rowsPerPage;
// //         const xPos = isColumn2 ? col2X : col1X;

// //         // Calculate Y position (resets for the second column)
// //         const rowIndex = isColumn2 ? index - rowsPerPage : index;
// //         const yPos = 30 + (rowIndex * rowHeight);

// //         const pNo = indexMap[name] ? (indexMap[name] + totalIndexPages).toString() : "";

// //         // Dot leader logic for narrower columns
// //         // Max chars reduced to ~60 to fit side-by-side
// //         const dots = ".".repeat(Math.max(5, 65 - name.length - pNo.length));
// //         const lineText = `${name.substring(0, 55)} ${dots} ${pNo}`;

// //         indexDoc.text(lineText, xPos, yPos);

// //         // Clickable link for the column item
// //         if (pNo) {
// //           indexDoc.link(xPos, yPos - 5, 130, 8, { pageNumber: Number(pNo) });
// //         }
// //       });
// //     }

// //     // --- STEP 3: FINAL MERGE ---
// //     const finalDoc = new JsPDF("landscape", "mm", "a4", true);

// //     // Copy Index Pages
// //     for (let i = 1; i <= totalIndexPages; i++) {
// //       if (i > 1) finalDoc.addPage();
// //       finalDoc.internal.pages[i] = indexDoc.internal.pages[i];
// //     }

// //     // Copy Data Pages
// //     const dataPageCount = dataDoc.internal.getNumberOfPages();
// //     for (let i = 1; i <= dataPageCount; i++) {
// //       finalDoc.addPage();
// //       finalDoc.internal.pages[totalIndexPages + i] = dataDoc.internal.pages[i];
// //     }

// //     // --- STEP 4: GLOBAL PAGE NUMBERING ---
// //     const total = finalDoc.internal.getNumberOfPages();
// //     for (let i = 1; i <= total; i++) {
// //       finalDoc.setPage(i);
// //       finalDoc.setFont("helvetica", "normal").setFontSize(9);
// //       finalDoc.text(`Page ${i} of ${total}`, 285, 205, { align: "right" });
// //     }

// //     finalDoc.save("EXOR_Master_PriceList.pdf");
// //     message.success({ content: "PDF Generated Successfully", key });

// //   } catch (err) {
// //     console.error(err);
// //     message.error({ content: "Error: " + err.message, key });
// //   } finally {
// //     setIsProcessing(false);
// //   }
// // };








// // // Final working 2 column clickable index and row hieght fix

// // const handleSaveAsPdf = async () => {
// //   if (!JsPDF) return message.error("PDF library not ready");
// //   if (!selectedRows.length) return message.error("No items selected");

// //   setIsProcessing(true);
// //   const key = 'pdf-process';
// //   message.loading({ content: 'Generating 2-Column Clickable PDF...', key });

// //   try {
// //     const { default: autoTable } = await import("jspdf-autotable");

// //     // --- STEP 1: GENERATE DATA DOC (to get page numbers) ---
// //     const dataDoc = new JsPDF("landscape", "mm", "a4", true);
// //     const indexMap = {};
// //     const tableData = [...selectedRows].sort((a, b) => Number(a.sl_no) - Number(b.sl_no));

// //     const grouped = {};
// //     tableData.forEach(r => {
// //       const k = `${r.sl_no}__${r.items}`;
// //       if (!grouped[k]) grouped[k] = [];
// //       grouped[k].push(r);
// //     });

// //     const bodyRows = [];
// //     Object.values(grouped).forEach(group => {
// //       group.forEach((row, i) => {
// //         const tableRow = [];
// //         if (i === 0) {
// //           tableRow.push({ content: row.sl_no, rowSpan: group.length });
// //           tableRow.push({ content: row.items, rowSpan: group.length });
// //         }
// //         tableRow.push(...[
// //           row.brand || "-", formatPrice(row.single), formatPrice(row.qty_5_plus),
// //           formatPrice(row.qty_10_plus), formatPrice(row.qty_20_plus), formatPrice(row.qty_50_plus),
// //           formatPrice(row.qty_100_plus), formatGST(row.gst), formatPrice(row.mrp),
// //           row.warranty || "-", { content: "", _image: row.image }
// //         ]);
// //         bodyRows.push(tableRow);
// //       });
// //     });

// //     autoTable(dataDoc, {
// //       head: [["SL","Item","Brand","Single","5+","10+","20+","50+","100+","GST","MRP","Warranty","Photo"]],
// //       body: bodyRows,
// //       startY: 15,
// //       theme: "grid",
// //       minCellHeight: 35,
// //       columnStyles: { 
// //         0: { cellWidth: 10 }, 
// //         1: { cellWidth: 45 }, 
// //         2: { cellWidth: 55 }, // Reduced 3rd column (Brand) width
// //         12: { cellWidth: 20 }  // Increased last column (Photo) width
// //       },
// //       styles: { fontSize: 7.5, halign: "center", valign: "middle", cellPadding: 1.5 },

// //       didParseCell: (data) => {
// //         if (data.section === 'body') {
// //             // This is the "Hard Override" for row height
// //             data.row.height = 15; 
// //             // Also set minCellHeight for the specific cell just in case
// //             data.cell.styles.minCellHeight = 15;
// //         }
// //       },

// //       didDrawCell: data => {
// //         if (data.section === "body" && data.column.index === 1 && data.cell.raw?.content) {
// //           const cleanName = data.cell.raw.content.replace(/\n/g, " ").trim();
// //           if (!indexMap[cleanName]) indexMap[cleanName] = dataDoc.internal.getCurrentPageInfo().pageNumber;
// //         }
// //         if (data.section === 'body' && data.column.index === 12 && data.cell.raw?._image) {
// //           try { dataDoc.addImage(data.cell.raw._image, 'JPEG', data.cell.x + 2, data.cell.y + 1, 18, 13, undefined, 'FAST'); } catch (e) {}
// //         }
// //       }
// //     });

// //     // --- STEP 2: PREPARE FINAL DOCUMENT ---
// //     const finalDoc = new JsPDF("landscape", "mm", "a4", true);
// //     const allUniqueItems = Object.keys(grouped)
// //       .map(k => k.split('__')[1].replace(/\n/g, " ").trim())
// //       .sort((a, b) => a.localeCompare(b));

// //     const rowsPerPage = 18; 
// //     const totalItemsPerPage = rowsPerPage * 2;
// //     const totalIndexPages = Math.ceil(allUniqueItems.length / totalItemsPerPage);

// //     // 1. Add Blank Index Pages
// //     for (let i = 0; i < totalIndexPages; i++) {
// //         if (i > 0) finalDoc.addPage();
// //     }

// //     // 2. Append Data Pages from dataDoc
// //     const dataPageCount = dataDoc.internal.getNumberOfPages();
// //     for (let i = 1; i <= dataPageCount; i++) {
// //       finalDoc.addPage();
// //       finalDoc.internal.pages[totalIndexPages + i] = dataDoc.internal.pages[i];
// //     }

// //     // --- STEP 3: DRAW INDEX DIRECTLY ON FINAL DOC (Enables Clicking) ---
// //     for (let i = 0; i < totalIndexPages; i++) {
// //       finalDoc.setPage(i + 1); // Select the actual page in the final doc

// //       finalDoc.setFont("helvetica", "bold").setFontSize(14).setTextColor(0);
// //       finalDoc.text("Product Index", 148, 15, { align: "center" });

// //       const startIdx = i * totalItemsPerPage;
// //       const pageItems = allUniqueItems.slice(startIdx, startIdx + totalItemsPerPage);

// //       finalDoc.setFont("courier", "normal").setFontSize(9);

// //       pageItems.forEach((name, idx) => {
// //         const isColumn2 = idx >= rowsPerPage;
// //         const xPos = isColumn2 ? 155 : 20;
// //         const rowIndex = isColumn2 ? idx - rowsPerPage : idx;
// //         const xStart = isColumn2 ? 155 : 20;
// //         const xEnd = isColumn2 ? 280 : 140;
// //         const yPos = 30 + (rowIndex * 9);

// //         const targetPNo = indexMap[name] ? (indexMap[name] + totalIndexPages) : null;
// //         const displayName = name.length > 45 ? name.substring(0, 42) + "..." : name;
// //         const pNoStr = targetPNo ? targetPNo.toString() : "";

// //         const dots = ".".repeat(Math.max(2, 60 - displayName.length - pNoStr.length));

// //         // Draw Text
// //         finalDoc.setTextColor(0);
// //         finalDoc.text(`${displayName} ${dots}`, xPos, yPos);



// //         if (targetPNo) {
// //           // 2. Right-Align Page Number with "Breathing Space" (Gap)
// //           const pNoWidth = finalDoc.getTextWidth(pNoStr);
// //           const pNoX = xEnd - pNoWidth;

// //           finalDoc.setTextColor(0, 0, 255); // Blue link
// //           finalDoc.text(pNoStr, pNoX, yPos);

// //           // 3. Draw Dots with Space before Number
// //           finalDoc.setTextColor(180); // Lighter gray dots
// //           const nameWidth = finalDoc.getTextWidth(displayName + " ");
// //           const gap = 3; // 3mm breathing space before number
// //           const dotsEnd = pNoX - gap; 
// //           const dotsWidth = dotsEnd - (xStart + nameWidth);

// //           if (dotsWidth > 0) {
// //             const oneDotWidth = finalDoc.getTextWidth(".");
// //             const dotString = ".".repeat(Math.floor(dotsWidth / oneDotWidth));
// //             finalDoc.text(dotString, xStart + nameWidth, yPos);
// //           }

// //           // IMPORTANT: Link must be drawn on the active finalDoc page
// //           finalDoc.link(xPos, yPos - 5, 125, 7, { pageNumber: Number(targetPNo) });
// //         }
// //       });
// //     }

// //     // --- STEP 4: GLOBAL NUMBERING ---
// //     const total = finalDoc.internal.getNumberOfPages();
// //     for (let i = 1; i <= total; i++) {
// //       finalDoc.setPage(i);
// //       finalDoc.setFont("helvetica", "normal").setFontSize(9).setTextColor(0);
// //       finalDoc.text(`Page ${i} of ${total}`, 285, 205, { align: "right" });
// //     }

// //     finalDoc.save("EXOR_Final_Clickable_Fixed.pdf");
// //     message.success({ content: "Clickable PDF Generated!", key });

// //   } catch (err) {
// //     console.error(err);
// //     message.error({ content: "Error: " + err.message, key });
// //   } finally {
// //     setIsProcessing(false);
// //   }
// // };










// // // // Final working 2 column clickable index and row hieght fix and solve nebulize issue


// // const handleSaveAsPdf = async () => {
// //   if (!JsPDF) return message.error("PDF library not ready");
// //   if (!selectedRows.length) return message.error("No items selected");






// //   setIsProcessing(true);
// //   const key = 'pdf-process';
// //   message.loading({ content: 'Processing large items and generating PDF...', key });

// //   try {
// //     const { default: autoTable } = await import("jspdf-autotable");
// //     const dataDoc = new JsPDF("landscape", "mm", "a4", true);
// //     const indexMap = {};

// //     // --- STEP 1: DATA PRE-PROCESSING (The "Splitter" Logic) ---
// //     const sortedData = [...selectedRows].sort((a, b) => Number(a.sl_no) - Number(b.sl_no));

// //     // Group raw data by SL and Name
// //     const rawGroups = {};
// //     sortedData.forEach(r => {
// //       const k = `${r.sl_no}__${r.items}`;
// //       if (!rawGroups[k]) rawGroups[k] = [];
// //       rawGroups[k].push(r);
// //     });

// //     const bodyRows = [];
// //     const MAX_ROWS_PER_CHUNK = 10; // Safety limit for 15mm rows

// //     Object.keys(rawGroups).forEach(groupKey => {
// //       const fullGroup = rawGroups[groupKey];
// //       const [slNo, itemName] = groupKey.split('__');

// //       // Break large groups (like Nebulizer) into smaller chunks
// //       for (let i = 0; i < fullGroup.length; i += MAX_ROWS_PER_CHUNK) {
// //         const chunk = fullGroup.slice(i, i + MAX_ROWS_PER_CHUNK);
// //         const isContinuation = i > 0;
// //         const displayTitle = isContinuation ? `${itemName.trim()} (Cont.)` : itemName.trim();

// //         chunk.forEach((row, rowIndex) => {
// //           const tableRow = [];
// //           if (rowIndex === 0) {
// //             // SL No and Item Name with rowSpan restricted to the chunk size
// //             tableRow.push({ content: slNo, rowSpan: chunk.length });
// //             tableRow.push({ content: displayTitle, rowSpan: chunk.length });
// //           }
// //           tableRow.push(...[
// //             row.brand || "-", formatPrice(row.single), formatPrice(row.qty_5_plus),
// //             formatPrice(row.qty_10_plus), formatPrice(row.qty_20_plus), formatPrice(row.qty_50_plus),
// //             formatPrice(row.qty_100_plus), formatGST(row.gst), formatPrice(row.mrp),
// //             row.warranty || "-", { content: "", _image: row.image }
// //           ]);
// //           bodyRows.push(tableRow);
// //         });
// //       }
// //     });

// //     // --- STEP 2: DRAW DATA TABLE (With Forced Height & Column Adjustments) ---
// //     autoTable(dataDoc, {
// //       head: [["SL","Item","Brand","Single","5+","10+","20+","50+","100+","GST","MRP","Warranty","Photo"]],
// //       body: bodyRows,
// //       startY: 15,
// //       theme: "grid",
// //       styles: { fontSize: 7.5, halign: "center", valign: "middle", cellPadding: 1.5 },
// //       columnStyles: { 
// //         0: { cellWidth: 10 }, 
// //         1: { cellWidth: 45 }, 
// //         2: { cellWidth: 55 }, // Reduced 3rd Column (Brand)
// //         12: { cellWidth: 25 }  // Increased Last Column (Photo)
// //       },
// //       didParseCell: (data) => {
// //         if (data.section === 'body') {
// //           data.row.height = 15; // Forced 15mm row height
// //         }
// //       },
// //       didDrawCell: data => {
// //         // Index Mapping
// //         if (data.section === "body" && data.column.index === 1 && data.cell.raw?.content) {
// //           const name = data.cell.raw.content.replace(/\n/g, " ").trim();
// //           if (!indexMap[name]) indexMap[name] = dataDoc.internal.getCurrentPageInfo().pageNumber;
// //         }
// //         // Centered Image Drawing
// //         if (data.section === 'body' && data.column.index === 12 && data.cell.raw?._image) {
// //           try {
// //             const imgW = 36; const imgH = 13;
// //             const x = data.cell.x + (data.cell.width - imgW) / 2;
// //             const y = data.cell.y + (data.cell.height - imgH) / 2;
// //             dataDoc.addImage(data.cell.raw._image, 'JPEG', x, y, imgW, imgH, undefined, 'FAST');
// //           } catch (e) {}
// //         }
// //       }
// //     });

// //     // --- STEP 3: CONSTRUCT FINAL DOCUMENT WITH CLICKABLE INDEX ---
// //     const finalDoc = new JsPDF("landscape", "mm", "a4", true);
// //     const indexItems = Object.keys(indexMap).sort((a, b) => a.localeCompare(b));
// //     const totalIndexPages = Math.ceil(indexItems.length / 36); // 18 rows * 2 columns

// //     // Create Index pages
// //     for (let i = 0; i < totalIndexPages; i++) if (i > 0) finalDoc.addPage();

// //     // Merge Data pages
// //     const dataPages = dataDoc.internal.getNumberOfPages();
// //     for (let i = 1; i <= dataPages; i++) {
// //       finalDoc.addPage();
// //       finalDoc.internal.pages[totalIndexPages + i] = dataDoc.internal.pages[i];
// //     }

// //     // Draw Index content on Final Doc
// //     for (let i = 0; i < totalIndexPages; i++) {
// //       finalDoc.setPage(i + 1);
// //       finalDoc.setFont("helvetica", "bold").setFontSize(18).text("Product Index", 148, 15, { align: "center" });
// //       finalDoc.setFont("courier", "normal").setFontSize(9);

// //       const pageItems = indexItems.slice(i * 36, (i + 1) * 36);
// //       pageItems.forEach((name, idx) => {
// //         const isCol2 = idx >= 18;
// //         const xStart = isCol2 ? 155 : 20;
// //         const xEnd = isCol2 ? 280 : 140;
// //         const yPos = 30 + ((idx % 18) * 9);

// //         const targetPNo = indexMap[name] + totalIndexPages;
// //         const displayName = name.length > 40 ? name.substring(0, 37) + "..." : name;
// //         const pNoStr = targetPNo.toString();

// //         // Draw Name & Blue Page No
// //         finalDoc.setTextColor(0).text(displayName, xStart, yPos);
// //         const pNoWidth = finalDoc.getTextWidth(pNoStr);
// //         const pNoX = xEnd - pNoWidth;
// //         finalDoc.setTextColor(0, 0, 255).text(pNoStr, pNoX, yPos);

// //         // Draw Gray Dots with Gap
// //         finalDoc.setTextColor(180);
// //         const dotsStart = xStart + finalDoc.getTextWidth(displayName + " ");
// //         const dotsEnd = pNoX - 3; // 3mm breathing space
// //         const dotsStr = ".".repeat(Math.max(0, Math.floor((dotsEnd - dotsStart) / finalDoc.getTextWidth("."))));
// //         finalDoc.text(dotsStr, dotsStart, yPos);

// //         // Link
// //         finalDoc.link(xStart, yPos - 5, (xEnd - xStart), 8, { pageNumber: targetPNo });
// //       });
// //     }

// //     // --- STEP 4: FOOTER ---
// //     const totalPages = finalDoc.internal.getNumberOfPages();
// //     for (let i = 1; i <= totalPages; i++) {
// //       finalDoc.setPage(i);
// //       finalDoc.setFont("helvetica", "normal").setFontSize(9).setTextColor(100);
// //       finalDoc.text(`Page ${i} of ${totalPages}`, 285, 205, { align: "right" });
// //     }

// //     finalDoc.save("EXOR_PriceList_Professional.pdf");
// //     message.success({ content: "PDF Generated Successfully!", key });

// //   } catch (err) {
// //     console.error(err);
// //     message.error({ content: "Error: " + err.message, key });
// //   } finally {
// //     setIsProcessing(false);
// //   }
// // };





















// // working with image but no index


// // const handleSaveAsPdf = async () => {
// //   if (!JsPDF) return message.error("PDF library not ready");
// //   if (!selectedRows.length) return message.error("No items selected");

// //   // --- INTERNAL HELPER ---
// //   const getBase64 = async (url) => {
// //     if (!url || url === "-" || url === "") return null;
// //     try {
// //       const res = await fetch(url);
// //       if (!res.ok) return null;
// //       const blob = await res.blob();
// //       return new Promise((resolve) => {
// //         const reader = new FileReader();
// //         reader.onloadend = () => resolve(reader.result);
// //         reader.onerror = () => resolve(null);
// //         reader.readAsDataURL(blob);
// //       });
// //     } catch (e) {
// //       console.error("Fetch Error for URL:", url, e);
// //       return null;
// //     }
// //   };

// //   setIsProcessing(true);
// //   const key = 'pdf-process';
// //   message.loading({ content: 'Running Debug Build...', key });

// //   try {
// //     const { default: autoTable } = await import("jspdf-autotable");
// //     const dataDoc = new JsPDF("landscape", "mm", "a4", true);

// //     // --- STEP 1: FETCH & LOG ---
// //     const imageMap = {};
// //     const uniqueUrls = [...new Set(selectedRows.map(r => 
// //       r.product_image || r.image || r.photo || r.productimage || r.img || r.picture || r.product_img
// //     ).filter(u => u && u !== "-"))];

// //     console.log("DEBUG: Unique URLs found:", uniqueUrls.length);

// //     await Promise.all(uniqueUrls.map(async (url) => {
// //       const b64 = await getBase64(url);
// //       if (b64) {
// //         imageMap[url] = b64;
// //         console.log("DEBUG: Successfully Mapped (Base64 length):", b64.length);
// //       } else {
// //         console.warn("DEBUG: Failed to get Base64 for:", url);
// //       }
// //     }));

// //     // --- STEP 2: PROCESS DATA ---
// //     const bodyRows = [];
// //     const MAX_ROWS_PER_CHUNK = 7; // Even smaller to ensure page fit

// //     const sortedData = [...selectedRows].sort((a, b) => Number(a.sl_no) - Number(b.sl_no));
// //     const rawGroups = {};
// //     sortedData.forEach(r => {
// //       const k = `${r.sl_no}__${r.items}`;
// //       if (!rawGroups[k]) rawGroups[k] = [];
// //       rawGroups[k].push(r);
// //     });

// //     Object.keys(rawGroups).forEach((groupKey) => {
// //       const fullGroup = rawGroups[groupKey];
// //       const [slNo, itemName] = groupKey.split('__');

// //       for (let i = 0; i < fullGroup.length; i += MAX_ROWS_PER_CHUNK) {
// //         const chunk = fullGroup.slice(i, i + MAX_ROWS_PER_CHUNK);
// //         chunk.forEach((row, rowIndex) => {
// //           const tableRow = [];
// //           if (rowIndex === 0) {
// //             tableRow.push({ content: slNo, rowSpan: chunk.length });
// //             tableRow.push({ content: itemName, rowSpan: chunk.length });
// //           }

// //           const imgUrl = row.product_image || row.image || row.photo || row.productimage || row.img || row.picture || row.product_img;
// //           const b64 = imageMap[imgUrl] || null;

// //           tableRow.push(...[
// //             row.brand || "-", formatPrice(row.single), formatPrice(row.qty_5_plus),
// //             formatPrice(row.qty_10_plus), formatPrice(row.qty_20_plus), formatPrice(row.qty_50_plus),
// //             formatPrice(row.qty_100_plus), formatGST(row.gst), formatPrice(row.mrp),
// //             row.warranty || "-", 
// //             { content: b64 ? "IMAGE_FOUND" : "NO_IMAGE", _img: b64 } 
// //           ]);
// //           bodyRows.push(tableRow);
// //         });
// //       }
// //     });

// //     // --- STEP 3: DRAW TABLE WITH EXTRA LOGGING ---
// //     autoTable(dataDoc, {
// //       head: [["SL","Item","Brand","Single","5+","10+","20+","50+","100+","GST","MRP","Warranty","Photo"]],
// //       body: bodyRows,
// //       startY: 35, // More space at top for debug gallery
// //       theme: "grid",
// //       styles: { fontSize: 7, valign: "middle", halign: "center" },
// //       columnStyles: { 12: { cellWidth: 25 } },
// //       didParseCell: (data) => {
// //         if (data.section === 'body') data.row.height = 15;
// //       },
// //       didDrawCell: (data) => {
// //         if (data.section === 'body' && data.column.index === 12) {
// //           const base64 = data.cell.raw?._img;
// //           if (base64) {
// //             console.log(`Drawing image for Row ${data.row.index}`);
// //             dataDoc.addImage(base64, 'JPEG', data.cell.x + 2, data.cell.y + 2, 21, 11);
// //           }
// //         }
// //       }
// //     });



// //     dataDoc.save("PriceList.pdf");
// //     message.success({ content: "Check top of PDF for Debug Gallery", key });

// //   } catch (err) {
// //     console.error("PDF CRASH:", err);
// //     message.error({ content: "Error: " + err.message, key });
// //   } finally {
// //     setIsProcessing(false);
// //   }
// // };









// // index with image and pagination but overflow issue






// // const handleSaveAsPdf = async () => {
// //   if (!JsPDF) return message.error("PDF library not ready");
// //   if (!selectedRows.length) return message.error("No items selected");

// //   setIsProcessing(true);
// //   const key = 'pdf-process';
// //   message.loading({ content: 'Generating PDF with Index and Images...', key });

// //   const getBase64 = async (url) => {
// //     if (!url || url === "-" || url === "") return null;
// //     try {
// //       const res = await fetch(url);
// //       if (!res.ok) return null;
// //       const blob = await res.blob();
// //       return new Promise((resolve) => {
// //         const reader = new FileReader();
// //         reader.onloadend = () => resolve(reader.result);
// //         reader.onerror = () => resolve(null);
// //         reader.readAsDataURL(blob);
// //       });
// //     } catch (e) {
// //       return null;
// //     }
// //   };

// //   try {
// //     const { default: autoTable } = await import("jspdf-autotable");
// //     // Single document approach to prevent image data loss during merging
// //     const doc = new JsPDF("landscape", "mm", "a4", true);
// //     const indexMap = {}; 

// //     // --- STEP 1: PRE-FETCH IMAGES (Working Debug Logic) ---
// //     const imageMap = {};
// //     const uniqueUrls = [...new Set(selectedRows.map(r => 
// //       r.product_image || r.image || r.photo || r.productimage || r.img || r.picture || r.product_img
// //     ).filter(u => u && u !== "-"))];

// //     await Promise.all(uniqueUrls.map(async (url) => {
// //       const b64 = await getBase64(url);
// //       if (b64) imageMap[url] = b64;
// //     }));

// //     // --- STEP 2: PRE-PROCESS INDEX MATH ---
// //     const sortedData = [...selectedRows].sort((a, b) => Number(a.sl_no) - Number(b.sl_no));

// //     // Determine unique items for the index
// //     const uniqueItemNames = [...new Set(sortedData.map(r => r.items.trim()))].sort((a, b) => a.localeCompare(b));
// //     const totalIndexPages = Math.ceil(uniqueItemNames.length / 36) || 1;

// //     // --- STEP 3: PRE-PROCESS BODY ROWS ---
// //     const rawGroups = {};
// //     sortedData.forEach(r => {
// //       const k = `${r.sl_no}__${r.items}`;
// //       if (!rawGroups[k]) rawGroups[k] = [];
// //       rawGroups[k].push(r);
// //     });

// //     const bodyRows = [];
// //     const MAX_ROWS_PER_CHUNK = 10;

// //     Object.keys(rawGroups).forEach((groupKey) => {
// //       const fullGroup = rawGroups[groupKey];
// //       const [slNo, itemName] = groupKey.split('__');

// //       for (let i = 0; i < fullGroup.length; i += MAX_ROWS_PER_CHUNK) {
// //         const chunk = fullGroup.slice(i, i + MAX_ROWS_PER_CHUNK);
// //         chunk.forEach((row, rowIndex) => {
// //           const tableRow = [];
// //           if (rowIndex === 0) {
// //             tableRow.push({ content: slNo, rowSpan: chunk.length });
// //             tableRow.push({ content: i > 0 ? `${itemName} (Cont.)` : itemName, rowSpan: chunk.length });
// //           }

// //           const imgUrl = row.product_image || row.image || row.photo || row.productimage || row.img || row.picture || row.product_img;
// //           const b64 = imageMap[imgUrl] || null;

// //           tableRow.push(...[
// //             row.brand || "-", formatPrice(row.single), formatPrice(row.qty_5_plus),
// //             formatPrice(row.qty_10_plus), formatPrice(row.qty_20_plus), formatPrice(row.qty_50_plus),
// //             formatPrice(row.qty_100_plus), formatGST(row.gst), formatPrice(row.mrp),
// //             row.warranty || "-", 
// //             { content: "", _img: b64 } // Data attached here
// //           ]);
// //           bodyRows.push(tableRow);
// //         });
// //       }
// //     });

// //     // --- STEP 4: DRAW TABLE (Starts after Index Pages) ---
// //     // Create blank pages for index
// //     for (let i = 1; i < totalIndexPages; i++) { doc.addPage(); }

// //     autoTable(doc, {
// //       head: [["SL","Item","Brand","Single","5+","10+","20+","50+","100+","GST","MRP","Warranty","Photo"]],
// //       body: bodyRows,
// //       startY: 15,
// //       margin: { top: 20 },
// //       theme: "grid",
// //       styles: { fontSize: 7.5, valign: "middle", halign: "center" },
// //       columnStyles: { 12: { cellWidth: 25 } },
// //       didParseCell: (data) => { if (data.section === 'body') data.row.height = 15; },
// //       didDrawCell: (data) => {
// //         // Record Index
// //         if (data.section === "body" && data.column.index === 1 && data.cell.raw?.content) {
// //           const name = data.cell.raw.content.replace(/\n/g, " ").replace(" (Cont.)", "").trim();
// //           if (!indexMap[name]) indexMap[name] = doc.internal.getCurrentPageInfo().pageNumber;
// //         }
// //         // Draw Image (The Debug logic)
// //         if (data.section === 'body' && data.column.index === 12) {
// //           const base64 = data.cell.raw?._img;
// //           if (base64) {
// //             doc.addImage(base64, 'JPEG', data.cell.x + 2, data.cell.y + 2, 21, 11);
// //           }
// //         }
// //       }
// //     });

// //     // --- STEP 5: DRAW INDEX CONTENT ON THE BLANK PAGES ---
// //     const indexItems = Object.keys(indexMap).sort((a, b) => a.localeCompare(b));
// //     for (let i = 0; i < totalIndexPages; i++) {
// //       doc.setPage(i + 1);
// //       doc.setFont("helvetica", "bold").setFontSize(18).text("Product Index", 148, 15, { align: "center" });
// //       doc.setFont("courier", "normal").setFontSize(9);

// //       const pageItems = indexItems.slice(i * 36, (i + 1) * 36);
// //       pageItems.forEach((name, idx) => {
// //         const isCol2 = idx >= 18;
// //         const xStart = isCol2 ? 155 : 20;
// //         const xEnd = isCol2 ? 280 : 140;
// //         const yPos = 30 + ((idx % 18) * 9);
// //         const targetPNo = indexMap[name];

// //         doc.setTextColor(0).text(name.substring(0, 38), xStart, yPos);
// //         doc.setTextColor(0, 0, 255).text(targetPNo.toString(), xEnd - 5, yPos);
// //         doc.link(xStart, yPos - 5, (xEnd - xStart), 8, { pageNumber: targetPNo });
// //       });
// //     }

// //     // --- STEP 6: FOOTER ---
// //     const totalPages = doc.internal.getNumberOfPages();
// //     for (let i = 1; i <= totalPages; i++) {
// //       doc.setPage(i);
// //       doc.setFontSize(9).setTextColor(100).text(`Page ${i} of ${totalPages}`, 285, 205, { align: "right" });
// //     }

// //     doc.save("Professional_PriceList.pdf");
// //     message.success({ content: "PDF Generated Successfully!", key });

// //   } catch (err) {
// //     message.error({ content: "Error: " + err.message, key });
// //   } finally {
// //     setIsProcessing(false);
// //   }
// // };







// // index with image and pagination but overflow issue solved but index name cleaniness issue



// // const handleSaveAsPdf = async () => {
// //   if (!JsPDF) return message.error("PDF library not ready");
// //   if (!selectedRows.length) return message.error("No items selected");

// //   setIsProcessing(true);
// //   const key = 'pdf-process';
// //   message.loading({ content: 'Generating PDF...', key });

// //   const getBase64 = async (url) => {
// //     if (!url || url === "-" || url === "") return null;
// //     try {
// //       const res = await fetch(url);
// //       if (!res.ok) return null;
// //       const blob = await res.blob();
// //       return new Promise((resolve) => {
// //         const reader = new FileReader();
// //         reader.onloadend = () => resolve(reader.result);
// //         reader.onerror = () => resolve(null);
// //         reader.readAsDataURL(blob);
// //       });
// //     } catch (e) { return null; }
// //   };

// //   try {
// //     const { default: autoTable } = await import("jspdf-autotable");
// //     const doc = new JsPDF("landscape", "mm", "a4", true);
// //     const indexMap = {}; 

// //     // --- STEP 1: PRE-FETCH IMAGES ---
// //     const imageMap = {};
// //     const uniqueUrls = [...new Set(selectedRows.map(r => 
// //       r.product_image || r.image || r.photo || r.productimage || r.img || r.picture || r.product_img
// //     ).filter(u => u && u !== "-"))];

// //     await Promise.all(uniqueUrls.map(async (url) => {
// //       const b64 = await getBase64(url);
// //       if (b64) imageMap[url] = b64;
// //     }));

// //     // --- STEP 2: CALCULATE INDEX PAGES ---
// //     const sortedData = [...selectedRows].sort((a, b) => Number(a.sl_no) - Number(b.sl_no));
// //     const uniqueItemNames = [...new Set(sortedData.map(r => r.items.trim()))]
// //       .filter(name => name && name.toLowerCase() !== 'item')
// //       .sort((a, b) => a.localeCompare(b));

// //     const totalIndexPages = Math.ceil(uniqueItemNames.length / 36) || 1;

// //     // --- STEP 3: PRE-PROCESS BODY ROWS ---
// //     const rawGroups = {};
// //     sortedData.forEach(r => {
// //       const k = `${r.sl_no}__${r.items}`;
// //       if (!rawGroups[k]) rawGroups[k] = [];
// //       rawGroups[k].push(r);
// //     });

// //     const bodyRows = [];
// //     const MAX_ROWS_PER_CHUNK = 10;

// //     Object.keys(rawGroups).forEach((groupKey) => {
// //       const fullGroup = rawGroups[groupKey];
// //       const [slNo, itemName] = groupKey.split('__');
// //       for (let i = 0; i < fullGroup.length; i += MAX_ROWS_PER_CHUNK) {
// //         const chunk = fullGroup.slice(i, i + MAX_ROWS_PER_CHUNK);
// //         chunk.forEach((row, rowIndex) => {
// //           const tableRow = [];
// //           if (rowIndex === 0) {
// //             tableRow.push({ content: slNo, rowSpan: chunk.length });
// //             tableRow.push({ content: i > 0 ? `${itemName} (Cont.)` : itemName, rowSpan: chunk.length });
// //           }
// //           const imgUrl = row.product_image || row.image || row.photo || row.productimage || row.img || row.picture || row.product_img;
// //           tableRow.push(...[
// //             row.brand || "-", formatPrice(row.single), formatPrice(row.qty_5_plus),
// //             formatPrice(row.qty_10_plus), formatPrice(row.qty_20_plus), formatPrice(row.qty_50_plus),
// //             formatPrice(row.qty_100_plus), formatGST(row.gst), formatPrice(row.mrp),
// //             row.warranty || "-", 
// //             { content: "", _img: imageMap[imgUrl] || null } 
// //           ]);
// //           bodyRows.push(tableRow);
// //         });
// //       }
// //     });

// //     // --- STEP 4: PREPARE DOCUMENT STRUCTURE ---
// //     // Add the required number of blank pages for the Index
// //     for (let i = 1; i < totalIndexPages; i++) { doc.addPage(); }

// //     // IMPORTANT: Move to a NEW page after the index so the table doesn't overflow
// //     doc.addPage(); 
// //     const tableStartPage = totalIndexPages + 1;

// //     // --- STEP 5: DRAW TABLE ---
// //     autoTable(doc, {
// //       head: [["SL","Item","Brand","Single","5+","10+","20+","50+","100+","GST","MRP","Warranty","Photo"]],
// //       body: bodyRows,
// //       startY: 15, 
// //       margin: { top: 20 },
// //       theme: "grid",
// //       styles: { fontSize: 7.5, valign: "middle", halign: "center" },
// //       columnStyles: { 12: { cellWidth: 25 } },
// //       didParseCell: (data) => { if (data.section === 'body') data.row.height = 15; },
// //       didDrawCell: (data) => {
// //         // Build Index Map
// //         // if (data.section === "body" && data.column.index === 1 && data.cell.raw?.content) {
// //         //   const name = data.cell.raw.content.replace(/\n/g, " ").trim();
// //         //   if (!indexMap[name]) indexMap[name] = doc.internal.getCurrentPageInfo().pageNumber;
// //         // }



// //         if (data.section === "body" && data.column.index === 1 && data.cell.raw?.content) {
// //   // 1. Convert to string and remove newlines
// //   let name = data.cell.raw.content.toString().replace(/\n/g, " ");

// //   // 2. Remove the (Cont.) suffix so it matches the original Index Key
// //   name = name.replace(/\s\(Cont\.\)$/i, "");

// //   // 3. Final trim of whitespace
// //   const cleanName = name.trim();

// //   // 4. Map it to the current page number if not already mapped
// //   if (cleanName && !indexMap[cleanName]) {
// //     indexMap[cleanName] = doc.internal.getCurrentPageInfo().pageNumber;
// //   }
// // }




// // //         if (data.section === "body" && data.column.index === 1 && data.cell.raw?.content) {
// // //           const name = data.cell.raw.content.replace(/\n/g, " ").trim();
// // //           if (!indexMap[name]) indexMap[name] = dataDoc.internal.getCurrentPageInfo().pageNumber;
// // //         }


// //         // Draw Images
// //         if (data.section === 'body' && data.column.index === 12 && data.cell.raw?._img) {
// //           doc.addImage(data.cell.raw._img, 'JPEG', data.cell.x + 2, data.cell.y + 2, 21, 11);
// //         }
// //       }
// //     });

// //     // --- STEP 6: FILL INDEX PAGES ---
// //     for (let i = 0; i < totalIndexPages; i++) {
// //       doc.setPage(i + 1);
// //       doc.setFont("helvetica", "bold").setFontSize(18).text("Product Index", 148, 15, { align: "center" });
// //       doc.setFont("courier", "normal").setFontSize(9);

// //       const pageItems = uniqueItemNames.slice(i * 36, (i + 1) * 36);
// //       pageItems.forEach((name, idx) => {
// //         const isCol2 = idx >= 18;
// //         const xStart = isCol2 ? 155 : 20;
// //         const xEnd = isCol2 ? 280 : 140;
// //         const yPos = 30 + ((idx % 18) * 9);
// //         const targetPNo = indexMap[name] || tableStartPage;

// //         doc.setTextColor(0).text(name.substring(0, 38), xStart, yPos);
// //         doc.setTextColor(0, 0, 255).text(targetPNo.toString(), xEnd - 5, yPos);
// //         doc.link(xStart, yPos - 5, (xEnd - xStart), 8, { pageNumber: targetPNo });
// //       });
// //     }

// //     // --- STEP 7: FOOTER ---
// //     const totalPages = doc.internal.getNumberOfPages();
// //     for (let i = 1; i <= totalPages; i++) {
// //       doc.setPage(i);
// //       doc.setFontSize(9).setTextColor(100).text(`Page ${i} of ${totalPages}`, 285, 205, { align: "right" });
// //     }

// //     doc.save("EXOR_PriceList.pdf");
// //     message.success({ content: "PDF Generated Successfully!", key });

// //   } catch (err) {
// //     message.error({ content: "Error: " + err.message, key });
// //   } finally {
// //     setIsProcessing(false);
// //   }
// // };










// // index with image and pagination with index clean name


// const handleSaveAsPdf = async () => {
//   if (!JsPDF) return message.error("PDF library not ready");
//   if (!selectedRows.length) return message.error("No items selected");

//   setIsProcessing(true);
//   const key = 'pdf-process';
//   message.loading({ content: 'Generating PDF...', key });

//   // --- 1. THE CLEANING HELPER (Crucial for Matching) ---
//   const cleanItemName = (name) => {
//     if (!name) return "";
//     return name
//       .toString()
//       .replace(/\n/g, " ")       // Remove new lines
//       .replace(/\s+/g, " ")      // Collapse multiple spaces into one
//       .replace(/"/g, "")         // Remove double quotes
//       .replace(/\s\(Cont\.\)$/i, "") // Remove the (Cont.) suffix
//       .trim();
//   };


//   const formatGST = (val) => {
//   if (val === undefined || val === null || val === "") return "-";
//   // If val is 18, it returns "18%"; if it's already "18%", it remains "18%"
//   return val.toString().includes("%") ? val : `${val}%`;
// };

//   const getBase64 = async (url) => {
//     if (!url || url === "-" || url === "") return null;
//     try {
//       const res = await fetch(url);
//       const blob = await res.blob();
//       return new Promise((resolve) => {
//         const reader = new FileReader();
//         reader.onloadend = () => resolve(reader.result);
//         reader.readAsDataURL(blob);
//       });
//     } catch (e) { return null; }
//   };

//   try {
//     const { default: autoTable } = await import("jspdf-autotable");
//     const doc = new JsPDF("landscape", "mm", "a4", true);
//     const indexMap = {}; 

//     // --- 2. PRE-FETCH IMAGES ---
//     const imageMap = {};
//     const uniqueUrls = [...new Set(selectedRows.map(r => 
//       r.product_image || r.image || r.photo || r.img || r.product_img
//     ).filter(u => u && u !== "-"))];

//     await Promise.all(uniqueUrls.map(async (url) => {
//       const b64 = await getBase64(url);
//       if (b64) imageMap[url] = b64;
//     }));

//     // --- 3. PRE-PROCESS INDEX LIST ---
//     const sortedData = [...selectedRows].sort((a, b) => Number(a.sl_no) - Number(b.sl_no));

//     // Create clean keys for the index
//     const uniqueItemNames = [...new Set(sortedData.map(r => cleanItemName(r.items)))]
//       .filter(name => name && name.toLowerCase() !== 'item')
//       .sort((a, b) => a.localeCompare(b));

//     const totalIndexPages = Math.ceil(uniqueItemNames.length / 36) || 1;

//     // --- 4. PRE-PROCESS BODY ROWS ---
//     const rawGroups = {};
//     sortedData.forEach(r => {
//       const k = `${r.sl_no}__${r.items}`;
//       if (!rawGroups[k]) rawGroups[k] = [];
//       rawGroups[k].push(r);
//     });

//     const bodyRows = [];
//     Object.keys(rawGroups).forEach((groupKey) => {
//       const fullGroup = rawGroups[groupKey];
//       const [slNo, itemName] = groupKey.split('__');
//       const MAX_ROWS = 10;

//       for (let i = 0; i < fullGroup.length; i += MAX_ROWS) {
//         const chunk = fullGroup.slice(i, i + MAX_ROWS);
//         chunk.forEach((row, rowIndex) => {
//           const tableRow = [];
//           if (rowIndex === 0) {
//             tableRow.push({ content: slNo, rowSpan: chunk.length });
//             // Add (Cont.) for visual UI only
//             tableRow.push({ content: i > 0 ? `${itemName.trim()} (Cont.)` : itemName.trim(), rowSpan: chunk.length });
//           }
//           const imgUrl = row.product_image || row.image || row.photo || row.img || row.product_img;
//           tableRow.push(...[
//             row.brand || "-", formatPrice(row.single), formatPrice(row.qty_5_plus),
//             formatPrice(row.qty_10_plus), formatPrice(row.qty_20_plus), formatPrice(row.qty_50_plus),
//             formatPrice(row.qty_100_plus), formatGST(row.gst || row.GST || row.gst_rate || "-"), formatPrice(row.mrp),
//             row.warranty || "-", 
//             { content: "", _img: imageMap[imgUrl] || null } 
//           ]);
//           bodyRows.push(tableRow);
//         });
//       }
//     });

//     // --- 5. DRAW TABLE ---
//     for (let i = 1; i < totalIndexPages; i++) { doc.addPage(); }
//     doc.addPage(); 
//     const tableStartPage = totalIndexPages + 1;

//     autoTable(doc, {
//       head: [["SL","Item","Brand","Single","5+","10+","20+","50+","100+","GST","MRP","Warranty","Photo"]],
//       body: bodyRows,
//       startY: 15,
//       theme: "grid",
//       styles: { fontSize: 7.5, valign: "middle", halign: "center" },
//                       columnStyles: { 
//                     0: { cellWidth: 10 }, 1: { cellWidth: 45 }, 2: { cellWidth: 45 },
//                     3: { cellWidth: 18 }, 4: { cellWidth: 18 }, 5: { cellWidth: 18 },
//                     6: { cellWidth: 18 }, 7: { cellWidth: 18 }, 8: { cellWidth: 18 },
//                     9: { cellWidth: 12 }, 10: { cellWidth: 18 }, 11: { cellWidth: 18 }, 
//                     12: { cellWidth: 20 } 
//                 },
//       didParseCell: (data) => { if (data.section === 'body') data.row.height = 15; },
//       didDrawCell: (data) => {
//         // CLEANING AND MAPPING
//         if (data.section === "body" && data.column.index === 1 && data.cell.raw?.content) {
//           const cleanName = cleanItemName(data.cell.raw.content);
//           if (cleanName && !indexMap[cleanName]) {
//             indexMap[cleanName] = doc.internal.getCurrentPageInfo().pageNumber;
//           }
//         }
//         // IMAGE DRAWING
//         if (data.section === 'body' && data.column.index === 12 && data.cell.raw?._img) {
//           doc.addImage(data.cell.raw._img, 'JPEG', data.cell.x + 2, data.cell.y + 2, 17, 11);
//         }
//       }
//     });







// // --- 6. FILL INDEX PAGES ---
// for (let i = 0; i < totalIndexPages; i++) {
//   doc.setPage(i + 1);
//   doc.setFont("helvetica", "bold").setFontSize(18).text("Product Index", 148, 15, { align: "center" });
//   doc.setFont("courier", "normal").setFontSize(9); // Courier is great for dots because it's monospaced

//   const pageItems = uniqueItemNames.slice(i * 36, (i + 1) * 36);
//   pageItems.forEach((name, idx) => {
//     const isCol2 = idx >= 18;
//     const xStart = isCol2 ? 155 : 20;
//     const xEnd = isCol2 ? 280 : 140; // The right boundary for this column
//     const yPos = 30 + ((idx % 18) * 9);
//     const targetPNo = indexMap[name] || tableStartPage;
//     const pNoStr = targetPNo.toString();

//     // 1. Draw the Item Name (with maxWidth to prevent overlap)
//     doc.setTextColor(0);
//     doc.text(name, xStart, yPos, { maxWidth: 105 }); 

//     // 2. Calculate Page Number position (Right Aligned)
//     const pNoWidth = doc.getTextWidth(pNoStr);
//     const pNoX = xEnd - pNoWidth;

//     // 3. DRAW GRAY DOTS (Integrated Logic)
//     doc.setTextColor(180); // Light gray
//     const nameWidth = Math.min(doc.getTextWidth(name), 105); // Limit width to match maxWidth
//     const dotsStart = xStart + nameWidth + 2; // 2mm gap after name
//     const dotsEnd = pNoX - 3; // 3mm gap before page number

//     if (dotsEnd > dotsStart) {
//       const dotCharWidth = doc.getTextWidth(".");
//       const dotsCount = Math.floor((dotsEnd - dotsStart) / dotCharWidth);
//       const dotsStr = ".".repeat(Math.max(0, dotsCount));
//       doc.text(dotsStr, dotsStart, yPos);
//     }

//     // 4. Draw Page Number (Blue and Clickable)
//     doc.setTextColor(0, 0, 255);
//     doc.text(pNoStr, pNoX, yPos);

//     // 5. Add Clickable Link over the whole row
//     doc.link(xStart, yPos - 5, (xEnd - xStart), 8, { pageNumber: targetPNo });
//   });
// }



//         // --- STEP 7: FOOTER ---
//               const totalPages = doc.internal.getNumberOfPages();
//               for (let i = 1; i <= totalPages; i++) {
//                 doc.setPage(i);
//                 doc.setFontSize(9).setTextColor(100).text(`Page ${i} of ${totalPages}`, 285, 205, { align: "right" });
//               }

//     doc.save("Professional_PriceList.pdf");
//     message.success({ content: "PDF Generated!", key });

//   } catch (err) {
//     message.error({ content: "Error: " + err.message, key });
//   } finally {
//     setIsProcessing(false);
//   }
// };




//   // // ---------------------------------------------
//   // // --- Share as Paginated Image (FIXED: Crisp Data, Faded Logo) ---  orginal
//   // // ---------------------------------------------
//   // const handleShareImage = async () => {
//   //   if (selectedRows.length === 0) { message.error("No items selected to share."); return; }
//   //   if (!html2canvas) { message.error("Image generation library not ready."); return; }

//   //   setIsProcessing(true);
//   //   const key = 'share-image-process';
//   //   message.loading({ content: '1/3. Preparing data...', key });

//   //   const groupedSelectedData = getGroupedData(selectedRows.sort((a, b) => a.sl_no - b.sl_no));
//   //   const pageBoundaries = getGroupAwareImagePageBoundaries(groupedSelectedData, IMAGE_PAGE_SIZE);
//   //   const pageCount = pageBoundaries.length;
//   //   const imageFiles = [];

//   //   try {
//   //       const element = imagePreviewRef.current;
//   //       if (!element) { message.error({ content: 'Failed to find rendering element.', key }); return; }

//   //       // --- IMAGE WATERMARK FIX (Reset Parent Styles) ---
//   //       // Ensure the root element has no interfering styles like opacity or background image
//   //       element.style.opacity = 1; 
//   //       element.style.backgroundColor = '#ffffff'; 
//   //       element.style.backgroundImage = 'none'; 
//   //       // --- END FIX ---

//   //       // 1. Loop through pages and generate images
//   //       for (let i = 0; i < pageCount; i++) {
//   //           const { start: startIndex, end: endIndex } = pageBoundaries[i];
//   //           const pageData = groupedSelectedData.slice(startIndex, endIndex);

//   //           message.loading({ content: `2/3. Generating Image Page ${i + 1} of ${pageCount}...`, key });

//   //           // Manually set the content of the hidden ref for the current page
//   //           element.innerHTML = `
//   //               <h2 style="text-align: center; margin-bottom: 10px; color: #333;">Selected Price List (Page ${i + 1} of ${pageCount})</h2>

//   //               ${logoBase64 ? `
//   //                   <div style="
//   //                       position: absolute; 
//   //                       top: 0; 
//   //                       left: 0; 
//   //                       width: 100%; 
//   //                       height: 100%; 
//   //                       // background-image: url(${logoBase64});
//   //                       background-repeat: no-repeat;
//   //                       background-position: center center;
//   //                       background-size: 300px;
//   //                       opacity: 0.15; /* Logo is faint */
//   //                       pointer-events: none;
//   //                       z-index: 2; /* Low Z-index */
//   //                   "></div>
//   //               ` : ''}
//   //               <div style="position: relative; z-index: 2; background-color: white; padding-top: 50px;">
//   //                   <table class="${styles.imageTable}">
//   //                       <thead>
//   //                           <tr style="background-color: #f8f9fa !important;">
//   //           <th style="width: 60px;">SL No</th>
//   //           <th style="width: 250px; text-align: left; padding-left: 15px;">Item</th>
//   //           <th style="width: 250px;">Brand</th>
//   //           <th>Single</th>
//   //           <th>5+</th>
//   //           <th>10+</th>
//   //           <th>20+</th>
//   //           <th>50+</th>
//   //           <th>100+</th>
//   //           <th>GST</th>
//   //           <th>MRP</th>
//   //           <th>Warranty</th>
//   //           <th style="width: 80px;">Image</th>
//   //       </tr>
//   //                       </thead>
//   //                       <tbody>
//   //                           ${pageData.map((row, idx) => `
//   //                               <tr key=${row.key || idx}>
//   //                                   <td rowspan="${row.rowSpan > 0 ? row.rowSpan : 1}" style="display: ${row.rowSpan === 0 ? 'none' : 'table-cell'};">${row.sl_no}</td>
//   //                                   <td rowspan="${row.rowSpan > 0 ? row.rowSpan : 1}" style="display: ${row.rowSpan === 0 ? 'none' : 'table-cell'};">${row.items}</td>
//   //                                   <td>${row.brand || '-'}</td>
//   //                                   <td>${formatPrice(row.single)}</td>
//   //                                   <td>${formatPrice(row.qty_5_plus)}</td>
//   //                                   <td>${formatPrice(row.qty_10_plus)}</td>
//   //                                   <td>${formatPrice(row.qty_20_plus)}</td>
//   //                                   <td>${formatPrice(row.qty_50_plus)}</td>
//   //                                   <td>${formatPrice(row.qty_100_plus)}</td>
//   //                                   <td>${formatGST(row.gst)}</td>
//   //                                   <td>${formatPrice(row.mrp)}</td>
//   //                                   <td>${row.warranty || '-'}</td>
//   //                                   <td>
//   //                                       ${row.product_image ? `<img src="${row.product_image}" alt="Product" style="width: 50px; height: 50px; object-fit: contain;" crossorigin="anonymous" />` : ''}
//   //                                   </td>
//   //                               </tr>
//   //                           `).join('')}
//   //                       </tbody>
//   //                   </table>
//   //               </div>
//   //           `;

//   //           // Convert to Canvas and then Blob
//   //           const canvas = await html2canvas(element, {
//   //               scale: 3, 
//   //               useCORS: true, 
//   //               allowTaint: true,
//   //               backgroundColor: '#ffffff',
//   //               removeContainer: false 
//   //           });

//   //           const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9)); 
//   //           if (!blob) throw new Error(`Failed to create image blob for page ${i + 1}.`);

//   //           const fileName = `PriceList_Page_${i + 1}.jpeg`;
//   //           const file = new File([blob], fileName, { type: "image/jpeg" });

//   //           imageFiles.push(file);
//   //       }

//   //       // 2. Attempt Multi-File Web Share (Primary Goal)
//   //       message.loading({ content: `3/3. Attempting to share ${pageCount} images directly...`, key });

//   //       if (navigator.share && navigator.canShare && navigator.canShare({ files: imageFiles })) {
//   //           await navigator.share({
//   //               files: imageFiles,
//   //               title: 'Paginated Product Price List',
//   //               text: `Paginated price list (${pageCount} images) for ${new Date().toLocaleDateString()}`
//   //           });
//   //           message.success({ content: `${pageCount} images shared successfully!`, key, duration: 3 });
//   //       } 

//   //       // 3. Fallback: Provide individual download links
//   //       else {
//   //           message.warn({ 
//   //               content: `Multi-file sharing not supported. Preparing ${pageCount} individual download links.`, 
//   //               key, 
//   //               duration: 5 
//   //           });

//   //           const downloadLinks = imageFiles.map((file, index) => {
//   //               const url = URL.createObjectURL(file);
//   //               return `<p><a href="${url}" download="${file.name}" target="_blank" style="padding: 8px; margin: 4px; border: 1px solid blue; text-decoration: none; display: block;">Download Page ${index + 1} (${file.name})</a></p>`;
//   //           }).join('');

//   //           message.info({
//   //               content: (
//   //                   <div>
//   //                       <p style={{ fontWeight: 'normal' }}>To share, please download the pages individually:</p>
//   //                       <div dangerouslySetInnerHTML={{ __html: downloadLinks }} /> 
//   //                   </div>
//   //               ),
//   //               duration: 15,
//   //               key: 'share-fallback'
//   //           });

//   //           setTimeout(() => { imageFiles.forEach(file => URL.revokeObjectURL(file.url)); }, 10000);
//   //       }

//   //   } catch (error) {
//   //       console.error("PAGINATED IMAGE SHARE CRASH DETAILS:", error);
//   //       message.error({ content: `Image sharing failed: ${error.message}`, key });
//   //   } finally { 
//   //       // Cleanup the temporary content and styles
//   //       if (imagePreviewRef.current) {
//   //           imagePreviewRef.current.innerHTML = '';
//   //           // Reset custom styles
//   //           imagePreviewRef.current.style.backgroundImage = 'none';
//   //           imagePreviewRef.current.style.opacity = 1;
//   //       }
//   //       setIsProcessing(false); 
//   //   }
//   // };


//   // const totalFixedWidth = columns.reduce((sum, col) => sum + (col.width || 0), 0);
//   // const totalFilteredRows = filteredAndGroupedData.length;
//   // const currentPageDataSize = paginatedData.length;
//   // const startRange = currentPageDataSize > 0 ? filteredAndGroupedData.indexOf(paginatedData[0]) + 1 : 0;
//   // const endRange = startRange > 0 ? startRange + currentPageDataSize - 1 : 0;










//   // ---------------------------------------------
//   // --- Share as Paginated Image (FIXED: Crisp Data, Faded Logo) ---  working
//   // ---------------------------------------------
//   const handleShareImage = async () => {
//     if (selectedRows.length === 0) { message.error("No items selected to share."); return; }
//     if (!html2canvas) { message.error("Image generation library not ready."); return; }

//     setIsProcessing(true);
//     const key = 'share-image-process';
//     message.loading({ content: '1/3. Preparing data...', key });

//     // Sort and group data
//     const groupedSelectedData = getGroupedData([...selectedRows].sort((a, b) => (a.sl_no || 0) - (b.sl_no || 0)));
//     const pageBoundaries = getGroupAwareImagePageBoundaries(groupedSelectedData, IMAGE_PAGE_SIZE);
//     const pageCount = pageBoundaries.length;
//     const imageFiles = [];

//     try {
//         const element = imagePreviewRef.current;
//         if (!element) { throw new Error('Failed to find rendering element.'); }

//         // --- STYLING FIX: Ensure container is visible for html2canvas but off-screen ---
//         element.style.display = 'block';
//         element.style.position = 'fixed';
//         element.style.left = '-9999px';
//         element.style.width = '1200px'; // Consistent width for high-quality output
//         element.style.backgroundColor = '#ffffff'; 

//         for (let i = 0; i < pageCount; i++) {
//             const { start: startIndex, end: endIndex } = pageBoundaries[i];
//             const pageData = groupedSelectedData.slice(startIndex, endIndex);

//             message.loading({ content: `2/3. Generating Image Page ${i + 1} of ${pageCount}...`, key });

//             // --- INLINE STYLING FIX: Use explicit styles instead of CSS modules ---
//             element.innerHTML = `
//                 <div style="padding: 40px; position: relative; background: white;">
//                     <h2 style="text-align: center; margin-bottom: 20px; color: #333; font-family: sans-serif;">
//                         Selected Price List (Page ${i + 1} of ${pageCount})
//                     </h2>

//                     ${logoBase64 ? `
//                         <div style="
//                             position: absolute; 
//                             top: 50%; left: 50%; 
//                             transform: translate(-50%, -50%);
//                             width: 600px; height: 600px;
//                             background-image: url(${logoBase64});
//                             background-repeat: no-repeat;
//                             background-position: center;
//                             background-size: contain;
//                             opacity: 0.1; /* Very faint watermark */
//                             pointer-events: none;
//                             z-index: 1;
//                         "></div>
//                     ` : ''}

//                     <table style="width: 100%; border-collapse: collapse; position: relative; z-index: 2; font-family: sans-serif; font-size: 12px; border: 1px solid #ddd;">
//                         <thead>
//                             <tr style="background-color: #f2f2f2;">
//                                 <th style="border: 1px solid #ddd; padding: 8px;">SL</th>
//                                 <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Item</th>
//                                 <th style="border: 1px solid #ddd; padding: 8px;">Brand</th>
//                                 <th style="border: 1px solid #ddd; padding: 8px;">Single</th>
//                                 <th style="border: 1px solid #ddd; padding: 8px;">5+</th>
//                                 <th style="border: 1px solid #ddd; padding: 8px;">10+</th>
//                                 <th style="border: 1px solid #ddd; padding: 8px;">20+</th>
//                                 <th style="border: 1px solid #ddd; padding: 8px;">50+</th>
//                                 <th style="border: 1px solid #ddd; padding: 8px;">100+</th>
//                                 <th style="border: 1px solid #ddd; padding: 8px;">GST</th>
//                                 <th style="border: 1px solid #ddd; padding: 8px;">MRP</th>
//                                 <th style="border: 1px solid #ddd; padding: 8px;">Image</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             ${pageData.map((row) => `
//                                 <tr>
//                                     <td style="border: 1px solid #ddd; padding: 8px; text-align: center; display: ${row.rowSpan === 0 ? 'none' : 'table-cell'};" rowspan="${row.rowSpan || 1}">${row.sl_no}</td>
//                                     <td style="border: 1px solid #ddd; padding: 8px; display: ${row.rowSpan === 0 ? 'none' : 'table-cell'};" rowspan="${row.rowSpan || 1}">${row.items}</td>
//                                     <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${row.brand || '-'}</td>
//                                     <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${row.single || '-'}</td>
//                                     <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${row.qty_5_plus || '-'}</td>
//                                     <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${row.qty_10_plus || '-'}</td>
//                                     <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${row.qty_20_plus || '-'}</td>
//                                     <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${row.qty_50_plus || '-'}</td>
//                                     <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${row.qty_100_plus || '-'}</td>
//                                     <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${row.gst || '-'}</td>
//                                     <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${row.mrp || '-'}</td>
//                                     <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
//                                         ${row.product_image ? `<img src="${row.product_image}" style="width: 40px; height: 40px; object-fit: contain;" crossorigin="anonymous" />` : '-'}
//                                     </td>
//                                 </tr>
//                             `).join('')}
//                         </tbody>
//                     </table>
//                 </div>
//             `;

//             // Wait a small moment for images inside element to decode
//             await new Promise(r => setTimeout(r, 300));

//             const canvas = await html2canvas(element, {
//                 scale: 2, // 2 is usually enough for WhatsApp/Email and keeps file size small
//                 useCORS: true, 
//                 backgroundColor: '#ffffff',
//                 logging: false
//             });

//             const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85)); 
//             if (!blob) throw new Error(`Failed to create page ${i + 1}`);

//             imageFiles.push(new File([blob], `PriceList_Page_${i + 1}.jpeg`, { type: "image/jpeg" }));
//         }

//         // 3. SHARE LOGIC
//         if (navigator.canShare && navigator.canShare({ files: imageFiles })) {
//             await navigator.share({
//                 files: imageFiles,
//                 title: 'Product Price List',
//             });
//             message.success({ content: 'Shared successfully!', key });
//         } else {
//             throw new Error("Device does not support direct image sharing.");
//         }

//     } catch (error) {
//         console.error("SHARE ERROR:", error);
//         message.error({ content: error.message, key });
//     } finally { 
//         if (imagePreviewRef.current) {
//             imagePreviewRef.current.innerHTML = '';
//             imagePreviewRef.current.style.display = 'none';
//         }
//         setIsProcessing(false); 
//     }
//   };










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
//             Share Whatsapp ({selectedRows.length})
//           </Button>

//           <Button 
//             type="primary" 
//             danger 
//             onClick={handleSaveAsPdf} 
//             loading={isProcessing} 
//             disabled={selectedRows.length === 0 || !JsPDF}
//           >
//             Save as PDF ({selectedRows.length})
//           </Button>
//         </Space>
//         <Input.Search placeholder="Search by Item or Brand" allowClear onSearch={handleSearch} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: 200 }} />
//       </Space>

//       {/* --- HIDDEN HTML DIV FOR IMAGE GENERATION (IMPORTANT: position: relative) --- */}
//       <div 
//         ref={imagePreviewRef} 
//         style={{ 
//             position: 'absolute', 
//             top: '-9999px', 
//             left: '-9999px', 
//             padding: '10px', 
//             backgroundColor: 'white', 
//             width: '1200px',
//             position: 'relative' /* CRITICAL: Allows absolute positioning of the watermark */
//         }}
//       >
//       </div>
//       {/* --- END HIDDEN HTML DIV --- */}


//       <div ref={visibleTableRef}>
//         <Table 
//             className={styles.responsivePriceTable}
//             columns={columns} 
//             dataSource={paginatedData} 
//             loading={loading} 
//             rowKey="id" 
//             pagination={false} 
//             scroll={{ x: 'max-content' }} 
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











// ////===========working and cleaned model================///////////






// import { useEffect, useState, useCallback, useMemo, useRef } from "react";
// // Ensure this path is correct for your Supabase client setup
// import { supabase } from "../lib/supabaseClient"; 
// import { Table, Image, Button, Space, Input, message, Pagination, Flex, Typography } from "antd";
// import Link from "next/link";
// // Assuming you have a styles file for image table CSS
// import styles from './pricelist.module.css'; 
// import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';



// // ===============================================
// // GLOBAL CONFIGURATION
// // ===============================================
// const PAGE_SIZE_HINT = 15;
// const IMAGE_PAGE_SIZE = 15;

// // 🚨 YOUR LOGO URL
// const LOGO_URL = 'https://res.cloudinary.com/dusbkxi2q/image/upload/v1769493205/product_images/dlq4igdaovrf23qnb6gn.png'; 
// // ===============================================

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


// const { Title } = Typography;



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
//   const [logoBase64, setLogoBase64] = useState(''); 

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

//   // useEffect(() => { fetchProducts(); }, [fetchProducts]);


// // --- 🚀 AUTOLOAD (REALTIME) LOGIC INTEGRATED HERE ---
//   useEffect(() => { 
//     fetchProducts(); 

//     const channel = supabase
//       .channel('realtime-products-home')
//       .on('postgres_changes', 
//         { event: '*', schema: 'public', table: 'products' }, 
//         (payload) => {
//           console.log('Realtime update:', payload);
//           fetchProducts(); 
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [fetchProducts]);



//   // Load libraries dynamically and load logo
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       import('jspdf').then(module => { setJsPDF(() => module.jsPDF || module.default); });
//       import('html2canvas').then(module => { setHtml2Canvas(() => module.default || module); });

//       // --- Load Logo ---
//       const loadLogo = async () => {
//           if (LOGO_URL) {
//               const base64 = await urlToBase64(LOGO_URL);
//               setLogoBase64(base64);
//           }
//       };
//       loadLogo();
//       // -------------------
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
//     setCurrentPage(1); 
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
//  //  // --- PDF Generation with Watermark (Data is Crisp) ---
//  // ---------------------------------------------







// const handleSaveAsPdf = async () => {
//   if (!JsPDF) return message.error("PDF library not ready");
//   if (!selectedRows.length) return message.error("No items selected");

//   setIsProcessing(true);
//   const key = 'pdf-process';
//   message.loading({ content: 'Generating PDF...', key });

//   const LOGO_URL = 'https://res.cloudinary.com/dusbkxi2q/image/upload/v1769493205/product_images/dlq4igdaovrf23qnb6gn.png';

//   // --- 1. THE CLEANING HELPER (Crucial for Matching) ---
//   const cleanItemName = (name) => {
//     if (!name) return "";
//     return name
//       .toString()
//       .replace(/\n/g, " ")       // Remove new lines
//       .replace(/\s+/g, " ")      // Collapse multiple spaces into one
//       .replace(/"/g, "")         // Remove double quotes
//       .replace(/\s\(Cont\.\)$/i, "") // Remove the (Cont.) suffix
//       .trim();
//   };


//   const formatGST = (val) => {
//   if (val === undefined || val === null || val === "") return "-";
//   // If val is 18, it returns "18%"; if it's already "18%", it remains "18%"
//   return val.toString().includes("%") ? val : `${val}%`;
// };

//   const getBase64 = async (url) => {
//     if (!url || url === "-" || url === "") return null;
//     try {
//       const res = await fetch(url);
//       const blob = await res.blob();
//       return new Promise((resolve) => {
//         const reader = new FileReader();
//         reader.onloadend = () => resolve(reader.result);
//         reader.readAsDataURL(blob);
//       });
//     } catch (e) { return null; }
//   };

//   try {
//     const { default: autoTable } = await import("jspdf-autotable");
//     const doc = new JsPDF("landscape", "mm", "a4", true);
//     const indexMap = {}; 

//     // --- 2. PRE-FETCH IMAGES ---
// const watermarkBase64 = await getBase64(LOGO_URL);

//     const imageMap = {};
//     const uniqueUrls = [...new Set(selectedRows.map(r => 
//       r.product_image || r.image || r.photo || r.img || r.product_img
//     ).filter(u => u && u !== "-"))];

//     await Promise.all(uniqueUrls.map(async (url) => {
//       const b64 = await getBase64(url);
//       if (b64) imageMap[url] = b64;
//     }));

//     // --- 3. PRE-PROCESS INDEX LIST ---
//     const sortedData = [...selectedRows].sort((a, b) => Number(a.sl_no) - Number(b.sl_no));

//     // Create clean keys for the index
//     const uniqueItemNames = [...new Set(sortedData.map(r => cleanItemName(r.items)))]
//       .filter(name => name && name.toLowerCase() !== 'item')
//       .sort((a, b) => a.localeCompare(b));

//     const totalIndexPages = Math.ceil(uniqueItemNames.length / 36) || 1;

//     // --- 4. PRE-PROCESS BODY ROWS ---
//     const rawGroups = {};
//     sortedData.forEach(r => {
//       const k = `${r.sl_no}__${r.items}`;
//       if (!rawGroups[k]) rawGroups[k] = [];
//       rawGroups[k].push(r);
//     });

//     const bodyRows = [];
//     Object.keys(rawGroups).forEach((groupKey) => {
//       const fullGroup = rawGroups[groupKey];
//       const [slNo, itemName] = groupKey.split('__');
//       const MAX_ROWS = 10;

//       for (let i = 0; i < fullGroup.length; i += MAX_ROWS) {
//         const chunk = fullGroup.slice(i, i + MAX_ROWS);
//         chunk.forEach((row, rowIndex) => {
//           const tableRow = [];
//           if (rowIndex === 0) {
//             tableRow.push({ content: slNo, rowSpan: chunk.length });
//             // Add (Cont.) for visual UI only
//             tableRow.push({ content: i > 0 ? `${itemName.trim()} (Cont.)` : itemName.trim(), rowSpan: chunk.length });
//           }
//           const imgUrl = row.product_image || row.image || row.photo || row.img || row.product_img;
//           tableRow.push(...[
//             row.brand || "-", formatPrice(row.single), formatPrice(row.qty_5_plus),
//             formatPrice(row.qty_10_plus), formatPrice(row.qty_20_plus), formatPrice(row.qty_50_plus),
//             formatPrice(row.qty_100_plus), formatGST(row.gst || row.GST || row.gst_rate || "-"), formatPrice(row.mrp),
//             row.warranty || "-", 
//             { content: "", _img: imageMap[imgUrl] || null } 
//           ]);
//           bodyRows.push(tableRow);
//         });
//       }
//     });

//     // --- 5. DRAW TABLE ---
//     for (let i = 1; i < totalIndexPages; i++) { doc.addPage(); }
//     doc.addPage(); 
//     const tableStartPage = totalIndexPages + 1;

//     autoTable(doc, {
//       head: [["SL","Item","Brand","Single","5+","10+","20+","50+","100+","GST","MRP","Warranty","Photo"]],
//       body: bodyRows,
//       startY: 15,
//       theme: "grid",
//       styles: { fontSize: 7.5, valign: "middle", halign: "center" },
//                       columnStyles: { 
//                     0: { cellWidth: 10 }, 1: { cellWidth: 45 }, 2: { cellWidth: 45 },
//                     3: { cellWidth: 18 }, 4: { cellWidth: 18 }, 5: { cellWidth: 18 },
//                     6: { cellWidth: 18 }, 7: { cellWidth: 18 }, 8: { cellWidth: 18 },
//                     9: { cellWidth: 12 }, 10: { cellWidth: 18 }, 11: { cellWidth: 18 }, 
//                     12: { cellWidth: 20 } 
//                 },
//       didParseCell: (data) => { if (data.section === 'body') data.row.height = 15; },

// didDrawPage: (data) => {
//         // --- WATERMARK DRAWING (Added here) ---
//         if (watermarkBase64) {
//           const pageSize = doc.internal.pageSize;
//           const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
//           const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();

//           doc.saveGraphicsState();
//           // Set Opacity to 0.1 (10%) to stay subtle
//           doc.setGState(new doc.GState({ opacity: 0.05 })); 

//           const imgWidth = 150;
//           const imgHeight = 60;


//           doc.addImage(watermarkBase64, 'PNG',130, 120,150,60, undefined, 'FAST', 45);
//           doc.restoreGraphicsState();
//         }
//       },

//       didDrawCell: (data) => {
//         // CLEANING AND MAPPING
//         if (data.section === "body" && data.column.index === 1 && data.cell.raw?.content) {
//           const cleanName = cleanItemName(data.cell.raw.content);
//           if (cleanName && !indexMap[cleanName]) {
//             indexMap[cleanName] = doc.internal.getCurrentPageInfo().pageNumber;
//           }
//         }
//         // IMAGE DRAWING
//         if (data.section === 'body' && data.column.index === 12 && data.cell.raw?._img) {
//           doc.addImage(data.cell.raw._img, 'JPEG', data.cell.x + 2, data.cell.y + 2, 17, 11);
//         }
//       }
//     });







// // --- 6. FILL INDEX PAGES ---
// for (let i = 0; i < totalIndexPages; i++) {
//   doc.setPage(i + 1);
//   doc.setFont("helvetica", "bold").setFontSize(18).text("Product Index", 148, 15, { align: "center" });
//   doc.setFont("helvetica", "normal").setFontSize(9); // Courier is great for dots because it's monospaced

//   const pageItems = uniqueItemNames.slice(i * 36, (i + 1) * 36);
//   pageItems.forEach((name, idx) => {
//     const isCol2 = idx >= 18;
//     const xStart = isCol2 ? 155 : 20;
//     const xEnd = isCol2 ? 280 : 140; // The right boundary for this column
//     const yPos = 30 + ((idx % 18) * 9);
//     const targetPNo = indexMap[name] || tableStartPage;
//     const pNoStr = targetPNo.toString();

//     // 1. Draw the Item Name (with maxWidth to prevent overlap)
//     doc.setTextColor(0);
//     doc.text(name, xStart, yPos, { maxWidth: 105 }); 

//     // 2. Calculate Page Number position (Right Aligned)
//     const pNoWidth = doc.getTextWidth(pNoStr);
//     const pNoX = xEnd - pNoWidth;

//     // 3. DRAW GRAY DOTS (Integrated Logic)
//     doc.setTextColor(180); // Light gray
//     const nameWidth = Math.min(doc.getTextWidth(name), 105); // Limit width to match maxWidth
//     const dotsStart = xStart + nameWidth + 2; // 2mm gap after name
//     const dotsEnd = pNoX - 3; // 3mm gap before page number

//     if (dotsEnd > dotsStart) {
//       const dotCharWidth = doc.getTextWidth(".");
//       const dotsCount = Math.floor((dotsEnd - dotsStart) / dotCharWidth);
//       const dotsStr = ".".repeat(Math.max(0, dotsCount));
//       doc.text(dotsStr, dotsStart, yPos);
//     }

//     // 4. Draw Page Number (Blue and Clickable)
//     doc.setTextColor(0, 0, 255);
//     doc.text(pNoStr, pNoX, yPos);

//     // 5. Add Clickable Link over the whole row
//     doc.link(xStart, yPos - 5, (xEnd - xStart), 8, { pageNumber: targetPNo });
//   });
// }



//         // --- STEP 7: FOOTER ---
//               const totalPages = doc.internal.getNumberOfPages();
//               for (let i = 1; i <= totalPages; i++) {
//                 doc.setPage(i);
//                 doc.setFontSize(9).setTextColor(100).text(`Page ${i} of ${totalPages}`, 285, 205, { align: "right" });
//               }

//     doc.save("Exor_PriceList.pdf");
//     message.success({ content: "PDF Generated!", key });

//   } catch (err) {
//     message.error({ content: "Error: " + err.message, key });
//   } finally {
//     setIsProcessing(false);
//   }
// };












// // ---------------------------------------------
//   // --- Share as Paginated Image (Clipboard + WhatsApp Web) ---
//   // ---------------------------------------------
//   const handleShareImage = async () => {
//     if (selectedRows.length === 0) { message.error("No items selected to share."); return; }
//     if (!html2canvas) { message.error("Image generation library not ready."); return; }

//     setIsProcessing(true);
//     const key = 'share-image-process';
//     message.loading({ content: '1/3. Preparing data...', key });

//     const sortedData = [...selectedRows].sort((a, b) => (Number(a.sl_no) || 0) - (Number(b.sl_no) || 0));
//     const groupedSelectedData = getGroupedData(sortedData);
//     const pageBoundaries = getGroupAwareImagePageBoundaries(groupedSelectedData, IMAGE_PAGE_SIZE);
//     const pageCount = pageBoundaries.length;
//     const imageFiles = [];
//     const logoWithCORS = `${LOGO_URL}${LOGO_URL.includes('?') ? '&' : '?'}t=${new Date().getTime()}`;



//     let element = null;

//     try {
//         element = imagePreviewRef.current;
//         if (!element) { message.error({ content: 'Failed to find rendering element.', key }); return; }

//         element.style.display = 'block';
//         element.style.opacity = 1; 
//         element.style.backgroundColor = '#ffffff'; 

//         for (let i = 0; i < pageCount; i++) {
//             const { start: startIndex, end: endIndex } = pageBoundaries[i];
//             const pageData = groupedSelectedData.slice(startIndex, endIndex);

//             message.loading({ content: `2/3. Generating Page ${i + 1} of ${pageCount}...`, key });

//             element.innerHTML = `
//                 <h2 style="text-align: center; margin-bottom: 10px; color: #333;">Selected Price List (Page ${i + 1} of ${pageCount})</h2>
//                 ${logoBase64 ? `<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-repeat: no-repeat; background-position: center center; background-size: 300px; opacity: 0.15; pointer-events: none; z-index: 2;"></div>` : ''}







// <div style="
//             position: absolute;
//             top: 50%;
//             left: 50%;
//             transform: translate(-50%, -50%) rotate(-30deg);
//             width: 800px; /* Adjust size as needed */
//             z-index: 9999; /* Forces it to the very front */
//             opacity: 0.06; /* Very low opacity for subtle watermark effect */
//             pointer-events: none; /* Allows clicking through to table if needed */
//             display: flex;
//             justify-content: center;
//         ">
//             <img 
//                 src="${logoWithCORS}" 
//                 style="width: 100%; height: auto; display: block;" 
//                 crossorigin="anonymous" 
//             />
//         </div>









//                 <div style="position: relative; z-index: 2; background-color: white; padding-top: 50px;">
//                     <table class="${styles.imageTable}">
//                         <thead>
//                             <tr style="background-color: #f8f9fa !important;">
//                                 <th style="width: 60px;">SL No</th>
//                                 <th style="width: 250px; text-align: left; padding-left: 15px;">Item</th>
//                                 <th style="width: 250px;">Brand</th>
//                                 <th>Single</th>
//                                 <th>5+</th>
//                                 <th>10+</th>
//                                 <th>20+</th>
//                                 <th>50+</th>
//                                 <th>100+</th>
//                                 <th>GST</th>
//                                 <th>MRP</th>
//                                 <th>Warranty</th>
//                                 <th style="width: 80px;">Image</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             ${pageData.map((row, idx) => `
//                                 <tr key=${row.key || idx}>
//                                     <td rowspan="${row.rowSpan > 0 ? row.rowSpan : 1}" style="display: ${row.rowSpan === 0 ? 'none' : 'table-cell'};">${row.sl_no}</td>
//                                     <td rowspan="${row.rowSpan > 0 ? row.rowSpan : 1}" style="display: ${row.rowSpan === 0 ? 'none' : 'table-cell'};">${row.items}</td>
//                                     <td>${row.brand || '-'}</td>
//                                     <td>${formatPrice(row.single)}</td>
//                                     <td>${formatPrice(row.qty_5_plus)}</td>
//                                     <td>${formatPrice(row.qty_10_plus)}</td>
//                                     <td>${formatPrice(row.qty_20_plus)}</td>
//                                     <td>${formatPrice(row.qty_50_plus)}</td>
//                                     <td>${formatPrice(row.qty_100_plus)}</td>
//                                     <td>${formatGST(row.gst)}</td>
//                                     <td>${formatPrice(row.mrp)}</td>
//                                     <td>${row.warranty || '-'}</td>
//                                     <td>
//                                         ${row.product_image ? `<img src="${row.product_image}" alt="Product" style="width: 50px; height: 50px; object-fit: contain;" crossorigin="anonymous" />` : ''}
//                                     </td>
//                                 </tr>
//                             `).join('')}
//                         </tbody>
//                     </table>
//                 </div>
//             `;

//             const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
//             const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png')); 

//             imageFiles.push({
//                 blob: blob, 
//                 fileName: `PriceList_P${i + 1}.png`,
//                 url: URL.createObjectURL(blob)
//             });
//         }

//         const copyToClipboard = async (blob) => {
//             try {
//                 const data = [new ClipboardItem({ "image/png": blob })];
//                 await navigator.clipboard.write(data);
//                 message.success("Copied to Clipboard!");
//             } catch (err) {
//                 message.error("Clipboard blocked. Use Download.");
//             }
//         };

//         message.destroy(key);
//         message.info({
//             content: (
//                 <div style={{ textAlign: 'left', position: 'relative', paddingTop: '10px' }}>
//                     {/* CLOSE BUTTON */}
//                     <div 
//                         onClick={() => message.destroy('share-ui')} 
//                         style={{ 
//                             position: 'absolute', top: '-10px', right: '-10px', 
//                             cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', 
//                             padding: '5px', color: '#888' 
//                         }}
//                     >
//                         &times;
//                     </div>

//                     <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Share to WhatsApp Web:</p>
//                     <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
//                         {imageFiles.map((img, index) => (
//                             <div key={index} style={{ background: '#f5f5f5', padding: '10px', marginBottom: '8px', borderRadius: '6px' }}>
//                                 <div style={{ marginBottom: '5px', fontSize: '12px' }}>Page {index + 1}</div>
//                                 <Space>
//                                     <Button size="small" type="primary" ghost onClick={() => copyToClipboard(img.blob)}>
//                                         Copy Page
//                                     </Button>
//                                     <Button size="small" href={img.url} download={img.fileName}>
//                                         Download
//                                     </Button>
//                                 </Space>
//                             </div>
//                         ))}
//                     </div>
//                     <Button 
//                         type="primary" block style={{ backgroundColor: '#25D366', marginTop: '10px' }}
//                         onClick={() => window.open('https://web.whatsapp.com/', '_blank')}
//                     >
//                         Open WhatsApp Web
//                     </Button>
//                 </div>
//             ),
//             duration: 0, // Manual close only
//             key: 'share-ui'
//         });

//     } catch (error) {
//         message.error(`Sharing failed: ${error.message}`);
//     } finally { 
//         if (element) {
//             element.innerHTML = '';
//             element.style.display = 'none';
//         }
//         setIsProcessing(false); 
//     }
//   };

//   const totalFilteredRows = filteredAndGroupedData.length;
//   const currentPageDataSize = paginatedData.length;
//   const startRange = currentPageDataSize > 0 ? filteredAndGroupedData.indexOf(paginatedData[0]) + 1 : 0;
//   const endRange = startRange > 0 ? startRange + currentPageDataSize - 1 : 0;














//   // ---------------------------------------------
//   // --- Render ---
//   // ---------------------------------------------
//   return (
//   <div style={{ padding: 20 }}>

//     {/* Row 1: Heading (Left) and Page Links (Right) */}
//     <Flex justify="space-between" align="center" style={{ marginBottom: 20 }}>
//       <Title level={2} style={{ margin: 0 }}>EXOR Product Price List</Title>

//       <Space wrap size="small">
//         <Link href="/manage-products">
//           <Button type="primary" style={{ backgroundColor: '#7a7979',  }}>
//             Manage Products</Button>
//         </Link>
//         <Link href="/manage-items">
//           <Button type="primary" style={{ backgroundColor: '#609dee',  }}>
//             Manage Item List</Button>
//         </Link>
//         <Link href="/approval-page">
//           <Button type="primary" style={{ backgroundColor: '#7a7979',  }}>
//             Approval Page</Button>
//         </Link>
//         <Link href="/rejected-requests">
//           <Button type="primary" style={{ backgroundColor: '#609dee',  }}>
//             Rejected Items</Button>

//         </Link>
//         <Link href="/logs">
//           <Button type="primary" style={{ backgroundColor: '#7a7979',  }}>
//             Logs</Button>
//         </Link>
//       </Space>
//     </Flex>

//     {/* Row 2: Action Buttons (Left) & Search (Right) */}
//     <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
//       <Space wrap size="small">
//         {/* "+ Add New Product" is now part of the actions row */}
//         <Link href="/add-product">
//           <Button type="primary">+ Add New Product</Button>
//         </Link>

//         <Button 
//           onClick={handleSelectAllFiltered} 
//           disabled={isProcessing || allFilteredKeys.length === 0 || selectedRows.length === allFilteredKeys.length}
//         >
//           Select All Filtered ({allFilteredKeys.length})
//         </Button>

//         <Button 
//           onClick={handleClearSelection} 
//           disabled={isProcessing || selectedRows.length === 0}
//         >
//           Clear Selection
//         </Button>

//         <Button 
//           type="primary"
//           style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} 
//           onClick={handleShareImage} 
//           loading={isProcessing} 
//           disabled={selectedRows.length === 0 || !html2canvas}
//         >
//           Share Whatsapp ({selectedRows.length})
//         </Button>

//         <Button 
//           type="primary" 
//           danger 
//           onClick={handleSaveAsPdf} 
//           loading={isProcessing} 
//           disabled={selectedRows.length === 0 || !JsPDF}
//         >
//           Save as PDF ({selectedRows.length})
//         </Button>
//       </Space>

//       {/* Search Bar aligned to the right of the actions */}
//       <Input.Search 
//         placeholder="Search by Item or Brand" 
//         allowClear 
//         onSearch={handleSearch} 
//         onChange={(e) => setSearchTerm(e.target.value)} 
//         style={{ width: 250 }} 
//       />
//     </Flex>


//       {/* --- HIDDEN HTML DIV FOR IMAGE GENERATION (IMPORTANT: position: relative) --- */}
//       <div 
//         ref={imagePreviewRef} 
//         style={{ 
//             position: 'absolute', 
//             top: '-9999px', 
//             left: '-9999px', 
//             padding: '10px', 
//             backgroundColor: 'white', 
//             width: '1200px',
//             position: 'relative' /* CRITICAL: Allows absolute positioning of the watermark */
//         }}
//       >
//       </div>
//       {/* --- END HIDDEN HTML DIV --- */}


//       <div ref={visibleTableRef}>
//         <Table 
//             className={styles.responsivePriceTable}
//             columns={columns} 
//             dataSource={paginatedData} 
//             loading={loading} 
//             rowKey="id" 
//             pagination={false} 
//             scroll={{ x: 'max-content' }} 
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





































////===========working================///////////






import { useEffect, useState, useCallback, useMemo, useRef } from "react";
// Ensure this path is correct for your Supabase client setup
import { supabase } from "../lib/supabaseClient";
import { Table, Image, Button, Space, Input, message, Pagination, Flex, Typography } from "antd";
import Link from "next/link";
// Assuming you have a styles file for image table CSS
import styles from './pricelist.module.css';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';



// ===============================================
// GLOBAL CONFIGURATION
// ===============================================
const PAGE_SIZE_HINT = 15;
const IMAGE_PAGE_SIZE = 15;

// 🚨 YOUR LOGO URL
const LOGO_URL = 'https://res.cloudinary.com/dusbkxi2q/image/upload/v1769493205/product_images/dlq4igdaovrf23qnb6gn.png';
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


const { Title } = Typography;



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
  { title: 'SL No', dataIndex: 'sl_no', key: 'sl_no', align: 'center', onCell: (record) => ({ rowSpan: record.rowSpan }), width: 50, fixed: 'left' },
  { title: 'Item', dataIndex: 'items', key: 'items', align: 'center', onCell: (record) => ({ rowSpan: record.rowSpan }), render: (text, record) => record.rowSpan > 0 ? text : null, width: 120, fixed: 'left' },
  { title: 'Brand', dataIndex: 'brand', key: 'brand', align: 'center', width: 80, fixed: 'left', render: (text) => text || '-' },
  { title: 'Single', dataIndex: 'single', key: 'single', align: 'center', render: formatPrice, width: 70 },
  { title: '5+', dataIndex: 'qty_5_plus', key: 'qty_5_plus', align: 'center', render: formatPrice, width: 60 },
  { title: '10+', dataIndex: 'qty_10_plus', key: 'qty_10_plus', align: 'center', render: formatPrice, width: 60 },
  { title: '20+', dataIndex: 'qty_20_plus', key: 'qty_20_plus', align: 'center', render: formatPrice, width: 60 },
  { title: '50+', dataIndex: 'qty_50_plus', key: 'qty_50_plus', align: 'center', render: formatPrice, width: 60 },
  { title: '100+', dataIndex: 'qty_100_plus', key: 'qty_100_plus', align: 'center', render: formatPrice, width: 60 },
  // { title: 'GST', dataIndex: 'gst', key: 'gst', align: 'center', render: formatGST, width: 50 },
  // { title: 'GST', dataIndex: 'gst', width: 70, align: 'center', render: (v) => (v !== null && v !== undefined) ? `${v}` : '-' },
  {
    title: 'GST',
    dataIndex: 'gst',
    width: 70,
    align: 'center',
    render: (v) => {
      if (v === null || v === undefined || v === '') return '-';

      const value = String(v).trim();

      // If already contains %, return as-is
      if (value.includes('%')) return value;

      // Otherwise append %
      return `${value}%`;
    }
  },

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

  // useEffect(() => { fetchProducts(); }, [fetchProducts]);


  // --- 🚀 AUTOLOAD (REALTIME) LOGIC INTEGRATED HERE ---
  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel('realtime-products-home')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('Realtime update:', payload);
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProducts]);



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
    if (!JsPDF) return message.error("PDF library not ready");
    if (!selectedRows.length) return message.error("No items selected");

    setIsProcessing(true);
    const key = 'pdf-process';
    message.loading({ content: 'Generating PDF...', key });

    const LOGO_URL = 'https://res.cloudinary.com/dusbkxi2q/image/upload/v1769493205/product_images/dlq4igdaovrf23qnb6gn.png';

    // --- 1. THE CLEANING HELPER (Crucial for Matching) ---
    const cleanItemName = (name) => {
      if (!name) return "";
      return name
        .toString()
        .replace(/\n/g, " ")       // Remove new lines
        .replace(/\s+/g, " ")      // Collapse multiple spaces into one
        .replace(/"/g, "")         // Remove double quotes
        .replace(/\s\(Cont\.\)$/i, "") // Remove the (Cont.) suffix
        .trim();
    };


    const formatGST = (val) => {
      if (val === undefined || val === null || val === "") return "-";
      // If val is 18, it returns "18%"; if it's already "18%", it remains "18%"
      return val.toString().includes("%") ? val : `${val}%`;
    };

    const getBase64 = async (url) => {
      if (!url || url === "-" || url === "") return null;
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      } catch (e) { return null; }
    };

    try {
      const { default: autoTable } = await import("jspdf-autotable");
      const doc = new JsPDF("landscape", "mm", "a4", true);
      const indexMap = {};

      // --- 2. PRE-FETCH IMAGES ---
      const watermarkBase64 = await getBase64(LOGO_URL);

      const imageMap = {};
      const uniqueUrls = [...new Set(selectedRows.map(r =>
        r.product_image || r.image || r.photo || r.img || r.product_img
      ).filter(u => u && u !== "-"))];

      await Promise.all(uniqueUrls.map(async (url) => {
        const b64 = await getBase64(url);
        if (b64) imageMap[url] = b64;
      }));

      // --- 3. PRE-PROCESS INDEX LIST ---
      const sortedData = [...selectedRows].sort((a, b) => Number(a.sl_no) - Number(b.sl_no));

      // Create clean keys for the index
      const uniqueItemNames = [...new Set(sortedData.map(r => cleanItemName(r.items)))]
        .filter(name => name && name.toLowerCase() !== 'item')
        .sort((a, b) => a.localeCompare(b));

      const totalIndexPages = Math.ceil(uniqueItemNames.length / 36) || 1;

      // --- 4. PRE-PROCESS BODY ROWS ---
      const rawGroups = {};
      sortedData.forEach(r => {
        const k = `${r.sl_no}__${r.items}`;
        if (!rawGroups[k]) rawGroups[k] = [];
        rawGroups[k].push(r);
      });

      const bodyRows = [];
      Object.keys(rawGroups).forEach((groupKey) => {
        const fullGroup = rawGroups[groupKey];
        const [slNo, itemName] = groupKey.split('__');
        const MAX_ROWS = 10;

        for (let i = 0; i < fullGroup.length; i += MAX_ROWS) {
          const chunk = fullGroup.slice(i, i + MAX_ROWS);
          chunk.forEach((row, rowIndex) => {
            const tableRow = [];
            if (rowIndex === 0) {
              tableRow.push({ content: slNo, rowSpan: chunk.length });
              // Add (Cont.) for visual UI only
              tableRow.push({ content: i > 0 ? `${itemName.trim()} (Cont.)` : itemName.trim(), rowSpan: chunk.length });
            }
            const imgUrl = row.product_image || row.image || row.photo || row.img || row.product_img;
            tableRow.push(...[
              row.brand || "-", formatPrice(row.single), formatPrice(row.qty_5_plus),
              formatPrice(row.qty_10_plus), formatPrice(row.qty_20_plus), formatPrice(row.qty_50_plus),
              formatPrice(row.qty_100_plus), formatGST(row.gst || row.GST || row.gst_rate || "-"), formatPrice(row.mrp),
              row.warranty || "-",
              { content: "", _img: imageMap[imgUrl] || null }
            ]);
            bodyRows.push(tableRow);
          });
        }
      });

      // --- 5. DRAW TABLE ---
      for (let i = 1; i < totalIndexPages; i++) { doc.addPage(); }
      doc.addPage();
      const tableStartPage = totalIndexPages + 1;

      autoTable(doc, {
        head: [["SL", "Item", "Brand", "Single", "5+", "10+", "20+", "50+", "100+", "GST", "MRP", "Warranty", "Photo"]],
        body: bodyRows,
        startY: 15,
        theme: "grid",
        styles: { fontSize: 7.5, valign: "middle", halign: "center" },
        columnStyles: {
          0: { cellWidth: 10 }, 1: { cellWidth: 45 }, 2: { cellWidth: 45 },
          3: { cellWidth: 18 }, 4: { cellWidth: 18 }, 5: { cellWidth: 18 },
          6: { cellWidth: 18 }, 7: { cellWidth: 18 }, 8: { cellWidth: 18 },
          9: { cellWidth: 12 }, 10: { cellWidth: 18 }, 11: { cellWidth: 18 },
          12: { cellWidth: 20 }
        },
        didParseCell: (data) => { if (data.section === 'body') data.row.height = 15; },

        didDrawPage: (data) => {
          // --- WATERMARK DRAWING (Added here) ---
          if (watermarkBase64) {
            const pageSize = doc.internal.pageSize;
            const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
            const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();

            doc.saveGraphicsState();
            // Set Opacity to 0.1 (10%) to stay subtle
            doc.setGState(new doc.GState({ opacity: 0.05 }));

            const imgWidth = 150;
            const imgHeight = 60;


            doc.addImage(watermarkBase64, 'PNG', 130, 120, 150, 60, undefined, 'FAST', 45);
            doc.restoreGraphicsState();
          }
        },

        didDrawCell: (data) => {
          // CLEANING AND MAPPING
          if (data.section === "body" && data.column.index === 1 && data.cell.raw?.content) {
            const cleanName = cleanItemName(data.cell.raw.content);
            if (cleanName && !indexMap[cleanName]) {
              indexMap[cleanName] = doc.internal.getCurrentPageInfo().pageNumber;
            }
          }
          // IMAGE DRAWING
          if (data.section === 'body' && data.column.index === 12 && data.cell.raw?._img) {
            doc.addImage(data.cell.raw._img, 'JPEG', data.cell.x + 2, data.cell.y + 2, 17, 11);
          }
        }
      });







      // --- 6. FILL INDEX PAGES ---
      for (let i = 0; i < totalIndexPages; i++) {
        doc.setPage(i + 1);
        doc.setFont("helvetica", "bold").setFontSize(18).text("Product Index", 148, 15, { align: "center" });
        doc.setFont("helvetica", "normal").setFontSize(9); // Courier is great for dots because it's monospaced

        const pageItems = uniqueItemNames.slice(i * 36, (i + 1) * 36);
        pageItems.forEach((name, idx) => {
          const isCol2 = idx >= 18;
          const xStart = isCol2 ? 155 : 20;
          const xEnd = isCol2 ? 280 : 140; // The right boundary for this column
          const yPos = 30 + ((idx % 18) * 9);
          const targetPNo = indexMap[name] || tableStartPage;
          const pNoStr = targetPNo.toString();

          // 1. Draw the Item Name (with maxWidth to prevent overlap)
          doc.setTextColor(0);
          doc.text(name, xStart, yPos, { maxWidth: 105 });

          // 2. Calculate Page Number position (Right Aligned)
          const pNoWidth = doc.getTextWidth(pNoStr);
          const pNoX = xEnd - pNoWidth;

          // 3. DRAW GRAY DOTS (Integrated Logic)
          doc.setTextColor(180); // Light gray
          const nameWidth = Math.min(doc.getTextWidth(name), 105); // Limit width to match maxWidth
          const dotsStart = xStart + nameWidth + 2; // 2mm gap after name
          const dotsEnd = pNoX - 3; // 3mm gap before page number

          if (dotsEnd > dotsStart) {
            const dotCharWidth = doc.getTextWidth(".");
            const dotsCount = Math.floor((dotsEnd - dotsStart) / dotCharWidth);
            const dotsStr = ".".repeat(Math.max(0, dotsCount));
            doc.text(dotsStr, dotsStart, yPos);
          }

          // 4. Draw Page Number (Blue and Clickable)
          doc.setTextColor(0, 0, 255);
          doc.text(pNoStr, pNoX, yPos);

          // 5. Add Clickable Link over the whole row
          doc.link(xStart, yPos - 5, (xEnd - xStart), 8, { pageNumber: targetPNo });
        });
      }



      // --- STEP 7: FOOTER ---
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(9).setTextColor(100).text(`Page ${i} of ${totalPages}`, 285, 205, { align: "right" });
      }

      doc.save("Exor_PriceList.pdf");
      message.success({ content: "PDF Generated!", key });

    } catch (err) {
      message.error({ content: "Error: " + err.message, key });
    } finally {
      setIsProcessing(false);
    }
  };












  // ---------------------------------------------
  // --- Share as Paginated Image (Clipboard + WhatsApp Web) ---
  // ---------------------------------------------
  const handleShareImage = async () => {
    if (selectedRows.length === 0) { message.error("No items selected to share."); return; }
    if (!html2canvas) { message.error("Image generation library not ready."); return; }

    setIsProcessing(true);
    const key = 'share-image-process';
    message.loading({ content: '1/3. Preparing data...', key });

    const sortedData = [...selectedRows].sort((a, b) => (Number(a.sl_no) || 0) - (Number(b.sl_no) || 0));
    const groupedSelectedData = getGroupedData(sortedData);
    const pageBoundaries = getGroupAwareImagePageBoundaries(groupedSelectedData, IMAGE_PAGE_SIZE);
    const pageCount = pageBoundaries.length;
    const imageFiles = [];
    const logoWithCORS = `${LOGO_URL}${LOGO_URL.includes('?') ? '&' : '?'}t=${new Date().getTime()}`;



    let element = null;

    try {
      element = imagePreviewRef.current;
      if (!element) { message.error({ content: 'Failed to find rendering element.', key }); return; }

      element.style.display = 'block';
      element.style.opacity = 1;
      element.style.backgroundColor = '#ffffff';

      for (let i = 0; i < pageCount; i++) {
        const { start: startIndex, end: endIndex } = pageBoundaries[i];
        const pageData = groupedSelectedData.slice(startIndex, endIndex);

        message.loading({ content: `2/3. Generating Page ${i + 1} of ${pageCount}...`, key });

        element.innerHTML = `
                <h2 style="text-align: center; margin-bottom: 10px; color: #333;">Selected Price List (Page ${i + 1} of ${pageCount})</h2>
                ${logoBase64 ? `<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-repeat: no-repeat; background-position: center center; background-size: 300px; opacity: 0.15; pointer-events: none; z-index: 2;"></div>` : ''}
                
                
                
                
                
               
            
<div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            width: 800px; /* Adjust size as needed */
            z-index: 9999; /* Forces it to the very front */
            opacity: 0.06; /* Very low opacity for subtle watermark effect */
            pointer-events: none; /* Allows clicking through to table if needed */
            display: flex;
            justify-content: center;
        ">
            <img 
                src="${logoWithCORS}" 
                style="width: 100%; height: auto; display: block;" 
                crossorigin="anonymous" 
            />
        </div>
                
                
                
                
                
                
                
                
                
                <div style="position: relative; z-index: 2; background-color: white; padding-top: 50px;">
                    <table class="${styles.imageTable}">
                        <thead>
                            <tr style="background-color: #f8f9fa !important;">
                                <th style="width: 60px;">SL No</th>
                                <th style="width: 250px; text-align: left; padding-left: 15px;">Item</th>
                                <th style="width: 250px;">Brand</th>
                                <th>Single</th>
                                <th>5+</th>
                                <th>10+</th>
                                <th>20+</th>
                                <th>50+</th>
                                <th>100+</th>
                                <th>GST</th>
                                <th>MRP</th>
                                <th>Warranty</th>
                                <th style="width: 80px;">Image</th>
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

        const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

        imageFiles.push({
          blob: blob,
          fileName: `PriceList_P${i + 1}.png`,
          url: URL.createObjectURL(blob)
        });
      }

      const copyToClipboard = async (blob) => {
        try {
          const data = [new ClipboardItem({ "image/png": blob })];
          await navigator.clipboard.write(data);
          message.success("Copied to Clipboard!");
        } catch (err) {
          message.error("Clipboard blocked. Use Download.");
        }
      };

      message.destroy(key);
      message.info({
        content: (
          <div style={{ textAlign: 'left', position: 'relative', paddingTop: '10px' }}>
            {/* CLOSE BUTTON */}
            <div
              onClick={() => message.destroy('share-ui')}
              style={{
                position: 'absolute', top: '-10px', right: '-10px',
                cursor: 'pointer', fontSize: '18px', fontWeight: 'bold',
                padding: '5px', color: '#888'
              }}
            >
              &times;
            </div>

            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Share to WhatsApp Web:</p>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {imageFiles.map((img, index) => (
                <div key={index} style={{ background: '#f5f5f5', padding: '10px', marginBottom: '8px', borderRadius: '6px' }}>
                  <div style={{ marginBottom: '5px', fontSize: '12px' }}>Page {index + 1}</div>
                  <Space>
                    <Button size="small" type="primary" ghost onClick={() => copyToClipboard(img.blob)}>
                      Copy Page
                    </Button>
                    <Button size="small" href={img.url} download={img.fileName}>
                      Download
                    </Button>
                  </Space>
                </div>
              ))}
            </div>
            <Button
              type="primary" block style={{ backgroundColor: '#25D366', marginTop: '10px' }}
              onClick={() => window.open('https://web.whatsapp.com/', '_blank')}
            >
              Open WhatsApp Web
            </Button>
          </div>
        ),
        duration: 0, // Manual close only
        key: 'share-ui'
      });

    } catch (error) {
      message.error(`Sharing failed: ${error.message}`);
    } finally {
      if (element) {
        element.innerHTML = '';
        element.style.display = 'none';
      }
      setIsProcessing(false);
    }
  };

  const totalFilteredRows = filteredAndGroupedData.length;
  const currentPageDataSize = paginatedData.length;
  const startRange = currentPageDataSize > 0 ? filteredAndGroupedData.indexOf(paginatedData[0]) + 1 : 0;
  const endRange = startRange > 0 ? startRange + currentPageDataSize - 1 : 0;














  // ---------------------------------------------
  // --- Render ---
  // ---------------------------------------------
  return (
    <div style={{ padding: 20 }}>

      {/* Row 1: Heading (Left) and Page Links (Right) */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 20 }}>
        <Title level={2} style={{ margin: 0 }}>EXOR Product Price List</Title>

        <Space wrap size="small">
          <Link href="/manage-products">
            <Button type="primary" style={{ backgroundColor: '#7a7979', }}>
              Manage Products</Button>
          </Link>
          <Link href="/manage-items">
            <Button type="primary" style={{ backgroundColor: '#609dee', }}>
              Manage Item List</Button>
          </Link>
          <Link href="/approval-page">
            <Button type="primary" style={{ backgroundColor: '#7a7979', }}>
              Approval Page</Button>
          </Link>
          <Link href="/rejected-requests">
            <Button type="primary" style={{ backgroundColor: '#609dee', }}>
              Rejected Items</Button>

          </Link>
          <Link href="/logs">
            <Button type="primary" style={{ backgroundColor: '#7a7979', }}>
              Logs</Button>
          </Link>
        </Space>
      </Flex>

      {/* Row 2: Action Buttons (Left) & Search (Right) */}
      <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
        <Space wrap size="small">
          {/* "+ Add New Product" is now part of the actions row */}
          <Link href="/add-product">
            <Button type="primary">+ Add New Product</Button>
          </Link>

          <Button
            onClick={handleSelectAllFiltered}
            disabled={isProcessing || allFilteredKeys.length === 0 || selectedRows.length === allFilteredKeys.length}
          >
            Select All Filtered ({allFilteredKeys.length})
          </Button>

          <Button
            onClick={handleClearSelection}
            disabled={isProcessing || selectedRows.length === 0}
          >
            Clear Selection
          </Button>

          <Button
            type="primary"
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
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

        {/* Search Bar aligned to the right of the actions */}
        <Input.Search
          placeholder="Search by Item or Brand"
          allowClear
          onSearch={handleSearch}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 250 }}
        />
      </Flex>


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




