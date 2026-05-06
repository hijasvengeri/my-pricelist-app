// import { useState, useEffect } from 'react';
// import { Table, Tag, Typography, Card, Space, Input } from 'antd';
// import { supabase } from '../lib/supabaseClient';
// import dayjs from 'dayjs'; // Recommended for date formatting

// const { Title } = Typography;

// export default function LogsPage() {
//     const [logs, setLogs] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const fetchLogs = async () => {
//         setLoading(true);
//         const { data, error } = await supabase
//             .from('activity_logs')
//             .select('*')
//             .order('created_at', { ascending: false });

//         if (!error) setLogs(data);
//         setLoading(false);
//     };

//     useEffect(() => {
//         fetchLogs();
//     }, []);

//     const columns = [
//         {
//             title: 'Date & Time',
//             dataIndex: 'created_at',
//             key: 'created_at',
//             width: 200,
//             render: (date) => dayjs(date).format('DD MMM YYYY, hh:mm A'),
//         },
//         {
//             title: 'Action',
//             dataIndex: 'action_type',
//             key: 'action_type',
//             render: (type) => {
//                 let color = 'default';
//                 if (type.includes('ADD')) color = 'blue';
//                 if (type.includes('EDIT')) color = 'orange';
//                 if (type === 'APPROVED') color = 'green';
//                 if (type === 'REJECTED') color = 'volcano';
//                 return <Tag color={color}>{type.replace('_', ' ')}</Tag>;
//             },
//         },
//         {
//             title: 'Product',
//             dataIndex: 'product_name',
//             key: 'product_name',
//             render: (text) => <strong>{text}</strong>,
//         },
//         {
//             title: 'Details',
//             dataIndex: 'details',
//             key: 'details',
//         },
//         { 
//             title: 'Remark', 
//             dataIndex: 'remark', 
//             render: text => <Typography.Text type="danger">{text || '-'}</Typography.Text> 
//         },
//     ];

//     return (
//         <div style={{ padding: '30px', background: '#f5f5f5', minHeight: '100vh' }}>
//             <Card>
//                 <Space style={{ marginBottom: 20, justifyContent: 'space-between', width: '100%' }}>
//                     <Title level={2} style={{ margin: 0 }}>System Activity Logs</Title>
//                     <Input.Search 
//                         placeholder="Search product or action..." 
//                         style={{ width: 300 }} 
//                         allowClear
//                     />
//                 </Space>

//                 <Table 
//                     dataSource={logs} 
//                     columns={columns} 
//                     rowKey="id" 
//                     loading={loading}
//                     pagination={{ pageSize: 15 }}
//                 />
//             </Card>
//         </div>
//     );
// }













import { useState, useEffect, useCallback } from 'react';
import { Table, Button, message, Space, Typography, Tag, Input, Card } from 'antd';
import { ArrowLeftOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

// Destructure Text correctly to avoid the "Failed to construct Text" error
const { Title, Text } = Typography;

export default function LogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');

    // ---------------- FETCH LOGS ----------------
    const fetchLogs = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            message.error(`Error fetching logs: ${error.message}`);
        } else {
            setLogs(data);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // ---------------- SEARCH FILTER LOGIC ----------------
    // This logic runs every time searchText or logs change
    const filteredData = logs.filter((record) => {
        const name = (record.product_name || '').toLowerCase();
        const brand = (record.brand_name || '').toLowerCase();
        const details = (record.details || '').toLowerCase();
        const remark = (record.remark || '').toLowerCase();
        const action = (record.action_type || '').toLowerCase();
        const search = searchText.toLowerCase();

        return (
            name.includes(search) ||
            brand.includes(search) ||
            details.includes(search) ||
            remark.includes(search) ||
            action.includes(search)
        );
    });

    // ---------------- TABLE COLUMNS ----------------
    const columns = [
        {
            title: 'Date & Time',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 180,
            render: (date) => new Date(date).toLocaleString('en-IN'),
        },
        {
            title: 'Action',
            dataIndex: 'action_type',
            key: 'action_type',
            width: 120,
            render: (type) => {
                let color = 'blue';
                if (type === 'DELETED' || type === 'REJECTED') color = 'red';
                if (type === 'APPROVED') color = 'green';
                if (type === 'EDIT_REQUEST' || type === 'DELETE_REQUEST') color = 'orange';
                if (type === 'RESUBMITTED') color = 'purple';
                return <Tag color={color}>{type}</Tag>;
            },
        },
        {
            title: 'Product Name',
            dataIndex: 'product_name',
            key: 'product_name',
            width: 200,
            render: (text) => <Text strong>{text || '-'}</Text>,
        },
        {
            title: 'Brand',
            dataIndex: 'brand_name',
            key: 'brand_name',
            width: 250,
            render: (text) => (
                <Text type={text ? "default" : "secondary"}>
                    {text || '-'}
                </Text>
            ),
        },
        {
            title: 'Details',
            dataIndex: 'details',
            key: 'details',
            render: (text) => <Text size="small">{text || '-'}</Text>,
        },
        {
            title: 'Remark',
            dataIndex: 'remark',
            key: 'remark',
            width: 200,
            render: (text) => (
                <Text type={text ? "danger" : "secondary"} italic>
                    {text || 'No remark'}
                </Text>
            ),
        },
    ];

    // ---------------- UI ----------------
    return (
        <div style={{ padding: 30 }}>
            <Card>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                    position: 'relative', // Keeps the Title centered relative to this row
                    gap: '20px'           // Adds a safety gap between items
                }}>
                    {/* LEFT SIDE: Navigation Buttons */}
                    <Space size="middle" style={{ flexShrink: 0 }}>
                        <Link href="/approval-page">
                            <Button icon={<ArrowLeftOutlined />}>Approvals</Button>
                        </Link>
                        <Link href="/">
                            <Button icon={<ArrowLeftOutlined />}>Home</Button>
                        </Link>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={fetchLogs}
                            loading={loading}
                        >
                            Refresh
                        </Button>
                    </Space>

                    {/* CENTER: The Title (Absolute positioned so it doesn't move) */}
                    <Title
                        level={3}
                        style={{
                            margin: 0,
                            position: 'absolute',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            whiteSpace: 'nowrap' // Prevents title from wrapping on small screens
                        }}
                    >
                        Activity Logs
                    </Title>

                    {/* RIGHT SIDE: Search Bar and Refresh Button grouped together */}
                    <Space style={{ flexGrow: 1, justifyContent: 'flex-end' }}>
                        <Input
                            placeholder="Search logs..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: 300 }} // Fixed width so it doesn't overlap the center title
                            allowClear
                        />

                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredData} // Point to the filtered list
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    bordered
                    scroll={{ x: 1000 }}
                />
            </Card>
        </div>
    );
}