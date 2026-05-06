



// pages/manage-items.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table, Input, Button, Form, message, Popconfirm,
  Typography, Space, Modal, InputNumber, Tooltip, Badge, Alert
} from 'antd';
import {
  EditOutlined, DeleteOutlined, SearchOutlined,
  SyncOutlined, PlusOutlined, WarningOutlined
} from '@ant-design/icons';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

const { Search } = Input;

export default function ManageItems() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [nextSlNo, setNextSlNo] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm] = Form.useForm();
  

  // --- 1. GAP DETECTION LOGIC ---
  const missingSlNos = useMemo(() => {
    if (data.length === 0) return [];

    // Get all current SL Nos and sort them
    const existingNos = data.map(item => item.sl_no_list).sort((a, b) => a - b);
    const maxNo = Math.max(...existingNos);
    const gaps = [];

    // Check for every number from 1 to the highest number present
    for (let i = 1; i < maxNo; i++) {
      if (!existingNos.includes(i)) {
        gaps.push(i);
      }
    }
    return gaps;
  }, [data]);

  // --- 2. DATA FETCHING ---
  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    const { data: items, error } = await supabase
      .from('items_list')
      .select('*')
      .order('sl_no_list', { ascending: true });

    if (error) {
      message.error(`Fetch error: ${error.message}`);
    } else {
      const formattedData = items.map(i => ({ ...i, key: i.id }));
      setData(formattedData);
      updateFilteredView(formattedData, searchText);

      const maxSl = items.length > 0 ? Math.max(...items.map(i => i.sl_no_list || 0)) : 0;
      setNextSlNo(maxSl + 1);
    }
    setLoading(false);
  }, [searchText]);

  const updateFilteredView = (allData, search) => {
    const s = search.toLowerCase();
    setFilteredData(allData.filter(item =>
      item.item_name.toLowerCase().includes(s) ||
      item.sl_no_list.toString().includes(s)
    ));
  };

  useEffect(() => {
    fetchData(true);
  }, []);

  // --- 3. SEARCH & VALIDATION ---
  const handleSearch = (value) => {
    setSearchText(value);
    updateFilteredView(data, value);
  };

  const validateUniqueSlNo = async (_, value) => {
    if (!value || (editingRecord && value === editingRecord.sl_no_list)) return Promise.resolve();
    const { data: existing } = await supabase.from('items_list').select('id').eq('sl_no_list', value);
    if (existing && existing.length > 0) return Promise.reject(new Error('SL No already in use!'));
    return Promise.resolve();
  };

  // --- 4. ACTION HANDLERS ---
  const handleAddNew = () => {
    setEditingRecord(null);
    editForm.resetFields();
    // If there are gaps, suggest the first missing number, otherwise suggest nextSlNo
    const suggested = missingSlNos.length > 0 ? missingSlNos[0] : nextSlNo;
    editForm.setFieldsValue({ sl_no_list: suggested });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    editForm.setFieldsValue({
      sl_no_list: record.sl_no_list,
      item_name: record.item_name
    });
    setIsModalOpen(true);
  };

  // const handleSave = async () => {
  //   try {
  //     const values = await editForm.validateFields();
  //     setLoading(true);

  //     if (editingRecord) {
  //       const { error } = await supabase.from('items_list').update(values).eq('id', editingRecord.id);
  //       if (error) throw error;
  //       const updatedData = data.map(item => item.id === editingRecord.id ? { ...item, ...values } : item);
  //       setData(updatedData);
  //       updateFilteredView(updatedData, searchText);
  //       message.success('Updated successfully');
  //     } else {
  //       const { error } = await supabase.from('items_list').insert([values]);
  //       if (error) throw error;
  //       message.success('Added successfully');
  //       await fetchData(false);
  //     }
  //     setIsModalOpen(false);
  //   } catch (err) {
  //     message.error(`Error: ${err.message}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };













  const handleSave = async () => {
    try {
      const values = await editForm.validateFields();
      setLoading(true);

      if (editingRecord) {
        const { error } = await supabase
          .from('staged_items')
          .insert([{
            staging_type: 'EDIT_ITEM',
            item_id: editingRecord.id,
            old_name: editingRecord.item_name,
            new_name: values.item_name,
            sl_no_list: values.sl_no_list
          }]);

        if (error) throw error;

        message.success('Edit request sent for approval!');
      } else {
        const { error } = await supabase
          .from('staged_items')
          .insert([{
            staging_type: 'ADD_ITEM',
            new_name: values.item_name,
            sl_no_list: values.sl_no_list
          }]);

        if (error) throw error;

        message.success('New item sent for approval!');
      }

      setIsModalOpen(false);
      await fetchData(false);

    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };








  const handleDelete = async (record) => {
    setLoading(true);
    try {
      const { data: linked } = await supabase.from('products').select('id').eq('items', record.item_name).limit(1);
      if (linked && linked.length > 0) {
        message.warning(`Cannot delete: "${record.item_name}" is in use.`);
        return;
      }
      const { error } = await supabase.from('items_list').delete().eq('id', record.id);
      if (error) throw error;
      const updatedData = data.filter(item => item.id !== record.id);
      setData(updatedData);
      updateFilteredView(updatedData, searchText);
      message.success('Deleted successfully');
    } catch (err) {
      message.error(`Delete failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'SL No', dataIndex: 'sl_no_list', width: 80, align: 'center', sorter: (a, b) => a.sl_no_list - b.sl_no_list },
    { title: 'Item Name', dataIndex: 'item_name', width: 350 },
    {
      title: 'Action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" shape="circle" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title={`Delete ${record.item_name}?`} onConfirm={() => handleDelete(record)}>
            <Button type="primary" danger shape="circle" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography.Title level={2} style={{ margin: 0 }}>Manage Item List</Typography.Title>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>Add New Item</Button>
            <Button icon={<SyncOutlined />} onClick={() => fetchData(true)}>Refresh & Sort</Button>
            <Link href="/"><Button>Home</Button></Link>
          </Space>
        </div>

        {/* --- MISSING SL NO NOTIFICATION --- */}
        {missingSlNos.length > 0 && (
          <Alert
            message="Missing Sequence Detected"
            description={`The following SL Numbers are missing in your list: ${missingSlNos.join(', ')}. You should fill these gaps to maintain a continuous index.`}
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            closable
          />
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <Search
            placeholder="Search name or SL No..."
            allowClear
            size="large"
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 400 }}
          />
          <Badge count={`Next Avail: ${nextSlNo}`} style={{ backgroundColor: '#52c41a' }} />
        </div>

        <Table
          bordered
          dataSource={filteredData}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 20 }}
          scroll={{ x: 600 }}
        />
      </Space>

      <Modal
        title={editingRecord ? "Edit Item" : "Add New Item"}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
        confirmLoading={loading}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            label="SL No"
            name="sl_no_list"
            extra={missingSlNos.length > 0 ? `Fill missing No: ${missingSlNos[0]}` : `Suggested: ${nextSlNo}`}
            rules={[{ required: true }, { validator: validateUniqueSlNo }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Item Name" name="item_name" rules={[{ required: true }]}>
            <Input placeholder="Enter item name" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}