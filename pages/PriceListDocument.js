








import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 20, fontSize: 8, fontFamily: 'Helvetica' },
  tableContainer: { width: "100%" },
  headerContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#1abc9c', 
    color: '#ffffff', 
    fontWeight: 'bold',
    minHeight: 35,
    borderTopWidth: 1,
    borderColor: '#cccccc',
  },
  rowContainer: { flexDirection: 'row', alignItems: 'stretch', minHeight: 45 },
  cell: {
    
    padding: 5,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#cccccc',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  firstCellInRow: { borderLeftWidth: 1 },
  cellText: { width: '100%', textAlign: 'center', flexWrap: 'wrap' },
  mergedCell: {
    backgroundColor: '#10a034ff',
    padding: 5,
    borderRightWidth: 1,
    borderBottomWidth: 0, 
    borderColor: '#cccccc',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupEndLine: { borderBottomWidth: 1 },

  // Precision Widths
  colSl: { width: '4%' }, colItem: { width: '15%' }, colBrand: { width: '30%' },   
  colPrice: { width: '5.5%' }, colGst: { width: '4%' }, colMrp: { width: '6%' },      
  colWarranty: { width: '8%' }, colImg: { width: '5.5%' },
});

// HIGH-TECH SPLITTER FUNCTION
const getSplitGroups = (data) => {
  const finalGroups = [];
  let currentGroup = [];
  const MAX_ROWS_PER_CHUNK = 10; // Splitting mega groups into 10-row chunks

  data.forEach((row) => {
    // If it's a new SL No from the database, or our current chunk is full
    if (row.isGroupStart || currentGroup.length >= MAX_ROWS_PER_CHUNK) {
      if (currentGroup.length > 0) {
        // Mark the previous chunk as finished so it gets a bottom border
        currentGroup[currentGroup.length - 1].isEndOfGroup = true;
        finalGroups.push(currentGroup);
      }
      
      // Start a new chunk. 
      // If we are splitting a mega-group, we force the next row to act as a 'GroupStart'
      const newRow = { ...row };
      if (currentGroup.length >= MAX_ROWS_PER_CHUNK && !row.isGroupStart) {
        newRow.isGroupStart = true;
        newRow.items = row.items + " (cont...)"; // Optional: adds (cont...) to item name
      }
      currentGroup = [newRow];
    } else {
      currentGroup.push(row);
    }
  });
  
  if (currentGroup.length > 0) {
    currentGroup[currentGroup.length - 1].isEndOfGroup = true;
    finalGroups.push(currentGroup);
  }
  return finalGroups;
};

const PriceListDocument = ({ data }) => {
  const processedGroups = getSplitGroups(data);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.tableContainer}>
          <View style={styles.headerContainer} fixed>
            <Text style={[styles.cell, styles.firstCellInRow, styles.colSl]}>SL No</Text>
            <Text style={[styles.cell, styles.colItem]}>Item</Text>
            <Text style={[styles.cell, styles.colBrand]}>Brand / Description</Text>
            <Text style={[styles.cell, styles.colPrice]}>Single</Text>
            <Text style={[styles.cell, styles.colPrice]}>5+</Text>
            <Text style={[styles.cell, styles.colPrice]}>10+</Text>
            <Text style={[styles.cell, styles.colPrice]}>20+</Text>
            <Text style={[styles.cell, styles.colPrice]}>50+</Text>
            <Text style={[styles.cell, styles.colPrice]}>100+</Text>
            <Text style={[styles.cell, styles.colGst]}>GST</Text>
            <Text style={[styles.cell, styles.colMrp]}>MRP</Text>
            <Text style={[styles.cell, styles.colWarranty]}>Warranty</Text>
            <Text style={[styles.cell, styles.colImg]}>Image</Text>
          </View>

          {processedGroups.map((group, gIdx) => (
            /* Now every single block is small (max 10 rows), 
               so wrap={false} will NEVER panic or stretch. */
            <View key={gIdx} wrap={false}>
              {group.map((row, rIdx) => (
                <View style={styles.rowContainer} key={rIdx}>
                  <View style={[styles.mergedCell, styles.firstCellInRow, styles.colSl, row.isEndOfGroup ? styles.groupEndLine : {}]}>
                    <Text style={styles.cellText}>{row.isGroupStart ? row.sl_no : ""}</Text>
                  </View>
                  <View style={[styles.mergedCell, styles.colItem, row.isEndOfGroup ? styles.groupEndLine : {}]}>
                    <Text style={styles.cellText}>{row.isGroupStart ? row.items : ""}</Text>
                  </View>
                  <View style={[styles.cell, styles.colBrand]}>
                    <Text style={[styles.cellText, { textAlign: 'left' }]}>{row.brand || '-'}</Text>
                  </View>
                  <View style={[styles.cell, styles.colPrice]}><Text>{row.single || '-'}</Text></View>
                  <View style={[styles.cell, styles.colPrice]}><Text>{row.qty_5_plus || '-'}</Text></View>
                  <View style={[styles.cell, styles.colPrice]}><Text>{row.qty_10_plus || '-'}</Text></View>
                  <View style={[styles.cell, styles.colPrice]}><Text>{row.qty_20_plus || '-'}</Text></View>
                  <View style={[styles.cell, styles.colPrice]}><Text>{row.qty_50_plus || '-'}</Text></View>
                  <View style={[styles.cell, styles.colPrice]}><Text>{row.qty_100_plus || '-'}</Text></View>
                  <View style={[styles.cell, styles.colGst]}><Text>{row.gst ? `${row.gst}%` : '-'}</Text></View>
                  <View style={[styles.cell, styles.colMrp]}><Text>{row.mrp || '-'}</Text></View>
                  <View style={[styles.cell, styles.colWarranty]}><Text>{row.warranty || '-'}</Text></View>
                  <View style={[styles.cell, styles.colImg]}>
                    {row.product_image && <Image src={row.product_image} style={{ width: 25, height: 25, objectFit: 'contain' }} />}
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};
export default PriceListDocument;


































