







// "use client";

// import { useEffect, useState, useCallback, useRef } from "react";
// import { Table, Spin, message, Button } from "antd";
// import { supabase } from "../lib/supabaseClient";

// import { DndContext, closestCenter } from "@dnd-kit/core";
// import {
//     SortableContext,
//     verticalListSortingStrategy,
//     useSortable,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";








// // =========================
// // SORTABLE ROW
// // =========================
// const SortableRow = (props) => {
//     const { data } = props;

//     const {
//         attributes,
//         listeners,
//         setNodeRef,
//         transform,
//         transition,
//     } = useSortable({ id: props["data-row-key"] });

//     const index = data.findIndex((item) => item.id === props["data-row-key"]);
//     const current = data[index];
//     const prev = data[index - 1];

//     const isNewGroup =
//         index === 0 ||
//         prev?.sl_no !== current?.sl_no ||
//         prev?.items !== current?.items;

//     const style = {
//         ...props.style,
//         transform: CSS.Transform.toString(transform),
//         transition,
//         cursor: "grab",

//         // ✅ BORDER ONLY (NO BACKGROUND)
//         borderTop: isNewGroup
//             ? "3px solid #1677ff"
//             : "1px solid #f0f0f0",
//     };

//     return (
//         <tr ref={setNodeRef} style={style} {...attributes} {...listeners}>
//             {props.children}
//         </tr>
//     );
// };

// // =========================
// // PAGE
// // =========================
// export default function ManageOrder() {
//     const [allProducts, setAllProducts] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const tableContainerRef = useRef(null);
//     const savedScrollTop = useRef(0);




//     useEffect(() => {
//         const el = tableContainerRef.current;

//         if (!el) return;

//         const handleScroll = () => {
//             savedScrollTop.current = el.scrollTop;
//         };

//         el.addEventListener("scroll", handleScroll);

//         return () => el.removeEventListener("scroll", handleScroll);
//     }, []);

//     // =========================
//     // FETCH DATA
//     // =========================


//     const fetchProducts = useCallback(async () => {
//         setLoading(true);

//         const { data, error } = await supabase.from("products").select("*");

//         if (!error) {
//             const sorted = [...data]
//                 .sort((a, b) => {
//                     const slDiff = Number(a.sl_no) - Number(b.sl_no);
//                     if (slDiff !== 0) return slDiff;

//                     return (a.sub_order || 0) - (b.sub_order || 0);
//                 })
//                 .map((item) => ({
//                     ...item,
//                     groupKey: `${item.sl_no}__${item.items}`,
//                 }));

//             setAllProducts(sorted);

//             // 🔥 restore scroll after render
//             setTimeout(() => {
//                 if (tableContainerRef.current) {
//                     tableContainerRef.current.scrollTop =
//                         savedScrollTop.current;
//                 }
//             }, 50);
//         }

//         setLoading(false);
//     }, []);

//     useEffect(() => {
//         fetchProducts();
//     }, [fetchProducts]);

//     // =========================
//     // DRAG END
//     // =========================
//     const handleDragEnd = async (event) => {
//         const { active, over } = event;

//         if (!over || active.id === over.id) return;

//         const activeItem = allProducts.find((i) => i.id === active.id);
//         const overItem = allProducts.find((i) => i.id === over.id);

//         // ❌ BLOCK CROSS GROUP DRAG
//         if (activeItem.groupKey !== overItem.groupKey) {
//             message.error("You can only reorder inside same Item group");
//             return;
//         }

//         const groupItems = allProducts.filter(
//             (i) => i.groupKey === activeItem.groupKey
//         );

//         const oldIndex = groupItems.findIndex((i) => i.id === active.id);
//         const newIndex = groupItems.findIndex((i) => i.id === over.id);

//         const reordered = [...groupItems];
//         const [moved] = reordered.splice(oldIndex, 1);
//         reordered.splice(newIndex, 0, moved);

//         const newData = allProducts.map((item) =>
//             item.groupKey === activeItem.groupKey
//                 ? reordered.find((r) => r.id === item.id)
//                 : item
//         );

//         setAllProducts(newData);

//         // DB UPDATE
//         await Promise.all(
//             reordered.map((item, index) =>
//                 supabase
//                     .from("products")
//                     .update({ sub_order: index + 1 })
//                     .eq("id", item.id)
//             )
//         );

//         message.success("Order updated");
//         fetchProducts();
//     };

//     // =========================
//     // COLUMNS
//     // =========================
//     const columns = [
//         // ================= SL NO =================
//         {
//             title: "SL No",
//             dataIndex: "sl_no",
//             width: 100,
//             align: "center",

//             render: (value, record, index) => {
//                 const prev = allProducts[index - 1];
//                 const isFirst =
//                     index === 0 ||
//                     prev?.sl_no !== record.sl_no ||
//                     prev?.items !== record.items;

//                 return isFirst ? record.sl_no : null;
//             },

//             onCell: (record, index) => {
//                 const prev = allProducts[index - 1];
//                 const isFirst =
//                     index === 0 ||
//                     prev?.sl_no !== record.sl_no ||
//                     prev?.items !== record.items;

//                 const span = allProducts.filter(
//                     (i) =>
//                         i.sl_no === record.sl_no &&
//                         i.items === record.items
//                 ).length;

//                 return {
//                     rowSpan: isFirst ? span : 0,
//                     style: {
//                         borderTop: isFirst
//                             ? "3px solid #f0f0f0"
//                             : "1px solid #f0f0f0",
//                     },
//                 };
//             },
//         },

//         // ================= ITEM =================
//         {
//             title: "Item",
//             dataIndex: "items",
//             width: 150,

//             render: (value, record, index) => {
//                 const prev = allProducts[index - 1];
//                 const isFirst =
//                     index === 0 ||
//                     prev?.sl_no !== record.sl_no ||
//                     prev?.items !== record.items;

//                 return isFirst ? record.items : null;
//             },

//             onCell: (record, index) => {
//                 const prev = allProducts[index - 1];
//                 const isFirst =
//                     index === 0 ||
//                     prev?.sl_no !== record.sl_no ||
//                     prev?.items !== record.items;

//                 const span = allProducts.filter(
//                     (i) =>
//                         i.sl_no === record.sl_no &&
//                         i.items === record.items
//                 ).length;

//                 return {
//                     rowSpan: isFirst ? span : 0,
//                     style: {
//                         borderTop: isFirst
//                             ? "3px solid #f0f0f0"
//                             : "1px solid #f0f0f0",
//                     },
//                 };
//             },
//         },
//         // ================= SUB ORDER =================
//         {
//             title: "Sub Order",
//             dataIndex: "sub_order",
//             width: 100,
//             align: "center",
//             onCell: (record, index) => ({
//                 style: {
//                     borderTop:
//                         index === 0 ||
//                             allProducts[index - 1]?.sl_no !== record.sl_no ||
//                             allProducts[index - 1]?.items !== record.items
//                             ? "3px solid #f0f0f0"
//                             : "1px solid #f0f0f0",
//                 },
//             }),
//         },

//         // ================= BRAND =================
//         {
//             title: "Brand",
//             dataIndex: "brand",
//             width: 150,
//             onCell: (record, index) => ({
//                 style: {
//                     borderTop:
//                         index === 0 ||
//                             allProducts[index - 1]?.sl_no !== record.sl_no ||
//                             allProducts[index - 1]?.items !== record.items
//                             ? "3px solid #f0f0f0"
//                             : "1px solid #f0f0f0",
//                 },
//             }),
//         },

//         // ================= SINGLE =================
//         {
//             title: "Single",
//             dataIndex: "single",
//             width: 120,
//             align: "center",
//             onCell: (record, index) => ({
//                 style: {
//                     borderTop:
//                         index === 0 ||
//                             allProducts[index - 1]?.sl_no !== record.sl_no ||
//                             allProducts[index - 1]?.items !== record.items
//                             ? "3px solid #f0f0f0"
//                             : "1px solid #f0f0f0",
//                 },
//             }),
//         }

//     ];

//     // =========================
//     // UI
//     // =========================
//     return (
//         <div style={{ padding: 20 }}>


//             <div
//                 style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     marginBottom: 15,
//                 }}
//             >
//                 <h2 style={{ margin: 0 }}>Order Manager</h2>

//                 <Button

//                     onClick={() => (window.location.href = "/")}
//                 >
//                     ⬅ Home
//                 </Button>
//             </div>

//             {loading ? (
//                 <Spin />
//             ) : (
//                 <DndContext
//                     collisionDetection={closestCenter}
//                     onDragEnd={handleDragEnd}
//                 >
//                     <SortableContext
//                         items={allProducts.map((i) => i.id)}
//                         strategy={verticalListSortingStrategy}
//                     >
//                         <div
//                             ref={tableContainerRef}
//                             style={{


//                             }}
//                         >
//                             <Table
//                                 rowKey="id"
//                                 columns={columns}
//                                 dataSource={allProducts}
//                                 pagination={false}
//                                 sticky={{ offsetHeader: 0 }}   // 👈 ADD THIS ONLY
//                                 components={{
//                                     body: {
//                                         row: (props) => (
//                                             <SortableRow {...props} data={allProducts} />
//                                         ),
//                                     },
//                                 }}
//                             />
//                         </div>
//                     </SortableContext>
//                 </DndContext>
//             )}
//         </div>
//     );
// }






















// "use client";

// import { useEffect, useState, useCallback, useRef } from "react";
// import { Table, Spin, message, Button } from "antd";
// import { supabase } from "../lib/supabaseClient";

// import { DndContext, closestCenter } from "@dnd-kit/core";
// import {
//     SortableContext,
//     verticalListSortingStrategy,
//     useSortable,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// // =========================
// // SORTABLE ROW
// // =========================
// const SortableRow = (props) => {
//     const { data } = props;

//     const {
//         attributes,
//         listeners,
//         setNodeRef,
//         transform,
//         transition,
//     } = useSortable({ id: props["data-row-key"] });

//     const index = data.findIndex((item) => item.id === props["data-row-key"]);
//     const current = data[index];
//     const prev = data[index - 1];

//     const isNewGroup =
//         index === 0 ||
//         prev?.sl_no !== current?.sl_no ||
//         prev?.items !== current?.items;

//     const style = {
//         ...props.style,
//         transform: CSS.Transform.toString(transform),
//         transition,
//         cursor: "grab",
//         borderTop: isNewGroup ? "3px solid #1677ff" : "1px solid #f0f0f0",
//     };

//     return (
//         <tr ref={setNodeRef} style={style} {...attributes} {...listeners}>
//             {props.children}
//         </tr>
//     );
// };

// // =========================
// // PAGE
// // =========================
// export default function ManageOrder() {
//     const [allProducts, setAllProducts] = useState([]);
//     const [loading, setLoading] = useState(false);

//     // ✅ FIXED SCROLL HANDLING (IMPORTANT)
//     const tableRef = useRef(null);
//     const savedScrollTop = useRef(0);

//     // =========================
//     // SCROLL LISTENER (ANTD FIX)
//     // =========================
//     useEffect(() => {
//         const el = tableRef.current;

//         if (!el) return;

//         const handleScroll = () => {
//             savedScrollTop.current = el.scrollTop;
//         };

//         el.addEventListener("scroll", handleScroll);

//         return () => el.removeEventListener("scroll", handleScroll);
//     }, []);

//     // =========================
//     // FETCH DATA
//     // =========================
//     const fetchProducts = useCallback(async () => {
//         setLoading(true);

//         const { data, error } = await supabase.from("products").select("*");

//         if (!error) {
//             const sorted = [...data]
//                 .sort((a, b) => {
//                     const slDiff = Number(a.sl_no) - Number(b.sl_no);
//                     if (slDiff !== 0) return slDiff;
//                     return (a.sub_order || 0) - (b.sub_order || 0);
//                 })
//                 .map((item) => ({
//                     ...item,
//                     groupKey: `${item.sl_no}__${item.items}`,
//                 }));

//             setAllProducts(sorted);

//             // ✅ RESTORE SCROLL AFTER RENDER
//             setTimeout(() => {
//                 if (tableRef.current) {
//                     tableRef.current.scrollTop = savedScrollTop.current;
//                 }
//             }, 50);
//         }

//         setLoading(false);
//     }, []);

//     useEffect(() => {
//         fetchProducts();
//     }, [fetchProducts]);

//     // =========================
//     // DRAG END
//     // =========================
//     const handleDragEnd = async (event) => {
//         const { active, over } = event;

//         if (!over || active.id === over.id) return;

//         const activeItem = allProducts.find((i) => i.id === active.id);
//         const overItem = allProducts.find((i) => i.id === over.id);

//         if (activeItem.groupKey !== overItem.groupKey) {
//             message.error("You can only reorder inside same Item group");
//             return;
//         }

//         const groupItems = allProducts.filter(
//             (i) => i.groupKey === activeItem.groupKey
//         );

//         const oldIndex = groupItems.findIndex((i) => i.id === active.id);
//         const newIndex = groupItems.findIndex((i) => i.id === over.id);

//         const reordered = [...groupItems];
//         const [moved] = reordered.splice(oldIndex, 1);
//         reordered.splice(newIndex, 0, moved);

//         const newData = allProducts.map((item) =>
//             item.groupKey === activeItem.groupKey
//                 ? reordered.find((r) => r.id === item.id)
//                 : item
//         );

//         setAllProducts(newData);

//         await Promise.all(
//             reordered.map((item, index) =>
//                 supabase
//                     .from("products")
//                     .update({ sub_order: index + 1 })
//                     .eq("id", item.id)
//             )
//         );

//         message.success("Order updated");
//         fetchProducts();
//     };

//     // =========================
//     // COLUMNS
//     // =========================
//     const columns = [
//         {
//             title: "SL No",
//             dataIndex: "sl_no",
//             width: 100,
//             align: "center",
//         },
//         {
//             title: "Item",
//             dataIndex: "items",
//             width: 150,
//         },
//         {
//             title: "Sub Order",
//             dataIndex: "sub_order",
//             width: 100,
//             align: "center",
//         },
//         {
//             title: "Brand",
//             dataIndex: "brand",
//             width: 150,
//         },
//         {
//             title: "Single",
//             dataIndex: "single",
//             width: 120,
//             align: "center",
//         },
//     ];

//     // =========================
//     // UI
//     // =========================
//     return (
//         <div style={{ padding: 20 }}>
//             <div
//                 style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     marginBottom: 15,
//                 }}
//             >
//                 <h2>Order Manager</h2>

//                 <Button onClick={() => (window.location.href = "/")}>
//                     ⬅ Home
//                 </Button>
//             </div>

//             {loading ? (
//                 <Spin />
//             ) : (
//                 <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//                     <SortableContext
//                         items={allProducts.map((i) => i.id)}
//                         strategy={verticalListSortingStrategy}
//                     >

//                         <div
//                             ref={tableRef}
//                             style={{
//                                 maxHeight: "75vh",
//                                 overflowY: "auto",
//                             }}
//                         >
//                             <Table
//                                 rowKey="id"
//                                 columns={columns}
//                                 dataSource={allProducts}
//                                 pagination={false}
//                                 sticky={{ offsetHeader: 0 }}
//                                 components={{
//                                     body: {
//                                         row: (props) => (
//                                             <SortableRow {...props} data={allProducts} />
//                                         ),
//                                     },
//                                 }}
//                             />
//                         </div>
//                     </SortableContext>
//                 </DndContext>
//             )}
//         </div>
//     );
// }

















"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Table, Spin, message, Button } from "antd";
import { supabase } from "../lib/supabaseClient";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// =========================
// SORTABLE ROW
// =========================
const SortableRow = (props) => {
    const { data } = props;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: props["data-row-key"] });

    const index = data.findIndex((i) => i.id === props["data-row-key"]);
    const current = data[index];
    const prev = data[index - 1];

    const isNewGroup =
        index === 0 ||
        prev?.sl_no !== current?.sl_no ||
        prev?.items !== current?.items;

    const style = {
        ...props.style,
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: "grab",
        borderTop: isNewGroup ? "3px solid #1677ff" : "1px solid #f0f0f0",
    };

    return (
        <tr ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {props.children}
        </tr>
    );
};

// =========================
// PAGE
// =========================
export default function ManageOrder() {
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const tableWrapperRef = useRef(null);
    const scrollMemory = useRef(0);

    // =========================
    // FETCH DATA
    // =========================
    const fetchProducts = useCallback(async () => {
        setLoading(true);

        const { data, error } = await supabase.from("products").select("*");

        if (!error) {
            const sorted = [...data]
                .sort((a, b) => {
                    const sl = Number(a.sl_no) - Number(b.sl_no);
                    if (sl !== 0) return sl;
                    return (a.sub_order || 0) - (b.sub_order || 0);
                })
                .map((item) => ({
                    ...item,
                    groupKey: `${item.sl_no}__${item.items}`,
                }));

            setAllProducts(sorted);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // =========================
    // SAVE SCROLL POSITION
    // =========================
    const handleScroll = (e) => {
        scrollMemory.current = e.target.scrollTop;
    };

    // =========================
    // RESTORE SCROLL (SAFE FIX)
    // =========================
    useEffect(() => {
        const timer = setTimeout(() => {
            const el = tableWrapperRef.current;

            if (el) {
                el.scrollTop = scrollMemory.current || 0;
            }
        }, 0);

        return () => clearTimeout(timer);
    }, [allProducts]);

    // =========================
    // DRAG END
    // =========================
    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const activeItem = allProducts.find((i) => i.id === active.id);
        const overItem = allProducts.find((i) => i.id === over.id);

        if (activeItem.groupKey !== overItem.groupKey) {
            message.error("Same group only");
            return;
        }

        const group = allProducts.filter(
            (i) => i.groupKey === activeItem.groupKey
        );

        const oldIndex = group.findIndex((i) => i.id === active.id);
        const newIndex = group.findIndex((i) => i.id === over.id);

        const reordered = [...group];
        const [moved] = reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, moved);

        const newData = allProducts.map((item) =>
            item.groupKey === activeItem.groupKey
                ? reordered.find((r) => r.id === item.id)
                : item
        );

        setAllProducts(newData);

        await Promise.all(
            reordered.map((item, index) =>
                supabase
                    .from("products")
                    .update({ sub_order: index + 1 })
                    .eq("id", item.id)
            )
        );

        message.success("Updated");

        await fetchProducts();

        // restore scroll after refresh
        setTimeout(() => {
            const el = tableWrapperRef.current;
            if (el) el.scrollTop = scrollMemory.current;
        }, 0);
    };

    // =========================
    // COLUMNS (UNCHANGED)
    // =========================
    const columns = [
        {
            title: "SL No",
            dataIndex: "sl_no",
            width: 100,
            align: "center",

            render: (value, record, index) => {
                const prev = allProducts[index - 1];

                const isFirst =
                    index === 0 ||
                    prev?.sl_no !== record.sl_no ||
                    prev?.items !== record.items;

                return isFirst ? record.sl_no : null;
            },

            onCell: (record, index) => {
                const prev = allProducts[index - 1];

                const isFirst =
                    index === 0 ||
                    prev?.sl_no !== record.sl_no ||
                    prev?.items !== record.items;

                const span = allProducts.filter(
                    (i) =>
                        i.sl_no === record.sl_no &&
                        i.items === record.items
                ).length;

                return {
                    rowSpan: isFirst ? span : 0,
                };
            },
        },
        {
            title: "Item",
            dataIndex: "items",
            width: 150,

            render: (value, record, index) => {
                const prev = allProducts[index - 1];

                const isFirst =
                    index === 0 ||
                    prev?.sl_no !== record.sl_no ||
                    prev?.items !== record.items;

                return isFirst ? record.items : null;
            },

            onCell: (record, index) => {
                const prev = allProducts[index - 1];

                const isFirst =
                    index === 0 ||
                    prev?.sl_no !== record.sl_no ||
                    prev?.items !== record.items;

                const span = allProducts.filter(
                    (i) =>
                        i.sl_no === record.sl_no &&
                        i.items === record.items
                ).length;

                return {
                    rowSpan: isFirst ? span : 0,
                };
            },
        },
        { title: "Sub Order", dataIndex: "sub_order", width: 100 },
        { title: "Brand", dataIndex: "brand", width: 150 },
        { title: "Single", dataIndex: "single", width: 120 },
    ];

    // =========================
    // UI (UNCHANGED)
    // =========================
    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h2>Order Manager</h2>

                <Button onClick={() => (window.location.href = "/")}>
                    Home
                </Button>
            </div>

            {loading ? (
                <Spin />
            ) : (
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext
                        items={allProducts.map((i) => i.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div
                            ref={tableWrapperRef}
                            onScroll={handleScroll}
                            style={{ maxHeight: "82vh", overflow: "auto" }}
                        >
                            <Table
                                rowKey="id"
                                columns={columns}
                                dataSource={allProducts}
                                pagination={false}
                                sticky
                                components={{
                                    body: {
                                        row: (props) => (
                                            <SortableRow
                                                {...props}
                                                data={allProducts}
                                            />
                                        ),
                                    },
                                }}
                            />
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
}