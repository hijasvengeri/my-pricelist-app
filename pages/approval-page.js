




import { useState, useEffect, useCallback } from 'react';
import { Table, Button, message, Space, Typography, Tag, Divider, Card, Modal, Input } from 'antd';
import { CheckOutlined, CloseOutlined, ArrowLeftOutlined, HistoryOutlined, ArrowRightOutlined, RightOutlined, ReloadOutlined } from '@ant-design/icons';
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
    const [editItemData, setEditItemData] = useState([]);

    // const fetchStagedData = useCallback(async () => {
    //     setLoading(true);
    //     const { data, error } = await supabase
    //         .from('staged_products')
    //         .select('*')
    //         .order('created_at', { ascending: false });

    //     if (error) {
    //         message.error(error.message);
    //     } else {
    //         setNewData(data.filter(d => d.staging_type === 'NEW_PRODUCT'));
    //         setEditData(data.filter(d => d.staging_type === 'EDIT_PRODUCT'));
    //         setDeleteData(data.filter(d => d.staging_type === 'DELETE_REQUEST'));
    //         setEditItemData(data.filter(d => d.staging_type === 'EDIT_ITEM'));
    //     }
    //     setLoading(false);
    // }, []);







    const fetchStagedData = useCallback(async () => {
        setLoading(true);

        // 🔵 Fetch product staging
        const { data: productData, error: productError } = await supabase
            .from('staged_products')
            .select('*')
            .order('created_at', { ascending: false });

        // 🟣 Fetch item staging
        const { data: itemData, error: itemError } = await supabase
            .from('staged_items')
            .select('*')
            .order('created_at', { ascending: false });

        if (productError) {
            message.error(productError.message);
        } else {
            setNewData(productData.filter(d => d.staging_type === 'NEW_PRODUCT'));
            setEditData(productData.filter(d => d.staging_type === 'EDIT_PRODUCT'));
            setDeleteData(productData.filter(d => d.staging_type === 'DELETE_REQUEST'));
        }

        if (itemError) {
            message.error(itemError.message);
        } else {
            setEditItemData(itemData.filter(d => d.staging_type === 'EDIT_ITEM'));
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
                    brand_name: record.brand,
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
                    brand_name: record.brand,
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
                    brand_name: record.brand,
                    details: 'Admin approved product edits.'
                }]);
            }

            else if (staging_type === 'EDIT_ITEM') {
                const { error } = await supabase
                    .from('items_list')
                    .update({
                        item_name: record.new_name,
                        sl_no_list: record.sl_no_list
                    })
                    .eq('id', record.item_id);

                if (error) throw error;

                await supabase.from('activity_logs').insert([{
                    action_type: 'APPROVED',
                    product_name: record.old_name,
                    brand_name: record.brand,
                    details: `Item name updated to "${record.new_name}"`
                }]);
            }

            // Cleanup: Delete from staging area using the staging row's actual ID
            await supabase.from('staged_items').delete().eq('id', id);
            message.success('Request Approved successfully');

        } catch (error) {
            throw error;
        }
    };









    // const processRejection = async (record) => {
    //     // Instead of .delete(), we .update()
    //     const { error } = await supabase
    //         .from('staged_products')
    //         .update({
    //             staging_type: 'REJECTED',
    //             remark: remarks // The remark you collected in the modal
    //         })
    //         .eq('id', record.id);

    //     if (error) throw error;

    //     await supabase.from('activity_logs').insert([{
    //         action_type: 'REJECTED',
    //         product_name: record.items,
    //         details: `Admin rejected request.`,
    //         remark: remarks
    //     }]);

    //     message.info('Request moved to Rejected Gallery');
    // };






const processRejection = async (record) => {
    try {
        const tableName =
            record.staging_type === 'EDIT_ITEM'
                ? 'staged_items'
                : 'staged_products';

        // 🛑 Safety check
        if (!record.id) {
            console.error("Invalid record:", record);
            return message.error("Invalid record ID");
        }

        // ✅ NO Number() anymore
        const { error } = await supabase
            .from(tableName)
            .update({
                staging_type: 'REJECTED',
                remark: remarks
            })
            .eq('id', record.id); // ✅ works for UUID

        if (error) throw error;

        await supabase.from('activity_logs').insert([{
            action_type: 'REJECTED',
            product_name: record.items || record.old_name,
            brand_name: record.brand,
            details:
                record.staging_type === 'EDIT_ITEM'
                    ? `Item rename rejected (${record.old_name} → ${record.new_name})`
                    : `Admin rejected product request.`,
            remark: remarks
        }]);

        message.info('Request moved to Rejected Gallery');

    } catch (err) {
        message.error(`Rejection failed: ${err.message}`);
    }
};




    const columns = [
        { title: 'SL', dataIndex: 'sl_no', width: 60, align: 'center' },
        { title: 'Item', dataIndex: 'items', width: 180, align: 'center' },
        { title: 'Brand', dataIndex: 'brand', width: 180, align: 'center' },
        { title: 'Single', dataIndex: 'single', width: 80, align: 'center', render: v => v || '-' },
        { title: '5+', dataIndex: 'qty_5_plus', width: 70, align: 'center', render: v => v || '-' },
        { title: '10+', dataIndex: 'qty_10_plus', width: 70, align: 'center', render: v => v || '-' },
        { title: '20+', dataIndex: 'qty_20_plus', width: 70, align: 'center', render: v => v || '-' },
        { title: '50+', dataIndex: 'qty_50_plus', width: 70, align: 'center', render: v => v || '-' },
        { title: '100+', dataIndex: 'qty_100_plus', width: 70, align: 'center', render: v => v || '-' },
        { title: 'GST%', dataIndex: 'gst', width: 70, align: 'center', render: v => v ? `${v}` : '-' },
        { title: 'MRP', dataIndex: 'mrp', width: 70, align: 'center', render: v => v || '-' },
        { title: 'Warranty', dataIndex: 'warranty', width: 100, align: 'center', render: v => v || '-' },

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




    const editItemColumns = [
        { title: 'SL No', dataIndex: 'sl_no_list', width: 80, align: 'center' },
        { title: 'Old Name', dataIndex: 'old_name', width: 250 },
        { title: 'New Name', dataIndex: 'new_name', width: 250 },
        {
            title: 'Action',
            width: 120,
            align: 'center',
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
                        style={{
                            margin: 0,
                            position: 'absolute',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            whiteSpace: 'nowrap'
                        }}
                    >Approval Dashboard
                    </Title>
                </div>

                <Divider orientation="left"><Tag color="blue">NEW PRODUCTS</Tag></Divider>
                <Table columns={columns} dataSource={newData} rowKey="id" loading={loading} pagination={false} scroll={{ x: 1000 }} />

                <Divider orientation="left"><Tag color="orange">EDIT REQUESTS</Tag></Divider>
                <Table columns={columns} dataSource={editData} rowKey="id" loading={loading} pagination={false} scroll={{ x: 1000 }} />

                <Divider orientation="left"><Tag color="red">DELETE REQUESTS</Tag></Divider>
                <Table columns={columns} dataSource={deleteData} rowKey="id" loading={loading} pagination={false} scroll={{ x: 1000 }} />

                <Divider orientation="left"><Tag color="purple">EDIT ITEM NAME REQUESTS</Tag></Divider>
                <Table columns={editItemColumns} dataSource={editItemData} rowKey="id" loading={loading} pagination={false} />
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