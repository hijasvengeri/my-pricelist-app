

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




  // const sortedData = [...data].sort((a, b) => {
  //   if (a.sl_no !== b.sl_no) return a.sl_no - b.sl_no;
  //   const aItems = a.items || '';
  //   const bItems = b.items || '';
  //   return aItems.localeCompare(bItems) || (a.brand || '').localeCompare(b.brand || '');
  // });





const sortedData = [...data].sort((a, b) => {
  // 1. PRIMARY SORT: sl_no (numeric)
  const aSl = Number(a.sl_no) || 0;
  const bSl = Number(b.sl_no) || 0;

  if (aSl !== bSl) return aSl - bSl;

  // 2. SECONDARY SORT: sub_order (numeric)
  const aOrder = Number(a.sub_order) || 0;
  const bOrder = Number(b.sub_order) || 0;

  if (aOrder !== bOrder) return aOrder - bOrder;

  // 3. FINAL FALLBACK
  const aItems = a.items || '';
  const bItems = b.items || '';

  return aItems.localeCompare(bItems) ||
         (a.brand || '').localeCompare(b.brand || '');
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
    if (!error)
      setAllProducts(data.map(item => ({ ...item, key: item.id })));


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
          <Link href="/manage-order">
            <Button type="primary" style={{ backgroundColor: '#609dee', }}>
              Sort Order Manager</Button>
          </Link>
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











