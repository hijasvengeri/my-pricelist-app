




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