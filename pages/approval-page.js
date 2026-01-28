// import { useState, useEffect, useCallback } from 'react';
// import { Table, Button, message, Space, Typography, Tag, Popconfirm, Divider, Empty } from 'antd';
// import { CheckOutlined, CloseOutlined, ArrowLeftOutlined } from '@ant-design/icons';
// import { supabase } from '../lib/supabaseClient';
// import Link from 'next/link';

// const { Title, Text } = Typography;

// export default function ApprovalPage() {
//     const [newData, setNewData] = useState([]);
//     const [editData, setEditData] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [actionLoading, setActionLoading] = useState(false);

//     // --- Fetch Data from Staged Table ---
//     const fetchStagedData = useCallback(async () => {
//         setLoading(true);
//         const { data, error } = await supabase
//             .from('staged_products')
//             .select('*')
//             .order('created_at', { ascending: false });

//         if (error) {
//             message.error(`Error fetching staged data: ${error.message}`);
//         } else {
//             // Split data into New and Edited lists
//             setNewData(data.filter(item => item.staging_type === 'NEW_PRODUCT'));
//             setEditData(data.filter(item => item.staging_type === 'EDIT_PRODUCT'));
//         }
//         setLoading(false);
//     }, []);

//     useEffect(() => {
//         fetchStagedData();
//     }, [fetchStagedData]);

//     // --- Handle Approval Logic ---
//     const handleApprove = async (record) => {
//         setActionLoading(true);
//         try {
//             // 1. Prepare data for the main products table
//             // We remove the staging-specific fields before inserting/updating
//             const { id, staging_type, original_product_id, created_at, ...mainProductData } = record;

//             if (staging_type === 'NEW_PRODUCT') {
//                 // INSERT new record into main products table
//                 const { error: insertError } = await supabase
//                     .from('products')
//                     .insert([mainProductData]);
                
//                 if (insertError) throw insertError;
//                 message.success("New product approved and added to live list.");

//             } else if (staging_type === 'EDIT_PRODUCT') {
//                 // UPDATE existing record in main products table
//                 const { error: updateError } = await supabase
//                     .from('products')
//                     .update(mainProductData)
//                     .eq('id', original_product_id);

//                 if (updateError) throw updateError;
//                 message.success("Product edits approved and updated live.");
//             }

//             // 2. Delete the record from staging after successful move
//             await supabase.from('staged_products').delete().eq('id', id);
//             fetchStagedData();

//         } catch (error) {
//             console.error("Approval Error:", error);
//             message.error(`Approval failed: ${error.message}`);
//         } finally {
//             setActionLoading(false);
//         }
//     };

//     // --- Handle Rejection (Delete from Staging) ---
//     const handleReject = async (id) => {
//         setActionLoading(true);
//         const { error } = await supabase.from('staged_products').delete().eq('id', id);
        
//         if (error) {
//             message.error("Rejection failed.");
//         } else {
//             message.info("Change rejected and removed from staging.");
//             fetchStagedData();
//         }
//         setActionLoading(false);
//     };

//     // --- Table Column Definitions ---
//     const getColumns = (isEditTable) => [
//         { title: 'SL No', dataIndex: 'sl_no', width: 70 },
//         { title: 'Item', dataIndex: 'items', width: 150 },
//         { title: 'Brand', dataIndex: 'brand', width: 120 },
//         { 
//             title: 'Image', 
//             dataIndex: 'product_image', 
//             width: 80,
//             render: (url) => url ? <img src={url} alt="Staged" style={{ width: 40, height: 40, objectFit: 'contain' }} /> : '-' 
//         },
//         {
//             title: 'Prices (S / 10+ / 100+)',
//             render: (_, r) => (
//                 <Text type="secondary" style={{ fontSize: '12px' }}>
//                     ₹{r.single} / ₹{r.qty_10_plus} / ₹{r.qty_100_plus}
//                 </Text>
//             )
//         },
//         {
//             title: 'Action',
//             key: 'action',
//             fixed: 'right',
//             width: 180,
//             render: (_, record) => (
//                 <Space>
//                     <Popconfirm title="Approve this change?" onConfirm={() => handleApprove(record)}>
//                         <Button type="primary" size="small" icon={<CheckOutlined />} loading={actionLoading}>
//                             Approve
//                         </Button>
//                     </Popconfirm>
//                     <Popconfirm title="Discard this change?" onConfirm={() => handleReject(record.id)} okText="Yes, Reject" okButtonProps={{ danger: true }}>
//                         <Button danger size="small" icon={<CloseOutlined />} loading={actionLoading}>
//                             Reject
//                         </Button>
//                     </Popconfirm>
//                 </Space>
//             ),
//         },
//     ];

//     return (
//         <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
//             <Space style={{ marginBottom: 20 }}>
//                 <Link href="/manage-products">
//                     <Button icon={<ArrowLeftOutlined />}>Back to Management</Button>
//                 </Link>
//                 <Title level={2} style={{ margin: 0 }}>Approval Dashboard</Title>
//             </Space>

//             <Divider orientation="left">
//                 <Tag color="blue">NEW PRODUCTS</Tag> Pending Approval
//             </Divider>
//             <Table 
//                 dataSource={newData} 
//                 columns={getColumns(false)} 
//                 rowKey="id" 
//                 loading={loading}
//                 locale={{ emptyText: <Empty description="No new products to approve" /> }}
//                 pagination={false}
//             />

//             <div style={{ marginTop: 40 }}>
//                 <Divider orientation="left">
//                     <Tag color="orange">EDITED PRODUCTS</Tag> Pending Approval
//                 </Divider>
//                 <Table 
//                     dataSource={editData} 
//                     columns={getColumns(true)} 
//                     rowKey="id" 
//                     loading={loading}
//                     locale={{ emptyText: <Empty description="No edited products to approve" /> }}
//                     pagination={false}
//                 />
//             </div>
//         </div>
//     );
// }






























// import { useState, useEffect, useCallback } from 'react';
// import { Table, Button, message, Space, Typography, Tag, Popconfirm, Divider, Empty } from 'antd';
// import { CheckOutlined, CloseOutlined, ArrowLeftOutlined } from '@ant-design/icons';
// import { supabase } from '../lib/supabaseClient';
// import Link from 'next/link';

// const { Title } = Typography;

// export default function ApprovalPage() {
//     const [newData, setNewData] = useState([]);
//     const [editData, setEditData] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [actionLoading, setActionLoading] = useState(false);

//     const fetchStagedData = useCallback(async () => {
//         setLoading(true);
//         const { data, error } = await supabase
//             .from('staged_products')
//             .select('*')
//             .order('created_at', { ascending: false });

//         if (error) {
//             message.error(`Error fetching staged data: ${error.message}`);
//         } else {
//             setNewData(data.filter(item => item.staging_type === 'NEW_PRODUCT'));
//             setEditData(data.filter(item => item.staging_type === 'EDIT_PRODUCT'));
//         }
//         setLoading(false);
//     }, []);

//     useEffect(() => {
//         fetchStagedData();
//     }, [fetchStagedData]);

//     const handleApprove = async (record) => {
//         setActionLoading(true);
//         try {
//             const { id, staging_type, original_product_id, created_at, ...mainProductData } = record;

//             if (staging_type === 'NEW_PRODUCT') {
//                 const { error: insertError } = await supabase.from('products').insert([mainProductData]);
//                 if (insertError) throw insertError;
//                 message.success("New product approved!");
//             } else {
//                 const { error: updateError } = await supabase
//                     .from('products')
//                     .update(mainProductData)
//                     .eq('id', original_product_id);
//                 if (updateError) throw updateError;
//                 message.success("Edits approved!");
//             }

//             await supabase.from('staged_products').delete().eq('id', id);
//             fetchStagedData();
//         } catch (error) {
//             message.error(`Approval failed: ${error.message}`);
//         } finally {
//             setActionLoading(false);
//         }
//     };

//     const handleReject = async (id) => {
//         setActionLoading(true);
//         const { error } = await supabase.from('staged_products').delete().eq('id', id);
//         if (!error) {
//             message.info("Change rejected.");
//             fetchStagedData();
//         }
//         setActionLoading(false);
//     };

//     // --- COLUMNS UPDATED TO MATCH YOUR IMAGE ---
//     const columns = [
//         { title: 'SL No', dataIndex: 'sl_no', width: 70, align: 'center' },
//         { title: 'Item', dataIndex: 'items', width: 150 },
//         { title: 'Brand', dataIndex: 'brand', width: 120 },
//         { title: 'Single', dataIndex: 'single', width: 80, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//         { title: '5+', dataIndex: 'qty_5_plus', width: 80, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//         { title: '10+', dataIndex: 'qty_10_plus', width: 80, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//         { title: '20+', dataIndex: 'qty_20_plus', width: 80, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//         { title: '50+', dataIndex: 'qty_50_plus', width: 80, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//         { title: '100+', dataIndex: 'qty_100_plus', width: 80, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//         { title: 'GST', dataIndex: 'gst', width: 70, align: 'center', render: (val) => val > 0 ? `${val}%` : '-' },
//         { title: 'MRP', dataIndex: 'mrp', width: 80, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//         { title: 'Warranty', dataIndex: 'warranty', width: 100, align: 'center', render: (w) => w || '-' },
//         {
//             title: 'Image',
//             dataIndex: 'product_image',
//             width: 80,
//             render: (url) => url ? (
//                 <img src={url} alt="Product" style={{ width: '40px', height: '50px', objectFit: 'contain' }} />
//             ) : '-'
//         },
//         {
//             title: 'Action',
//             key: 'operation',
//             fixed: 'right',
//             width: 180,
//             align: 'center',
//             render: (_, record) => (
//                 <Space>
//                     <Popconfirm title="Approve?" onConfirm={() => handleApprove(record)}>
//                         <Button type="primary" size="small" icon={<CheckOutlined />} loading={actionLoading}>Approve</Button>
//                     </Popconfirm>
//                     <Popconfirm title="Reject?" onConfirm={() => handleReject(record.id)} okText="Reject" okButtonProps={{ danger: true }}>
//                         <Button danger size="small" icon={<CloseOutlined />} loading={actionLoading}>Reject</Button>
//                     </Popconfirm>
//                 </Space>
//             ),
//         },
//     ];

//     return (
//         <div style={{ padding: 20 }}>
//             <Space style={{ marginBottom: 20, justifyContent: 'space-between', width: '100%' }}>
//                 <Title level={2}>Approval Dashboard</Title>
//                 <Link href="/manage-products">
//                     <Button icon={<ArrowLeftOutlined />}>Back to Manage Products</Button>
//                 </Link>
//             </Space>

//             <Divider orientation="left"><Tag color="blue">NEW ADDITIONS</Tag></Divider>
//             <Table 
//                 dataSource={newData} 
//                 columns={columns} 
//                 rowKey="id" 
//                 loading={loading} 
//                 scroll={{ x: 1400 }} 
//                 pagination={false}
//                 locale={{ emptyText: 'No new products pending' }}
//             />

//             <Divider orientation="left" style={{ marginTop: 40 }}><Tag color="orange">EDITS TO EXISTING</Tag></Divider>
//             <Table 
//                 dataSource={editData} 
//                 columns={columns} 
//                 rowKey="id" 
//                 loading={loading} 
//                 scroll={{ x: 1400 }} 
//                 pagination={false}
//                 locale={{ emptyText: 'No edits pending' }}
//             />
//         </div>
//     );
// }










// import { useState, useEffect, useCallback } from 'react';
// import { Table, Button, message, Space, Typography, Tag, Popconfirm, Divider, Empty, Card } from 'antd';
// import { CheckOutlined, CloseOutlined, ArrowLeftOutlined, HistoryOutlined } from '@ant-design/icons';
// import { supabase } from '../lib/supabaseClient';
// import Link from 'next/link';

// const { Title, Text } = Typography;

// export default function ApprovalPage() {
//     const [newData, setNewData] = useState([]);
//     const [editData, setEditData] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [actionLoading, setActionLoading] = useState(false);

//     // --- 1. Fetch Pending Data ---
//     const fetchStagedData = useCallback(async () => {
//         setLoading(true);
//         const { data, error } = await supabase
//             .from('staged_products')
//             .select('*')
//             .order('created_at', { ascending: false });

//         if (error) {
//             message.error(`Error: ${error.message}`);
//         } else {
//             setNewData(data.filter(item => item.staging_type === 'NEW_PRODUCT'));
//             setEditData(data.filter(item => item.staging_type === 'EDIT_PRODUCT'));
//         }
//         setLoading(false);
//     }, []);

//     useEffect(() => {
//         fetchStagedData();
//     }, [fetchStagedData]);






//     // // --- 2. Approval Logic (Main Function) ---
//     // const handleApprove = async (record) => {
//     //     setActionLoading(true);
//     //     try {
//     //         const { id, staging_type, original_product_id, created_at, ...productData } = record;

//     //         if (staging_type === 'NEW_PRODUCT') {
//     //             // Move to live products table
//     //             const { error: insErr } = await supabase.from('products').insert([productData]);
//     //             if (insErr) throw insErr;
//     //         } else {
//     //             // Update the existing product using the original_product_id
//     //             const { error: updErr } = await supabase
//     //                 .from('products')
//     //                 .update(productData)
//     //                 .eq('id', original_product_id);
//     //             if (updErr) throw updErr;
//     //         }

//     //         // Log the approval action
//     //         await supabase.from('activity_logs').insert([{
//     //             action_type: 'APPROVED',
//     //             product_name: record.items,
//     //             details: `Admin approved ${staging_type === 'NEW_PRODUCT' ? 'new product' : 'edits'}.`
//     //         }]);

//     //         // Clean up staging table
//     //         await supabase.from('staged_products').delete().eq('id', id);
            
//     //         message.success("Action approved successfully!");
//     //         fetchStagedData();
//     //     } catch (error) {
//     //         message.error(`Approval failed: ${error.message}`);
//     //     } finally {
//     //         setActionLoading(false);
//     //     }
//     // };





// const handleApprove = async (record) => {
//     setActionLoading(true);
//     try {
//         const { id, staging_type, original_product_id, items, sl_no } = record;

//         if (staging_type === 'DELETE_REQUEST') {
//             // Step A: Delete the actual product from the LIVE table
//             const { error: liveErr } = await supabase
//                 .from('products')
//                 .delete()
//                 .eq('id', original_product_id);
            
//             if (liveErr) throw liveErr;

//             // Step B: Log the final deletion
//             await supabase.from('activity_logs').insert([{
//                 action_type: 'DELETED',
//                 product_name: items,
//                 details: `Admin approved deletion. Product (SL: ${sl_no}) removed permanently.`
//             }]);
//         } 
//         // ... (handle NEW_PRODUCT and EDIT_PRODUCT as before)

//         // Step C: Delete the request from the staging table
//         await supabase.from('staged_products').delete().eq('id', id);
        
//         message.success("Approval processed and logged.");
//         fetchStagedData();
//     } catch (error) {
//         message.error(`Approval failed: ${error.message}`);
//     } finally {
//         setActionLoading(false);
//     }
// };











//     // --- 3. Rejection Logic ---
//     const handleReject = async (record) => {
//         setActionLoading(true);
//         try {
//             // Delete from staging
//             const { error } = await supabase.from('staged_products').delete().eq('id', record.id);
//             if (error) throw error;

//             // Log the rejection
//             await supabase.from('activity_logs').insert([{
//                 action_type: 'REJECTED',
//                 product_name: record.items,
//                 details: `Admin rejected the ${record.staging_type === 'NEW_PRODUCT' ? 'addition' : 'edits'}.`
//             }]);

//             message.info("Change rejected and removed.");
//             fetchStagedData();
//         } catch (error) {
//             message.error("Rejection failed");
//         } finally {
//             setActionLoading(false);
//         }
//     };

//     // --- 4. Column Configuration ---
//     const columns = [
//         { title: 'SL No', dataIndex: 'sl_no', width: 80, align: 'center' },
//         { title: 'Item', dataIndex: 'items', width: 200, render: (text) => <b>{text}</b> },
//         { title: 'Brand', dataIndex: 'brand', width: 120 },
//         { title: 'Single', dataIndex: 'single', width: 100, render: v => `₹${v}` },
//         { title: '10+', dataIndex: 'qty_10_plus', width: 100, render: v => `₹${v}` },
//         { title: '100+', dataIndex: 'qty_100_plus', width: 100, render: v => `₹${v}` },
//         { title: 'GST', dataIndex: 'gst', width: 80, render: v => `${v}%` },
//         {
//             title: 'Image',
//             dataIndex: 'product_image',
//             width: 100,
//             render: (url) => url ? <img src={url} alt="product" style={{ width: 40, borderRadius: 4 }} /> : '-'
//         },
//         {
//             title: 'Action',
//             key: 'action',
//             fixed: 'right',
//             width: 200,
//             render: (_, record) => (
//                 <Space>
//                     <Popconfirm title="Approve this?" onConfirm={() => handleApprove(record)}>
//                         <Button type="primary" size="small" icon={<CheckOutlined />} loading={actionLoading}>
//                             Approve
//                         </Button>
//                     </Popconfirm>
//                     <Popconfirm title="Reject this?" onConfirm={() => handleReject(record)} okButtonProps={{ danger: true }}>
//                         <Button danger size="small" icon={<CloseOutlined />} loading={actionLoading}>
//                             Reject
//                         </Button>
//                     </Popconfirm>
//                 </Space>
//             ),
//         },
//     ];

//     return (
//         <div style={{ padding: '30px', background: '#f0f2f5', minHeight: '100vh' }}>
//             <Card borderless>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
//                     <Space>
//                         <Link href="/manage-products">
//                             <Button icon={<ArrowLeftOutlined />}>Back</Button>
//                         </Link>
//                         <Title level={2} style={{ margin: 0 }}>Approval Dashboard</Title>
//                     </Space>
//                     <Link href="/logs">
//                         <Button type="default" icon={<HistoryOutlined />}>View Activity Logs</Button>
//                     </Link>
//                 </div>

//                 <Divider orientation="left"><Tag color="blue">NEW PRODUCTS PENDING</Tag></Divider>
//                 <Table 
//                     columns={columns} 
//                     dataSource={newData} 
//                     rowKey="id" 
//                     loading={loading} 
//                     pagination={false}
//                     scroll={{ x: 1200 }}
//                 />

//                 <div style={{ marginTop: 50 }}>
//                     <Divider orientation="left"><Tag color="orange">EDITS PENDING APPROVAL</Tag></Divider>
//                     <Table 
//                         columns={columns} 
//                         dataSource={editData} 
//                         rowKey="id" 
//                         loading={loading} 
//                         pagination={false}
//                         scroll={{ x: 1200 }}
//                     />
//                 </div>
//             </Card>
//         </div>
//     );
// }






























// import { useState, useEffect, useCallback } from 'react';
// import { Table, Button, message, Space, Typography, Tag, Popconfirm, Divider, Card } from 'antd';
// import { CheckOutlined, CloseOutlined, ArrowLeftOutlined, HistoryOutlined } from '@ant-design/icons';
// import { supabase } from '../lib/supabaseClient';
// import Link from 'next/link';


// const { Title } = Typography;

// export default function ApprovalPage() {
//     const [newData, setNewData] = useState([]);
//     const [editData, setEditData] = useState([]);
//     const [deleteData, setDeleteData] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [actionLoading, setActionLoading] = useState(false);
//     const [isActionModalVisible, setIsActionModalVisible] = useState(false);
//     const [currentRecord, setCurrentRecord] = useState(null);
//     const [actionType, setActionType] = useState(''); // 'APPROVE' or 'REJECT'
//     const [remarks, setRemarks] = useState('');
//     const [pin, setPin] = useState('');
//     const AUTH_PIN = "1234"; // Set your desired 4-digit code here  

//     // ---------------- FETCH STAGED DATA ----------------
//     const fetchStagedData = useCallback(async () => {
//         setLoading(true);

//         const { data, error } = await supabase
//             .from('staged_products')
//             .select('*')
//             .order('created_at', { ascending: false });

//         if (error) {
//             message.error(error.message);
//         } else {
//             setNewData(data.filter(d => d.staging_type === 'NEW_PRODUCT'));
//             setEditData(data.filter(d => d.staging_type === 'EDIT_PRODUCT'));
//             setDeleteData(data.filter(d => d.staging_type === 'DELETE_REQUEST'));
//         }

//         setLoading(false);
//     }, []);

//     useEffect(() => {
//         fetchStagedData();
//     }, [fetchStagedData]);

//     // ---------------- APPROVE ----------------
//     const handleApprove = async (record) => {
//         setActionLoading(true);

//         try {
//             const {
//                 id,
//                 staging_type,
//                 original_product_id,
//                 sl_no,
//                 items,
//                 brand,
//                 single,
//                 qty_5_plus,    
//                 qty_10_plus,
//                 qty_20_plus,   
//                 qty_50_plus,  
//                 qty_100_plus,
//                 gst,
//                 product_image
//             } = record;

//             // ---------- DELETE ----------
//             if (staging_type === 'DELETE_REQUEST') {
//                 const { error } = await supabase
//                     .from('products')
//                     .delete()
//                     .eq('id', original_product_id);

//                 if (error) throw error;

//                 await supabase.from('activity_logs').insert([{
//                     action_type: 'DELETED',
//                     product_name: items,
//                     details: `Admin approved deletion. Product (SL: ${sl_no}) removed.`
//                 }]);
//             }

//             // ---------- NEW PRODUCT ----------
//             if (staging_type === 'NEW_PRODUCT') {
//                 const { error } = await supabase.from('products').insert([{
//                     sl_no,
//                     items,
//                     brand,
//                     single,
//                     qty_5_plus,    
//                     qty_10_plus,
//                     qty_20_plus,   
//                     qty_50_plus,  
//                     qty_100_plus,
//                     gst,
//                     product_image
//                 }]);

//                 if (error) throw error;

//                 await supabase.from('activity_logs').insert([{
//                     action_type: 'APPROVED',
//                     product_name: items,
//                     details: 'Admin approved new product.'
//                 }]);
//             }

//             // ---------- EDIT PRODUCT ----------
//             if (staging_type === 'EDIT_PRODUCT') {
//                 const { error } = await supabase
//                     .from('products')
//                     .update({
//                         sl_no,
//                         items,
//                         brand,
//                         single,
//                         qty_5_plus,    
//                         qty_10_plus,
//                         qty_20_plus,   
//                         qty_50_plus,  
//                         qty_100_plus,
//                         gst,
//                         product_image
//                     })
//                     .eq('id', original_product_id);

//                 if (error) throw error;

//                 await supabase.from('activity_logs').insert([{
//                     action_type: 'APPROVED',
//                     product_name: items,
//                     details: 'Admin approved product edits.'
//                 }]);
//             }

//             // ---------- CLEAN STAGING ----------
//             await supabase.from('staged_products').delete().eq('id', id);

//             message.success('Approval completed successfully');
//             fetchStagedData();

//         } catch (error) {
//             message.error(`Approval failed: ${error.message}`);
//         } finally {
//             setActionLoading(false);
//         }
//     };

//     // ---------------- REJECT ----------------
//     const handleReject = async (record) => {
//         setActionLoading(true);

//         try {
//             await supabase.from('staged_products').delete().eq('id', record.id);

//             await supabase.from('activity_logs').insert([{
//                 action_type: 'REJECTED',
//                 product_name: record.items,
//                 details: `Admin rejected ${record.staging_type.replace('_', ' ').toLowerCase()}.`
//             }]);

//             message.info('Request rejected');
//             fetchStagedData();

//         } catch {
//             message.error('Rejection failed');
//         } finally {
//             setActionLoading(false);
//         }
//     };

//     // ---------------- TABLE COLUMNS ----------------
//     const columns = [
//         { title: 'SL No', dataIndex: 'sl_no', width: 80 },
//         { title: 'Item', dataIndex: 'items', width: 200 },
//         { title: 'Brand', dataIndex: 'brand', width: 120 },
//         { title: 'Single', dataIndex: 'single', render: v => v || '-' },
//         { title: 'Single', dataIndex: 'single', render: v => v || '-' },
//         { title: '5+', dataIndex: 'qty_5_plus', render: v => v || '-' }, 
//         { title: '10+', dataIndex: 'qty_10_plus', render: v => v || '-' },
//         { title: '20+', dataIndex: 'qty_20_plus', render: v => v || '-' }, 
//         { title: '50+', dataIndex: 'qty_50_plus', render: v => v || '-' }, 
//         { title: '100+', dataIndex: 'qty_100_plus', render: v => v || '-' },
//         { title: 'GST', dataIndex: 'gst', render: v => v ? `${v}%` : '-' },
//         {
//             title: 'Image',
//             dataIndex: 'product_image',
//             render: url => url ? <img src={url} style={{ width: 40 }} /> : '-'
//         },
//         {
//             title: 'Action',
//             fixed: 'right',
//             render: (_, record) => (
//                 <Space>
//                     <Popconfirm title="Approve?" onConfirm={() => handleApprove(record)}>
//                         <Button type="primary" size="small" icon={<CheckOutlined />} loading={actionLoading} />
//                     </Popconfirm>
//                     <Popconfirm title="Reject?" onConfirm={() => handleReject(record)}>
//                         <Button danger size="small" icon={<CloseOutlined />} loading={actionLoading} />
//                     </Popconfirm>
//                 </Space>
//             )
//         }
//     ];

//     // ---------------- UI ----------------
//     return (
//         <div style={{ padding: 30 }}>
//             <Card>
//                 <Space style={{ marginBottom: 20 }}>
//                     <Link href="/manage-products">
//                         <Button icon={<ArrowLeftOutlined />}>Back</Button>
//                     </Link>
//                     <Title level={3}>Approval Dashboard</Title>
//                     <Link href="/logs">
//                         <Button icon={<HistoryOutlined />}>Activity Logs</Button>
//                     </Link>
//                 </Space>

//                 <Divider orientation="left"><Tag color="blue">NEW PRODUCTS</Tag></Divider>
//                 <Table columns={columns} dataSource={newData} rowKey="id" loading={loading} pagination={false} />

//                 <Divider orientation="left"><Tag color="orange">EDIT REQUESTS</Tag></Divider>
//                 <Table columns={columns} dataSource={editData} rowKey="id" loading={loading} pagination={false} />

//                 <Divider orientation="left"><Tag color="red">DELETE REQUESTS</Tag></Divider>
//                 <Table columns={columns} dataSource={deleteData} rowKey="id" loading={loading} pagination={false} />
//             </Card>
//         </div>
//     );
// }














import { useState, useEffect, useCallback } from 'react';
import { Table, Button, message, Space, Typography, Tag, Divider, Card, Modal, Input } from 'antd';
import { CheckOutlined, CloseOutlined, ArrowLeftOutlined, HistoryOutlined, ArrowRightOutlined, RightOutlined,ReloadOutlined  } from '@ant-design/icons';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function ApprovalPage() {
    const [newData, setNewData] = useState([]);
    const [editData, setEditData] = useState([]);
    const [deleteData, setDeleteData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // --- New State for Security & Remarks ---
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [actionType, setActionType] = useState(''); // 'APPROVE' or 'REJECT'
    const [remarks, setRemarks] = useState('');
    const [pin, setPin] = useState('');
    const AUTH_PIN = "1234"; 

    const fetchStagedData = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('staged_products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            message.error(error.message);
        } else {
            setNewData(data.filter(d => d.staging_type === 'NEW_PRODUCT'));
            setEditData(data.filter(d => d.staging_type === 'EDIT_PRODUCT'));
            setDeleteData(data.filter(d => d.staging_type === 'DELETE_REQUEST'));
        }
        setLoading(false);
    }, []);

    // --- 🚀 AUTOLOAD (REALTIME) INTEGRATION ---
    useEffect(() => {
        // 1. Initial manual fetch
        fetchStagedData();

        // 2. Set up Realtime Subscription for 'staged_products'
        const channel = supabase
            .channel('realtime-approvals')
            .on(
                'postgres_changes', 
                { 
                    event: '*',           // Listen for INSERT, UPDATE, and DELETE
                    schema: 'public', 
                    table: 'staged_products' 
                }, 
                (payload) => {
                    console.log('Staging change detected:', payload);
                    fetchStagedData();    // Refresh the lists automatically
                }
            )
            .subscribe();

        // 3. Cleanup subscription on unmount
        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchStagedData]);

    // --- Trigger functions for the Modal ---
    const openApproval = (record) => {
        setCurrentRecord(record);
        setActionType('APPROVE');
        setPin('');
        setRemarks('');
        setIsModalVisible(true);
    };

    const openRejection = (record) => {
        setCurrentRecord(record);
        setActionType('REJECT');
        setPin('');
        setRemarks('');
        setIsModalVisible(true);
    };

    const handleConfirmAction = async () => {
        if (pin !== AUTH_PIN) return message.error("Invalid Security PIN");
        if (actionType === 'REJECT' && !remarks) return message.warning("Please enter a reason for rejection");

        setActionLoading(true);
        try {
            if (actionType === 'APPROVE') {
                await processApproval(currentRecord);
            } else {
                await processRejection(currentRecord);
            }
            setIsModalVisible(false);
            fetchStagedData();
        } catch (error) {
            message.error(`Operation failed: ${error.message}`);
        } finally {
            setActionLoading(false);
        }
    };





    const processApproval = async (record) => {
    const { 
        id, 
        staging_type, 
        original_product_id, 
        remark, 
        created_at, 
        rejection_reason, // Also pull this out if it exists in your table
        ...productData 
    } = record;

    // Helper to safely parse the ID and avoid the "null" string error
    const safeOriginalId = (original_product_id && original_product_id !== "null") 
        ? Number(original_product_id) 
        : null;

    try {
        if (staging_type === 'DELETE_REQUEST') {
            if (!safeOriginalId) throw new Error("Original Product ID is missing for deletion.");
            
            const { error } = await supabase.from('products').delete().eq('id', safeOriginalId);
            if (error) throw error;
            
            await supabase.from('activity_logs').insert([{
                action_type: 'DELETED',
                product_name: record.items,
                details: `Admin approved deletion. (SL: ${record.sl_no})`
            }]);
        } 
        // Logic: If it's a NEW_PRODUCT OR an EDIT without an original ID (Resubmissions)
        else if (staging_type === 'NEW_PRODUCT' || (staging_type === 'EDIT_PRODUCT' && !safeOriginalId)) {
            const { error } = await supabase.from('products').insert([productData]);
            if (error) throw error;
            
            await supabase.from('activity_logs').insert([{
                action_type: 'APPROVED',
                product_name: record.items,
                details: 'Admin approved new product entry/resubmission.',
                remark: remarks 
            }]);
        } 
        else if (staging_type === 'EDIT_PRODUCT') {
            const { error } = await supabase.from('products').update(productData).eq('id', safeOriginalId);
            if (error) throw error;
            
            await supabase.from('activity_logs').insert([{
                action_type: 'APPROVED',
                product_name: record.items,
                details: 'Admin approved product edits.'
            }]);
        }

        // Cleanup: Delete from staging area using the staging row's actual ID
        await supabase.from('staged_products').delete().eq('id', id);
        message.success('Request Approved successfully');
        
    } catch (error) {
        throw error;
    }
};









    const processRejection = async (record) => {
    // Instead of .delete(), we .update()
    const { error } = await supabase
        .from('staged_products')
        .update({ 
            staging_type: 'REJECTED',
            remark: remarks // The remark you collected in the modal
        })
        .eq('id', record.id);

    if (error) throw error;

    await supabase.from('activity_logs').insert([{
        action_type: 'REJECTED',
        product_name: record.items,
        details: `Admin rejected request.`,
        remark: remarks
    }]);
    
    message.info('Request moved to Rejected Gallery');
};






    const columns = [
        { title: 'SL', dataIndex: 'sl_no', width: 60, align: 'center' },
        { title: 'Item', dataIndex: 'items', width: 180, align: 'center' },
        { title: 'Brand', dataIndex: 'brand', width: 180, align: 'center' },
        { title: 'Single', dataIndex: 'single',width: 80, align: 'center', render: v => v || '-' },
        { title: '5+', dataIndex: 'qty_5_plus', width: 70,align: 'center', render: v => v || '-' }, 
        { title: '10+', dataIndex: 'qty_10_plus',width: 70,align: 'center',  render: v => v || '-' },
        { title: '20+', dataIndex: 'qty_20_plus',width: 70,align: 'center',  render: v => v || '-' }, 
        { title: '50+', dataIndex: 'qty_50_plus',width: 70,align: 'center',  render: v => v || '-' }, 
        { title: '100+', dataIndex: 'qty_100_plus', width: 70,align: 'center', render: v => v || '-' },
        { title: 'GST%', dataIndex: 'gst', width: 70,align: 'center', render: v => v ? `${v}` : '-' },
        { title: 'MRP', dataIndex: 'mrp', width: 70,align: 'center', render: v => v || '-' },
        { title: 'Warranty', dataIndex: 'warranty',width: 100, align: 'center',  render: v => v || '-' },
        
        {
            title: 'Image',
            dataIndex: 'product_image',
            render: url => url ? <img src={url} style={{ width: 40 }} alt="prod" /> : '-'
        },
        {
            title: 'Action',
            fixed: 'right',
            width: 110,
            render: (_, record) => (
                <Space>
                    <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => openApproval(record)} />
                    <Button danger size="small" icon={<CloseOutlined />} onClick={() => openRejection(record)} />
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 30 }}>
            <Card>
                <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        marginBottom: 20, 
                        position: 'relative' // Essential for the absolute Title to center correctly
                    }}>
                <Space style={{ marginBottom: 20 }}>
                    <Link href="/"><Button icon={<ArrowLeftOutlined />}>Home</Button></Link>
                    <Link href="/logs"><Button icon={<HistoryOutlined />}>Activity Logs</Button></Link>
                        <Button 
                            icon={<ReloadOutlined />} 
                            onClick={fetchStagedData} 
                            loading={loading}
                            >
                            Refresh
                        </Button>

                </Space>
                <Title 
                    level={3} 
                    style={{ margin: 0, 
                    position: 'absolute', 
                    left:'50%', 
                    transform: 'translateX(-50%)',
                    whiteSpace: 'nowrap'}}
                    >Approval Dashboard
                </Title>
                </div>

                <Divider orientation="left"><Tag color="blue">NEW PRODUCTS</Tag></Divider>
                <Table columns={columns} dataSource={newData} rowKey="id" loading={loading} pagination={false} scroll={{ x: 1000 }} />

                <Divider orientation="left"><Tag color="orange">EDIT REQUESTS</Tag></Divider>
                <Table columns={columns} dataSource={editData} rowKey="id" loading={loading} pagination={false} scroll={{ x: 1000 }} />

                <Divider orientation="left"><Tag color="red">DELETE REQUESTS</Tag></Divider>
                <Table columns={columns} dataSource={deleteData} rowKey="id" loading={loading} pagination={false} scroll={{ x: 1000 }} />
            </Card>

            {/* Authorization & Remark Modal */}
            <Modal
                title={actionType === 'APPROVE' ? "Confirm Approval" : "Confirm Rejection"}
                open={isModalVisible}
                onOk={handleConfirmAction}
                onCancel={() => setIsModalVisible(false)}
                confirmLoading={actionLoading}
                okText="Submit"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                    {actionType === 'REJECT' && (
                        <div>
                            <Text strong>Rejection Remark:</Text>
                            <Input.TextArea 
                                placeholder="Enter reason for rejection..." 
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                rows={3}
                                style={{ marginTop: 5 }}
                            />
                        </div>
                    )}
                    <div>
                        <Text strong>Security PIN:</Text>
                        <Input.Password 
                            placeholder="Enter 4-digit code"
                            maxLength={4}
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            style={{ marginTop: 5, textAlign: 'center', letterSpacing: 5 }}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}