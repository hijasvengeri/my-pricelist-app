








// import React from 'react';
// import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// const styles = StyleSheet.create({
//   page: { padding: 20, fontSize: 8, fontFamily: 'Helvetica' },
//   tableContainer: { width: "100%" },
//   headerContainer: { 
//     flexDirection: 'row', 
//     backgroundColor: '#1abc9c', 
//     color: '#ffffff', 
//     fontWeight: 'bold',
//     minHeight: 35,
//     borderTopWidth: 1,
//     borderColor: '#cccccc',
//   },
//   rowContainer: { flexDirection: 'row', alignItems: 'stretch', minHeight: 45 },
//   cell: {
    
//     padding: 5,
//     borderRightWidth: 1,
//     borderBottomWidth: 1,
//     borderColor: '#cccccc',
//     justifyContent: 'center',
//     alignItems: 'stretch',
//   },
//   firstCellInRow: { borderLeftWidth: 1 },
//   cellText: { width: '100%', textAlign: 'center', flexWrap: 'wrap' },
//   mergedCell: {
//     backgroundColor: '#10a034ff',
//     padding: 5,
//     borderRightWidth: 1,
//     borderBottomWidth: 0, 
//     borderColor: '#cccccc',
//     display: 'flex',
//     flexDirection: 'column',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   groupEndLine: { borderBottomWidth: 1 },

//   // Precision Widths
//   colSl: { width: '4%' }, colItem: { width: '15%' }, colBrand: { width: '30%' },   
//   colPrice: { width: '5.5%' }, colGst: { width: '4%' }, colMrp: { width: '6%' },      
//   colWarranty: { width: '8%' }, colImg: { width: '5.5%' },
// });

// // HIGH-TECH SPLITTER FUNCTION
// const getSplitGroups = (data) => {
//   const finalGroups = [];
//   let currentGroup = [];
//   const MAX_ROWS_PER_CHUNK = 10; // Splitting mega groups into 10-row chunks

//   data.forEach((row) => {
//     // If it's a new SL No from the database, or our current chunk is full
//     if (row.isGroupStart || currentGroup.length >= MAX_ROWS_PER_CHUNK) {
//       if (currentGroup.length > 0) {
//         // Mark the previous chunk as finished so it gets a bottom border
//         currentGroup[currentGroup.length - 1].isEndOfGroup = true;
//         finalGroups.push(currentGroup);
//       }
      
//       // Start a new chunk. 
//       // If we are splitting a mega-group, we force the next row to act as a 'GroupStart'
//       const newRow = { ...row };
//       if (currentGroup.length >= MAX_ROWS_PER_CHUNK && !row.isGroupStart) {
//         newRow.isGroupStart = true;
//         newRow.items = row.items + " (cont...)"; // Optional: adds (cont...) to item name
//       }
//       currentGroup = [newRow];
//     } else {
//       currentGroup.push(row);
//     }
//   });
  
//   if (currentGroup.length > 0) {
//     currentGroup[currentGroup.length - 1].isEndOfGroup = true;
//     finalGroups.push(currentGroup);
//   }
//   return finalGroups;
// };

// const PriceListDocument = ({ data }) => {
//   const processedGroups = getSplitGroups(data);

//   return (
//     <Document>
//       <Page size="A4" orientation="landscape" style={styles.page}>
//         <View style={styles.tableContainer}>
//           <View style={styles.headerContainer} fixed>
//             <Text style={[styles.cell, styles.firstCellInRow, styles.colSl]}>SL No</Text>
//             <Text style={[styles.cell, styles.colItem]}>Item</Text>
//             <Text style={[styles.cell, styles.colBrand]}>Brand / Description</Text>
//             <Text style={[styles.cell, styles.colPrice]}>Single</Text>
//             <Text style={[styles.cell, styles.colPrice]}>5+</Text>
//             <Text style={[styles.cell, styles.colPrice]}>10+</Text>
//             <Text style={[styles.cell, styles.colPrice]}>20+</Text>
//             <Text style={[styles.cell, styles.colPrice]}>50+</Text>
//             <Text style={[styles.cell, styles.colPrice]}>100+</Text>
//             <Text style={[styles.cell, styles.colGst]}>GST</Text>
//             <Text style={[styles.cell, styles.colMrp]}>MRP</Text>
//             <Text style={[styles.cell, styles.colWarranty]}>Warranty</Text>
//             <Text style={[styles.cell, styles.colImg]}>Image</Text>
//           </View>

//           {processedGroups.map((group, gIdx) => (
//             /* Now every single block is small (max 10 rows), 
//                so wrap={false} will NEVER panic or stretch. */
//             <View key={gIdx} wrap={false}>
//               {group.map((row, rIdx) => (
//                 <View style={styles.rowContainer} key={rIdx}>
//                   <View style={[styles.mergedCell, styles.firstCellInRow, styles.colSl, row.isEndOfGroup ? styles.groupEndLine : {}]}>
//                     <Text style={styles.cellText}>{row.isGroupStart ? row.sl_no : ""}</Text>
//                   </View>
//                   <View style={[styles.mergedCell, styles.colItem, row.isEndOfGroup ? styles.groupEndLine : {}]}>
//                     <Text style={styles.cellText}>{row.isGroupStart ? row.items : ""}</Text>
//                   </View>
//                   <View style={[styles.cell, styles.colBrand]}>
//                     <Text style={[styles.cellText, { textAlign: 'left' }]}>{row.brand || '-'}</Text>
//                   </View>
//                   <View style={[styles.cell, styles.colPrice]}><Text>{row.single || '-'}</Text></View>
//                   <View style={[styles.cell, styles.colPrice]}><Text>{row.qty_5_plus || '-'}</Text></View>
//                   <View style={[styles.cell, styles.colPrice]}><Text>{row.qty_10_plus || '-'}</Text></View>
//                   <View style={[styles.cell, styles.colPrice]}><Text>{row.qty_20_plus || '-'}</Text></View>
//                   <View style={[styles.cell, styles.colPrice]}><Text>{row.qty_50_plus || '-'}</Text></View>
//                   <View style={[styles.cell, styles.colPrice]}><Text>{row.qty_100_plus || '-'}</Text></View>
//                   <View style={[styles.cell, styles.colGst]}><Text>{row.gst ? `${row.gst}%` : '-'}</Text></View>
//                   <View style={[styles.cell, styles.colMrp]}><Text>{row.mrp || '-'}</Text></View>
//                   <View style={[styles.cell, styles.colWarranty]}><Text>{row.warranty || '-'}</Text></View>
//                   <View style={[styles.cell, styles.colImg]}>
//                     {row.product_image && <Image src={row.product_image} style={{ width: 25, height: 25, objectFit: 'contain' }} />}
//                   </View>
//                 </View>
//               ))}
//             </View>
//           ))}
//         </View>
//       </Page>
//     </Document>
//   );
// };
// export default PriceListDocument;


































// import React from 'react';
// import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// const styles = StyleSheet.create({
//   page: { padding: 20, fontSize: 8, fontFamily: 'Helvetica' },
//   tableContainer: { width: "100%" },
//   headerContainer: { 
//     flexDirection: 'row', 
//     backgroundColor: '#1abc9c', 
//     color: '#ffffff', 
//     fontWeight: 'bold',
//     minHeight: 35,
//     borderTopWidth: 1,
//     borderColor: '#cccccc',
//   },
//   rowContainer: { flexDirection: 'row', alignItems: 'stretch', minHeight: 45 },
//   cell: {
//     padding: 5,
//     borderRightWidth: 1,
//     borderBottomWidth: 1,
//     borderColor: '#cccccc',
//     justifyContent: 'center',
//     alignItems: 'stretch',
//   },
//   firstCellInRow: { borderLeftWidth: 1 },
//   cellText: { width: '100%', textAlign: 'center', flexWrap: 'wrap' },
//   mergedCell: {
//     backgroundColor: '#10a034ff',
//     padding: 5,
//     borderRightWidth: 1,
//     borderBottomWidth: 0, 
//     borderColor: '#cccccc',
//     display: 'flex',
//     flexDirection: 'column',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   groupEndLine: { borderBottomWidth: 1 },

//   // Precision Widths
//   colSl: { width: '4%' }, colItem: { width: '15%' }, colBrand: { width: '30%' },   
//   colPrice: { width: '5.5%' }, colGst: { width: '4%' }, colMrp: { width: '6%' },      
//   colWarranty: { width: '8%' }, colImg: { width: '5.5%' },
// });

// // HIGH-TECH SPLITTER FUNCTION
// const getSplitGroups = (data) => {
//   // SAFETY CHECK: If data is undefined or not an array, return an empty array
//   if (!data || !Array.isArray(data)) {
//     return [];
//   }

//   const finalGroups = [];
//   let currentGroup = [];
//   const MAX_ROWS_PER_CHUNK = 10; 

//   data.forEach((row) => {
//     if (row.isGroupStart || currentGroup.length >= MAX_ROWS_PER_CHUNK) {
//       if (currentGroup.length > 0) {
//         currentGroup[currentGroup.length - 1].isEndOfGroup = true;
//         finalGroups.push(currentGroup);
//       }
      
//       const newRow = { ...row };
//       if (currentGroup.length >= MAX_ROWS_PER_CHUNK && !row.isGroupStart) {
//         newRow.isGroupStart = true;
//         newRow.items = (row.items || "") + " (cont...)"; 
//       }
//       currentGroup = [newRow];
//     } else {
//       currentGroup.push(row);
//     }
//   });
  
//   if (currentGroup.length > 0) {
//     currentGroup[currentGroup.length - 1].isEndOfGroup = true;
//     finalGroups.push(currentGroup);
//   }
//   return finalGroups;
// };

// const PriceListDocument = ({ data = [] }) => {
//   const processedGroups = getSplitGroups(data);

//   // If there is no data, render a simple page saying "No Data Available" 
//   // to prevent the PDF generator from crashing.
//   if (processedGroups.length === 0) {
//     return (
//       <Document>
//         <Page size="A4" style={styles.page}>
//           <Text>No data available for price list.</Text>
//         </Page>
//       </Document>
//     );
//   }

//   return (
//     <Document>
//       <Page size="A4" orientation="landscape" style={styles.page}>
//         <View style={styles.tableContainer}>
//           <View style={styles.headerContainer} fixed>
//             <Text style={[styles.cell, styles.firstCellInRow, styles.colSl]}>SL No</Text>
//             <Text style={[styles.cell, styles.colItem]}>Item</Text>
//             <Text style={[styles.cell, styles.colBrand]}>Brand / Description</Text>
//             <Text style={[styles.cell, styles.colPrice]}>Single</Text>
//             <Text style={[styles.cell, styles.colPrice]}>5+</Text>
//             <Text style={[styles.cell, styles.colPrice]}>10+</Text>
//             <Text style={[styles.cell, styles.colPrice]}>20+</Text>
//             <Text style={[styles.cell, styles.colPrice]}>50+</Text>
//             <Text style={[styles.cell, styles.colPrice]}>100+</Text>
//             <Text style={[styles.cell, styles.colGst]}>GST</Text>
//             <Text style={[styles.cell, styles.colMrp]}>MRP</Text>
//             <Text style={[styles.cell, styles.colWarranty]}>Warranty</Text>
//             <Text style={[styles.cell, styles.colImg]}>Image</Text>
//           </View>

//           {processedGroups.map((group, gIdx) => (
//             <View key={gIdx} wrap={false}>
//               {group.map((row, rIdx) => (
//                 <View style={styles.rowContainer} key={rIdx}>
//                   <View style={[styles.mergedCell, styles.firstCellInRow, styles.colSl, row.isEndOfGroup ? styles.groupEndLine : {}]}>
//                     <Text style={styles.cellText}>{row.isGroupStart ? row.sl_no : ""}</Text>
//                   </View>
//                   <View style={[styles.mergedCell, styles.colItem, row.isEndOfGroup ? styles.groupEndLine : {}]}>
//                     <Text style={styles.cellText}>{row.isGroupStart ? row.items : ""}</Text>
//                   </View>
//                   <View style={[styles.cell, styles.colBrand]}>
//                     <Text style={[styles.cellText, { textAlign: 'left' }]}>{row.brand || '-'}</Text>
//                   </View>
//                   <View style={[styles.cell, styles.colPrice]}><Text>{row.single || '-'}</Text></View>
//                   <View style={[styles.cell, styles.colPrice]}><Text>{row.qty_5_plus || '-'}</Text></View>
//                   <View style={[styles.cell, styles.colPrice]}><Text>{row.qty_10_plus || '-'}</Text></View>
//                   <View style={[styles.cell, styles.colPrice]}><Text>{row.qty_20_plus || '-'}</Text></View>
//                   <View style={[styles.cell, styles.colPrice]}><Text>{row.qty_50_plus || '-'}</Text></View>
//                   <View style={[styles.cell, styles.colPrice]}><Text>{row.qty_100_plus || '-'}</Text></View>
//                   <View style={[styles.cell, styles.colGst]}><Text>{row.gst ? `${row.gst}%` : '-'}</Text></View>
//                   <View style={[styles.cell, styles.colMrp]}><Text>{row.mrp || '-'}</Text></View>
//                   <View style={[styles.cell, styles.colWarranty]}><Text>{row.warranty || '-'}</Text></View>
//                   <View style={[styles.cell, styles.colImg]}>
//                     {row.product_image && <Image src={row.product_image} style={{ width: 25, height: 25, objectFit: 'contain' }} />}
//                   </View>
//                 </View>
//               ))}
//             </View>
//           ))}
//         </View>
//       </Page>
//     </Document>
//   );
// };

// export default PriceListDocument;












// import React from 'react';
// import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// const styles = StyleSheet.create({
//   page: { padding: 20, fontSize: 8, fontFamily: 'Helvetica' },
//   tableContainer: { width: "100%" },
//   headerContainer: { 
//     flexDirection: 'row', 
//     backgroundColor: '#1abc9c', 
//     color: '#ffffff', 
//     fontWeight: 'bold',
//     minHeight: 35,
//     borderTopWidth: 1,
//     borderColor: '#cccccc',
//   },
//   rowContainer: { flexDirection: 'row', alignItems: 'stretch', minHeight: 45 },
//   cell: {
//     padding: 5,
//     borderRightWidth: 1,
//     borderBottomWidth: 1,
//     borderColor: '#cccccc',
//     justifyContent: 'center',
//     alignItems: 'stretch',
//   },
//   firstCellInRow: { borderLeftWidth: 1 },
//   cellText: { width: '100%', textAlign: 'center', flexWrap: 'wrap' },
//   mergedCell: {
//     backgroundColor: '#10a034ff',
//     padding: 5,
//     borderRightWidth: 1,
//     borderBottomWidth: 0, 
//     borderColor: '#cccccc',
//     display: 'flex',
//     flexDirection: 'column',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   groupEndLine: { borderBottomWidth: 1 },

//   // Precision Widths
//   colSl: { width: '4%' }, colItem: { width: '15%' }, colBrand: { width: '30%' },   
//   colPrice: { width: '5.5%' }, colGst: { width: '4%' }, colMrp: { width: '6%' },      
//   colWarranty: { width: '8%' }, colImg: { width: '5.5%' },
// });

// // HIGH-TECH SPLITTER FUNCTION
// const getSplitGroups = (data) => {
//   // SAFETY CHECK: If data is undefined or not an array, return an empty array
//   if (!data || !Array.isArray(data)) {
//     return [];
//   }

//   const finalGroups = [];
//   let currentGroup = [];
//   const MAX_ROWS_PER_CHUNK = 10; 

//   data.forEach((row) => {
//     if (row.isGroupStart || currentGroup.length >= MAX_ROWS_PER_CHUNK) {
//       if (currentGroup.length > 0) {
//         currentGroup[currentGroup.length - 1].isEndOfGroup = true;
//         finalGroups.push(currentGroup);
//       }
      
//       const newRow = { ...row };
//       if (currentGroup.length >= MAX_ROWS_PER_CHUNK && !row.isGroupStart) {
//         newRow.isGroupStart = true;
//         newRow.items = (row.items || "") + " (cont...)"; 
//       }
//       currentGroup = [newRow];
//     } else {
//       currentGroup.push(row);
//     }
//   });
  
//   if (currentGroup.length > 0) {
//     currentGroup[currentGroup.length - 1].isEndOfGroup = true;
//     finalGroups.push(currentGroup);
//   }
//   return finalGroups;
// };

// const PriceListDocument = ({ data = [] }) => {
//   const processedGroups = getSplitGroups(data);

//   // If there is no data, render a simple page saying "No Data Available" 
//   // to prevent the PDF generator from crashing.
//   if (processedGroups.length === 0) {
//     return (
//       <Document>
//         <Page size="A4" style={styles.page}>
//           <Text>No data available for price list.</Text>
//         </Page>
//       </Document>
//     );
//   }

//   return (
//     <Document>
//       <Page size="A4" orientation="landscape" style={styles.page}>
//         <View style={styles.tableContainer}>
//           <View style={styles.headerContainer} fixed>
//             <Text style={[styles.cell, styles.firstCellInRow, styles.colSl]}>SL No</Text>
//             <Text style={[styles.cell, styles.colItem]}>Item</Text>
//             <Text style={[styles.cell, styles.colBrand]}>Brand / Description</Text>
//             <Text style={[styles.cell, styles.colPrice]}>Single</Text>
//             <Text style={[styles.cell, styles.colPrice]}>5+</Text>
//             <Text style={[styles.cell, styles.colPrice]}>10+</Text>
//             <Text style={[styles.cell, styles.colPrice]}>20+</Text>
//             <Text style={[styles.cell, styles.colPrice]}>50+</Text>
//             <Text style={[styles.cell, styles.colPrice]}>100+</Text>
//             <Text style={[styles.cell, styles.colGst]}>GST</Text>
//             <Text style={[styles.cell, styles.colMrp]}>MRP</Text>
//             <Text style={[styles.cell, styles.colWarranty]}>Warranty</Text>
//             <Text style={[styles.cell, styles.colImg]}>Image</Text>
//           </View>

//           {processedGroups.map((group, gIdx) => (
//   /* wrap={false} prevents the group from breaking across pages */
//   <View key={gIdx} wrap={false} style={{ flexDirection: 'row', width: '100%' }}>
    
//     {/* LEFT SIDE: Merged Columns (SL and Item) 
//         Total Width: 19% (4% + 15%) */}
//     <View style={{ flexDirection: 'row', width: '19%' }}>
//       <View style={[styles.mergedCell, styles.firstCellInRow, { width: '21.05%' }, styles.groupEndLine]}> 
//         {/* 21.05% is (4/19)*100 to maintain the original 4% page width */}
//         <Text style={styles.cellText}>{group[0].sl_no || ""}</Text>
//       </View>
      
//       <View style={[styles.mergedCell, { width: '78.95%' }, styles.groupEndLine]}>
//         {/* 78.95% is (15/19)*100 to maintain the original 15% page width */}
//         <Text style={styles.cellText}>{group[0].items || ""}</Text>
//       </View>
//     </View>

//     {/* RIGHT SIDE: Individual Data Rows 
//         Total Width: 81% */}
//     <View style={{ width: '81%' }}>
//       {group.map((row, rIdx) => (
//         <View style={[styles.rowContainer, { width: '100%' }]} key={rIdx}>
//           {/* Brand Column: Original 30% of page -> (30/81)*100 = ~37% */}
//           <View style={[styles.cell, { width: '37.04%' }]}>
//             <Text style={[styles.cellText, { textAlign: 'left' }]}>{row.brand || '-'}</Text>
//           </View>
          
//           {/* Price Columns: Original 5.5% -> (5.5/81)*100 = ~6.79% */}
//           <View style={[styles.cell, { width: '6.79%' }]}><Text>{row.single || '-'}</Text></View>
//           <View style={[styles.cell, { width: '6.79%' }]}><Text>{row.qty_5_plus || '-'}</Text></View>
//           <View style={[styles.cell, { width: '6.79%' }]}><Text>{row.qty_10_plus || '-'}</Text></View>
//           <View style={[styles.cell, { width: '6.79%' }]}><Text>{row.qty_20_plus || '-'}</Text></View>
//           <View style={[styles.cell, { width: '6.79%' }]}><Text>{row.qty_50_plus || '-'}</Text></View>
//           <View style={[styles.cell, { width: '6.79%' }]}><Text>{row.qty_100_plus || '-'}</Text></View>
          
//           {/* GST: Original 4% -> (4/81)*100 = ~4.94% */}
//           <View style={[styles.cell, { width: '4.94%' }]}><Text>{row.gst ? `${row.gst}%` : '-'}</Text></View>
          
//           {/* MRP: Original 6% -> (6/81)*100 = ~7.41% */}
//           <View style={[styles.cell, { width: '7.41%' }]}><Text>{row.mrp || '-'}</Text></View>
          
//           {/* Warranty: Original 8% -> (8/81)*100 = ~9.88% */}
//           <View style={[styles.cell, { width: '9.88%' }]}><Text>{row.warranty || '-'}</Text></View>
          
//           {/* Image: Original 5.5% -> (5.5/81)*100 = ~6.79% */}
//           <View style={[styles.cell, { width: '6.79%' }]}>
//             {row.product_image && <Image src={row.product_image} style={{ width: 25, height: 25, objectFit: 'contain' }} />}
//           </View>
//         </View>
//       ))}
//     </View>
//   </View>
// ))}
//         </View>
//       </Page>
//     </Document>
//   );
// };

// export default PriceListDocument;


















import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// 1. CONSTANT WIDTHS (Total = 100%)
const W_LEFT = 18; // SL (4) + Item (14)
const W_RIGHT = 82; // All other columns

const COL = {
  sl: '22.22%',      // (4 / 18) * 100
  item: '77.78%',    // (14 / 18) * 100
  brand: '34.15%',   // (28 / 82) * 100
  price: '6.1%',     // (5 / 82) * 100
  gst: '4.88%',      // (4 / 82) * 100
  mrp: '7.32%',      // (6 / 82) * 100
  warranty: '9.75%', // (8 / 82) * 100
  img: '7.31%',      // (6 / 82) * 100
};

const styles = StyleSheet.create({
  page: { padding: 20, fontSize: 7, fontFamily: 'Helvetica' },
  tableContainer: { width: "100%" },
  
  // Header and Row use the same flex container
  rowMaster: { flexDirection: 'row', width: '100%' },
  
  headerContainer: { 
    backgroundColor: '#d8aff0', 
    color: '#ffffff', 
    fontWeight: 'bold',
    fontSize: 8,
    minHeight: 20,
    // justifyContent: 'center',
    alignItems: 'stretch',
    borderBottomWidth: 2,
    borderTopWidth: 1,
    borderColor: '#cccccc',
  },

  headerContainer: { 
    backgroundColor: '#d8aff0', 
    color: '#ffffff', 
    fontWeight: 'bold',
    fontSize: 8,
    minHeight: 25, // Increased slightly for better visual balance
    borderBottomWidth: 2,
    borderTopWidth: 1,
    borderColor: '#cccccc',
    flexDirection: 'row',
    alignItems: 'stretch', // Stretch sections to full height
},

// New helper style for header cells
headerCell: {
    padding: 3,
    borderRightWidth: 1,
    borderColor: '#ffffff', // White separators look better on violet
    justifyContent: 'center', // Vertical center
    alignItems: 'center',      // Horizontal center
    display: 'flex',
},

headerText: {
    width: '100%',
    textAlign: 'center', // Crucial for text alignment
},
  
  leftSection: { flexDirection: 'row', width: `${W_LEFT}%` },
  rightSection: { width: `${W_RIGHT}%` },
  
  cell: {
    padding: 3,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#cccccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  mergedCell: {
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#cccccc',
    justifyContent: 'center', // Vertical Center
    alignItems: 'center',      // Horizontal Center
    padding: 5,
  },

  cellText: { width: '100%', textAlign: 'center' },
  borderLeft: { borderLeftWidth: 1 },
});

const getSplitGroups = (data) => {
  if (!data || !Array.isArray(data)) return [];
  const finalGroups = [];
  let currentGroup = [];
  const MAX_ROWS = 10;

  data.forEach((row) => {
    if (row.isGroupStart || currentGroup.length >= MAX_ROWS) {
      if (currentGroup.length > 0) finalGroups.push(currentGroup);
      currentGroup = [{ ...row }];
    } else {
      currentGroup.push(row);
    }
  });
  if (currentGroup.length > 0) finalGroups.push(currentGroup);
  return finalGroups;
};

const PriceListDocument = ({ data = [] }) => {
  const processedGroups = getSplitGroups(data);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.tableContainer}>
          
          {/* HEADER: Split exactly like the rows */}
          <View style={[styles.rowMaster, styles.headerContainer]} fixed>
            <View style={styles.leftSection}>
              <Text style={[styles.cell, styles.borderLeft, { width: COL.sl }]}>SL No</Text>
              <Text style={[styles.cell, { width: COL.item }]}>Item</Text>
            </View>
            <View style={[styles.rightSection, { flexDirection: 'row' }]}>
              <Text style={[styles.cell, { width: COL.brand }]}>Brand / Description</Text>
              <Text style={[styles.cell, { width: COL.price }]}>Single</Text>
              <Text style={[styles.cell, { width: COL.price }]}>5+</Text>
              <Text style={[styles.cell, { width: COL.price }]}>10+</Text>
              <Text style={[styles.cell, { width: COL.price }]}>20+</Text>
              <Text style={[styles.cell, { width: COL.price }]}>50+</Text>
              <Text style={[styles.cell, { width: COL.price }]}>100+</Text>
              <Text style={[styles.cell, { width: COL.gst }]}>GST</Text>
              <Text style={[styles.cell, { width: COL.mrp }]}>MRP</Text>
              <Text style={[styles.cell, { width: COL.warranty }]}>Warranty</Text>
              <Text style={[styles.cell, { width: COL.img }]}>Image</Text>
            </View>
          </View>

          {/* BODY */}
          {processedGroups.map((group, gIdx) => (
            <View key={gIdx} wrap={false} style={styles.rowMaster}>
              
              {/* LEFT SIDE: Merged Box */}
              <View style={styles.leftSection}>
                <View style={[styles.mergedCell, styles.borderLeft, { width: COL.sl }]}>
                  <Text style={styles.cellText}>{group[0].sl_no}</Text>
                </View>
                <View style={[styles.mergedCell, { width: COL.item }]}>
                  <Text style={styles.cellText}>{group[0].items}</Text>
                </View>
              </View>

              {/* RIGHT SIDE: Rows */}
              <View style={styles.rightSection}>
                {group.map((row, rIdx) => (
                  <View style={{ flexDirection: 'row', minHeight: 40 }} key={rIdx}>
                    <View style={[styles.cell, { width: COL.brand, alignItems: 'flex-start' }]}>
                      <Text>{row.brand || '-'}</Text>
                    </View>
                    <View style={[styles.cell, { width: COL.price }]}><Text>{row.single}</Text></View>
                    <View style={[styles.cell, { width: COL.price }]}><Text>{row.qty_5_plus}</Text></View>
                    <View style={[styles.cell, { width: COL.price }]}><Text>{row.qty_10_plus}</Text></View>
                    <View style={[styles.cell, { width: COL.price }]}><Text>{row.qty_20_plus}</Text></View>
                    <View style={[styles.cell, { width: COL.price }]}><Text>{row.qty_50_plus}</Text></View>
                    <View style={[styles.cell, { width: COL.price }]}><Text>{row.qty_100_plus}</Text></View>
                    <View style={[styles.cell, { width: COL.gst }]}><Text>{row.gst}</Text></View>
                    <View style={[styles.cell, { width: COL.mrp }]}><Text>{row.mrp}</Text></View>
                    <View style={[styles.cell, { width: COL.warranty }]}><Text>{row.warranty}</Text></View>
                    <View style={[styles.cell, { width: COL.img }]}>
                      {row.product_image && <Image src={row.product_image} style={{ width: 20, height: 20 }} />}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default PriceListDocument;