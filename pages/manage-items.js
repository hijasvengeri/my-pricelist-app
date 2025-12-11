


// // pages/manage-items.js (Modal Edit Approach)

// import { useState, useEffect, useCallback } from 'react';
// import { Table, Input, Button, Form, message, Popconfirm, Typography, Space, Modal, InputNumber } from 'antd';
// import { supabase } from '../lib/supabaseClient';
// import Link from 'next/link';

// export default function ManageItems() {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
  
//   // State for Modal
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingRecord, setEditingRecord] = useState(null);
//   const [editForm] = Form.useForm();

//   // --- Data Fetching ---
//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     const { data: items, error } = await supabase
//       .from('items_list')
//       .select('*')
//       .order('sl_no_list', { ascending: true });
    
//     if (error) {
//       message.error(`Error fetching items list: ${error.message}`);
//     } else {
//       setData(items.map(i => ({ ...i, key: i.id })));
//     }
//     setLoading(false);
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   // --- Modal Handlers ---

//   const handleEdit = (record) => {
//     // Set the record being edited and open the modal
//     setEditingRecord(record);
//     editForm.setFieldsValue(record); // Load data into the form
//     setIsModalOpen(true);
//   };

//   const handleSave = async () => {
//     try {
//       const values = await editForm.validateFields();
      
//       const key = editingRecord.id;
      
//       // Prevent updating the disabled SL_No List column
//       if (values.sl_no_list) delete values.sl_no_list; 

//       setLoading(true);
//       const { error } = await supabase
//         .from('items_list')
//         .update(values)
//         .eq('id', key);

//       if (error) {
//         message.error(`Update failed: ${error.message}`);
//       } else {
//         message.success('Item list entry updated successfully.');
//         setIsModalOpen(false);
//         setEditingRecord(null);
//         await fetchData(); // Refresh data
//       }
//     } catch (errInfo) {
//       console.log('Validate Failed:', errInfo);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancel = () => {
//     setIsModalOpen(false);
//     setEditingRecord(null);
//     editForm.resetFields();
//   };

//   // --- Delete Handler ---
//   const handleDelete = async (key) => {
//     setLoading(true);
//     const { error } = await supabase
//       .from('items_list')
//       .delete()
//       .eq('id', key);

//     if (error) {
//       message.error(`Deletion failed: ${error.message}`);
//     } else {
//       message.success('Item list entry deleted successfully.');
//       await fetchData(); 
//     }
//     setLoading(false);
//   };

//   // --- Table Columns Definition ---
//   const columns = [
//     { title: 'List SL No', dataIndex: 'sl_no_list', width: 150, align: 'center' },
//     { title: 'Item Name', dataIndex: 'item_name', width: 300 },
//     {
//       title: 'Action',
//       dataIndex: 'operation',
//       width: 150,
//       align: 'center',
//       render: (_, record) => (
//         <Space size="small">
//           <Typography.Link onClick={() => handleEdit(record)}>
//             **Edit**
//           </Typography.Link>
//           <Popconfirm 
//               title="Are you sure to delete this item? This may affect linked products." 
//               onConfirm={() => handleDelete(record.id)}
//               okText="Yes"
//               cancelText="No"
//           >
//             <Button type="link" danger style={{ padding: 0 }}>
//               Delete
//             </Button>
//           </Popconfirm>
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <div style={{ padding: 20 }}>
//       <Space style={{ marginBottom: 20, justifyContent: 'space-between', width: '100%' }}>
//         <h1>Manage Item List Table</h1>
//         <Link href="/">
//           <Button>Back to Home</Button>
//         </Link>
//       </Space>

//       <Table
//         bordered
//         dataSource={data}
//         columns={columns}
//         loading={loading}
//         rowKey="id"
//         pagination={{ pageSize: 20 }}
//         scroll={{ x: 800 }}
//       />

//       {/* --- EDIT MODAL --- */}
//       <Modal
//         title="Edit Item List Entry"
//         open={isModalOpen}
//         onOk={handleSave}
//         onCancel={handleCancel}
//         okText="Save Changes"
//         confirmLoading={loading}
//       >
//         <Form
//           form={editForm}
//           layout="vertical"
//           name="edit_item_form"
//         >
//           <Form.Item label="List SL No" name="sl_no_list">
//             <InputNumber disabled />
//           </Form.Item>

//           <Form.Item 
//             label="Item Name" 
//             name="item_name" 
//             rules={[{ required: true, message: 'Please input item name!' }]}
//           >
//             <Input />
//           </Form.Item>

//         </Form>
//       </Modal>
//     </div>
//   );
// }










// pages/manage-items.js (SL No Editable & Unique Validation)

import { useState, useEffect, useCallback } from 'react';
import { Table, Input, Button, Form, message, Popconfirm, Typography, Space, Modal, InputNumber } from 'antd';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

export default function ManageItems() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm] = Form.useForm();

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: items, error } = await supabase
      .from('items_list')
      .select('*')
      .order('sl_no_list', { ascending: true });
    
    if (error) {
      message.error(`Error fetching items list: ${error.message}`);
    } else {
      setData(items.map(i => ({ ...i, key: i.id })));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Custom Validation Rule for Unique SL No ---
  const validateUniqueSlNo = async (_, value) => {
    if (!value) {
      return Promise.resolve();
    }
    const currentId = editingRecord ? editingRecord.id : null;
    
    // Check if the new SL No already exists in the database
    let query = supabase
        .from('items_list')
        .select('id')
        .eq('sl_no_list', value);

    // If we are editing an existing record, exclude the current record's ID from the check
    if (currentId) {
        query = query.neq('id', currentId);
    }
    
    const { data: existingItems, error } = await query;

    if (error) {
        console.error("Supabase validation error:", error);
        return Promise.reject(new Error('Validation check failed.'));
    }

    if (existingItems && existingItems.length > 0) {
      return Promise.reject(new Error('This SL No is already used. Please choose another one.'));
    }

    return Promise.resolve();
  };


  // --- Modal Handlers ---

  const handleEdit = (record) => {
    // Set the record being edited and open the modal
    setEditingRecord(record);
    editForm.setFieldsValue(record); // Load data into the form
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await editForm.validateFields();
      
      const key = editingRecord.id;

      setLoading(true);
      const { error } = await supabase
        .from('items_list')
        .update(values)
        .eq('id', key);

      if (error) {
        message.error(`Update failed: ${error.message}`);
      } else {
        message.success('Item list entry updated successfully.');
        setIsModalOpen(false);
        setEditingRecord(null);
        await fetchData(); // Refresh data
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    editForm.resetFields();
  };

  // --- Delete Handler ---
  const handleDelete = async (key) => {
    setLoading(true);
    const { error } = await supabase
      .from('items_list')
      .delete()
      .eq('id', key);

    if (error) {
      message.error(`Deletion failed: ${error.message}`);
    } else {
      message.success('Item list entry deleted successfully.');
      await fetchData(); 
    }
    setLoading(false);
  };

  // --- Table Columns Definition ---
  const columns = [
    { title: 'List SL No', dataIndex: 'sl_no_list', width: 150, align: 'center' },
    { title: 'Item Name', dataIndex: 'item_name', width: 300 },
    {
      title: 'Action',
      dataIndex: 'operation',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Typography.Link onClick={() => handleEdit(record)}>
            **Edit**
          </Typography.Link>
          <Popconfirm 
              title="Are you sure to delete this item? This may affect linked products." 
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
          >
            <Button type="link" danger style={{ padding: 0 }}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Space style={{ marginBottom: 20, justifyContent: 'space-between', width: '100%' }}>
        <h1>Manage Item List Table</h1>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </Space>

      <Table
        bordered
        dataSource={data}
        columns={columns}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 20 }}
        scroll={{ x: 800 }}
      />

      {/* --- EDIT MODAL --- */}
      <Modal
        title="Edit Item List Entry"
        open={isModalOpen}
        onOk={handleSave}
        onCancel={handleCancel}
        okText="Save Changes"
        confirmLoading={loading}
      >
        <Form
          form={editForm}
          layout="vertical"
          name="edit_item_form"
        >
          {/* SL NO LIST FIELD - NOW EDITABLE */}
          <Form.Item 
            label="List SL No" 
            name="sl_no_list" 
            rules={[
                { required: true, message: 'Please input the SL No!' },
                // Apply the custom validation rule for uniqueness
                { validator: validateUniqueSlNo } 
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item 
            label="Item Name" 
            name="item_name" 
            rules={[{ required: true, message: 'Please input item name!' }]}
          >
            <Input />
          </Form.Item>

        </Form>
      </Modal>
    </div>
  );
}