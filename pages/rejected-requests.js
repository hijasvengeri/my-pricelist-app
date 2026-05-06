

import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Space, Typography, Card, Divider, Select, modal, Upload, Image as AntImage } from 'antd';
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
    const [isItemEditModalOpen, setIsItemEditModalOpen] = useState(false);
    const [itemForm] = Form.useForm();

    // const fetchRejected = useCallback(async () => {
    //     setLoading(true);
    //     try {
    //         const { data: rejectedData, error } = await supabase
    //             .from('staged_products')
    //             .select('*')
    //             .eq('staging_type', 'REJECTED');

    //         if (error) throw error;
    //         setData(rejectedData || []);
    //     } catch (error) {
    //         message.error("Failed to load: " + error.message);
    //     } finally {
    //         setLoading(false);
    //     }
    // }, []);





    const fetchRejected = useCallback(async () => {
        setLoading(true);
        try {
            // 🔹 Fetch rejected products
            const { data: rejectedProducts, error: error1 } = await supabase
                .from('staged_products')
                .select('*')
                .eq('staging_type', 'REJECTED');

            if (error1) throw error1;

            // 🔹 Fetch rejected items
            const { data: rejectedItems, error: error2 } = await supabase
                .from('staged_items')
                .select('*')
                .eq('staging_type', 'REJECTED');

            if (error2) throw error2;

            // 🔹 Normalize item data to match table structure
            const formattedItems = (rejectedItems || []).map(item => ({
                id: `item-${item.id}`,     // for UI
                original_id: item.id,      // ✅ REAL DB ID (IMPORTANT)
                sl_no: item.sl_no_list,
                items: item.new_name,
                brand: '-',
                single: null,
                qty_5_plus: null,
                qty_10_plus: null,
                qty_20_plus: null,
                qty_50_plus: null,
                qty_100_plus: null,
                gst: null,
                warranty: null,
                mrp: null,
                product_image: null,
                remark: item.remark,
                source: 'ITEM' // 🔹 important to differentiate
            }));

            // 🔹 Add source for products
            const formattedProducts = (rejectedProducts || []).map(p => ({
                ...p,
                source: 'PRODUCT'
            }));

            // 🔹 Merge both
            setData([...formattedProducts, ...formattedItems]);

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

    // const handleEdit = (record) => {
    //     setEditingRecord(record);

    //     if (record.source === 'ITEM') {
    //         // ITEM modal
    //         itemForm.setFieldsValue({
    //             sl_no: record.sl_no,
    //             items: record.items
    //         });

    //         setIsItemModalOpen(true);

    //     } else {
    //         // PRODUCT modal
    //         form.setFieldsValue(record);

    //         if (record.product_image) {
    //             setFileList([{
    //                 uid: '-1',
    //                 name: 'image.png',
    //                 status: 'done',
    //                 url: record.product_image,
    //             }]);
    //         } else {
    //             setFileList([]);
    //         }

    //         setIsEditModalOpen(true);
    //     }
    // };







    const handleEdit = (record) => {
        setEditingRecord(record);

        // 🔹 ITEM
        if (record.source === 'ITEM') {
            itemForm.setFieldsValue({
                sl_no_list: record.sl_no,
                item_name: record.items
            });

            setIsItemEditModalOpen(true);
        }

        // 🔹 PRODUCT
        else {
            form.setFieldsValue(record);

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
        }
    };



    // const handleResubmit = async (values) => {
    //     try {
    //         const { error: updateError } = await supabase
    //             .from('staged_products')
    //             .update({
    //                 ...values,
    //                 staging_type: 'EDIT_PRODUCT',
    //                 remark: null
    //             })
    //             .eq('id', editingRecord.id);

    //         if (updateError) throw updateError;

    //         await supabase.from('activity_logs').insert([{
    //             action_type: 'RESUBMITTED',
    //             product_name: values.items,
    //             details: `Product resubmitted for approval after fixing rejection issues.`,
    //             remark: `Original rejection reason was: ${editingRecord.remark || 'N/A'}`
    //         }]);

    //         message.success("Resubmitted to Admin for approval!");
    //         setIsEditModalOpen(false);
    //         fetchRejected();
    //     } catch (err) {
    //         message.error("Resubmit failed: " + err.message);
    //     }
    // };







    // const handleResubmit = async (values) => {
    //     try {
    //         const { error } = await supabase
    //             .from('staged_products')
    //             .update({
    //                 ...values,
    //                 staging_type: 'EDIT_PRODUCT', // 👈 goes back to approval queue
    //                 remark: null                 // 👈 clear rejection reason
    //             })
    //             .eq('id', editingRecord.id);

    //         if (error) throw error;

    //         await supabase.from('activity_logs').insert([{
    //             action_type: 'RESUBMITTED',
    //             product_name: values.items,
    //             details: 'Rejected item fixed and sent for approval again',
    //             remark: `Old rejection: ${editingRecord.remark || 'N/A'}`
    //         }]);

    //         message.success("Sent back for approval!");
    //         setIsEditModalOpen(false);
    //         fetchRejected(); // 👈 disappears from rejected list

    //     } catch (err) {
    //         message.error("Resubmit failed: " + err.message);
    //     }
    // };



    const handleResubmit = async (values) => {
        try {
            if (!editingRecord) return;

            // 🔹 Handle ITEM resubmission
            if (editingRecord.source === 'ITEM') {

                const { error } = await supabase
                    .from('staged_items')
                    .update({
                        new_name: values.item_name,
                        sl_no_list: values.sl_no_list,
                        staging_type: 'EDIT_ITEM',
                        remark: null
                    })
                    .eq('id', editingRecord.original_id); // ✅ DIRECT USE

                if (error) throw error;

                await supabase.from('activity_logs').insert([{
                    action_type: 'RESUBMITTED',
                    product_name: values.item_name,
                    details: 'Rejected item fixed and sent for approval again',
                    remark: `Old rejection: ${editingRecord.remark || 'N/A'}`
                }]);
            }
            // 🔹 Handle PRODUCT resubmission
            else {
                const { error } = await supabase
                    .from('staged_products')
                    .update({
                        ...values,
                        staging_type: 'EDIT_PRODUCT', // back to approval queue
                        remark: null
                    })
                    .eq('id', editingRecord.id); // UUID

                if (error) throw error;

                await supabase.from('activity_logs').insert([{
                    action_type: 'RESUBMITTED',
                    product_name: values.items,
                    details: 'Rejected product fixed and sent for approval again',
                    remark: `Old rejection: ${editingRecord.remark || 'N/A'}`
                }]);
            }

            message.success("Sent back for approval!");
            setIsEditModalOpen(false);
            fetchRejected(); // refresh list

        } catch (err) {
            message.error("Resubmit failed: " + err.message);
        }
    };






    // const handleDelete = async (id) => {
    //     const { error } = await supabase.from('staged_products').delete().eq('id', id);
    //     if (!error) {
    //         message.success("Request permanently deleted");
    //         fetchRejected();
    //     }
    // };




    // const handleDelete = (id) => {
    //     let inputCode = '';

    //     Modal.confirm({
    //         title: 'Confirm Delete',
    //         content: (
    //             <div>
    //                 <p>Enter code to delete:</p>
    //                 <Input
    //                     placeholder="Enter code"
    //                     maxLength={4}
    //                     onChange={(e) => (inputCode = e.target.value)}
    //                 />
    //             </div>
    //         ),
    //         okText: 'Delete',
    //         okType: 'danger',
    //         onOk: async () => {
    //             if (inputCode !== '5678') {
    //                 message.error('Incorrect code. Deletion cancelled.');
    //                 return Promise.reject(); // prevents modal from closing
    //             }

    //             const { error } = await supabase
    //                 .from('staged_products')
    //                 .delete()
    //                 .eq('id', id);

    //             if (!error) {
    //                 message.success('Request permanently deleted');
    //                 fetchRejected();
    //             } else {
    //                 message.error('Delete failed: ' + error.message);
    //             }
    //         },
    //     });
    // };




    const handleDelete = (record) => {
        let inputCode = '';

        Modal.confirm({
            title: 'Confirm Delete',
            content: (
                <div>
                    <p>Enter code to delete:</p>
                    <Input
                        placeholder="Enter code"
                        maxLength={4}
                        onChange={(e) => (inputCode = e.target.value)}
                    />
                </div>
            ),
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                if (inputCode !== '5678') {
                    message.error('Incorrect code. Deletion cancelled.');
                    return Promise.reject();
                }

                try {
                    let deletedName = '';

                    // 🔹 ITEM DELETE
                    if (record.source === 'ITEM') {
                        deletedName = record.items;

                        const { error } = await supabase
                            .from('staged_items')
                            .delete()
                            .eq('id', record.original_id);

                        if (error) throw error;

                        // ✅ LOG
                        await supabase.from('activity_logs').insert([{
                            action_type: 'DELETED',
                            product_name: deletedName,
                            details: 'Rejected item permanently deleted',
                            remark: record.remark || null
                        }]);
                    }

                    // 🔹 PRODUCT DELETE
                    else {
                        deletedName = record.items;

                        const { error } = await supabase
                            .from('staged_products')
                            .delete()
                            .eq('id', record.id);

                        if (error) throw error;

                        // ✅ LOG
                        await supabase.from('activity_logs').insert([{
                            action_type: 'DELETED',
                            product_name: deletedName,
                            details: 'Rejected product permanently deleted',
                            remark: record.remark || null
                        }]);
                    }

                    message.success('Request permanently deleted');
                    fetchRejected();

                } catch (error) {
                    message.error('Delete failed: ' + error.message);
                }
            },
        });
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
        {
            title: 'GST', dataIndex: 'gst', width: 70, align: 'center', render: (v) => {
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
            width: 100,
            render: (val) => <Text type="danger" italic>{val || 'No remark'}</Text>
        },
        {
            title: 'Actions',
            fixed: 'right',
            width: 80,
            render: (_, record) => (
                <Space>
                    <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}></Button>
                    <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
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
                        <Form.Item name="single" label="Single Price"><InputNumber style={{ width: '100%' }} /></Form.Item>
                        <Form.Item name="qty_5_plus" label="5+ Price"><InputNumber style={{ width: '100%' }} /></Form.Item>
                        <Form.Item name="qty_10_plus" label="10+ Price"><InputNumber style={{ width: '100%' }} /></Form.Item>
                        <Form.Item name="qty_20_plus" label="20+ Price"><InputNumber style={{ width: '100%' }} /></Form.Item>
                        <Form.Item name="qty_50_plus" label="50+ Price"><InputNumber style={{ width: '100%' }} /></Form.Item>
                        <Form.Item name="qty_100_plus" label="100+ Price"><InputNumber style={{ width: '100%' }} /></Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        <Form.Item name="gst" label="GST %"><InputNumber style={{ width: '100%' }} /></Form.Item>
                        <Form.Item name="warranty" label="Warranty"><Input placeholder="e.g., 1 year manufacturer warranty" /></Form.Item>
                        <Form.Item name="mrp" label="MRP"><InputNumber style={{ width: '100%' }} /></Form.Item>
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
            <Modal
                title="Fix Item"
                open={isItemEditModalOpen}
                onCancel={() => setIsItemEditModalOpen(false)}
                onOk={() => itemForm.submit()}
            >
                <Form form={itemForm} layout="vertical" onFinish={handleResubmit}>

                    <Form.Item
                        label="SL No"
                        name="sl_no_list"
                        rules={[{ required: true }]}
                    >
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        label="Item Name"
                        name="item_name"
                        rules={[{ required: true }]}
                    >
                        <Input placeholder="Enter item name" />
                    </Form.Item>

                </Form>
            </Modal>
        </div>
    );
}