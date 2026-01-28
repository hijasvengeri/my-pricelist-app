


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










// // pages/manage-items.js (SL No Editable & Unique Validation)

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

//   // --- Custom Validation Rule for Unique SL No ---
//   const validateUniqueSlNo = async (_, value) => {
//     if (!value) {
//       return Promise.resolve();
//     }
//     const currentId = editingRecord ? editingRecord.id : null;
    
//     // Check if the new SL No already exists in the database
//     let query = supabase
//         .from('items_list')
//         .select('id')
//         .eq('sl_no_list', value);

//     // If we are editing an existing record, exclude the current record's ID from the check
//     if (currentId) {
//         query = query.neq('id', currentId);
//     }
    
//     const { data: existingItems, error } = await query;

//     if (error) {
//         console.error("Supabase validation error:", error);
//         return Promise.reject(new Error('Validation check failed.'));
//     }

//     if (existingItems && existingItems.length > 0) {
//       return Promise.reject(new Error('This SL No is already used. Please choose another one.'));
//     }

//     return Promise.resolve();
//   };


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
//           {/* SL NO LIST FIELD - NOW EDITABLE */}
//           <Form.Item 
//             label="List SL No" 
//             name="sl_no_list" 
//             rules={[
//                 { required: true, message: 'Please input the SL No!' },
//                 // Apply the custom validation rule for uniqueness
//                 { validator: validateUniqueSlNo } 
//             ]}
//           >
//             <InputNumber min={1} style={{ width: '100%' }} />
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











// // pages/manage-items.js
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

//   // --- Custom Validation Rule for Unique SL No ---
//   const validateUniqueSlNo = async (_, value) => {
//     if (!value) return Promise.resolve();
    
//     const currentId = editingRecord ? editingRecord.id : null;
    
//     let query = supabase
//         .from('items_list')
//         .select('id')
//         .eq('sl_no_list', value);

//     if (currentId) {
//         query = query.neq('id', currentId);
//     }
    
//     const { data: existingItems, error } = await query;

//     if (error) {
//         console.error("Supabase validation error:", error);
//         return Promise.reject(new Error('Validation check failed.'));
//     }

//     if (existingItems && existingItems.length > 0) {
//       return Promise.reject(new Error('This SL No is already used. Please choose another one.'));
//     }

//     return Promise.resolve();
//   };

//   // --- Modal Handlers ---
//   const handleEdit = (record) => {
//     setEditingRecord(record);
//     editForm.setFieldsValue(record);
//     setIsModalOpen(true);
//   };

//   const handleSave = async () => {
//     try {
//       const values = await editForm.validateFields();
//       const key = editingRecord.id;

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
//         await fetchData();
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

//   // --- Updated Delete Handler with 'items' Column Check ---
//   const handleDelete = async (record) => {
//     // Check if record exists to prevent "undefined" syntax errors
//     if (!record || !record.id) {
//         message.error("Invalid record data.");
//         return;
//     }

//     setLoading(true);
//     try {
//       // 🛠️ UPDATED: Changed to 'items' to match your Supabase products table
//       const COLUMN_NAME_IN_PRODUCTS = 'items'; 

//       // 1. Check if the item is used in the 'products' table
//       const { data: linkedProducts, error: checkError } = await supabase
//         .from('products')
//         .select('id')
//         .eq(COLUMN_NAME_IN_PRODUCTS, record.item_name)
//         .limit(1);

//       if (checkError) {
//           throw new Error(`Column "${COLUMN_NAME_IN_PRODUCTS}" not found in products table.`);
//       }

//       // 2. Prevent deletion if linked products exist
//       if (linkedProducts && linkedProducts.length > 0) {
//         message.warning(`Cannot delete "${record.item_name}" because it is currently used in the Products table.`);
//         setLoading(false);
//         return;
//       }

//       // 3. If no links found, proceed with deletion
//       const { error: deleteError } = await supabase
//         .from('items_list')
//         .delete()
//         .eq('id', record.id);

//       if (deleteError) throw deleteError;

//       message.success('Item deleted successfully.');
//       await fetchData(); 
//     } catch (err) {
//       console.error("Delete operation failed:", err);
//       message.error(`Deletion failed: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
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
//             Edit
//           </Typography.Link>
//           <Popconfirm 
//               title={`Are you sure you want to delete "${record.item_name}"?`} 
//               onConfirm={() => handleDelete(record)} // Passes full record to the handler
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
//         <Typography.Title level={2}>Manage Item List Table</Typography.Title>
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
//         size="small"  // Adds standard compact styling
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
//         <Form form={editForm} layout="vertical" name="edit_item_form">
//           <Form.Item 
//             label="List SL No" 
//             name="sl_no_list" 
//             rules={[
//                 { required: true, message: 'Please input the SL No!' },
//                 { validator: validateUniqueSlNo } 
//             ]}
//           >
//             <InputNumber min={1} style={{ width: '100%' }} />
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






// with buttons and searchbar



// pages/manage-items.js     




// import { useState, useEffect, useCallback } from 'react';
// import { Table, Input, Button, Form, message, Popconfirm, Typography, Space, Modal, InputNumber, Tooltip } from 'antd';
// import { EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'; // Import Icons
// import { supabase } from '../lib/supabaseClient';
// import Link from 'next/link';

// const { Search } = Input;

// export default function ManageItems() {
//   const [data, setData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]); // State for search results
//   const [loading, setLoading] = useState(true);
//   const [searchText, setSearchText] = useState('');
  
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
//       const formattedData = items.map(i => ({ ...i, key: i.id }));
//       setData(formattedData);
//       setFilteredData(formattedData); // Initialize filtered data
//     }
//     setLoading(false);
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   // --- Search Logic ---
//   const handleSearch = (value) => {
//     setSearchText(value);
//     const lowerCaseValue = value.toLowerCase();
//     const filtered = data.filter(item => 
//       item.item_name.toLowerCase().includes(lowerCaseValue) ||
//       item.sl_no_list.toString().includes(lowerCaseValue)
//     );
//     setFilteredData(filtered);
//   };

//   // --- Custom Validation Rule for Unique SL No ---
//   const validateUniqueSlNo = async (_, value) => {
//     if (!value) return Promise.resolve();
//     const currentId = editingRecord ? editingRecord.id : null;
//     let query = supabase.from('items_list').select('id').eq('sl_no_list', value);
//     if (currentId) { query = query.neq('id', currentId); }
//     const { data: existingItems, error } = await query;
//     if (error) return Promise.reject(new Error('Validation check failed.'));
//     if (existingItems && existingItems.length > 0) {
//       return Promise.reject(new Error('This SL No is already used.'));
//     }
//     return Promise.resolve();
//   };

//   // --- Modal Handlers ---
//   const handleEdit = (record) => {
//     setEditingRecord(record);
//     editForm.setFieldsValue(record);
//     setIsModalOpen(true);
//   };

//   const handleSave = async () => {
//     try {
//       const values = await editForm.validateFields();
//       setLoading(true);
//       const { error } = await supabase.from('items_list').update(values).eq('id', editingRecord.id);
//       if (error) {
//         message.error(`Update failed: ${error.message}`);
//       } else {
//         message.success('Updated successfully.');
//         setIsModalOpen(false);
//         setEditingRecord(null);
//         await fetchData();
//       }
//     } catch (errInfo) { console.log('Validate Failed:', errInfo); } 
//     finally { setLoading(false); }
//   };

//   const handleCancel = () => {
//     setIsModalOpen(false);
//     setEditingRecord(null);
//     editForm.resetFields();
//   };

//   const handleDelete = async (record) => {
//     setLoading(true);
//     try {
//       const { data: linkedProducts } = await supabase
//         .from('products')
//         .select('id')
//         .eq('items', record.item_name)
//         .limit(1);

//       if (linkedProducts && linkedProducts.length > 0) {
//         message.warning(`Used in Products table. Cannot delete.`);
//         return;
//       }

//       const { error } = await supabase.from('items_list').delete().eq('id', record.id);
//       if (error) throw error;
//       message.success('Deleted successfully.');
//       await fetchData(); 
//     } catch (err) {
//       message.error(`Deletion failed: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Table Columns Definition ---
//   const columns = [
//     { title: 'List SL No', dataIndex: 'sl_no_list', width: 100, align: 'center' },
//     { title: 'Item Name', dataIndex: 'item_name', width: 400 },
//     {
//       title: 'Action',
//       dataIndex: 'operation',
//       width: 120,
//       align: 'center',
//       render: (_, record) => (
//         <Space size="middle">
//           <Tooltip title="Edit Item">
//             <Button 
//               type="primary" 
//               shape="circle" 
//               icon={<EditOutlined />} 
//               onClick={() => handleEdit(record)} 
//             />
//           </Tooltip>
          
//           <Popconfirm 
//               title={`Delete "${record.item_name}"?`} 
//               onConfirm={() => handleDelete(record)}
//               okText="Yes"
//               cancelText="No"
//           >
//             <Tooltip title="Delete Item">
//               <Button 
//                 type="primary" 
//                 danger 
//                 shape="circle" 
//                 icon={<DeleteOutlined />} 
//               />
//             </Tooltip>
//           </Popconfirm>
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <div style={{ padding: 20 }}>
//       <Typography.Title level={2}>Manage Item List Table</Typography.Title>
      
//       {/* Search and Navigation Bar */}
//       <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
//         <Search
//           placeholder="Search by item name or SL No..."
//           allowClear
//           enterButton={<SearchOutlined />}
//           size="large"
//           onSearch={handleSearch}
//           onChange={(e) => handleSearch(e.target.value)}
//           style={{ maxWidth: 400 }}
//         />
//         <Link href="/">
//           <Button size="large">Back to Home</Button>
//         </Link>
//       </div>

//       <Table
//         bordered
//         dataSource={filteredData} // Use filtered data here
//         columns={columns}
//         loading={loading}
//         rowKey="id"
//         size="middle"
//         pagination={{ pageSize: 20, showSizeChanger: false }}
//         scroll={{ x: 600 }}
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
//         <Form form={editForm} layout="vertical">
//           <Form.Item 
//             label="List SL No" 
//             name="sl_no_list" 
//             rules={[{ required: true, message: 'Required' }, { validator: validateUniqueSlNo }]}
//           >
//             <InputNumber min={1} style={{ width: '100%' }} />
//           </Form.Item>

//           <Form.Item 
//             label="Item Name" 
//             name="item_name" 
//             rules={[{ required: true, message: 'Required' }]}
//           >
//             <Input />
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// }













// with buttons and searchbar and next sl no displayed



// // pages/manage-items.js
// import { useState, useEffect, useCallback } from 'react';
// import { 
//   Table, Input, Button, Form, message, Popconfirm, 
//   Typography, Space, Modal, InputNumber, Tooltip, Badge 
// } from 'antd';
// import { 
//   EditOutlined, DeleteOutlined, SearchOutlined, 
//   SyncOutlined, PlusOutlined 
// } from '@ant-design/icons';
// import { supabase } from '../lib/supabaseClient';
// import Link from 'next/link';

// const { Search } = Input;

// export default function ManageItems() {
//   const [data, setData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchText, setSearchText] = useState('');
//   const [nextSlNo, setNextSlNo] = useState(1);
  
//   // State for Modal
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingRecord, setEditingRecord] = useState(null); // null = Add, object = Edit
//   const [editForm] = Form.useForm();

//   // --- 1. CORE DATA FETCHING ---
//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     const { data: items, error } = await supabase
//       .from('items_list')
//       .select('*')
//       .order('sl_no_list', { ascending: true });
    
//     if (error) {
//       message.error(`Error fetching items list: ${error.message}`);
//     } else {
//       const formattedData = items.map(i => ({ ...i, key: i.id }));
//       setData(formattedData);
      
//       // Calculate Next SL No
//       const maxSl = items.length > 0 ? Math.max(...items.map(i => i.sl_no_list || 0)) : 0;
//       setNextSlNo(maxSl + 1);

//       // Re-apply filter to the new data
//       const lowerCaseValue = searchText.toLowerCase();
//       const filtered = formattedData.filter(item => 
//         item.item_name.toLowerCase().includes(lowerCaseValue) ||
//         item.sl_no_list.toString().includes(lowerCaseValue)
//       );
//       setFilteredData(filtered);
//     }
//     setLoading(false);
//   }, [searchText]);

//   // --- 2. REALTIME (AUTOLOAD) INTEGRATION ---
//   useEffect(() => {
//     fetchData();

//     const channel = supabase
//       .channel('realtime_items_list')
//       .on(
//         'postgres_changes',
//         { event: '*', table: 'items_list', schema: 'public' },
//         () => {
//           fetchData(); 
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [fetchData]);

//   // --- 3. SEARCH HANDLER ---
//   const handleSearch = (value) => {
//     setSearchText(value);
//     const lowerCaseValue = value.toLowerCase();
//     const filtered = data.filter(item => 
//       item.item_name.toLowerCase().includes(lowerCaseValue) ||
//       item.sl_no_list.toString().includes(lowerCaseValue)
//     );
//     setFilteredData(filtered);
//   };

//   // --- 4. VALIDATION RULE (FIXES THE REFERENCE ERROR) ---
//   const validateUniqueSlNo = async (_, value) => {
//     if (!value) return Promise.resolve();
    
//     const currentId = editingRecord ? editingRecord.id : null;
    
//     let query = supabase
//         .from('items_list')
//         .select('id')
//         .eq('sl_no_list', value);

//     if (currentId) {
//         query = query.neq('id', currentId);
//     }
    
//     const { data: existingItems, error } = await query;

//     if (error) return Promise.reject(new Error('Database check failed.'));

//     if (existingItems && existingItems.length > 0) {
//       return Promise.reject(new Error('This SL No is already used.'));
//     }

//     return Promise.resolve();
//   };

//   // --- 5. ACTION HANDLERS ---
//   const handleAddNew = () => {
//     setEditingRecord(null);
//     editForm.resetFields();
//     // Pre-fill the next available SL no
//     editForm.setFieldsValue({
//       sl_no_list: nextSlNo 
//     });
//     setIsModalOpen(true);
//   };

//   const handleEdit = (record) => {
//     setEditingRecord(record);
//     editForm.setFieldsValue(record);
//     setIsModalOpen(true);
//   };

//   const handleSave = async () => {
//     try {
//       const values = await editForm.validateFields();
//       setLoading(true);

//       if (editingRecord) {
//         // Update
//         const { error } = await supabase.from('items_list').update(values).eq('id', editingRecord.id);
//         if (error) throw error;
//         message.success('Item updated');
//       } else {
//         // Insert
//         const { error } = await supabase.from('items_list').insert([values]);
//         if (error) throw error;
//         message.success('New item added');
//       }

//       setIsModalOpen(false);
//     } catch (err) {
//       if (err.errorFields) return; // Validation failed
//       message.error(`Operation failed: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (record) => {
//     setLoading(true);
//     try {
//       // Check if item name is used in products table
//       const { data: linked } = await supabase.from('products').select('id').eq('items', record.item_name).limit(1);
      
//       if (linked && linked.length > 0) {
//         message.warning(`Cannot delete: "${record.item_name}" is in use.`);
//         return;
//       }

//       const { error } = await supabase.from('items_list').delete().eq('id', record.id);
//       if (error) throw error;
//       message.success('Deleted successfully');
//     } catch (err) {
//       message.error(`Error: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const columns = [
//     { title: 'List SL No', dataIndex: 'sl_no_list', width: 100, align: 'center', sorter: (a, b) => a.sl_no_list - b.sl_no_list },
//     { title: 'Item Name', dataIndex: 'item_name', width: 400 },
//     {
//       title: 'Action',
//       width: 120,
//       align: 'center',
//       render: (_, record) => (
//         <Space size="middle">
//           <Tooltip title="Edit">
//             <Button type="primary" shape="circle" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
//           </Tooltip>
//           <Popconfirm title={`Delete ${record.item_name}?`} onConfirm={() => handleDelete(record)}>
//             <Tooltip title="Delete">
//               <Button type="primary" danger shape="circle" icon={<DeleteOutlined />} />
//             </Tooltip>
//           </Popconfirm>
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
//       <Space direction="vertical" size="large" style={{ width: '100%' }}>
        
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <Typography.Title level={2} style={{ margin: 0 }}>Manage Item List</Typography.Title>
//           <Space>
//             <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew} size="large">
//               Add New Item
//             </Button>
//             <Link href="/">
//               <Button size="large">Back to Home</Button>
//             </Link>
//           </Space>
//         </div>

//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
//           <Search
//             placeholder="Search name or SL No..."
//             allowClear
//             size="large"
//             onChange={(e) => handleSearch(e.target.value)}
//             style={{ width: 400 }}
//           />
          
//           <Badge 
//             count={`Next Available: ${nextSlNo}`} 
//             style={{ backgroundColor: '#52c41a', fontSize: '14px', height: '28px', lineHeight: '28px', padding: '0 12px' }} 
//           />
//         </div>

//         <Table
//           bordered
//           dataSource={filteredData}
//           columns={columns}
//           loading={loading}
//           rowKey="id"
//           pagination={{ pageSize: 15 }}
//           scroll={{ x: 600 }}
//           footer={() => loading ? <SyncOutlined spin /> : 'Realtime Sync Active'}
//         />
//       </Space>

//       <Modal
//         title={editingRecord ? "Edit Item" : "Add New Item"}
//         open={isModalOpen}
//         onOk={handleSave}
//         onCancel={() => setIsModalOpen(false)}
//         okText={editingRecord ? "Update" : "Add Item"}
//         confirmLoading={loading}
//       >
//         <Form form={editForm} layout="vertical">
//           <Form.Item 
//             label="List SL No" 
//             name="sl_no_list" 
//             extra={
//                 <Typography.Text type="success" strong>
//                   Next Available SL No: {nextSlNo}
//                 </Typography.Text>
//             }
//             rules={[
//               { required: true, message: 'Please enter SL No' },
//               { validator: validateUniqueSlNo }
//             ]}
//           >
//             <InputNumber min={1} style={{ width: '100%' }} />
//           </Form.Item>

//           <Form.Item 
//             label="Item Name" 
//             name="item_name" 
//             rules={[{ required: true, message: 'Please enter item name' }]}
//           >
//             <Input placeholder="Enter unique item name" />
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// }








// // button added searchbox, next sl no, 


// // pages/manage-items.js
// import { useState, useEffect, useCallback } from 'react';
// import { 
//   Table, Input, Button, Form, message, Popconfirm, 
//   Typography, Space, Modal, InputNumber, Tooltip, Badge 
// } from 'antd';
// import { 
//   EditOutlined, DeleteOutlined, SearchOutlined, 
//   SyncOutlined, PlusOutlined 
// } from '@ant-design/icons';
// import { supabase } from '../lib/supabaseClient';
// import Link from 'next/link';

// const { Search } = Input;

// export default function ManageItems() {
//   const [data, setData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchText, setSearchText] = useState('');
//   const [nextSlNo, setNextSlNo] = useState(1);
  
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingRecord, setEditingRecord] = useState(null);
//   const [editForm] = Form.useForm();

//   // --- 1. DATA FETCHING (Stable: Only runs on load or manual refresh) ---
//   const fetchData = useCallback(async (isInitial = false) => {
//     if (isInitial) setLoading(true);
//     const { data: items, error } = await supabase
//       .from('items_list')
//       .select('*')
//       .order('sl_no_list', { ascending: true });
    
//     if (error) {
//       message.error(`Fetch error: ${error.message}`);
//     } else {
//       const formattedData = items.map(i => ({ ...i, key: i.id }));
//       setData(formattedData);
//       updateFilteredView(formattedData, searchText);
      
//       const maxSl = items.length > 0 ? Math.max(...items.map(i => i.sl_no_list || 0)) : 0;
//       setNextSlNo(maxSl + 1);
//     }
//     setLoading(false);
//   }, [searchText]);

//   const updateFilteredView = (allData, search) => {
//     const s = search.toLowerCase();
//     setFilteredData(allData.filter(item => 
//       item.item_name.toLowerCase().includes(s) ||
//       item.sl_no_list.toString().includes(s)
//     ));
//   };

//   useEffect(() => {
//     fetchData(true);
//   }, []); 

//   // --- 2. SEARCH ---
//   const handleSearch = (value) => {
//     setSearchText(value);
//     updateFilteredView(data, value);
//   };

//   // --- 3. VALIDATION ---
//   const validateUniqueSlNo = async (_, value) => {
//     if (!value || (editingRecord && value === editingRecord.sl_no_list)) return Promise.resolve();
//     const { data: existing } = await supabase.from('items_list').select('id').eq('sl_no_list', value);
//     if (existing && existing.length > 0) return Promise.reject(new Error('SL No already in use!'));
//     return Promise.resolve();
//   };

//   // --- 4. ACTION HANDLERS ---
//   const handleAddNew = () => {
//     setEditingRecord(null);
//     editForm.resetFields();
//     editForm.setFieldsValue({ sl_no_list: nextSlNo });
//     setIsModalOpen(true);
//   };

//   const handleEdit = (record) => {
//     setEditingRecord(record);
//     editForm.setFieldsValue({
//         sl_no_list: record.sl_no_list,
//         item_name: record.item_name
//     });
//     setIsModalOpen(true);
//   };

//   const handleSave = async () => {
//     try {
//       const values = await editForm.validateFields();
//       setLoading(true);

//       if (editingRecord) {
//         // UPDATE
//         const { error } = await supabase.from('items_list').update(values).eq('id', editingRecord.id);
//         if (error) throw error;
        
//         // Update local state so row stays in place (Stable UI)
//         const updatedData = data.map(item => 
//           item.id === editingRecord.id ? { ...item, ...values } : item
//         );
//         setData(updatedData);
//         updateFilteredView(updatedData, searchText);
//         message.success('Updated successfully');
//       } else {
//         // INSERT
//         const { error } = await supabase.from('items_list').insert([values]);
//         if (error) throw error;
//         message.success('Added successfully. Click refresh to sort.');
//         await fetchData(false);
//       }
//       setIsModalOpen(false);
//     } catch (err) {
//       message.error(`Error: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (record) => {
//     setLoading(true);
//     try {
//       // 1. Check if used in Products
//       const { data: linked } = await supabase.from('products').select('id').eq('items', record.item_name).limit(1);
//       if (linked && linked.length > 0) {
//         message.warning(`Cannot delete: "${record.item_name}" is used in Products table.`);
//         return;
//       }
//       // 2. Delete from items_list
//       const { error } = await supabase.from('items_list').delete().eq('id', record.id);
//       if (error) throw error;

//       // 3. Update local state
//       const updatedData = data.filter(item => item.id !== record.id);
//       setData(updatedData);
//       updateFilteredView(updatedData, searchText);
//       message.success('Deleted successfully');
//     } catch (err) {
//       message.error(`Delete failed: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const columns = [
//     { title: 'SL No', dataIndex: 'sl_no_list', width: 80, align: 'center', sorter: (a, b) => a.sl_no_list - b.sl_no_list },
//     { title: 'Item Name', dataIndex: 'item_name', width: 350 },
//     {
//       title: 'Action',
//       width: 120,
//       align: 'center',
//       render: (_, record) => (
//         <Space size="middle">
//           <Tooltip title="Edit">
//             <Button type="primary" shape="circle" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
//           </Tooltip>
//           <Popconfirm title={`Delete ${record.item_name}?`} onConfirm={() => handleDelete(record)}>
//             <Tooltip title="Delete">
//               <Button type="primary" danger shape="circle" icon={<DeleteOutlined />} />
//             </Tooltip>
//           </Popconfirm>
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
//       <Space direction="vertical" style={{ width: '100%' }} size="large">
        
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <Typography.Title level={2} style={{ margin: 0 }}>Manage Item List</Typography.Title>
//           <Space>
//             <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>Add New Item</Button>
//             <Button icon={<SyncOutlined />} onClick={() => fetchData(true)}>Refresh & Sort</Button>
//             <Link href="/"><Button>Home</Button></Link>
//           </Space>
//         </div>

//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
//           <Search
//             placeholder="Search name or SL No..."
//             allowClear
//             size="large"
//             onChange={(e) => handleSearch(e.target.value)}
//             style={{ width: 400 }}
//           />
//           <Badge count={`Next Avail: ${nextSlNo}`} style={{ backgroundColor: '#52c41a' }} />
//         </div>

//         <Table
//           bordered
//           dataSource={filteredData}
//           columns={columns}
//           loading={loading}
//           rowKey="id"
//           pagination={{ pageSize: 20 }}
//           scroll={{ x: 600 }}
//         />
//       </Space>

//       <Modal
//         title={editingRecord ? "Edit Item" : "Add New Item"}
//         open={isModalOpen}
//         onOk={handleSave}
//         onCancel={() => setIsModalOpen(false)}
//         destroyOnClose
//         confirmLoading={loading}
//       >
//         <Form form={editForm} layout="vertical">
//           <Form.Item 
//             label="SL No" 
//             name="sl_no_list" 
//             extra={`Available Next: ${nextSlNo}`}
//             rules={[{ required: true }, { validator: validateUniqueSlNo }]}
//           >
//             <InputNumber style={{ width: '100%' }} />
//           </Form.Item>
//           <Form.Item label="Item Name" name="item_name" rules={[{ required: true }]}>
//             <Input placeholder="Enter item name" />
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// }















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

  const handleSave = async () => {
    try {
      const values = await editForm.validateFields();
      setLoading(true);

      if (editingRecord) {
        const { error } = await supabase.from('items_list').update(values).eq('id', editingRecord.id);
        if (error) throw error;
        const updatedData = data.map(item => item.id === editingRecord.id ? { ...item, ...values } : item);
        setData(updatedData);
        updateFilteredView(updatedData, searchText);
        message.success('Updated successfully');
      } else {
        const { error } = await supabase.from('items_list').insert([values]);
        if (error) throw error;
        message.success('Added successfully');
        await fetchData(false);
      }
      setIsModalOpen(false);
    } catch (err) {
      message.error(`Error: ${err.message}`);
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