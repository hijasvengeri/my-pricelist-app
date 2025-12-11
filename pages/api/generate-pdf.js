// // /pages/api/generate-pdf.js

// import pdf from 'html-pdf';

// // Helper function to format prices cleanly
// const formatPrice = (value) => {
//   return (typeof value === 'number' && value > 0) ? `₹${value}` : '-';
// };

// // Helper function to generate the HTML table string (Same as Puppeteer)
// const generateHtmlTable = (data, searchTerm) => {
//   if (!data || data.length === 0) {
//     return `<h1>No data found for: ${searchTerm || 'All Products'}</h1>`;
//   }

//   // --- HTML Structure ---
//   let html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//         <title>Product Price List</title>
//         <style>
//             body { font-family: Arial, sans-serif; margin: 0; }
//             h1 { font-size: 18px; margin: 10mm 10mm 5mm 10mm; }
//             .table-container { 
//                 width: 100%; 
//                 border-collapse: collapse; 
//             }
//             .table-container th, .table-container td {
//                 border: 1px solid #ccc;
//                 padding: 5px 3px;
//                 text-align: center;
//                 font-size: 10px;
//                 vertical-align: middle;
//             }
//             .table-container th {
//                 background-color: #eee;
//                 font-weight: bold;
//             }
//             .merged-cell {
//                 /* The HTML renderer might be slightly less reliable with complex CSS, 
//                    but rowSpan attribute in the HTML is the key */
//                 background-color: #f7f7f7; 
//             }
//         </style>
//     </head>
//     <body>
//         <h1>Product Price List - Filtered: ${searchTerm || 'All Products'}</h1>
//         <table class="table-container">
//             <thead>
//                 <tr>
//                     <th style="width: 5%">SL No</th>
//                     <th style="width: 15%">Item</th>
//                     <th style="width: 10%">Brand</th>
//                     <th style="width: 7%">Single</th>
//                     <th style="width: 7%">5+</th>
//                     <th style="width: 7%">10+</th>
//                     <th style="width: 7%">20+</th>
//                     <th style="width: 7%">50+</th>
//                     <th style="width: 7%">100+</th>
//                     <th style="width: 5%">GST</th>
//                     <th style="width: 8%">MRP</th>
//                     <th style="width: 15%">Warranty</th>
//                 </tr>
//             </thead>
//             <tbody>
//   `;

//   // --- Row Generation ---
//   data.forEach(row => {
//     html += '<tr>';
    
//     // 1. SL No and Item (Merged Cells)
//     if (row.rowSpan > 0) {
//         // Use the rowspan HTML attribute
//         html += `<td rowspan="${row.rowSpan}" class="merged-cell">${row.sl_no}</td>`;
//         html += `<td rowspan="${row.rowSpan}" class="merged-cell">${row.items}</td>`;
//     }

//     // 2. Brand and Price/Detail Cells
//     html += `<td>${row.brand || '-'}</td>`;
//     html += `<td>${formatPrice(row.single)}</td>`;
//     html += `<td>${formatPrice(row.qty_5_plus)}</td>`;
//     html += `<td>${formatPrice(row.qty_10_plus)}</td>`;
//     html += `<td>${formatPrice(row.qty_20_plus)}</td>`;
//     html += `<td>${formatPrice(row.qty_50_plus)}</td>`;
//     html += `<td>${formatPrice(row.qty_100_plus)}</td>`;
//     html += `<td>${(row.gst > 0) ? `${row.gst}%` : '-'}</td>`;
//     html += `<td>${formatPrice(row.mrp)}</td>`;
//     html += `<td>${row.warranty || '-'}</td>`;

//     html += '</tr>';
//   });

//   html += `
//             </tbody>
//         </table>
//     </body>
//     </html>
//   `;

//   return html;
// };


// // --- Next.js API Route Handler ---
// export default async function handler(req, res) {
//     if (req.method !== 'POST') {
//         return res.status(405).json({ message: 'Method Not Allowed' });
//     }

//     const { data, searchTerm } = req.body;
//     const htmlContent = generateHtmlTable(data, searchTerm);

//     const options = {
//         format: 'A4',
//         orientation: 'landscape',
//         border: '10mm',
//         header: {
//             height: "10mm",
//             contents: '<div style="text-align: right; font-size: 10px;">Product Price List</div>'
//         },
//         footer: {
//             height: "10mm",
//             contents: {
//                 default: '<span style="color: #444; font-size: 10px;">Page {{page}} of {{pages}}</span>', // Default page numbering
//             }
//         },
//     };

//     try {
//         const pdfBuffer = await new Promise((resolve, reject) => {
//             // Create the PDF buffer from the HTML content
//             pdf.create(htmlContent, options).toBuffer((err, buffer) => {
//                 if (err) {
//                     return reject(err);
//                 }
//                 resolve(buffer);
//             });
//         });

//         // Send the PDF back to the client
//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `attachment; filename="PriceList_HTMLPDF_${searchTerm || 'All'}.pdf"`);
//         res.send(pdfBuffer);

//     } catch (error) {
//         console.error('HTML-PDF generation failed:', error.message);
//         res.status(500).json({ 
//             message: 'Failed to generate PDF on the server using html-pdf.', 
//             error: error.message 
//         });
//     }
// }


























const exportToPDF = async () => {
  const html2pdf = (await import("html2pdf.js")).default;

  const element = document.querySelector(".table-responsive");

  const opt = {
    margin: 0.5,
    filename: "pricelist.pdf",
    html2canvas: {
      scale: 2,
      useCORS: true,
    },
    jsPDF: {
      unit: "in",
      format: "a4",
      orientation: "portrait",
    },
  };

  html2pdf().set(opt).from(element).save();
};
