








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


















// import React from 'react';
// import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// // 1. CONSTANT WIDTHS (Total = 100%)
// const W_LEFT = 18; // SL (4) + Item (14)
// const W_RIGHT = 82; // All other columns

// const COL = {
//   sl: '22.22%',      // (4 / 18) * 100
//   item: '77.78%',    // (14 / 18) * 100
//   brand: '34.15%',   // (28 / 82) * 100
//   price: '6.1%',     // (5 / 82) * 100
//   gst: '4.88%',      // (4 / 82) * 100
//   mrp: '7.32%',      // (6 / 82) * 100
//   warranty: '9.75%', // (8 / 82) * 100
//   img: '7.31%',      // (6 / 82) * 100
// };

// const styles = StyleSheet.create({
//   page: { padding: 20, fontSize: 7, fontFamily: 'Helvetica' },
//   tableContainer: { width: "100%" },
  
//   // Header and Row use the same flex container
//   rowMaster: { flexDirection: 'row', width: '100%' },
  
//   // headerContainer: { 
//   //   backgroundColor: '#d8aff0', 
//   //   color: '#ffffff', 
//   //   fontWeight: 'bold',
//   //   fontSize: 8,
//   //   minHeight: 20,
//   //   // justifyContent: 'center',
//   //   alignItems: 'stretch',
//   //   borderBottomWidth: 2,
//   //   borderTopWidth: 1,
//   //   borderColor: '#cccccc',
//   // },

//     page: { 
//         paddingTop: 20, 
//         paddingLeft: 20, 
//         paddingRight: 20, 
//         paddingBottom: 20, // Increased bottom padding for the footer area
//         fontSize: 7, 
//         fontFamily: 'Helvetica' 
//       },


//   headerContainer: { 
//     backgroundColor: '#d8aff0', 
//     color: '#ffffff', 
//     fontWeight: 'bold',
//     fontSize: 8,
//     minHeight: 20, // Increased slightly for better visual balance
//     borderBottomWidth: 2,
//     borderTopWidth: 1,
//     borderColor: '#cccccc',
//     flexDirection: 'row',
//     alignItems: 'stretch', // Stretch sections to full height
// },

// // New helper style for header cells
// headerCell: {
//     padding: 3,
//     borderRightWidth: 1,
//     borderColor: '#ffffff', // White separators look better on violet
//     justifyContent: 'center', // Vertical center
//     alignItems: 'center',      // Horizontal center
//     display: 'flex',
// },

// headerText: {
//     width: '100%',
//     textAlign: 'center', // Crucial for text alignment
// },
  
//   leftSection: { flexDirection: 'row', width: `${W_LEFT}%` },
//   rightSection: { width: `${W_RIGHT}%` },
  
//   cell: {
//     padding: 3,
//     borderRightWidth: 1,
//     borderBottomWidth: 1,
//     borderColor: '#cccccc',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
  
//   mergedCell: {
//     backgroundColor: '#ffffff',
//     borderRightWidth: 1,
//     borderBottomWidth: 1,
//     borderColor: '#cccccc',
//     justifyContent: 'center', // Vertical Center
//     alignItems: 'center',      // Horizontal Center
//     padding: 5,
//   },

//   pageNumber: {
//     position: 'absolute',
//     fontSize: 8,
//     bottom: 10,
//     right: 20,
//     color: 'grey',
//   },

//   cellText: { width: '100%', textAlign: 'center' },
//   borderLeft: { borderLeftWidth: 1 },
// });

// const getSplitGroups = (data) => {
//   if (!data || !Array.isArray(data)) return [];
//   const finalGroups = [];
//   let currentGroup = [];
//   const MAX_ROWS = 10;

//   data.forEach((row) => {
//     if (row.isGroupStart || currentGroup.length >= MAX_ROWS) {
//       if (currentGroup.length > 0) finalGroups.push(currentGroup);
//       currentGroup = [{ ...row }];
//     } else {
//       currentGroup.push(row);
//     }
//   });
//   if (currentGroup.length > 0) finalGroups.push(currentGroup);
//   return finalGroups;
// };

// const PriceListDocument = ({ data = [] }) => {
//   const processedGroups = getSplitGroups(data);

//   return (
//     <Document>
//       <Page size="A4" orientation="landscape" style={styles.page}>
//         <View style={styles.tableContainer}>
          
//           {/* HEADER: Split exactly like the rows */}
//           <View style={[styles.rowMaster, styles.headerContainer]} fixed>
//             <View style={styles.leftSection}>
//               <Text style={[styles.cell, styles.borderLeft, { width: COL.sl }]}>SL No</Text>
//               <Text style={[styles.cell, { width: COL.item }]}>Item</Text>
//             </View>
//             <View style={[styles.rightSection, { flexDirection: 'row' }]}>
//               <Text style={[styles.cell, { width: COL.brand }]}>Brand / Description</Text>
//               <Text style={[styles.cell, { width: COL.price }]}>Single</Text>
//               <Text style={[styles.cell, { width: COL.price }]}>5+</Text>
//               <Text style={[styles.cell, { width: COL.price }]}>10+</Text>
//               <Text style={[styles.cell, { width: COL.price }]}>20+</Text>
//               <Text style={[styles.cell, { width: COL.price }]}>50+</Text>
//               <Text style={[styles.cell, { width: COL.price }]}>100+</Text>
//               <Text style={[styles.cell, { width: COL.gst }]}>GST</Text>
//               <Text style={[styles.cell, { width: COL.mrp }]}>MRP</Text>
//               <Text style={[styles.cell, { width: COL.warranty }]}>Warranty</Text>
//               <Text style={[styles.cell, { width: COL.img }]}>Image</Text>
              
//             </View>
//           </View>


          

//           {/* BODY */}
//           {processedGroups.map((group, gIdx) => (
//             <View key={gIdx} wrap={false} style={styles.rowMaster}>
              
//               {/* LEFT SIDE: Merged Box */}
//               <View style={styles.leftSection}>
//                 <View style={[styles.mergedCell, styles.borderLeft, { width: COL.sl }]}>
//                   <Text style={styles.cellText}>{group[0].sl_no}</Text>
//                 </View>
//                 <View style={[styles.mergedCell, { width: COL.item }]}>
//                   <Text style={styles.cellText}>{group[0].items}</Text>
//                 </View>
//               </View>

//               {/* RIGHT SIDE: Rows */}
//               <View style={styles.rightSection}>
//                 {group.map((row, rIdx) => (
//                   <View style={{ flexDirection: 'row', minHeight: 40 }} key={rIdx}>
//                     <View style={[styles.cell, { width: COL.brand, alignItems: 'flex-start' }]}>
//                       <Text>{row.brand || '-'}</Text>
//                     </View>
//                     <View style={[styles.cell, { width: COL.price }]}><Text>{row.single}</Text></View>
//                     <View style={[styles.cell, { width: COL.price }]}><Text>{row.qty_5_plus}</Text></View>
//                     <View style={[styles.cell, { width: COL.price }]}><Text>{row.qty_10_plus}</Text></View>
//                     <View style={[styles.cell, { width: COL.price }]}><Text>{row.qty_20_plus}</Text></View>
//                     <View style={[styles.cell, { width: COL.price }]}><Text>{row.qty_50_plus}</Text></View>
//                     <View style={[styles.cell, { width: COL.price }]}><Text>{row.qty_100_plus}</Text></View>
//                     <View style={[styles.cell, { width: COL.gst }]}><Text>{row.gst}</Text></View>
//                     <View style={[styles.cell, { width: COL.mrp }]}><Text>{row.mrp}</Text></View>
//                     <View style={[styles.cell, { width: COL.warranty }]}><Text>{row.warranty}</Text></View>
//                     <View style={[styles.cell, { width: COL.img }]}>
//                       {row.product_image && <Image src={row.product_image} style={{ width: 20, height: 20 }} />}
//                     </View>
//                   </View>
//                 ))}
//               </View>
//             </View>
//           ))}
//         </View>

//         <Text 
//     style={styles.pageNumber} 
//     render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} 
//     fixed 
//   />
//       </Page>
//     </Document>
//   );
// };

// export default PriceListDocument;





















// import React from 'react';
// import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// // 1. CONSTANT WIDTHS (Total = 100%)
// const W_LEFT = 18; // SL (4) + Item (14)
// const W_RIGHT = 82; // All other columns

// const COL = {
//   sl: '22.22%',      // (4 / 18) * 100
//   item: '77.78%',    // (14 / 18) * 100
//   brand: '34.15%',   // (28 / 82) * 100
//   price: '6.1%',     // (5 / 82) * 100
//   gst: '4.88%',      // (4 / 82) * 100
//   mrp: '7.32%',      // (6 / 82) * 100
//   warranty: '9.75%', // (8 / 82) * 100
//   img: '7.31%',      // (6 / 82) * 100
// };

// const styles = StyleSheet.create({
//   page: { padding: 20, fontSize: 7, fontFamily: 'Helvetica' },
//   tableContainer: { width: "100%" },
  
//   // Header and Row use the same flex container
//   rowMaster: { flexDirection: 'row', width: '100%' },
  
//   // headerContainer: { 
//   //   backgroundColor: '#d8aff0', 
//   //   color: '#ffffff', 
//   //   fontWeight: 'bold',
//   //   fontSize: 8,
//   //   minHeight: 20,
//   //   // justifyContent: 'center',
//   //   alignItems: 'stretch',
//   //   borderBottomWidth: 2,
//   //   borderTopWidth: 1,
//   //   borderColor: '#cccccc',
//   // },

//     page: { 
//         paddingTop: 20, 
//         paddingLeft: 20, 
//         paddingRight: 20, 
//         paddingBottom: 20, // Increased bottom padding for the footer area
//         fontSize: 7, 
//         fontFamily: 'Helvetica' 
//       },


//   headerContainer: { 
//     backgroundColor: '#d8aff0', 
//     color: '#ffffff', 
//     fontWeight: 'bold',
//     fontSize: 8,
//     minHeight: 20, // Increased slightly for better visual balance
//     borderBottomWidth: 2,
//     borderTopWidth: 1,
//     borderColor: '#cccccc',
//     flexDirection: 'row',
//     alignItems: 'stretch', // Stretch sections to full height
// },

// // New helper style for header cells
// headerCell: {
//     padding: 3,
//     borderRightWidth: 1,
//     borderColor: '#ffffff', // White separators look better on violet
//     justifyContent: 'center', // Vertical center
//     alignItems: 'center',      // Horizontal center
//     display: 'flex',
// },

// headerText: {
//     width: '100%',
//     textAlign: 'center', // Crucial for text alignment
// },
  
//   leftSection: { flexDirection: 'row', width: `${W_LEFT}%` },
//   rightSection: { width: `${W_RIGHT}%` },
  
//   cell: {
//     padding: 3,
//     borderRightWidth: 1,
//     borderBottomWidth: 1,
//     borderColor: '#cccccc',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
  
//   mergedCell: {
//     backgroundColor: '#ffffff',
//     borderRightWidth: 1,
//     borderBottomWidth: 1,
//     borderColor: '#cccccc',
//     justifyContent: 'center', // Vertical Center
//     alignItems: 'center',      // Horizontal Center
//     padding: 5,
//   },

//   pageNumber: {
//     position: 'absolute',
//     fontSize: 8,
//     bottom: 10,
//     right: 20,
//     color: 'grey',
//   },


  

//   cellText: { width: '100%', textAlign: 'center' },
//   borderLeft: { borderLeftWidth: 1 },

//   indexPage: { 
//     padding: 30, 
//     fontSize: 9, 
//     fontFamily: 'Helvetica' 
//   },
//   indexHeader: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 15,
//     textAlign: 'center',
//     color: '#4b0082', // Deep violet to match your theme
//     textDecoration: 'underline',
//   },
//   indexGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     width: '100%',
//   },
//   indexEntry: {
//     width: '50%', // 3 Columns in Landscape
//     paddingRight: 10,
//     paddingVertical: 4,
//     flexDirection: 'row',
//     alignItems: 'center',
//     overflow: 'hidden',
//     borderBottomWidth: 0.5,
//     borderColor: '#eeeeee',
//     // height: 14,
//     flexWrap: 'nowrap',
//   },
//   indexText: {
//     fontSize: 8,
//     color: '#333333',
//     textOverflow: 'ellipsis', 
//     whiteSpace: 'nowrap',
//     lineHeight: 1,
//   },
//   bullet: {
//     width: 10,
//     fontSize: 8,
//     color: '#d8aff0',
//   }
// });

// const getSplitGroups = (data) => {
//   if (!data || !Array.isArray(data)) return [];
//   const finalGroups = [];
//   let currentGroup = [];
//   const MAX_ROWS = 10;

//   data.forEach((row) => {
//     if (row.isGroupStart || currentGroup.length >= MAX_ROWS) {
//       if (currentGroup.length > 0) finalGroups.push(currentGroup);
//       currentGroup = [{ ...row }];
//     } else {
//       currentGroup.push(row);
//     }
//   });
//   if (currentGroup.length > 0) finalGroups.push(currentGroup);
//   return finalGroups;
// };

// // const PriceListDocument = ({ data = [] }) => {
// //   const processedGroups = getSplitGroups(data);




// const PriceListDocument = ({ data = [] }) => {
//   // 1. SAFELY Get Unique Items
//   const uniqueItems = Array.from(
//   new Set(
//     data.map((d) => {
//       // 1. Find the key that contains 'Item' (handles hidden newlines in headers)
//       const itemKey = Object.keys(d || {}).find(key => key && key.includes('Item'));
      
//       // 2. Get value and force to string (prevents 'null reading props' error)
//       const val = itemKey ? d[itemKey] : "";
      
//       // 3. Clean: Remove "Enters" (\n) and extra spaces
//       return String(val || "")
//         .replace(/[\r\n]+/gm, " ") 
//         .replace(/\s+/g, " ")      
//         .trim();
//     })
//   )
// )
// // 4. Remove empty strings and the header row itself
// .filter(name => name !== "" && name.toLowerCase() !== "item")
// // 5. Sort Ascending (A to Z)
// .sort((a, b) => a.localeCompare(b));



//   return (
//     <Document>


//        <Page size="A4" orientation="landscape" style={styles.indexPage}>
//         <Text style={styles.indexHeader}>Product Index (A-Z)</Text>
//         <View style={{ flexDirection: 'row' }}>
//           {/* Left Column */}
//           <View style={{ width: '50%' }}>
//             {leftCol.map((item, i) => (
//               <View key={i} style={styles.indexEntry}>
//                 <Text style={styles.bullet}>•</Text>
//                 <Text style={styles.indexText} numberOfLines={1}>{item}</Text>
//               </View>
//             ))}
//           </View>
//           {/* Right Column */}
//           <View style={{ width: '50%' }}>
//             {rightCol.map((item, i) => (
//               <View key={i} style={styles.indexEntry}>
//                 <Text style={styles.bullet}>•</Text>
//                 <Text style={styles.indexText} numberOfLines={1}>{item}</Text>
//               </View>
//             ))}
//           </View>
//         </View>
//         <Text 
//           style={styles.pageNumber} 
//           render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} 
//           fixed 
//         />
//       </Page>







//       <Page size="A4" orientation="landscape" style={styles.page}>
//         <View style={styles.tableContainer}>
          
//           {/* HEADER: Split exactly like the rows */}
//           <View style={[styles.rowMaster, styles.headerContainer]} fixed>
//             <View style={styles.leftSection}>
//               <Text style={[styles.cell, styles.borderLeft, { width: COL.sl }]}>SL No</Text>
//               <Text style={[styles.cell, { width: COL.item }]}>Item</Text>
//             </View>
//             <View style={[styles.rightSection, { flexDirection: 'row' }]}>
//               <Text style={[styles.cell, { width: COL.brand }]}>Brand / Description</Text>
//               <Text style={[styles.cell, { width: COL.price }]}>Single</Text>
//               <Text style={[styles.cell, { width: COL.price }]}>5+</Text>
//               <Text style={[styles.cell, { width: COL.price }]}>10+</Text>
//               <Text style={[styles.cell, { width: COL.price }]}>20+</Text>
//               <Text style={[styles.cell, { width: COL.price }]}>50+</Text>
//               <Text style={[styles.cell, { width: COL.price }]}>100+</Text>
//               <Text style={[styles.cell, { width: COL.gst }]}>GST</Text>
//               <Text style={[styles.cell, { width: COL.mrp }]}>MRP</Text>
//               <Text style={[styles.cell, { width: COL.warranty }]}>Warranty</Text>
//               <Text style={[styles.cell, { width: COL.img }]}>Image</Text>
              
//             </View>
//           </View>


          

//           {/* BODY */}
//           {processedGroups.map((group, gIdx) => (
//             <View key={gIdx} wrap={false} style={styles.rowMaster}>
              
//               {/* LEFT SIDE: Merged Box */}
//               <View style={styles.leftSection}>
//                 <View style={[styles.mergedCell, styles.borderLeft, { width: COL.sl }]}>
//                   <Text style={styles.cellText}>{group[0].sl_no}</Text>
//                 </View>
//                 <View style={[styles.mergedCell, { width: COL.item }]}>
//                   <Text style={styles.cellText}>{group[0].items}</Text>
//                 </View>
//               </View>

//               {/* RIGHT SIDE: Rows */}
//               <View style={styles.rightSection}>
//                 {group.map((row, rIdx) => (
//                   <View style={{ flexDirection: 'row', minHeight: 40 }} key={rIdx}>
//                     <View style={[styles.cell, { width: COL.brand, alignItems: 'flex-start' }]}>
//                       <Text>{row.brand || '-'}</Text>
//                     </View>
//                     <View style={[styles.cell, { width: COL.price }]}><Text>{row.single}</Text></View>
//                     <View style={[styles.cell, { width: COL.price }]}><Text>{row.qty_5_plus}</Text></View>
//                     <View style={[styles.cell, { width: COL.price }]}><Text>{row.qty_10_plus}</Text></View>
//                     <View style={[styles.cell, { width: COL.price }]}><Text>{row.qty_20_plus}</Text></View>
//                     <View style={[styles.cell, { width: COL.price }]}><Text>{row.qty_50_plus}</Text></View>
//                     <View style={[styles.cell, { width: COL.price }]}><Text>{row.qty_100_plus}</Text></View>
//                     <View style={[styles.cell, { width: COL.gst }]}><Text>{row.gst}</Text></View>
//                     <View style={[styles.cell, { width: COL.mrp }]}><Text>{row.mrp}</Text></View>
//                     <View style={[styles.cell, { width: COL.warranty }]}><Text>{row.warranty}</Text></View>
//                     <View style={[styles.cell, { width: COL.img }]}>
//                       {row.product_image && <Image src={row.product_image} style={{ width: 20, height: 20 }} />}
//                     </View>
//                   </View>
//                 ))}
//               </View>
//             </View>
//           ))}
//         </View>
// {/* 
//         <Text 
//     style={styles.pageNumber} 
//     render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} 
//     fixed 
//   /> */}
//       </Page>
//     </Document>
//   );
// };

// export default PriceListDocument;

























// import React from "react";
// import {
//   Document,
//   Page,
//   Text,
//   View,
//   StyleSheet,
//   Image,
// } from "@react-pdf/renderer";

// /* ===================== CONSTANTS ===================== */

// const W_LEFT = 18;
// const W_RIGHT = 82;

// const COL = {
//   sl: "22.22%",
//   item: "77.78%",
//   brand: "34.15%",
//   price: "6.1%",
//   gst: "4.88%",
//   mrp: "7.32%",
//   warranty: "9.75%",
//   img: "7.31%",
// };

// /* ===================== STYLES ===================== */

// const styles = StyleSheet.create({
//   page: {
//     padding: 20,
//     fontSize: 7,
//     fontFamily: "Helvetica",
//   },

//   indexPage: {
//     padding: 30,
//     fontSize: 9,
//     fontFamily: "Helvetica",
//   },

//   tableContainer: { width: "100%" },

//   rowMaster: {
//     flexDirection: "row",
//     width: "100%",
//   },

//   leftSection: {
//     flexDirection: "row",
//     width: `${W_LEFT}%`,
//   },

//   rightSection: {
//     width: `${W_RIGHT}%`,
//     flexDirection: "row",
//   },

//   headerContainer: {
//     backgroundColor: "#d8aff0",
//     minHeight: 20,
//     borderBottomWidth: 2,
//     borderTopWidth: 1,
//     borderColor: "#cccccc",
//   },

//   cell: {
//     padding: 3,
//     borderRightWidth: 1,
//     borderBottomWidth: 1,
//     borderColor: "#cccccc",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   mergedCell: {
//     borderRightWidth: 1,
//     borderBottomWidth: 1,
//     borderColor: "#cccccc",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 5,
//   },

//   borderLeft: {
//     borderLeftWidth: 1,
//     borderColor: "#cccccc",
//   },

//   indexHeader: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginBottom: 15,
//     textAlign: "center",
//     color: "#4b0082",
//     textDecoration: "underline",
//   },

//   indexEntry: {
//     flexDirection: "row",
//     paddingVertical: 4,
//     paddingRight: 10,
//     alignItems: "center",
//     borderBottomWidth: 0.5,
//     borderColor: "#eeeeee",
//   },

//   indexText: {
//     fontSize: 8,
//   },

//   bullet: {
//     width: 10,
//     fontSize: 8,
//     color: "#d8aff0",
//   },

//   pageNumber: {
//     position: "absolute",
//     fontSize: 8,
//     bottom: 10,
//     right: 20,
//     color: "grey",
//   },
// });

// /* ===================== HELPERS ===================== */

// const getSplitGroups = (data) => {
//   if (!Array.isArray(data)) return [];

//   const groups = [];
//   let current = [];
//   const MAX = 10;

//   data.forEach((row) => {
//     if (row?.isGroupStart || current.length >= MAX) {
//       if (current.length) groups.push(current);
//       current = [row];
//     } else {
//       current.push(row);
//     }
//   });

//   if (current.length) groups.push(current);
//   return groups;
// };

// /* ===================== COMPONENT ===================== */

// const PriceListDocument = ({ data = [] }) => {
//   /* ---------- INDEX DATA ---------- */

//   const uniqueItems = Array.from(
//     new Set(
//       data.map((d) => {
//         const key = Object.keys(d || {}).find((k) =>
//           k?.toLowerCase().includes("item")
//         );
//         return String(d?.[key] || "")
//           .replace(/[\r\n]+/g, " ")
//           .replace(/\s+/g, " ")
//           .trim();
//       })
//     )
//   )
//     .filter((v) => v && v.toLowerCase() !== "item")
//     .sort((a, b) => a.localeCompare(b));

//   const mid = Math.ceil(uniqueItems.length / 2);
//   const leftCol = uniqueItems.slice(0, mid);
//   const rightCol = uniqueItems.slice(mid);

//   /* ---------- TABLE DATA ---------- */

//   const processedGroups = getSplitGroups(data);

//   return (
//     <Document>
//       {/* ================= INDEX PAGE ================= */}

//       <Page size="A4" orientation="landscape" style={styles.indexPage}>
//         <Text style={styles.indexHeader}>Product Index (A-Z)</Text>

//         <View style={{ flexDirection: "row" }}>
//           <View style={{ width: "50%" }}>
//             {leftCol.map((item, i) => (
//               <View key={i} style={styles.indexEntry}>
//                 <Text style={styles.bullet}>•</Text>
//                 <Text style={styles.indexText}>{item}</Text>
//               </View>
//             ))}
//           </View>

//           <View style={{ width: "50%" }}>
//             {rightCol.map((item, i) => (
//               <View key={i} style={styles.indexEntry}>
//                 <Text style={styles.bullet}>•</Text>
//                 <Text style={styles.indexText}>{item}</Text>
//               </View>
//             ))}
//           </View>
//         </View>

//         <Text
//           style={styles.pageNumber}
//           render={({ pageNumber, totalPages }) =>
//             `Page ${pageNumber} of ${totalPages}`
//           }
//           fixed
//         />
//       </Page>

//       {/* ================= TABLE PAGE ================= */}

//       <Page size="A4" orientation="landscape" style={styles.page}>
//         <View style={styles.tableContainer}>
//           {/* HEADER */}
//           <View style={[styles.rowMaster, styles.headerContainer]} fixed>
//             <View style={styles.leftSection}>
//               <View style={[styles.cell, styles.borderLeft, { width: COL.sl }]}>
//                 <Text>SL No</Text>
//               </View>
//               <View style={[styles.cell, { width: COL.item }]}>
//                 <Text>Item</Text>
//               </View>
//             </View>

//             <View style={styles.rightSection}>
//               {[
//                 ["Brand / Description", COL.brand],
//                 ["Single", COL.price],
//                 ["5+", COL.price],
//                 ["10+", COL.price],
//                 ["20+", COL.price],
//                 ["50+", COL.price],
//                 ["100+", COL.price],
//                 ["GST", COL.gst],
//                 ["MRP", COL.mrp],
//                 ["Warranty", COL.warranty],
//                 ["Image", COL.img],
//               ].map(([label, width], i) => (
//                 <View key={i} style={[styles.cell, { width }]}>
//                   <Text>{label}</Text>
//                 </View>
//               ))}
//             </View>
//           </View>

//           {/* BODY */}
//           {processedGroups.map((group, gIdx) => (
//             <View key={gIdx} wrap={false} style={styles.rowMaster}>
//               <View style={styles.leftSection}>
//                 <View
//                   style={[styles.mergedCell, styles.borderLeft, { width: COL.sl }]}
//                 >
//                   <Text>{group[0]?.sl_no}</Text>
//                 </View>
//                 <View style={[styles.mergedCell, { width: COL.item }]}>
//                   <Text>{group[0]?.items}</Text>
//                 </View>
//               </View>

//               <View style={{ width: `${W_RIGHT}%` }}>
//                 {group.map((row, rIdx) => (
//                   <View
//                     key={rIdx}
//                     style={{ flexDirection: "row", minHeight: 40 }}
//                   >
//                     <View
//                       style={[
//                         styles.cell,
//                         { width: COL.brand, alignItems: "flex-start" },
//                       ]}
//                     >
//                       <Text>{row?.brand || "-"}</Text>
//                     </View>

//                     {[
//                       row?.single,
//                       row?.qty_5_plus,
//                       row?.qty_10_plus,
//                       row?.qty_20_plus,
//                       row?.qty_50_plus,
//                       row?.qty_100_plus,
//                     ].map((v, i) => (
//                       <View key={i} style={[styles.cell, { width: COL.price }]}>
//                         <Text>{v || "-"}</Text>
//                       </View>
//                     ))}

//                     <View style={[styles.cell, { width: COL.gst }]}>
//                       <Text>{row?.gst}</Text>
//                     </View>
//                     <View style={[styles.cell, { width: COL.mrp }]}>
//                       <Text>{row?.mrp}</Text>
//                     </View>
//                     <View style={[styles.cell, { width: COL.warranty }]}>
//                       <Text>{row?.warranty}</Text>
//                     </View>

//                     <View style={[styles.cell, { width: COL.img }]}>
//                       {row?.product_image && (
//                         <Image
//                           src={row.product_image}
//                           style={{ width: 20, height: 20 }}
//                         />
//                       )}
//                     </View>
//                   </View>
//                 ))}
//               </View>
//             </View>
//           ))}
//         </View>
//       </Page>
//     </Document>
//   );
// };

// export default PriceListDocument;

























// import React from "react";
// import {
//   Document,
//   Page,
//   Text,
//   View,
//   StyleSheet,
//   Image,
// } from "@react-pdf/renderer";

// /* ===================== CONSTANTS ===================== */

// const W_LEFT = 18;
// const W_RIGHT = 82;

// const COL = {
//   sl: "22.22%",
//   item: "77.78%",
//   brand: "34.15%",
//   price: "6.1%",
//   gst: "4.88%",
//   mrp: "7.32%",
//   warranty: "9.75%",
//   img: "7.31%",
// };

// /* ===================== STYLES ===================== */

// const styles = StyleSheet.create({
//   page: {
//     padding: 20,
//     fontSize: 7,
//     fontFamily: "Helvetica",
//   },

//   indexPage: {
//     padding: 30,
//     fontSize: 9,
//     fontFamily: "Helvetica",
//   },

//   tableContainer: { width: "100%" },

//   rowMaster: {
//     flexDirection: "row",
//     width: "100%",
//   },

//   leftSection: {
//     flexDirection: "row",
//     width: `${W_LEFT}%`,
//   },

//   rightSection: {
//     width: `${W_RIGHT}%`,
//     flexDirection: "row",
//   },

//   headerContainer: {
//     backgroundColor: "#d8aff0",
//     minHeight: 20,
//     borderBottomWidth: 2,
//     borderTopWidth: 1,
//     borderColor: "#cccccc",
//   },

//   cell: {
//     padding: 3,
//     borderRightWidth: 1,
//     borderBottomWidth: 1,
//     borderColor: "#cccccc",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   mergedCell: {
//     borderRightWidth: 1,
//     borderBottomWidth: 1,
//     borderColor: "#cccccc",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 5,
//   },

//   borderLeft: {
//     borderLeftWidth: 1,
//     borderColor: "#cccccc",
//   },

//   indexHeader: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginBottom: 15,
//     textAlign: "center",
//     color: "#4b0082",
//     textDecoration: "underline",
//   },

//   indexEntry: {
//     flexDirection: "row",
//     paddingVertical: 4,
//     paddingRight: 10,
//     alignItems: "center",
//     borderBottomWidth: 0.5,
//     borderColor: "#eeeeee",
//   },

//   indexText: {
//     fontSize: 8,
//   },

//   bullet: {
//     width: 10,
//     fontSize: 8,
//     color: "#d8aff0",
//   },

//   pageNumber: {
//     position: "absolute",
//     fontSize: 8,
//     bottom: 10,
//     right: 20,
//     color: "grey",
//   },
// });

// /* ===================== HELPERS ===================== */

// const getSplitGroups = (data) => {
//   if (!Array.isArray(data)) return [];

//   const groups = [];
//   let current = [];
//   const MAX = 10;

//   data.forEach((row) => {
//     if (row?.isGroupStart || current.length >= MAX) {
//       if (current.length) groups.push(current);
//       current = [row];
//     } else {
//       current.push(row);
//     }
//   });

//   if (current.length) groups.push(current);
//   return groups;
// };

// /* 🔑 PAGE MAP BUILDER (INDEX → PAGE NUMBER) */
// const buildIndexPageMap = (groups, startPage = 2) => {
//   const map = {};
//   let page = startPage;

//   groups.forEach((group) => {
//     const item = group?.[0]?.items;
//     if (item) map[item] = page;
//     page += 1; // one group = one page (your layout)
//   });

//   return map;
// };

// /* ===================== COMPONENT ===================== */

// const PriceListDocument = ({ data = [] }) => {
//   /* ---------- INDEX DATA ---------- */

//   const uniqueItems = Array.from(
//     new Set(
//       data.map((d) => {
//         const key = Object.keys(d || {}).find((k) =>
//           k?.toLowerCase().includes("item")
//         );
//         return String(d?.[key] || "")
//           .replace(/[\r\n]+/g, " ")
//           .replace(/\s+/g, " ")
//           .trim();
//       })
//     )
//   )
//     .filter((v) => v && v.toLowerCase() !== "item")
//     .sort((a, b) => a.localeCompare(b));

//   const mid = Math.ceil(uniqueItems.length / 2);
//   const leftCol = uniqueItems.slice(0, mid);
//   const rightCol = uniqueItems.slice(mid);

//   /* ---------- TABLE DATA ---------- */

//   const processedGroups = getSplitGroups(data);
//   const pageMap = buildIndexPageMap(processedGroups);

//   return (
//     <Document>
//       {/* ================= INDEX PAGE ================= */}

//       <Page size="A4" orientation="landscape" style={styles.indexPage}>
//         <Text style={styles.indexHeader}>Product Index (A-Z)</Text>

//         <View style={{ flexDirection: "row" }}>
//           <View style={{ width: "50%" }}>
//             {leftCol.map((item, i) => (
//               <View key={i} style={styles.indexEntry}>
//                 <Text style={styles.bullet}>•</Text>
//                 <Text style={styles.indexText}>
//                   {item} ........................ {pageMap[item] || "-"}
//                 </Text>
//               </View>
//             ))}
//           </View>

//           <View style={{ width: "50%" }}>
//             {rightCol.map((item, i) => (
//               <View key={i} style={styles.indexEntry}>
//                 <Text style={styles.bullet}>•</Text>
//                 <Text style={styles.indexText}>
//                   {item} ........................ {pageMap[item] || "-"}
//                 </Text>
//               </View>
//             ))}
//           </View>
//         </View>

//         <Text
//           style={styles.pageNumber}
//           render={({ pageNumber, totalPages }) =>
//             `Page ${pageNumber} of ${totalPages}`
//           }
//           fixed
//         />
//       </Page>

//       {/* ================= TABLE PAGES ================= */}

//       {processedGroups.map((group, gIdx) => (
//         <Page
//           key={gIdx}
//           size="A4"
//           orientation="landscape"
//           style={styles.page}
//         >
//           <View style={styles.tableContainer}>
//             {/* HEADER */}
//             <View style={[styles.rowMaster, styles.headerContainer]} fixed>
//               <View style={styles.leftSection}>
//                 <View
//                   style={[styles.cell, styles.borderLeft, { width: COL.sl }]}
//                 >
//                   <Text>SL No</Text>
//                 </View>
//                 <View style={[styles.cell, { width: COL.item }]}>
//                   <Text>Item</Text>
//                 </View>
//               </View>

//               <View style={styles.rightSection}>
//                 {[
//                   ["Brand / Description", COL.brand],
//                   ["Single", COL.price],
//                   ["5+", COL.price],
//                   ["10+", COL.price],
//                   ["20+", COL.price],
//                   ["50+", COL.price],
//                   ["100+", COL.price],
//                   ["GST", COL.gst],
//                   ["MRP", COL.mrp],
//                   ["Warranty", COL.warranty],
//                   ["Image", COL.img],
//                 ].map(([label, width], i) => (
//                   <View key={i} style={[styles.cell, { width }]}>
//                     <Text>{label}</Text>
//                   </View>
//                 ))}
//               </View>
//             </View>

//             {/* BODY */}
//             <View wrap={false} style={styles.rowMaster}>
//               <View style={styles.leftSection}>
//                 <View
//                   style={[styles.mergedCell, styles.borderLeft, { width: COL.sl }]}
//                 >
//                   <Text>{group[0]?.sl_no}</Text>
//                 </View>
//                 <View style={[styles.mergedCell, { width: COL.item }]}>
//                   <Text>{group[0]?.items}</Text>
//                 </View>
//               </View>

//               <View style={{ width: `${W_RIGHT}%` }}>
//                 {group.map((row, rIdx) => (
//                   <View
//                     key={rIdx}
//                     style={{ flexDirection: "row", minHeight: 40 }}
//                   >
//                     <View
//                       style={[
//                         styles.cell,
//                         { width: COL.brand, alignItems: "flex-start" },
//                       ]}
//                     >
//                       <Text>{row?.brand || "-"}</Text>
//                     </View>

//                     {[
//                       row?.single,
//                       row?.qty_5_plus,
//                       row?.qty_10_plus,
//                       row?.qty_20_plus,
//                       row?.qty_50_plus,
//                       row?.qty_100_plus,
//                     ].map((v, i) => (
//                       <View key={i} style={[styles.cell, { width: COL.price }]}>
//                         <Text>{v || "-"}</Text>
//                       </View>
//                     ))}

//                     <View style={[styles.cell, { width: COL.gst }]}>
//                       <Text>{row?.gst}</Text>
//                     </View>
//                     <View style={[styles.cell, { width: COL.mrp }]}>
//                       <Text>{row?.mrp}</Text>
//                     </View>
//                     <View style={[styles.cell, { width: COL.warranty }]}>
//                       <Text>{row?.warranty}</Text>
//                     </View>

//                     <View style={[styles.cell, { width: COL.img }]}>
//                       {row?.product_image && (
//                         <Image
//                           src={row.product_image}
//                           style={{ width: 20, height: 20 }}
//                         />
//                       )}
//                     </View>
//                   </View>
//                 ))}
//               </View>
//             </View>
//           </View>

//           <Text
//             style={styles.pageNumber}
//             render={({ pageNumber, totalPages }) =>
//               `Page ${pageNumber} of ${totalPages}`
//             }
//             fixed
//           />
//         </Page>
//       ))}
//     </Document>
//   );
// };

// export default PriceListDocument;


















// import React from "react";
// import {
//   Document,
//   Page,
//   Text,
//   View,
//   StyleSheet,
//   Image,
// } from "@react-pdf/renderer";

// /* ===================== CONSTANTS ===================== */

// // TUNE THIS ONCE (very important)
// const ROWS_PER_PAGE = 12; 
// const INDEX_ROWS_PER_PAGE = 60;   // rows that fit after header (landscape A4)
// const calculateIndexPages = (itemCount) => {
//   return Math.max(1, Math.ceil(itemCount / INDEX_ROWS_PER_PAGE));
// };
//      // index occupies 1 page

// const W_LEFT = 18;
// const W_RIGHT = 82;

// const COL = {
//   sl: "22.22%",
//   item: "77.78%",
//   brand: "34.15%",
//   price: "6.1%",
//   gst: "4.88%",
//   mrp: "7.32%",
//   warranty: "9.75%",
//   img: "7.31%",
// };

// /* ===================== STYLES ===================== */

// const styles = StyleSheet.create({
//   page: { padding: 20, fontSize: 7, fontFamily: "Helvetica" },
//   indexPage: { padding: 30, fontSize: 9, fontFamily: "Helvetica" },

//   tableContainer: { width: "100%" },
//   rowMaster: { flexDirection: "row", width: "100%" },

//   leftSection: { flexDirection: "row", width: `${W_LEFT}%` },
//   rightSection: { width: `${W_RIGHT}%`, flexDirection: "row" },

//   headerContainer: {
//     backgroundColor: "#d8aff0",
//     minHeight: 20,
//     borderBottomWidth: 2,
//     borderTopWidth: 1,
//     borderColor: "#cccccc",
//   },

//   cell: {
//     padding: 3,
//     borderRightWidth: 1,
//     borderBottomWidth: 1,
//     borderColor: "#cccccc",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   mergedCell: {
//     borderRightWidth: 1,
//     borderBottomWidth: 1,
//     borderColor: "#cccccc",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 5,
//   },

//   borderLeft: { borderLeftWidth: 1, borderColor: "#cccccc" },

//   indexHeader: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginBottom: 15,
//     textAlign: "center",
//     color: "#4b0082",
//     textDecoration: "underline",
//   },

//   indexEntry: {
//     flexDirection: "row",
//     paddingVertical: 4,
//     paddingRight: 10,
//     alignItems: "center",
//     borderBottomWidth: 0.5,
//     borderColor: "#eeeeee",
//   },

//   indexText: { fontSize: 8 },
//   bullet: { width: 10, fontSize: 8, color: "#d8aff0" },

//   pageNumber: {
//     position: "absolute",
//     fontSize: 8,
//     bottom: 10,
//     right: 20,
//     color: "grey",
//   },
// });

// /* ===================== HELPERS ===================== */

// // Groups rows by SL No (your existing logic)
// const getSplitGroups = (data) => {
//   if (!Array.isArray(data)) return [];

//   const map = {};
//   data.forEach((r) => {
//     if (!map[r.sl_no]) map[r.sl_no] = [];
//     map[r.sl_no].push(r);
//   });

//   return Object.values(map);
// };

// /* 🔑 ESTIMATED PAGINATION (jsPDF-style logic) */
// const buildEstimatedIndexMap = (groups) => {
//   let currentPage = INDEX_PAGES + 1;
//   let usedRows = 0;
//   const pageMap = {};

//   groups.forEach((group) => {
//     const rowsNeeded = group.length;

//     // simulate page break
//     if (usedRows + rowsNeeded > ROWS_PER_PAGE) {
//       currentPage += 1;
//       usedRows = 0;
//     }

//     const item = group[0]?.items;
//     if (item && !pageMap[item]) {
//       pageMap[item] = currentPage;
//     }

//     usedRows += rowsNeeded;
//   });

//   return pageMap;
// };

// /* ===================== COMPONENT ===================== */

// const PriceListDocument = ({ data = [] }) => {
//   const processedGroups = getSplitGroups(data);
  

//   /* -------- INDEX DATA -------- */

//   const uniqueItems = Array.from(
//     new Set(
//       processedGroups.map((g) =>
//         String(g[0]?.items || "")
//           .replace(/[\r\n]+/g, " ")
//           .replace(/\s+/g, " ")
//           .trim()
//       )
//     )
//   ).sort((a, b) => a.localeCompare(b));

//   const mid = Math.ceil(uniqueItems.length / 2);
//   const leftCol = uniqueItems.slice(0, mid);
//   const rightCol = uniqueItems.slice(mid);
//   const indexPages = calculateIndexPages(uniqueItems.length);
//   const pageMap = buildEstimatedIndexMap(processedGroups, indexPages);

//   return (
//     <Document>
//       {/* ================= INDEX PAGE ================= */}

//       <Page size="A4" orientation="landscape" style={styles.indexPage}>
//         <Text style={styles.indexHeader}>Product Index (A–Z)</Text>

//         <View style={{ flexDirection: "row" }}>
//           <View style={{ width: "50%" }}>
//             {leftCol.map((item, i) => (
//               <View key={i} style={styles.indexEntry}>
//                 <Text style={styles.bullet}>•</Text>
//                 <Text style={styles.indexText}>
//                   {item} ........................ {pageMap[item] ?? "-"}
//                 </Text>
//               </View>
//             ))}
//           </View>

//           <View style={{ width: "50%" }}>
//             {rightCol.map((item, i) => (
//               <View key={i} style={styles.indexEntry}>
//                 <Text style={styles.bullet}>•</Text>
//                 <Text style={styles.indexText}>
//                   {item} ........................ {pageMap[item] ?? "-"}
//                 </Text>
//               </View>
//             ))}
//           </View>
//         </View>

//         <Text
//           style={styles.pageNumber}
//           render={({ pageNumber, totalPages }) =>
//             `Page ${pageNumber} of ${totalPages}`
//           }
//           fixed
//         />
//       </Page>

//       {/* ================= CONTINUOUS TABLE ================= */}

//       <Page size="A4" orientation="landscape" style={styles.page}>
//         <View style={styles.tableContainer}>
//           {/* HEADER */}
//           <View style={[styles.rowMaster, styles.headerContainer]} fixed>
//             <View style={styles.leftSection}>
//               <View style={[styles.cell, styles.borderLeft, { width: COL.sl }]}>
//                 <Text>SL No</Text>
//               </View>
//               <View style={[styles.cell, { width: COL.item }]}>
//                 <Text>Item</Text>
//               </View>
//             </View>

//             <View style={styles.rightSection}>
//               {[
//                 ["Brand / Description", COL.brand],
//                 ["Single", COL.price],
//                 ["5+", COL.price],
//                 ["10+", COL.price],
//                 ["20+", COL.price],
//                 ["50+", COL.price],
//                 ["100+", COL.price],
//                 ["GST", COL.gst],
//                 ["MRP", COL.mrp],
//                 ["Warranty", COL.warranty],
//                 ["Image", COL.img],
//               ].map(([label, width], i) => (
//                 <View key={i} style={[styles.cell, { width }]}>
//                   <Text>{label}</Text>
//                 </View>
//               ))}
//             </View>
//           </View>

//           {/* BODY – CONTINUOUS FLOW */}
//           {processedGroups.map((group, gIdx) => (
//             <View key={gIdx} wrap={false} style={styles.rowMaster}>
//               <View style={styles.leftSection}>
//                 <View
//                   style={[styles.mergedCell, styles.borderLeft, { width: COL.sl }]}
//                 >
//                   <Text>{group[0]?.sl_no}</Text>
//                 </View>
//                 <View style={[styles.mergedCell, { width: COL.item }]}>
//                   <Text>{group[0]?.items}</Text>
//                 </View>
//               </View>

//               <View style={{ width: `${W_RIGHT}%` }}>
//                 {group.map((row, rIdx) => (
//                   <View
//                     key={rIdx}
//                     style={{ flexDirection: "row", minHeight: 40 }}
//                   >
//                     <View
//                       style={[
//                         styles.cell,
//                         { width: COL.brand, alignItems: "flex-start" },
//                       ]}
//                     >
//                       <Text>{row?.brand || "-"}</Text>
//                     </View>

//                     {[
//                       row?.single,
//                       row?.qty_5_plus,
//                       row?.qty_10_plus,
//                       row?.qty_20_plus,
//                       row?.qty_50_plus,
//                       row?.qty_100_plus,
//                     ].map((v, i) => (
//                       <View key={i} style={[styles.cell, { width: COL.price }]}>
//                         <Text>{v || "-"}</Text>
//                       </View>
//                     ))}

//                     <View style={[styles.cell, { width: COL.gst }]}>
//                       <Text>{row?.gst}</Text>
//                     </View>
//                     <View style={[styles.cell, { width: COL.mrp }]}>
//                       <Text>{row?.mrp}</Text>
//                     </View>
//                     <View style={[styles.cell, { width: COL.warranty }]}>
//                       <Text>{row?.warranty}</Text>
//                     </View>

//                     <View style={[styles.cell, { width: COL.img }]}>
//                       {row?.product_image && (
//                         <Image
//                           src={row.product_image}
//                           style={{ width: 20, height: 20 }}
//                         />
//                       )}
//                     </View>
//                   </View>
//                 ))}
//               </View>
//             </View>
//           ))}
//         </View>

//         <Text
//           style={styles.pageNumber}
//           render={({ pageNumber, totalPages }) =>
//             `Page ${pageNumber} of ${totalPages}`
//           }
//           fixed
//         />
//       </Page>
//     </Document>
//   );
// };

// export default PriceListDocument;

















// import React from "react";
// import {
//   Document,
//   Page,
//   Text,
//   View,
//   StyleSheet,
//   Image,
// } from "@react-pdf/renderer";

// /* ===================== CONSTANTS ===================== */

// const ROWS_PER_PAGE = 12;
// const INDEX_ROWS_PER_PAGE = 60;

// const calculateIndexPages = (itemCount) =>
//   Math.max(1, Math.ceil(itemCount / INDEX_ROWS_PER_PAGE));

// const W_LEFT = 18;
// const W_RIGHT = 82;

// const COL = {
//   sl: "22.22%",
//   item: "77.78%",
//   brand: "34.15%",
//   price: "6.1%",
//   gst: "4.88%",
//   mrp: "7.32%",
//   warranty: "9.75%",
//   img: "7.31%",
// };

// /* ===================== STYLES (UNCHANGED) ===================== */

// const styles = StyleSheet.create({
//   page: { padding: 20, fontSize: 7, fontFamily: "Helvetica" },
//   indexPage: { padding: 30, fontSize: 9, fontFamily: "Helvetica" },

//   tableContainer: { width: "100%" },
//   rowMaster: { flexDirection: "row", width: "100%" },

//   leftSection: { flexDirection: "row", width: `${W_LEFT}%` },
//   rightSection: { width: `${W_RIGHT}%`, flexDirection: "row" },

//   headerContainer: {
//     backgroundColor: "#d8aff0",
//     minHeight: 20,
//     borderBottomWidth: 2,
//     borderTopWidth: 1,
//     borderColor: "#cccccc",
//   },

//   cell: {
//     padding: 3,
//     borderRightWidth: 1,
//     borderBottomWidth: 1,
//     borderColor: "#cccccc",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   mergedCell: {
//     borderRightWidth: 1,
//     borderBottomWidth: 1,
//     borderColor: "#cccccc",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 5,
//   },

//   borderLeft: { borderLeftWidth: 1, borderColor: "#cccccc" },

//   indexHeader: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginBottom: 15,
//     textAlign: "center",
//     color: "#4b0082",
//     textDecoration: "underline",
//   },

//   indexEntry: {
//     flexDirection: "row",
//     paddingVertical: 4,
//     paddingRight: 10,
//     alignItems: "center",
//     borderBottomWidth: 0.5,
//     borderColor: "#eeeeee",
//   },

//   indexText: { fontSize: 8 },
//   bullet: { width: 10, fontSize: 8, color: "#d8aff0" },

//   pageNumber: {
//     position: "absolute",
//     fontSize: 8,
//     bottom: 10,
//     right: 20,
//     color: "grey",
//   },
// });

// /* ===================== HELPERS ===================== */

// const getSplitGroups = (data) => {
//   if (!Array.isArray(data)) return [];
//   const map = {};
//   data.forEach((r) => {
//     if (!map[r.sl_no]) map[r.sl_no] = [];
//     map[r.sl_no].push(r);
//   });
//   return Object.values(map);
// };

// /* 🔑 SAFE page estimation */
// const buildEstimatedIndexMap = (groups, indexPages) => {
//   let currentPage = indexPages + 1;
//   let usedRows = 0;
//   const pageMap = {};

//   groups.forEach((group) => {
//     const rowsNeeded = group.length;

//     if (usedRows + rowsNeeded > ROWS_PER_PAGE) {
//       currentPage += 1;
//       usedRows = 0;
//     }

//     const item = group[0]?.items;
//     if (item && !pageMap[item]) {
//       pageMap[item] = currentPage;
//     }

//     usedRows += rowsNeeded;
//   });

//   return pageMap;
// };




// /* ===================== COMPONENT ===================== */

// const PriceListDocument = ({ data }) => {
//   const safeData = Array.isArray(data) ? data : [];
//   const processedGroups = getSplitGroups(safeData);

//   /* -------- INDEX DATA -------- */

//   const uniqueItems = Array.from(
//     new Set(
//       processedGroups.map((g) =>
//         String(g[0]?.items || "")
//           .replace(/[\r\n]+/g, " ")
//           .replace(/\s+/g, " ")
//           .trim()
//       )
//     )
//   ).filter(Boolean).sort((a, b) => a.localeCompare(b));

//   const mid = Math.ceil(uniqueItems.length / 2);
//   const leftCol = uniqueItems.slice(0, mid);
//   const rightCol = uniqueItems.slice(mid);

//   const indexPages = calculateIndexPages(uniqueItems.length);
//   const pageMap = buildEstimatedIndexMap(processedGroups, indexPages);

//   return (
//     <Document>

//       {/* ================= INDEX ================= */}

//       <Page size="A4" orientation="landscape" style={styles.indexPage}>
//         <Text style={styles.indexHeader}>Product Index (A–Z)</Text>

//         <View style={{ flexDirection: "row" }}>
//           <View style={{ width: "50%" }}>
//             {leftCol.map((item, i) => (
//               <View key={i} style={styles.indexEntry}>
//                 <Text style={styles.bullet}>•</Text>
//                 <Text style={styles.indexText}>
//                   {item} ........................ {pageMap[item] ?? "-"}
//                 </Text>
//               </View>
//             ))}
//           </View>

//           <View style={{ width: "50%" }}>
//             {rightCol.map((item, i) => (
//               <View key={i} style={styles.indexEntry}>
//                 <Text style={styles.bullet}>•</Text>
//                 <Text style={styles.indexText}>
//                   {item} ........................ {pageMap[item] ?? "-"}
//                 </Text>
//               </View>
//             ))}
//           </View>
//         </View>

//         <Text
//           style={styles.pageNumber}
//           render={({ pageNumber, totalPages }) =>
//             `Page ${pageNumber} of ${totalPages}`
//           }
//           fixed
//         />
//       </Page>

//       {/* ================= DATA TABLE ================= */}

//       <Page size="A4" orientation="landscape" style={styles.page}>
//         <View style={styles.tableContainer}>

//           {/* HEADER */}
//           <View style={[styles.rowMaster, styles.headerContainer]} fixed>
//             <View style={styles.leftSection}>
//               <View style={[styles.cell, styles.borderLeft, { width: COL.sl }]}>
//                 <Text>SL No</Text>
//               </View>
//               <View style={[styles.cell, { width: COL.item }]}>
//                 <Text>Item</Text>
//               </View>
//             </View>

//             <View style={styles.rightSection}>
//               {[
//                 ["Brand / Description", COL.brand],
//                 ["Single", COL.price],
//                 ["5+", COL.price],
//                 ["10+", COL.price],
//                 ["20+", COL.price],
//                 ["50+", COL.price],
//                 ["100+", COL.price],
//                 ["GST", COL.gst],
//                 ["MRP", COL.mrp],
//                 ["Warranty", COL.warranty],
//                 ["Image", COL.img],
//               ].map(([label, width], i) => (
//                 <View key={i} style={[styles.cell, { width }]}>
//                   <Text>{label}</Text>
//                 </View>
//               ))}
//             </View>
//           </View>

//           {/* BODY */}
//           {processedGroups.map((group, gIdx) => (
//             <View key={gIdx} wrap={false} style={styles.rowMaster}>
//               <View style={styles.leftSection}>
//                 <View style={[styles.mergedCell, styles.borderLeft, { width: COL.sl }]}>
//                   <Text>{group[0]?.sl_no}</Text>
//                 </View>
//                 <View style={[styles.mergedCell, { width: COL.item }]}>
//                   <Text>{group[0]?.items}</Text>
//                 </View>
//               </View>

//               <View style={{ width: `${W_RIGHT}%` }}>
//                 {group.map((row, rIdx) => (
//                   <View key={rIdx} style={{ flexDirection: "row", minHeight: 40 }}>
//                     <View style={[styles.cell, { width: COL.brand, alignItems: "flex-start" }]}>
//                       <Text>{row?.brand || "-"}</Text>
//                     </View>

//                     {[row?.single, row?.qty_5_plus, row?.qty_10_plus, row?.qty_20_plus, row?.qty_50_plus, row?.qty_100_plus].map(
//                       (v, i) => (
//                         <View key={i} style={[styles.cell, { width: COL.price }]}>
//                           <Text>{v || "-"}</Text>
//                         </View>
//                       )
//                     )}

//                     <View style={[styles.cell, { width: COL.gst }]}>
//                       <Text>{row?.gst || "-"}</Text>
//                     </View>
//                     <View style={[styles.cell, { width: COL.mrp }]}>
//                       <Text>{row?.mrp || "-"}</Text>
//                     </View>
//                     <View style={[styles.cell, { width: COL.warranty }]}>
//                       <Text>{row?.warranty || "-"}</Text>
//                     </View>

//                     <View style={[styles.cell, { width: COL.img }]}>
//                       {typeof row?.product_image === "string" &&
//                       row.product_image.trim() !== "" ? (
//                         <Image
//                           src={row.product_image}
//                           style={{ width: 20, height: 20 }}
//                         />
//                       ) : (
//                         <Text></Text>
//                       )}
//                     </View>
//                   </View>
//                 ))}
//               </View>
//             </View>
//           ))}
//         </View>

//         <Text
//           style={styles.pageNumber}
//           render={({ pageNumber, totalPages }) =>
//             `Page ${pageNumber} of ${totalPages}`
//           }
//           fixed
//         />
//       </Page>

//     </Document>
//   );
// };

// export default PriceListDocument;

















// import React from "react";
// import {
//   Document,
//   Page,
//   Text,
//   View,
//   StyleSheet,
//   Image,
// } from "@react-pdf/renderer";

// /* ===================== CONSTANTS ===================== */

// const ROWS_PER_PAGE = 12;
// const INDEX_ROWS_PER_PAGE = 60;

// const calculateIndexPages = (itemCount) =>
//   Math.max(1, Math.ceil(itemCount / INDEX_ROWS_PER_PAGE));

// const W_LEFT = 18;
// const W_RIGHT = 82;

// const COL = {
//   sl: "22.22%",
//   item: "77.78%",
//   brand: "34.15%",
//   price: "6.1%",
//   gst: "4.88%",
//   mrp: "7.32%",
//   warranty: "9.75%",
//   img: "7.31%",
// };

// /* ===================== STYLES (UNCHANGED) ===================== */

// const styles = StyleSheet.create({
//   page: { padding: 20, fontSize: 7, fontFamily: "Helvetica" },
//   indexPage: { padding: 30, fontSize: 9, fontFamily: "Helvetica" },

//   tableContainer: { width: "100%" },
//   rowMaster: { flexDirection: "row", width: "100%" },

//   leftSection: { flexDirection: "row", width: `${W_LEFT}%` },
//   rightSection: { width: `${W_RIGHT}%`, flexDirection: "row" },

//   headerContainer: {
//     backgroundColor: "#d8aff0",
//     minHeight: 20,
//     borderBottomWidth: 2,
//     borderTopWidth: 1,
//     borderColor: "#cccccc",
//   },

//   cell: {
//     padding: 3,
//     borderRightWidth: 1,
//     borderBottomWidth: 1,
//     borderColor: "#cccccc",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   mergedCell: {
//     borderRightWidth: 1,
//     borderBottomWidth: 1,
//     borderColor: "#cccccc",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 5,
//   },

//   borderLeft: { borderLeftWidth: 1, borderColor: "#cccccc" },

//   indexHeader: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginBottom: 15,
//     textAlign: "center",
//     color: "#4b0082",
//     textDecoration: "underline",
//   },

//   indexEntry: {
//     flexDirection: "row",
//     paddingVertical: 4,
//     paddingRight: 10,
//     alignItems: "center",
//     borderBottomWidth: 0.5,
//     borderColor: "#eeeeee",
//   },

//   indexText: { fontSize: 8 },
//   bullet: { width: 10, fontSize: 8, color: "#d8aff0" },

//   dots: {
//     flexGrow: 1,           // fills remaining space
//     // borderBottomWidth: 1,  // creates a solid line of dots
//     borderBottomColor: "#997474",
//     marginHorizontal: 5,
//   },

//   pageNumber: {
//     position: "absolute",
//     fontSize: 8,
//     bottom: 10,
//     right: 20,
//     color: "grey",
//   },
// });

// /* ===================== HELPERS ===================== */

// const getSplitGroups = (data) => {
//   if (!Array.isArray(data)) return [];
//   const map = {};
//   data.forEach((r) => {
//     if (!map[r.sl_no]) map[r.sl_no] = [];
//     map[r.sl_no].push(r);
//   });
//   return Object.values(map);
// };

// /* 🔑 SAFE page estimation */
// const buildEstimatedIndexMap = (groups, indexPages) => {
//   let currentPage = indexPages + 1;
//   let usedRows = 0;
//   const pageMap = {};

//   groups.forEach((group) => {
//     const rowsNeeded = group.length;

//     if (usedRows + rowsNeeded > ROWS_PER_PAGE) {
//       currentPage += 1;
//       usedRows = 0;
//     }

//     const item = normalizeItem(group[0]?.items);
//     if (item && !pageMap[item]) {
//       pageMap[item] = currentPage;
//     }

//     usedRows += rowsNeeded;
//   });

//   return pageMap;
// };




// const normalizeItem = (val) =>
//   String(val || "")
//     .replace(/[\r\n]+/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();





// /* ===================== COMPONENT ===================== */

// const PriceListDocument = ({ data }) => {
//   const safeData = Array.isArray(data) ? data : [];
//   const processedGroups = getSplitGroups(safeData);

//   /* -------- INDEX DATA -------- */

//   const uniqueItems = Array.from(
//   new Set(processedGroups.map((g) => normalizeItem(g[0]?.items)))
// )
// .filter(Boolean)
// .sort((a, b) => a.localeCompare(b));


//   const mid = Math.ceil(uniqueItems.length / 2);
//   const leftCol = uniqueItems.slice(0, mid);
//   const rightCol = uniqueItems.slice(mid);

//   const indexPages = calculateIndexPages(uniqueItems.length);
//   const pageMap = buildEstimatedIndexMap(processedGroups, indexPages);

//   return (
//     <Document>

//       {/* ================= INDEX ================= */}

//       {/* <Page size="A4" orientation="landscape" style={styles.indexPage}>
//         <Text style={styles.indexHeader}>Product Index (A–Z)</Text>

//         <View style={{ flexDirection: "row" }}>
//           <View style={{ width: "50%" }}>
//             {leftCol.map((item, i) => (
//               <View key={i} style={styles.indexEntry}>
//                 <Text style={styles.bullet}>•</Text>
//                 <Text style={styles.indexText}>
//                   {item} ........................ {pageMap[item] ?? "-"}
//                 </Text>
//               </View>
//             ))}
//           </View>

//           <View style={{ width: "50%" }}>
//             {rightCol.map((item, i) => (
//               <View key={i} style={styles.indexEntry}>
//                 <Text style={styles.bullet}>•</Text>
//                 <Text style={styles.indexText}>
//                   {item} ........................ {pageMap[item] ?? "-"}
//                 </Text>
//               </View>
//             ))}
//           </View>
//         </View>

//         <Text
//           style={styles.pageNumber}
//           render={({ pageNumber, totalPages }) =>
//             `Page ${pageNumber} of ${totalPages}`
//           }
//           fixed
//         />
//       </Page> */}





// <Page size="A4" orientation="landscape" style={styles.indexPage}>
//   <Text style={styles.indexHeader}>Product Index (A–Z)</Text>

//   <View style={{ flexDirection: "row",columnGap: 20 }}>
//     {/* Left Column */}
//     <View style={{ width: "50%" }}>
//       {leftCol.map((item, i) => (
//         <View key={i} style={styles.indexEntry}>
//           <Text style={styles.indexText}>
//             {item}
//           </Text>
//           <Text style={styles.dots}>
//             {"."} {/* The flex will stretch this */}
//           </Text>
//           <Text style={styles.pageNumberText}>
//             {pageMap[item] ?? "-"}
//           </Text>
//         </View>
//       ))}
//     </View>

//     {/* Right Column */}
//     <View style={{ width: "50%" }}>
//       {rightCol.map((item, i) => (
//         <View key={i} style={styles.indexEntry}>
//           <Text style={styles.indexText}>
//             {item}
//           </Text>
//           <Text style={styles.dots}>
//             {"."}
//           </Text>
//           <Text style={styles.pageNumberText}>
//             {pageMap[item] ?? "-"}
//           </Text>
//         </View>
//       ))}
//     </View>
//   </View>

//   {/* Footer Page Number */}
//    <Text
//           style={styles.pageNumber}
//           render={({ pageNumber, totalPages }) =>
//             `Page ${pageNumber} of ${totalPages}`
//           }
//           fixed
//         />
// </Page>


//       {/* ================= DATA TABLE ================= */}

//       <Page size="A4" orientation="landscape" style={styles.page}>
//         <View style={styles.tableContainer}>

//           {/* HEADER */}
//           <View style={[styles.rowMaster, styles.headerContainer]} fixed>
//             <View style={styles.leftSection}>
//               <View style={[styles.cell, styles.borderLeft, { width: COL.sl }]}>
//                 <Text>SL No</Text>
//               </View>
//               <View style={[styles.cell, { width: COL.item }]}>
//                 <Text>Item</Text>
//               </View>
//             </View>

//             <View style={styles.rightSection}>
//               {[
//                 ["Brand / Description", COL.brand],
//                 ["Single", COL.price],
//                 ["5+", COL.price],
//                 ["10+", COL.price],
//                 ["20+", COL.price],
//                 ["50+", COL.price],
//                 ["100+", COL.price],
//                 ["GST", COL.gst],
//                 ["MRP", COL.mrp],
//                 ["Warranty", COL.warranty],
//                 ["Image", COL.img],
//               ].map(([label, width], i) => (
//                 <View key={i} style={[styles.cell, { width }]}>
//                   <Text>{label}</Text>
//                 </View>
//               ))}
//             </View>
//           </View>

//           {/* BODY */}
//           {processedGroups.map((group, gIdx) => (
//             <View key={gIdx} wrap={false} style={styles.rowMaster}>
//               <View style={styles.leftSection}>
//                 <View style={[styles.mergedCell, styles.borderLeft, { width: COL.sl }]}>
//                   <Text>{group[0]?.sl_no}</Text>
//                 </View>
//                 <View style={[styles.mergedCell, { width: COL.item }]}>
//                   <Text>{group[0]?.items}</Text>
//                 </View>
//               </View>

//               <View style={{ width: `${W_RIGHT}%` }}>
//                 {group.map((row, rIdx) => (
//                   <View key={rIdx} style={{ flexDirection: "row", minHeight: 40 }}>
//                     <View style={[styles.cell, { width: COL.brand, alignItems: "flex-start" }]}>
//                       <Text>{row?.brand || "-"}</Text>
//                     </View>

//                     {[row?.single, row?.qty_5_plus, row?.qty_10_plus, row?.qty_20_plus, row?.qty_50_plus, row?.qty_100_plus].map(
//                       (v, i) => (
//                         <View key={i} style={[styles.cell, { width: COL.price }]}>
//                           <Text>{v || "-"}</Text>
//                         </View>
//                       )
//                     )}

//                     <View style={[styles.cell, { width: COL.gst }]}>
//                       <Text>{row?.gst || "-"}</Text>
//                     </View>
//                     <View style={[styles.cell, { width: COL.mrp }]}>
//                       <Text>{row?.mrp || "-"}</Text>
//                     </View>
//                     <View style={[styles.cell, { width: COL.warranty }]}>
//                       <Text>{row?.warranty || "-"}</Text>
//                     </View>

//                     <View style={[styles.cell, { width: COL.img }]}>
//                       {typeof row?.product_image === "string" &&
//                       row.product_image.trim() !== "" ? (
//                         <Image
//                           src={row.product_image}
//                           style={{ width: 20, height: 20 }}
//                         />
//                       ) : (
//                         <Text></Text>
//                       )}
//                     </View>
//                   </View>
//                 ))}
//               </View>
//             </View>
//           ))}
//         </View>

//         <Text
//           style={styles.pageNumber}
//           render={({ pageNumber, totalPages }) =>
//             `Page ${pageNumber} of ${totalPages}`
//           }
//           fixed
//         />
//       </Page>

//     </Document>
//   );
// };

// export default PriceListDocument;











import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, Link } from "@react-pdf/renderer";

const COL = { sl: "22.22%", item: "77.78%", brand: "34.15%", price: "6.1%", gst: "4.88%", mrp: "7.32%", warranty: "9.75%", img: "7.31%" };

const styles = StyleSheet.create({
  page: { padding: 20, fontSize: 7, fontFamily: "Helvetica" },
  indexPage: { padding: 30, fontSize: 9, fontFamily: "Helvetica" },
  rowMaster: { flexDirection: "row", width: "100%" },
  headerContainer: { backgroundColor: "#d8aff0", minHeight: 20, borderBottomWidth: 2, borderTopWidth: 1, borderColor: "#cccccc" },
  cell: { padding: 3, borderRightWidth: 1, borderBottomWidth: 1, borderColor: "#cccccc", justifyContent: "center", alignItems: "center" },
  indexEntry: { flexDirection: "row", paddingVertical: 3, alignItems: "flex-end" },
  dots: { flexGrow: 1, borderBottomWidth: 1, borderBottomColor: "#bbbbbb", borderStyle: "dotted", marginHorizontal: 4, marginBottom: 2 },
  // 🔑 The Tracker must have a tiny height to be "seen" by the layout engine
  tracker: { height: 0.1, width: 1, opacity: 0 }, 
});

const getSafeId = (name) => `id_${String(name).replace(/[^a-zA-Z0-9]/g, '')}`;

const PriceListDocument = ({ data, actualPageMap, onDiscoverPage }) => {
  const groups = Array.isArray(data) ? data : [];
  
  // Unique items for index
  const uniqueItems = Array.from(new Set(groups.map(g => String(g[0]?.items || "").trim()))).filter(Boolean).sort();
  const mid = Math.ceil(uniqueItems.length / 2);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.indexPage}>
        <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 10 }}>Product Index</Text>
        <View style={{ flexDirection: "row", columnGap: 20 }}>
          {[uniqueItems.slice(0, mid), uniqueItems.slice(mid)].map((col, cIdx) => (
            <View key={cIdx} style={{ width: "50%" }}>
              {col.map((item, i) => (
                <Link key={i} src={`#${getSafeId(item)}`} style={{ textDecoration: 'none' }}>
                  <View style={styles.indexEntry}>
                    <Text style={{ color: "#000" }}>{item}</Text>
                    <View style={styles.dots} />
                    <Text style={{ width: 25, textAlign: 'right' }}>{actualPageMap?.[item] || "..."}</Text>
                  </View>
                </Link>
              ))}
            </View>
          ))}
        </View>
      </Page>

      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={[styles.rowMaster, styles.headerContainer]} fixed>
            <Text style={{ width: '18%', padding: 3 }}>Item Details</Text>
            <Text style={{ width: '82%', padding: 3 }}>Pricing & Specs</Text>
        </View>

        {groups.map((group, gIdx) => {
          const itemName = String(group[0]?.items || "").trim();
          return (
            <View key={gIdx} wrap={false} style={styles.rowMaster} id={getSafeId(itemName)}>
              {/* 🔑 The Tracker reports the page number */}
              <View style={styles.tracker} render={({ pageNumber }) => {
                if (onDiscoverPage) onDiscoverPage(itemName, pageNumber);
                return null;
              }} />
              
              <View style={{ width: '18%', borderLeftWidth: 1, borderColor: '#ccc', padding: 5 }}>
                <Text>{itemName}</Text>
              </View>

              <View style={{ width: '82%' }}>
                {group.map((row, rIdx) => (
                  <View key={rIdx} style={{ flexDirection: 'row', minHeight: 40 }}>
                    <View style={[styles.cell, { width: COL.brand }]}><Text>{row.brand}</Text></View>
                    <View style={[styles.cell, { width: COL.price }]}><Text>{row.single}</Text></View>
                    <View style={[styles.cell, { width: COL.gst }]}><Text>{row.gst}</Text></View>
                    <View style={[styles.cell, { width: COL.img }]}>
                      {row.product_image ? (
                        <Image src={row.product_image} style={{ width: 20, height: 20 }} />
                      ) : <Text>-</Text>}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </Page>
    </Document>
  );
};

export default PriceListDocument;