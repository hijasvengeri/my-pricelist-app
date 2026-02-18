// import React, { useState, useEffect, useCallback } from 'react';
// import { Table, Button, Modal, Form, Input, InputNumber, message, Space, Typography, Card, Divider, Tag, Select, Image as AntImage} from 'antd';
// import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, HistoryOutlined, PlusOutlined, EyeOutlined, LinkOutlined } from '@ant-design/icons';
// import { supabase } from '../lib/supabaseClient';
// import Link from 'next/link';
// import { title } from 'process';

// const { Title, Text } = Typography;

// export default function RejectedRequests() {
//     const [data, setData] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//     const [editingRecord, setEditingRecord] = useState(null);
//     const [form] = Form.useForm();
//     const imageUrl = Form.useWatch('product_image', form);
    

//     const fetchRejected = useCallback(async () => {
//         setLoading(true);
//         try {
//             const { data: rejectedData, error } = await supabase
//                 .from('staged_products')
//                 .select('*')
//                 .eq('staging_type', 'REJECTED');

//             if (error) throw error;
//             setData(rejectedData || []);
//         } catch (error) {
//             message.error("Failed to load: " + error.message);
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     const [itemsList, setItemsList] = useState([]);

// // Add this to your useEffect or create a separate one
// const fetchItemsList = async () => {
//     const { data, error } = await supabase
//         .from('items_list') // Ensure this matches your table name exactly
//         .select('item_name') // Assuming the column name is item_name
//         .order('item_name', { ascending: true });

//     if (!error) {
//         setItemsList(data);
//     } else {
//         console.error("Error fetching items list:", error.message);
//     }
// };

//     useEffect(() => {
//         fetchRejected();
//         fetchItemsList();
//     }, [fetchRejected]);

//     const handleResubmit = async (values) => {
//     try {
//         // 1. Update the staged product status back to 'EDIT_PRODUCT'
//         const { error: updateError } = await supabase
//             .from('staged_products')
//             .update({ 
//                 ...values, 
//                 staging_type: 'EDIT_PRODUCT', 
//                 remark: null // Clear the rejection remark since it's now fixed
//             })
//             .eq('id', editingRecord.id);

//         if (updateError) throw updateError;

//         // 2. Insert a new log specifically for the Resubmission
//         const { error: logError } = await supabase.from('activity_logs').insert([{
//             action_type: 'RESUBMITTED', // New tag for your logs
//             product_name: values.items,
//             details: `Product resubmitted for approval after fixing rejection issues.`,
//             remark: `Original rejection reason was: ${editingRecord.remark || 'N/A'}`
//         }]);

//         if (logError) throw logError;

//         message.success("Resubmitted to Admin for approval!");
//         setIsEditModalOpen(false);
//         fetchRejected(); // Refresh the list
//     } catch (err) {
//         message.error("Resubmit failed: " + err.message);
//     }
// };

//     const handleDelete = async (id) => {
//         const { error } = await supabase.from('staged_products').delete().eq('id', id);
//         if (!error) {
//             message.success("Request permanently deleted");
//             fetchRejected();
//         }
//     };


//     const handleUpdateImage = () => {
//     Modal.confirm({
//         title: 'Update Product Image',
//         icon: <LinkOutlined />,
//         content: (
//             <div style={{ marginTop: 10 }}>
//                 <Text type="secondary">Paste the new image URL below:</Text>
//                 <Input 
//                     autoFocus
//                     placeholder="https://example.com/image.jpg" 
//                     onChange={(e) => form.setFieldsValue({ product_image: e.target.value })}
//                     style={{ marginTop: 10 }}
//                 />
//             </div>
//         ),
//         okText: 'Update Preview',
//         onOk: () => message.success('Image updated')
//     });
// };

//     // --- SAME COLUMNS AS APPROVAL PAGE ---
//     const columns = [
//         { title: 'SL No', dataIndex: 'sl_no', width: 80 },
//         { title: 'Item', dataIndex: 'items', width: 180 },
//         { title: 'Brand', dataIndex: 'brand', width: 100 },
//         { title: 'Single', dataIndex: 'single', render: v => v || '-' },
//         { title: '5+', dataIndex: 'qty_5_plus', render: v => v || '-' }, 
//         { title: '10+', dataIndex: 'qty_10_plus', render: v => v || '-' },
//         { title: '20+', dataIndex: 'qty_20_plus', render: v => v || '-' }, 
//         { title: '50+', dataIndex: 'qty_50_plus', render: v => v || '-' }, 
//         { title: '100+', dataIndex: 'qty_100_plus', render: v => v || '-' },
//         { title: 'GST%', dataIndex: 'gst', render: v => v ? `${v}%` : '-' },
//         { title: 'Warranty', dataIndex: 'warranty', render: v => v || '-' },
//         { title: 'MRP', dataIndex: 'mrp', render: v => v || '-' },
//         // {title: 'Image', dataIndex: 'product_image', render: (url) => url ? <img src={url} style={{ width: 40, borderRadius: 4 }} alt="prod" /> : '-'},
//         {
//                     title: 'Image',
//                     dataIndex: 'product_image',
//                     width: 80,
//                     render: (url) => (
//                         <div style={{ width: 40, height: 40, overflow: 'hidden', borderRadius: 4, border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                             {url ? (
//                                 <AntImage // Use the new name
//                                     src={url}
//                                     width={40}
//                                     preview={{ mask: <EyeOutlined /> }}
//                                     fallback="https://placehold.co/40x40?text=?"
//                                 />
//                             ) : (
//                                 <Text type="secondary" style={{ fontSize: '10px' }}>None</Text>
//                             )}
//                         </div>
//                     )
//                 },



//         { 
//             title: 'Rejection Remark', 
//             dataIndex: 'remark', 
//             render: (val) => <Text type="danger" italic>{val || 'No remark'}</Text> 
//         },
//         {
//             title: 'Actions',
//             fixed: 'right',
//             width: 150,
//             render: (_, record) => (
//                 <Space>
//                     <Button 
//                         type="primary"
//                         size="small"
//                         icon={<EditOutlined />} 
//                         onClick={() => {
//                             setEditingRecord(record);
//                             form.setFieldsValue(record);
//                             setIsEditModalOpen(true);
//                         }}
//                     >
//                         Fix
//                     </Button>
//                     <Button 
//                         danger 
//                         size="small"
//                         icon={<DeleteOutlined />} 
//                         onClick={() => handleDelete(record.id)}
//                     />
//                 </Space>
//             )
//         }
//     ];

//     return (
//         <div style={{ padding: 30 }}>
//             <Card>
//                 {/* --- SAME HEADER AS APPROVAL PAGE --- */}
//                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, position: 'relative' }}>
//                     <Space>
//                         <Link href="/approval-page"><Button icon={<ArrowLeftOutlined />}>Back</Button></Link>
//                         <Link href="/logs"><Button icon={<HistoryOutlined />}>Activity Logs</Button></Link>
//                         <Button icon={<ReloadOutlined />} onClick={fetchRejected} loading={loading}>Refresh</Button>
//                     </Space>

//                     <Title level={3} style={{ margin: 0, position: 'absolute', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
//                         Rejected Requests
//                     </Title>

//                     <div style={{ width: 100 }} /> 
//                 </div>

//                 <Table 
//                     columns={columns} 
//                     dataSource={data} 
//                     rowKey="id" 
//                     loading={loading} 
//                     scroll={{ x: 1200 }}
//                 />
//             </Card>

//             {/* --- FULL EDIT FORM MODAL --- */}
//             <Modal 
//                 title={`Fixing: ${editingRecord?.items}`}
//                 open={isEditModalOpen} 
//                 onCancel={() => setIsEditModalOpen(false)}
//                 onOk={() => form.submit()}
//                 width={800}
//             >
//                 <Form form={form} layout="vertical" onFinish={handleResubmit}>
//                     <Space size="large" style={{ display: 'flex', flexWrap: 'wrap' }}>
//                         <Form.Item name="sl_no" label="SL No"><InputNumber /></Form.Item>
//                         {/* <Form.Item name="items" label="Item Name" rules={[{required: true}]}><Input style={{ width: 300 }} /></Form.Item> */}
//                             <Form.Item 
//                                     name="items" 
//                                     label="Item Name" 
//                                     rules={[{ required: true, message: 'Please select an item' }]}
//                                 >
//                                     <Select
//                                         showSearch // Allows typing to filter the list
//                                         placeholder="Select an item"
//                                         filterOption={(input, option) =>
//                                             (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
//                                         }
//                                         options={itemsList.map(item => ({
//                                             value: item.item_name,
//                                             label: item.item_name,
//                                         }))}
//                                     />
//                                 </Form.Item>

//                         <Form.Item name="brand" label="Brand"><Input /></Form.Item>
//                     </Space>
                    
//                     <Divider>Pricing Tiers</Divider>
//                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
//                         <Form.Item name="single" label="Single Price"><InputNumber style={{width:'100%'}} /></Form.Item>
//                         <Form.Item name="qty_5_plus" label="5+ Price"><InputNumber style={{width:'100%'}} /></Form.Item>
//                         <Form.Item name="qty_10_plus" label="10+ Price"><InputNumber style={{width:'100%'}} /></Form.Item>
//                         <Form.Item name="qty_20_plus" label="20+ Price"><InputNumber style={{width:'100%'}} /></Form.Item>
//                         <Form.Item name="qty_50_plus" label="50+ Price"><InputNumber style={{width:'100%'}} /></Form.Item>
//                         <Form.Item name="qty_100_plus" label="100+ Price"><InputNumber style={{width:'100%'}} /></Form.Item>
//                     </div>
//                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
//                         <Form.Item name="gst" label="GST %"><InputNumber style={{width:'100%'}} /></Form.Item>
//                         <Form.Item name="warranty" label="Warranty"><Input placeholder="e.g., 1 year manufacturer warranty" /></Form.Item>
//                         <Form.Item name="mrp" label="MRP"><InputNumber style={{width:'100%'}} /></Form.Item>
//                     </div>
//                     {/* <Form.Item name="product_image" label="Image URL"><Input placeholder="https://..." /></Form.Item> */}
//                             <Form.Item label="Product Image">
//     {/* Hidden field to store the URL */}
//     <Form.Item name="product_image" noStyle><Input type="hidden" /></Form.Item>

//     <div 
//         onClick={handleUpdateImage}
//         style={{ 
//             position: 'relative', 
//             width: 104, 
//             height: 104, 
//             border: '1px dashed #d9d9d9', 
//             borderRadius: 6, 
//             display: 'flex', 
//             alignItems: 'center', 
//             justifyContent: 'center', 
//             background: '#fafafa',
//             cursor: 'pointer',
//             overflow: 'hidden'
//         }}
//     >
//         {imageUrl ? (
//             <>
//                 <img 
//                     src={imageUrl} 
//                     alt="Preview" 
//                     style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
//                 />
                
//                 {/* REMOVE & UPLOAD NEW BUTTON */}
//                 <Button
//                     type="primary"
//                     danger
//                     icon={<PlusOutlined rotate={45} />}
//                     size="small"
//                     style={{ 
//                         position: 'absolute', 
//                         top: 2, 
//                         right: 2, 
//                         width: 20, 
//                         height: 20, 
//                         padding: 0,
//                         zIndex: 10 
//                     }}
//                     onClick={(e) => {
//                         e.stopPropagation(); // Prevents double-triggering
//                         form.setFieldsValue({ product_image: null }); // Clear current
//                         handleUpdateImage(); // Immediately ask for new URL
//                     }}
//                 />
//             </>
//         ) : (
//             <div style={{ textAlign: 'center', color: '#8c8c8c' }}>
//                 <PlusOutlined style={{ fontSize: 20 }} />
//                 <div style={{ marginTop: 8 }}>Add Image</div>
//             </div>
//         )}
//     </div>
// </Form.Item>

//                 </Form>
//             </Modal>
//         </div>
//     );
// }




















import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Space, Typography, Card, Divider, Select, Upload, Image as AntImage } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, HistoryOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function RejectedRequests() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();
    
    // Cloudinary States
    const [fileList, setFileList] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [itemsList, setItemsList] = useState([]);

    const fetchRejected = useCallback(async () => {
        setLoading(true);
        try {
            const { data: rejectedData, error } = await supabase
                .from('staged_products')
                .select('*')
                .eq('staging_type', 'REJECTED');

            if (error) throw error;
            setData(rejectedData || []);
        } catch (error) {
            message.error("Failed to load: " + error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchItemsList = async () => {
        const { data, error } = await supabase
            .from('items_list')
            .select('item_name')
            .order('item_name', { ascending: true });
        if (!error) setItemsList(data);
    };

    useEffect(() => {
        fetchRejected();
        fetchItemsList();
    }, [fetchRejected]);

    // --- CLOUDINARY UPLOAD HANDLER ---
    const customUploadRequest = async ({ file, onSuccess, onError }) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file); 

        try {
            const response = await fetch('/api/product-image-upload', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Upload failed');

            const fileURL = result.imageUrl; 
            onSuccess(fileURL, file); 
            message.success(`${file.name} uploaded successfully.`);
            form.setFieldsValue({ product_image: fileURL }); 
        } catch (error) {
            onError(error);
            message.error(`Upload failed: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        form.setFieldsValue(record);
        // Set preview for the browse box
        if (record.product_image) {
            setFileList([{
                uid: '-1',
                name: 'image.png',
                status: 'done',
                url: record.product_image,
            }]);
        } else {
            setFileList([]);
        }
        setIsEditModalOpen(true);
    };

    const handleResubmit = async (values) => {
        try {
            const { error: updateError } = await supabase
                .from('staged_products')
                .update({ 
                    ...values, 
                    staging_type: 'EDIT_PRODUCT', 
                    remark: null 
                })
                .eq('id', editingRecord.id);

            if (updateError) throw updateError;

            await supabase.from('activity_logs').insert([{
                action_type: 'RESUBMITTED',
                product_name: values.items,
                details: `Product resubmitted for approval after fixing rejection issues.`,
                remark: `Original rejection reason was: ${editingRecord.remark || 'N/A'}`
            }]);

            message.success("Resubmitted to Admin for approval!");
            setIsEditModalOpen(false);
            fetchRejected();
        } catch (err) {
            message.error("Resubmit failed: " + err.message);
        }
    };

    const handleDelete = async (id) => {
        const { error } = await supabase.from('staged_products').delete().eq('id', id);
        if (!error) {
            message.success("Request permanently deleted");
            fetchRejected();
        }
    };

    // --- RESTORED YOUR FULL ORIGINAL COLUMNS ---
    const columns = [
        { title: 'SL No', dataIndex: 'sl_no', width: 80 },
        { title: 'Item', dataIndex: 'items', width: 180 },
        { title: 'Brand', dataIndex: 'brand', width: 100 },
        { title: 'Single', dataIndex: 'single', render: v => v || '-' },
        { title: '5+', dataIndex: 'qty_5_plus', render: v => v || '-' }, 
        { title: '10+', dataIndex: 'qty_10_plus', render: v => v || '-' },
        { title: '20+', dataIndex: 'qty_20_plus', render: v => v || '-' }, 
        { title: '50+', dataIndex: 'qty_50_plus', render: v => v || '-' }, 
        { title: '100+', dataIndex: 'qty_100_plus', render: v => v || '-' },
        // { title: 'GST%', dataIndex: 'gst', render: v => v ? `${v}%` : '-' },
        {title: 'GST',dataIndex: 'gst',width: 70,align: 'center',render: (v) => {
                if (v === null || v === undefined || v === '') return '-';

                const value = String(v).trim();

                // If already contains %, return as-is
                if (value.includes('%')) return value;

                // Otherwise append %
                return `${value}%`;
            }
            },

        { title: 'Warranty', dataIndex: 'warranty', render: v => v || '-' },
        { title: 'MRP', dataIndex: 'mrp', render: v => v || '-' },
        {
            title: 'Image',
            dataIndex: 'product_image',
            width: 80,
            render: (url) => (
                <div style={{ width: 40, height: 40, overflow: 'hidden', borderRadius: 4, border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {url ? (
                        <AntImage 
                            src={url}
                            width={40}
                            preview={{ mask: <EyeOutlined /> }}
                            fallback="https://placehold.co/40x40?text=?"
                        />
                    ) : (
                        <Text type="secondary" style={{ fontSize: '10px' }}>None</Text>
                    )}
                </div>
            )
        },
        { 
            title: 'Rejection Remark', 
            dataIndex: 'remark', 
            render: (val) => <Text type="danger" italic>{val || 'No remark'}</Text> 
        },
        {
            title: 'Actions',
            fixed: 'right',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>Fix</Button>
                    <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 30 }}>
            <Card>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, position: 'relative' }}>
                    <Space>
                        <Link href="/approval-page"><Button icon={<ArrowLeftOutlined />}>Back</Button></Link>
                        <Link href="/logs"><Button icon={<HistoryOutlined />}>Activity Logs</Button></Link>
                        <Button icon={<ReloadOutlined />} onClick={fetchRejected} loading={loading}>Refresh</Button>
                    </Space>
                    <Title level={3} style={{ margin: 0, position: 'absolute', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
                        Rejected Requests
                    </Title>
                    <div style={{ width: 100 }} /> 
                </div>

                <Table columns={columns} dataSource={data} rowKey="id" loading={loading} scroll={{ x: 1200 }} />
            </Card>

            <Modal 
                title={`Fixing: ${editingRecord?.items}`}
                open={isEditModalOpen} 
                onCancel={() => setIsEditModalOpen(false)}
                onOk={() => form.submit()}
                width={800}
            >
                <Form form={form} layout="vertical" onFinish={handleResubmit}>
                    <Space size="large" style={{ display: 'flex', flexWrap: 'wrap' }}>
                        <Form.Item name="sl_no" label="SL No"><InputNumber /></Form.Item>
                        <Form.Item name="items" label="Item Name" rules={[{ required: true }]}>
                            <Select
                                showSearch
                                placeholder="Select an item"
                                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                options={itemsList.map(item => ({ value: item.item_name, label: item.item_name }))}
                                style={{ width: 300 }}
                            />
                        </Form.Item>
                        <Form.Item name="brand" label="Brand"><Input /></Form.Item>
                    </Space>
                    
                    <Divider>Pricing Tiers</Divider>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        <Form.Item name="single" label="Single Price"><InputNumber style={{width:'100%'}} /></Form.Item>
                        <Form.Item name="qty_5_plus" label="5+ Price"><InputNumber style={{width:'100%'}} /></Form.Item>
                        <Form.Item name="qty_10_plus" label="10+ Price"><InputNumber style={{width:'100%'}} /></Form.Item>
                        <Form.Item name="qty_20_plus" label="20+ Price"><InputNumber style={{width:'100%'}} /></Form.Item>
                        <Form.Item name="qty_50_plus" label="50+ Price"><InputNumber style={{width:'100%'}} /></Form.Item>
                        <Form.Item name="qty_100_plus" label="100+ Price"><InputNumber style={{width:'100%'}} /></Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        <Form.Item name="gst" label="GST %"><InputNumber style={{width:'100%'}} /></Form.Item>
                        <Form.Item name="warranty" label="Warranty"><Input placeholder="e.g., 1 year manufacturer warranty" /></Form.Item>
                        <Form.Item name="mrp" label="MRP"><InputNumber style={{width:'100%'}} /></Form.Item>
                    </div>

                    <Form.Item label="Product Image">
                        <Form.Item name="product_image" noStyle><Input type="hidden" /></Form.Item>
                        <Upload
                            customRequest={customUploadRequest}
                            listType="picture"
                            fileList={fileList}
                            onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                            onRemove={() => { setFileList([]); form.setFieldsValue({ product_image: null }); }}
                            maxCount={1}
                            showUploadList={false}
                        >
                            {fileList.length === 0 ? (
                                <Button icon={<PlusOutlined />} loading={isUploading}>
                                    {isUploading ? 'Uploading...' : 'Browse Image'}
                                </Button>
                            ) : (
                                <div style={{ 
                                    position: 'relative', width: 104, height: 104, 
                                    border: '1px solid #d9d9d9', borderRadius: 6, 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' 
                                }}>
                                    <img 
                                        src={fileList[0].url || fileList[0].response} 
                                        alt="Preview" 
                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                                    />
                                    <Button
                                        type="primary" danger
                                        icon={<PlusOutlined rotate={45} />}
                                        size="small"
                                        style={{ position: 'absolute', top: 2, right: 2 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFileList([]);
                                            form.setFieldsValue({ product_image: null });
                                        }}
                                    />
                                </div>
                            )}
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}