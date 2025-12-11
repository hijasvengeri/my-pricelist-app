



// import { useState, useEffect, useCallback, useMemo } from 'react';
// import { Table, Input, InputNumber, Button, Form, message, Popconfirm, Typography, Space, Modal, Select, Divider } from 'antd';
// import { PlusOutlined } from '@ant-design/icons';
// import { supabase } from '../lib/supabaseClient';
// import Link from 'next/link';

// const { Option } = Select;

// // ------------------------------------------------------------------
// // --- NESTED COMPONENT: NEW ITEM CREATION MODAL ---
// // ------------------------------------------------------------------

// const NewItemModal = ({ isVisible, onClose, onCreated, existingItems }) => {
//   const [form] = Form.useForm();
//   const [loading, setLoading] = useState(false);

//   const handleCreate = async () => {
//     try {
//       const values = await form.validateFields();
//       setLoading(true);

//       // --- Custom Validation: Check for uniqueness based on existing list ---
//       if (existingItems.includes(values.item_name)) {
//         message.error(`Item "${values.item_name}" already exists.`);
//         setLoading(false);
//         return;
//       }
      
//       // Get the highest existing SL No list and increment for the new item
//       const { data: maxSlNoData, error: maxError } = await supabase
//         .from('items_list')
//         .select('sl_no_list')
//         .order('sl_no_list', { ascending: false })
//         .limit(1);

//       if (maxError) throw maxError;
      
//       const newSlNo = maxSlNoData.length > 0 ? maxSlNoData[0].sl_no_list + 1 : 1;

//       // Insert the new item into the items_list table
//       const { error } = await supabase
//         .from('items_list')
//         .insert({ 
//           item_name: values.item_name,
//           sl_no_list: newSlNo 
//         });

//       if (error) throw error;

//       message.success(`Item "${values.item_name}" created successfully with SL No ${newSlNo}.`);
//       form.resetFields();
//       onCreated(values.item_name); // Notify parent component
//       onClose();

//     } catch (error) {
//       console.error('Item creation error:', error);
//       message.error(`Creation failed: ${error.message || 'Unknown error'}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal
//       title="Create New Item"
//       open={isVisible}
//       onOk={handleCreate}
//       onCancel={onClose}
//       okText="Create Item"
//       confirmLoading={loading}
//     >
//       <Form
//         form={form}
//         layout="vertical"
//         name="create_new_item_form"
//         style={{ marginTop: 20 }}
//       >
//         <Form.Item 
//           label="Item Name" 
//           name="item_name" 
//           rules={[{ required: true, message: 'Please enter the new item name!' }]}
//         >
//           <Input placeholder="e.g., HDMI Cable 10m" />
//         </Form.Item>
//         <Typography.Text type="secondary">
//             A unique SL No will be automatically assigned.
//         </Typography.Text>
//       </Form>
//     </Modal>
//   );
// };

// // ------------------------------------------------------------------
// // --- MAIN COMPONENT: MANAGE PRODUCTS ---
// // ------------------------------------------------------------------

// // ...
// export default function ManageProducts() {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState(''); 
//   
//   // State for Edit Modal
// // ... (rest of component)
  
//   // State for Edit Modal
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingRecord, setEditingRecord] = useState(null);
//   const [editForm] = Form.useForm();
//   const [existingItems, setExistingItems] = useState([]);
  
//   // State for New Item Modal
//   const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);

//   // --- Utility Function: Fetch SL No based on Item Name ---
//   const fetchSlNoByItem = async (itemName) => {
//     if (!itemName) return null;
    
//     const { data: itemData, error } = await supabase
//         .from('items_list')
//         .select('sl_no_list')
//         .eq('item_name', itemName)
//         .single();
    
//     if (error) {
//         console.error("Error fetching SL No:", error);
//         return null;
//     }
//     return itemData ? itemData.sl_no_list : null;
//   };

//   // --- Item Change Handler (Updates SL No field in the form) ---
//   const handleItemChange = async (itemName) => {
//     const newSlNo = await fetchSlNoByItem(itemName);
//     editForm.setFieldsValue({ sl_no: newSlNo });
//   };

//   // --- Data Fetching ---
//   const fetchItemsList = useCallback(async () => {
//     const { data: items, error } = await supabase
//         .from('items_list')
//         .select('item_name')
//         .order('item_name', { ascending: true });
    
//     if (!error) {
//         setExistingItems(items.map(i => i.item_name));
//     }
//   }, []);

//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     const { data: products, error } = await supabase
//       .from('products')
//       .select('*')
//       .order('sl_no', { ascending: true })
//       .order('brand', { ascending: true });
    
//     if (error) {
//       message.error(`Error fetching products: ${error.message}`);
//     } else {
//       setData(products.map(p => ({ ...p, key: p.id })));
//     }
//     setLoading(false);
//   }, []);

//   useEffect(() => {
//     fetchData();
//     fetchItemsList();
//   }, [fetchData, fetchItemsList]);



//   const filteredData = useMemo(() => { 
//     if (!searchTerm) return data;
//     const lowerCaseSearchTerm = searchTerm.toLowerCase();
//     return data.filter(product =>
//       (product.items && product.items.toLowerCase().includes(lowerCaseSearchTerm)) ||
//       (product.brand && product.brand.toLowerCase().includes(lowerCaseSearchTerm))
//     );
//   }, [data, searchTerm]);

//   // ADD THIS FUNCTION:
//   const handleSearch = (value) => {
//     setSearchTerm(value);
//   };


//   // --- Item Creation Handlers (called by NewItemModal) ---
//   const handleNewItemCreated = (newItemName) => {
//     // 1. Refetch the items list to include the new item
//     fetchItemsList();
//     // 2. Automatically select the newly created item in the product edit form
//     editForm.setFieldsValue({ items: newItemName });
//     // 3. Trigger the SL No update for the newly selected item
//     handleItemChange(newItemName);
//     if (record.items) {
//     handleItemChange(record.items); 
// }
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
      
//       // Use the dynamically updated SL No from the form state
//       const finalSlNo = values.sl_no;
      
//       const updatePayload = {
//           ...values,
//           sl_no: finalSlNo
//       };
      
//       // Clean up fields that shouldn't be updated 
//     //   if (updatePayload.product_image) delete updatePayload.product_image; 

//       setLoading(true);
//       const { error } = await supabase
//         .from('products')
//         .update(updatePayload)
//         .eq('id', key);

//       if (error) throw error;

//       message.success('Product updated successfully.');
//       setIsModalOpen(false);
//       setEditingRecord(null);
//       await fetchData(); 
      
//     } catch (errInfo) {
//       console.log('Validate Failed:', errInfo);
//       if (errInfo.message) message.error(`Save failed: ${errInfo.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancel = () => {
//     setIsModalOpen(false);
//     setEditingRecord(null);
//     editForm.resetFields();
//   };

//   // --- Delete Handler (Unchanged) ---
//   const handleDelete = async (key) => {
//     setLoading(true);
//     const { error } = await supabase
//       .from('products')
//       .delete()
//       .eq('id', key);

//     if (error) {
//       message.error(`Deletion failed: ${error.message}`);
//     } else {
//       message.success('Product deleted successfully.');
//       await fetchData(); 
//     }
//     setLoading(false);
//   };

//   // --- Table Columns Definition (Unchanged) ---
//   const columns = [
//     { title: 'SL No', dataIndex: 'sl_no', width: 60, align: 'center' }, 
//     { title: 'Item', dataIndex: 'items', width: 130 },
//     { title: 'Brand', dataIndex: 'brand', width: 130 },
//     { title: 'Single', dataIndex: 'single', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: '5+', dataIndex: 'qty_5_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: '10+', dataIndex: 'qty_10_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: '20+', dataIndex: 'qty_20_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: '50+', dataIndex: 'qty_50_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: '100+', dataIndex: 'qty_100_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: 'GST (%)', dataIndex: 'gst', width: 70, align: 'center', render: (val) => val > 0 ? `${val}%` : '-' },
//     { title: 'MRP', dataIndex: 'mrp', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: 'Warranty', dataIndex: 'warranty', width: 80, align: 'center', render: (warranty) => warranty || '-' },
//    {
//     title: 'Image',
//     dataIndex: 'product_image', // This maps the data from the 'product_image' column
//     width: 80,
//     render: (url) => url ? ( // The 'url' variable holds the data from product_image (the URL string)
//         <img 
//             src={url} // The image's source is set to the URL string
//             alt="Product Thumbnail" 
//             style={{ width: '60px', height: '80px', objectFit: 'contain' }}
//         />
//     ) : '-'
// },
//     {
//       title: 'Action',
//       dataIndex: 'operation',
//       width: 100,
//       fixed: 'right',
//       align: 'center',
//       render: (_, record) => (
//         <Space size="small">
//           <Typography.Link onClick={() => handleEdit(record)}>
//             Edit
//           </Typography.Link>
//           <Popconfirm 
//               title="Are you sure to delete this product?" 
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
// <Space style={{ marginBottom: 20, justifyContent: 'space-between', width: '100%' }}>
//         <h1>Manage Products Table</h1>
//         <Space>
//           {/* THE SEARCH BOX CODE: */}
//           <Input.Search 
//             placeholder="Search by Item or Brand" 
//             allowClear 
//             onSearch={handleSearch} 
//             onChange={(e) => setSearchTerm(e.target.value)} 
//             style={{ width: 300 }} 
//           />
//           <Link href="/">
//             <Button>Back to Home</Button>
//           </Link>
//         </Space>
//       </Space>

//       <Table
//         bordered
//         dataSource={filteredData}
//         columns={columns}
//         loading={loading}
//         rowKey="id"
//         pagination={{ pageSize: 15 }}
//         scroll={{ x: 1170 }}
//       />

//       {/* --- EDIT PRODUCT MODAL --- */}
//       <Modal
//         title="Edit Product"
//         open={isModalOpen}
//         onOk={handleSave}
//         onCancel={handleCancel}
//         okText="Save Changes"
//         confirmLoading={loading}
//         width={700}
//       >
//         <Form
//           form={editForm}
//           layout="vertical"
//           name="edit_product_form"
//         >
//           {/* SL NO FIELD: READ-ONLY, POPULATED BY ITEM SELECT */}
//           <Form.Item label="SL No (From Item List)" name="sl_no">
//             <InputNumber disabled style={{ width: '100%' }} /> 
//           </Form.Item>

//           <Form.Item 
//             label="Item" 
//             name="items" 
//             rules={[{ required: true, message: 'Please select an Item!' }]}
//           >
//             <Select 
//               showSearch 
//               placeholder="Select item"
//               onChange={handleItemChange} 
//               // --- CRITICAL ADDITION: CREATE BUTTON IN DROPDOWN ---
//               dropdownRender={menu => (
//                 <div>
//                   {menu}
//                   <Divider style={{ margin: '4px 0' }} />
//                   <Space style={{ padding: '4px 8px' }}>
//                     <Button 
//                       type="text" 
//                       icon={<PlusOutlined />} 
//                       onClick={() => setIsNewItemModalOpen(true)}
//                     >
//                       **Create New Item**
//                     </Button>
//                   </Space>
//                 </div>
//               )}
//               // --------------------------------------------------
//             >
//               {existingItems.map(item => (
//                 <Option key={item} value={item}>
//                   {item}
//                 </Option>
//               ))}
//             </Select>
//           </Form.Item>
          
//           <Form.Item label="Brand" name="brand" rules={[{ required: true, message: 'Please input brand!' }]}>
//             <Input />
//           </Form.Item>

//           <Typography.Title level={5}>Pricing</Typography.Title>
//           <Space wrap size="large">
//             <Form.Item label="Single" name="single">
//               <InputNumber min={0} />
//             </Form.Item>
//             <Form.Item label="5+" name="qty_5_plus">
//               <InputNumber min={0} />
//             </Form.Item>
//             <Form.Item label="10+" name="qty_10_plus">
//               <InputNumber min={0} />
//             </Form.Item>
//             <Form.Item label="20+" name="qty_20_plus">
//               <InputNumber min={0} />
//             </Form.Item>
//             <Form.Item label="50+" name="qty_50_plus">
//               <InputNumber min={0} />
//             </Form.Item>
//             <Form.Item label="100+" name="qty_100_plus">
//               <InputNumber min={0} />
//             </Form.Item>
//           </Space>

//           <Form.Item label="GST (%)" name="gst">
//             <InputNumber min={0} />
//           </Form.Item>

//           <Form.Item label="MRP" name="mrp">
//             <InputNumber min={0} />
//           </Form.Item>

//           <Form.Item label="Warranty" name="warranty">
//             <Input />
//           </Form.Item>

//         </Form>
//       </Modal>

//       {/* --- CREATE NEW ITEM MODAL (POPS UP FROM SELECT DROPDOWN) --- */}
//       <NewItemModal 
//         isVisible={isNewItemModalOpen}
//         onClose={() => setIsNewItemModalOpen(false)}
//         onCreated={handleNewItemCreated}
//         existingItems={existingItems}
//       />
//     </div>
//   );
// }





































// import { useState, useEffect, useCallback, useMemo } from 'react';
// import { Table, Input, InputNumber, Button, Form, message, Popconfirm, Typography, Space, Modal, Select, Divider, Upload } from 'antd';
// import { PlusOutlined } from '@ant-design/icons';
// import { supabase } from '../lib/supabaseClient';
// import Link from 'next/link';

// const { Option } = Select;

// // ------------------------------------------------------------------
// // --- NESTED COMPONENT: NEW ITEM CREATION MODAL ---
// // ------------------------------------------------------------------

// const NewItemModal = ({ isVisible, onClose, onCreated, existingItems }) => {
//   const [form] = Form.useForm();
//   const [loading, setLoading] = useState(false);

//   const handleCreate = async () => {
//     try {
//       const values = await form.validateFields();
//       setLoading(true);

//       // --- Custom Validation: Check for uniqueness based on existing list ---
//       if (existingItems.includes(values.item_name)) {
//         message.error(`Item "${values.item_name}" already exists.`);
//         setLoading(false);
//         return;
//       }
      
//       // Get the highest existing SL No list and increment for the new item
//       const { data: maxSlNoData, error: maxError } = await supabase
//         .from('items_list')
//         .select('sl_no_list')
//         .order('sl_no_list', { ascending: false })
//         .limit(1);

//       if (maxError) throw maxError;
      
//       const newSlNo = maxSlNoData.length > 0 ? maxSlNoData[0].sl_no_list + 1 : 1;

//       // Insert the new item into the items_list table
//       const { error } = await supabase
//         .from('items_list')
//         .insert({ 
//           item_name: values.item_name,
//           sl_no_list: newSlNo 
//         });

//       if (error) throw error;

//       message.success(`Item "${values.item_name}" created successfully with SL No ${newSlNo}.`);
//       form.resetFields();
//       onCreated(values.item_name); // Notify parent component
//       onClose();

//     } catch (error) {
//       console.error('Item creation error:', error);
//       message.error(`Creation failed: ${error.message || 'Unknown error'}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal
//       title="Create New Item"
//       open={isVisible}
//       onOk={handleCreate}
//       onCancel={onClose}
//       okText="Create Item"
//       confirmLoading={loading}
//     >
//       <Form
//         form={form}
//         layout="vertical"
//         name="create_new_item_form"
//         style={{ marginTop: 20 }}
//       >
//         <Form.Item 
//           label="Item Name" 
//           name="item_name" 
//           rules={[{ required: true, message: 'Please enter the new item name!' }]}
//         >
//           <Input placeholder="e.g., HDMI Cable 10m" />
//         </Form.Item>
//         <Typography.Text type="secondary">
//             A unique SL No will be automatically assigned.
//         </Typography.Text>
//       </Form>
//     </Modal>
//   );
// };

// // ------------------------------------------------------------------
// // --- MAIN COMPONENT: MANAGE PRODUCTS ---
// // ------------------------------------------------------------------

// // ...
// export default function ManageProducts() {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState(''); 
// const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);

// // NEW STATES FOR IMAGE UPLOAD
// const [isUploading, setIsUploading] = useState(false);
// const [fileList, setFileList] = useState([]); // Antd Upload's file list state
//   
//   // State for Edit Modal
// // ... (rest of component)
  
//   // State for Edit Modal
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingRecord, setEditingRecord] = useState(null);
//   const [editForm] = Form.useForm();
//   const [existingItems, setExistingItems] = useState([]);
  


//   // --- Utility Function: Fetch SL No based on Item Name ---
//   const fetchSlNoByItem = async (itemName) => {
//     if (!itemName) return null;
    
//     const { data: itemData, error } = await supabase
//         .from('items_list')
//         .select('sl_no_list')
//         .eq('item_name', itemName)
//         .single();
    
//     if (error) {
//         console.error("Error fetching SL No:", error);
//         return null;
//     }
//     return itemData ? itemData.sl_no_list : null;
//   };

//   // --- Item Change Handler (Updates SL No field in the form) ---
//   const handleItemChange = async (itemName) => {
//     const newSlNo = await fetchSlNoByItem(itemName);
//     editForm.setFieldsValue({ sl_no: newSlNo });
//   };

//   // --- Data Fetching ---
//   const fetchItemsList = useCallback(async () => {
//     const { data: items, error } = await supabase
//         .from('items_list')
//         .select('item_name')
//         .order('item_name', { ascending: true });
    
//     if (!error) {
//         setExistingItems(items.map(i => i.item_name));
//     }
//   }, []);

//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     const { data: products, error } = await supabase
//       .from('products')
//       .select('*')
//       .order('sl_no', { ascending: true })
//       .order('brand', { ascending: true });
    
//     if (error) {
//       message.error(`Error fetching products: ${error.message}`);
//     } else {
//       setData(products.map(p => ({ ...p, key: p.id })));
//     }
//     setLoading(false);
//   }, []);

//   useEffect(() => {
//     fetchData();
//     fetchItemsList();
//   }, [fetchData, fetchItemsList]);



//   const filteredData = useMemo(() => { 
//     if (!searchTerm) return data;
//     const lowerCaseSearchTerm = searchTerm.toLowerCase();
//     return data.filter(product =>
//       (product.items && product.items.toLowerCase().includes(lowerCaseSearchTerm)) ||
//       (product.brand && product.brand.toLowerCase().includes(lowerCaseSearchTerm))
//     );
//   }, [data, searchTerm]);

//   // ADD THIS FUNCTION:
//   const handleSearch = (value) => {
//     setSearchTerm(value);
//   };


//   // --- Item Creation Handlers (called by NewItemModal) ---
//   const handleNewItemCreated = (newItemName) => {
//     // 1. Refetch the items list to include the new item
//     fetchItemsList();
//     // 2. Automatically select the newly created item in the product edit form
//     editForm.setFieldsValue({ items: newItemName });
//     // 3. Trigger the SL No update for the newly selected item
//     handleItemChange(newItemName);
//     if (record.items) {
//     handleItemChange(record.items); 
// }
//   };


//   const customUploadRequest = async ({ file, onSuccess, onError }) => {
//     setIsUploading(true);
//     // Create a unique filename (e.g., timestamp-originalfilename)
//     const fileName = `${Date.now()}-${file.name.replace(/ /g, '_')}`; 
//     const bucketName = 'products'; // <<< !!! IMPORTANT: CHANGE THIS TO YOUR BUCKET NAME !!!

//     try {
//         // 1. Upload the file to Supabase Storage
//         const { error: uploadError } = await supabase.storage
//             .from(bucketName)
//             .upload(fileName, file, {
//                 cacheControl: '3600',
//                 upsert: true,
//             });

//         if (uploadError) throw uploadError;

//         // 2. Get the public URL for the uploaded file
//         const { data: publicURLData } = supabase.storage
//             .from(bucketName)
//             .getPublicUrl(fileName);
        
//         const fileURL = publicURLData.publicUrl;

//         // 3. Update Antd Upload state (success)
//         onSuccess(fileURL, file);
//         message.success(`${file.name} uploaded successfully.`);
        
//         // Update the hidden form field with the new URL for reference
//         editForm.setFieldsValue({ product_image: fileURL }); 

//     } catch (error) {
//         console.error('Upload Error:', error);
//         onError(error);
//         message.error(`Upload failed: ${error.message || 'Unknown error'}`);
//     } finally {
//         setIsUploading(false);
//     }
// };

// /**
//  * Handles changes to the Ant Design Upload component's file list.
//  */
// const handleFileChange = ({ fileList: newFileList }) => {
//     setFileList(newFileList);
// };


//   // --- Modal Handlers ---
//   const handleEdit = (record) => {
//     setEditingRecord(record);
//     editForm.setFieldsValue(record);
//     setIsModalOpen(true);
//     if (record.product_image) {
//         setFileList([
//             {
//                 uid: '-1',
//                 name: record.product_image.substring(record.product_image.lastIndexOf('/') + 1),
//                 status: 'done',
//                 url: record.product_image,
//             },
//         ]);
//     } else {
//         setFileList([]);
//     }

//     if (record.items) { 
//         handleItemChange(record.items); 
//     }
//   };

//  const handleSave = async () => {
//     try {
//         const values = await editForm.validateFields();
//         const key = editingRecord.id;

//         // NEW LOGIC: Get the final image URL
//         let finalImageUrl = values.product_image; // Start with the existing URL if any

//         // If a file was uploaded, the fileList state will contain the new URL.
//         if (fileList.length > 0 && fileList[0].status === 'done') {
//             // Get the URL from the file object (the response from onSuccess in customUploadRequest)
//             finalImageUrl = fileList[0].response || fileList[0].url; 
//         } else if (fileList.length === 0) {
//             // If the user removed the image, set URL to null
//             finalImageUrl = null;
//         }
//         // If fileList has an item but status is not 'done' (e.g., 'uploading' or 'error'), the user must wait or retry.

//         // Use the dynamically updated SL No from the form state
//         const finalSlNo = values.sl_no;

//         const updatePayload = {
//             ...values,
//             sl_no: finalSlNo,
//             product_image: finalImageUrl, // Set the final image URL
//         };

//         // Remove temporary fields or fields that shouldn't be updated
//         delete updatePayload.product_image_temp; 

//         setLoading(true);
//         const { error } = await supabase
//             .from('products')
//             .update(updatePayload)
//             .eq('id', key);

//         if (error) throw error;

//         message.success('Product updated successfully.');
//         setIsModalOpen(false);
//         setEditingRecord(null);
//         setFileList([]); // Clear file state
//         await fetchData();

//     } catch (errInfo) {
//         console.log('Validate Failed:', errInfo);
//         if (errInfo.message) message.error(`Save failed: ${errInfo.message}`);
//     } finally {
//         setLoading(false);
//     }
// };

//   const handleCancel = () => {
//     setIsModalOpen(false);
//     setEditingRecord(null);
//     editForm.resetFields();
//     setFileList([]);
//   };

//   // --- Delete Handler (Unchanged) ---
//   const handleDelete = async (key) => {
//     setLoading(true);
//     const { error } = await supabase
//       .from('products')
//       .delete()
//       .eq('id', key);

//     if (error) {
//       message.error(`Deletion failed: ${error.message}`);
//     } else {
//       message.success('Product deleted successfully.');
//       await fetchData(); 
//     }
//     setLoading(false);
//   };

//   // --- Table Columns Definition (Unchanged) ---
//   const columns = [
//     { title: 'SL No', dataIndex: 'sl_no', width: 60, align: 'center' }, 
//     { title: 'Item', dataIndex: 'items', width: 130 },
//     { title: 'Brand', dataIndex: 'brand', width: 130 },
//     { title: 'Single', dataIndex: 'single', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: '5+', dataIndex: 'qty_5_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: '10+', dataIndex: 'qty_10_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: '20+', dataIndex: 'qty_20_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: '50+', dataIndex: 'qty_50_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: '100+', dataIndex: 'qty_100_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: 'GST (%)', dataIndex: 'gst', width: 70, align: 'center', render: (val) => val > 0 ? `${val}%` : '-' },
//     { title: 'MRP', dataIndex: 'mrp', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: 'Warranty', dataIndex: 'warranty', width: 80, align: 'center', render: (warranty) => warranty || '-' },
//    {
//     title: 'Image',
//     dataIndex: 'product_image', // This maps the data from the 'product_image' column
//     width: 80,
//     render: (url) => url ? ( // The 'url' variable holds the data from product_image (the URL string)
//         <img 
//             src={url} // The image's source is set to the URL string
//             alt="Product Thumbnail" 
//             style={{ width: '60px', height: '80px', objectFit: 'contain' }}
//         />
//     ) : '-'
// },
//     {
//       title: 'Action',
//       dataIndex: 'operation',
//       width: 100,
//       fixed: 'right',
//       align: 'center',
//       render: (_, record) => (
//         <Space size="small">
//           <Typography.Link onClick={() => handleEdit(record)}>
//             Edit
//           </Typography.Link>
//           <Popconfirm 
//               title="Are you sure to delete this product?" 
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
// <Space style={{ marginBottom: 20, justifyContent: 'space-between', width: '100%' }}>
//         <h1>Manage Products Table</h1>
//         <Space>
//           {/* THE SEARCH BOX CODE: */}
//           <Input.Search 
//             placeholder="Search by Item or Brand" 
//             allowClear 
//             onSearch={handleSearch} 
//             onChange={(e) => setSearchTerm(e.target.value)} 
//             style={{ width: 300 }} 
//           />
//           <Link href="/">
//             <Button>Back to Home</Button>
//           </Link>
//         </Space>
//       </Space>

//       <Table
//         bordered
//         dataSource={filteredData}
//         columns={columns}
//         loading={loading}
//         rowKey="id"
//         pagination={{ pageSize: 15 }}
//         scroll={{ x: 1170 }}
//       />

//       {/* --- EDIT PRODUCT MODAL --- */}
//       <Modal
//         title="Edit Product"
//         open={isModalOpen}
//         onOk={handleSave}
//         onCancel={handleCancel}
//         okText="Save Changes"
//         confirmLoading={loading}
//         width={700}
//       >
//         <Form
//           form={editForm}
//           layout="vertical"
//           name="edit_product_form"
//         >
//           {/* SL NO FIELD: READ-ONLY, POPULATED BY ITEM SELECT */}
//           <Form.Item label="SL No (From Item List)" name="sl_no">
//             <InputNumber disabled style={{ width: '100%' }} /> 
//           </Form.Item>

//           <Form.Item 
//             label="Item" 
//             name="items" 
//             rules={[{ required: true, message: 'Please select an Item!' }]}
//           >
//             <Select 
//               showSearch 
//               placeholder="Select item"
//               onChange={handleItemChange} 
//               // --- CRITICAL ADDITION: CREATE BUTTON IN DROPDOWN ---
//               dropdownRender={menu => (
//                 <div>
//                   {menu}
//                   <Divider style={{ margin: '4px 0' }} />
//                   <Space style={{ padding: '4px 8px' }}>
//                     <Button 
//                       type="text" 
//                       icon={<PlusOutlined />} 
//                       onClick={() => setIsNewItemModalOpen(true)}
//                     >
//                       **Create New Item**
//                     </Button>
//                   </Space>
//                 </div>
//               )}
//               // --------------------------------------------------
//             >
//               {existingItems.map(item => (
//                 <Option key={item} value={item}>
//                   {item}
//                 </Option>
//               ))}
//             </Select>
//           </Form.Item>
          
//           <Form.Item label="Brand" name="brand" rules={[{ required: true, message: 'Please input brand!' }]}>
//             <Input />
//           </Form.Item>

//           <Typography.Title level={5}>Pricing</Typography.Title>
//           <Space wrap size="large">
//             <Form.Item label="Single" name="single">
//               <InputNumber min={0} />
//             </Form.Item>
//             <Form.Item label="5+" name="qty_5_plus">
//               <InputNumber min={0} />
//             </Form.Item>
//             <Form.Item label="10+" name="qty_10_plus">
//               <InputNumber min={0} />
//             </Form.Item>
//             <Form.Item label="20+" name="qty_20_plus">
//               <InputNumber min={0} />
//             </Form.Item>
//             <Form.Item label="50+" name="qty_50_plus">
//               <InputNumber min={0} />
//             </Form.Item>
//             <Form.Item label="100+" name="qty_100_plus">
//               <InputNumber min={0} />
//             </Form.Item>
//           </Space>

//           <Form.Item label="GST (%)" name="gst">
//             <InputNumber min={0} />
//           </Form.Item>

//           <Form.Item label="MRP" name="mrp">
//             <InputNumber min={0} />
//           </Form.Item>

//           <Form.Item label="Warranty" name="warranty">
//             <Input />
//           </Form.Item>

//           <Form.Item label="Product Image">
//     <Upload
//         customRequest={customUploadRequest}
//         listType="picture"
//         fileList={fileList}
//         onChange={handleFileChange}
//         onRemove={() => setFileList([])} // Clear file if removed
//         maxCount={1}
//         disabled={isUploading}
//     >
//         {fileList.length === 0 && (
//             <Button icon={<PlusOutlined />} loading={isUploading}>
//                 {isUploading ? 'Uploading...' : 'Click to Upload Image'}
//             </Button>
//         )}
//     </Upload>
// </Form.Item>

// {/* Optional: Show the current URL for debugging/reference */}
// <Form.Item label="Current Image URL (Read Only)" name="product_image">
//     <Input placeholder="Image URL will appear here after upload" disabled />
// </Form.Item>

//         </Form>
//       </Modal>

//       {/* --- CREATE NEW ITEM MODAL (POPS UP FROM SELECT DROPDOWN) --- */}
//       <NewItemModal 
//         isVisible={isNewItemModalOpen}
//         onClose={() => setIsNewItemModalOpen(false)}
//         onCreated={handleNewItemCreated}
//         existingItems={existingItems}
//       />
//     </div>
//   );
// }










































// import { useState, useEffect, useCallback, useMemo } from 'react';
// import { Table, Input, InputNumber, Button, Form, message, Popconfirm, Typography, Space, Modal, Select, Divider, Upload } from 'antd';
// import { PlusOutlined } from '@ant-design/icons';
// import { supabase } from '../lib/supabaseClient';
// import Link from 'next/link';

// const { Option } = Select;

// // ------------------------------------------------------------------
// // --- NESTED COMPONENT: NEW ITEM CREATION MODAL ---
// // ------------------------------------------------------------------

// const NewItemModal = ({ isVisible, onClose, onCreated, existingItems }) => {
//   const [form] = Form.useForm();
//   const [loading, setLoading] = useState(false);

//   const handleCreate = async () => {
//     try {
//       const values = await form.validateFields();
//       setLoading(true);

//       // --- Custom Validation: Check for uniqueness based on existing list ---
//       if (existingItems.includes(values.item_name)) {
//         message.error(`Item "${values.item_name}" already exists.`);
//         setLoading(false);
//         return;
//       }
      
//       // Get the highest existing SL No list and increment for the new item
//       const { data: maxSlNoData, error: maxError } = await supabase
//         .from('items_list')
//         .select('sl_no_list')
//         .order('sl_no_list', { ascending: false })
//         .limit(1);

//       if (maxError) throw maxError;
      
//       const newSlNo = maxSlNoData.length > 0 ? maxSlNoData[0].sl_no_list + 1 : 1;

//       // Insert the new item into the items_list table
//       const { error } = await supabase
//         .from('items_list')
//         .insert({ 
//           item_name: values.item_name,
//           sl_no_list: newSlNo 
//         });

//       if (error) throw error;

//       message.success(`Item "${values.item_name}" created successfully with SL No ${newSlNo}.`);
//       form.resetFields();
//       onCreated(values.item_name); // Notify parent component
//       onClose();

//     } catch (error) {
//       console.error('Item creation error:', error);
//       message.error(`Creation failed: ${error.message || 'Unknown error'}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal
//       title="Create New Item"
//       open={isVisible}
//       onOk={handleCreate}
//       onCancel={onClose}
//       okText="Create Item"
//       confirmLoading={loading}
//     >
//       <Form
//         form={form}
//         layout="vertical"
//         name="create_new_item_form"
//         style={{ marginTop: 20 }}
//       >

//          <Form.Item
//                             name="list_sl_no"
//                             label="List SL No"
//                         ></Form.Item>

//         <Form.Item 
//           label="Item Name" 
//           name="item_name" 
//           rules={[{ required: true, message: 'Please enter the new item name!' }]}
//         >
//           <Input placeholder="e.g., HDMI Cable 10m" />
//         </Form.Item>
//         <Typography.Text type="secondary">
//             A unique SL No will be automatically assigned.
//         </Typography.Text>
//       </Form>
//     </Modal>
//   );
// };

// // ------------------------------------------------------------------
// // --- MAIN COMPONENT: MANAGE PRODUCTS ---
// // ------------------------------------------------------------------

// // ...
// export default function ManageProducts() {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState(''); 
// const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);

// // NEW STATES FOR IMAGE UPLOAD
// const [isUploading, setIsUploading] = useState(false);
// const [fileList, setFileList] = useState([]); // Antd Upload's file list state
//   
//   // State for Edit Modal
// // ... (rest of component)
  
//   // State for Edit Modal
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingRecord, setEditingRecord] = useState(null);
//   const [editForm] = Form.useForm();
//   const [existingItems, setExistingItems] = useState([]);
  


//   // --- Utility Function: Fetch SL No based on Item Name ---
//   const fetchSlNoByItem = async (itemName) => {
//     if (!itemName) return null;
    
//     const { data: itemData, error } = await supabase
//         .from('items_list')
//         .select('sl_no_list')
//         .eq('item_name', itemName)
//         .single();
    
//     if (error) {
//         console.error("Error fetching SL No:", error);
//         return null;
//     }
//     return itemData ? itemData.sl_no_list : null;
//   };

//   // --- Item Change Handler (Updates SL No field in the form) ---
//   const handleItemChange = async (itemName) => {
//     const newSlNo = await fetchSlNoByItem(itemName);
//     editForm.setFieldsValue({ sl_no: newSlNo });
//   };

//   // --- Data Fetching ---
//   const fetchItemsList = useCallback(async () => {
//     const { data: items, error } = await supabase
//         .from('items_list')
//         .select('item_name')
//         .order('item_name', { ascending: true });
    
//     if (!error) {
//         setExistingItems(items.map(i => i.item_name));
//     }
//   }, []);

//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     const { data: products, error } = await supabase
//       .from('products')
//       .select('*')
//       .order('sl_no', { ascending: true })
//       .order('brand', { ascending: true });
    
//     if (error) {
//       message.error(`Error fetching products: ${error.message}`);
//     } else {
//       setData(products.map(p => ({ ...p, key: p.id })));
//     }
//     setLoading(false);
//   }, []);

//   useEffect(() => {
//     fetchData();
//     fetchItemsList();
//   }, [fetchData, fetchItemsList]);



//   const filteredData = useMemo(() => { 
//     if (!searchTerm) return data;
//     const lowerCaseSearchTerm = searchTerm.toLowerCase();
//     return data.filter(product =>
//       (product.items && product.items.toLowerCase().includes(lowerCaseSearchTerm)) ||
//       (product.brand && product.brand.toLowerCase().includes(lowerCaseSearchTerm))
//     );
//   }, [data, searchTerm]);

//   // ADD THIS FUNCTION:
//   const handleSearch = (value) => {
//     setSearchTerm(value);
//   };


//   // --- Item Creation Handlers (called by NewItemModal) ---
//   const handleNewItemCreated = (newItemName) => {
//     // 1. Refetch the items list to include the new item
//     fetchItemsList();
//     // 2. Automatically select the newly created item in the product edit form
//     editForm.setFieldsValue({ items: newItemName });
//     // 3. Trigger the SL No update for the newly selected item
//     handleItemChange(newItemName);

//   };


//   const customUploadRequest = async ({ file, onSuccess, onError }) => {
//     setIsUploading(true);
    
//     // 1. Prepare FormData to send the file to the Next.js API route
//     const formData = new FormData();
//     formData.append('image', file); 

//     try {
//         // 2. Send the file to the secure local API route
//         const response = await fetch('/api/product-image-upload', {
//             method: 'POST',
//             body: formData,
//         });

//         const result = await response.json();

//         if (!response.ok) {
//             throw new Error(result.error || 'Upload failed on the server.');
//         }

//         // The API route should return the final Cloudinary URL as 'imageUrl'
//         const fileURL = result.imageUrl; 

//         // 3. Update Antd Upload state (success)
//         onSuccess(fileURL, file); 
//         message.success(`${file.name} uploaded successfully to Cloudinary.`);
        
//         // Update the form field with the new URL
//         editForm.setFieldsValue({ product_image: fileURL }); 

//     } catch (error) {
//         console.error('Upload Error:', error);
//         onError(error);
//         message.error(`Upload failed: ${error.message || 'Unknown network error'}`);
//     } finally {
//         setIsUploading(false);
//     }
// };

// /**
//  * Handles changes to the Ant Design Upload component's file list.
//  */
// const handleFileChange = ({ fileList: newFileList }) => {
//     setFileList(newFileList);
// };


//   // --- Modal Handlers ---
//   const handleEdit = (record) => {
//     setEditingRecord(record);
//     editForm.setFieldsValue(record);
//     setIsModalOpen(true);
//     
//     // <<< MODIFIED: Initialize fileList state for existing image >>>
//     if (record.product_image) {
//         setFileList([
//             {
//                 uid: record.id, // Use record id for uid
//                 name: record.product_image.substring(record.product_image.lastIndexOf('/') + 1),
//                 status: 'done',
//                 url: record.product_image,
//             },
//         ]);
//     } else {
//         setFileList([]);
//     }
//     // <<< END MODIFIED: Image Initialization >>>

//     if (record.items) { 
//         handleItemChange(record.items); 
//     }
//   };

// const handleSave = async () => {
//     try {
//         const values = await editForm.validateFields();
//         const key = editingRecord.id;

//         // <<< MODIFIED: Logic to get the final image URL >>>
//         let finalImageUrl = null; 

//         if (fileList.length > 0 && fileList[0].status === 'done') {
//             // Use the 'response' (new upload URL) or 'url' (existing image URL)
//             finalImageUrl = fileList[0].response || fileList[0].url; 
//         } else if (fileList.length === 0) {
//             // If the user removed the image, set URL to null
//             finalImageUrl = null;
//         }
//         // <<< END MODIFIED: Logic to get the final image URL >>>

//         // Use the dynamically updated SL No from the form state
//         const finalSlNo = values.sl_no;

//         const updatePayload = {
//             ...values,
//             sl_no: finalSlNo,
//             product_image: finalImageUrl, // <<< MODIFIED: Use the final image URL >>>
//         };

//         // Remove temporary fields
//         delete updatePayload.product_image_temp; 

//         setLoading(true);
//         const { error } = await supabase
//             .from('products')
//             .update(updatePayload)
//             .eq('id', key);

//         if (error) throw error;

//         message.success('Product updated successfully.');
//         setIsModalOpen(false);
//         setEditingRecord(null);
//         setFileList([]); // <<< MODIFIED: Clear file state on successful save >>>
//         await fetchData();

//     } catch (errInfo) {
//         console.log('Validate Failed:', errInfo);
//         if (errInfo.message) message.error(`Save failed: ${errInfo.message}`);
//     } finally {
//         setLoading(false);
//     }
// };

//   const handleCancel = () => {
//     setIsModalOpen(false);
//     setEditingRecord(null);
//     editForm.resetFields();
//     setFileList([]); // <<< MODIFIED: Clear file state on cancel >>>
//   };

//   // --- Delete Handler (Unchanged) ---
//   const handleDelete = async (key) => {
//     setLoading(true);
//     const { error } = await supabase
//       .from('products')
//       .delete()
//       .eq('id', key);

//     if (error) {
//       message.error(`Deletion failed: ${error.message}`);
//     } else {
//       message.success('Product deleted successfully.');
//       await fetchData(); 
//     }
//     setLoading(false);
//   };

//   // --- Table Columns Definition (Unchanged) ---
//   const columns = [
//     { title: 'SL No', dataIndex: 'sl_no', width: 60, align: 'center' }, 
//     { title: 'Item', dataIndex: 'items', width: 130 },
//     { title: 'Brand', dataIndex: 'brand', width: 130 },
//     { title: 'Single', dataIndex: 'single', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: '5+', dataIndex: 'qty_5_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: '10+', dataIndex: 'qty_10_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: '20+', dataIndex: 'qty_20_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: '50+', dataIndex: 'qty_50_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: '100+', dataIndex: 'qty_100_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: 'GST (%)', dataIndex: 'gst', width: 70, align: 'center', render: (val) => val > 0 ? `${val}%` : '-' },
//     { title: 'MRP', dataIndex: 'mrp', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: 'Warranty', dataIndex: 'warranty', width: 80, align: 'center', render: (warranty) => warranty || '-' },
//    {
//     title: 'Image',
//     dataIndex: 'product_image', // This maps the data from the 'product_image' column
//     width: 80,
//     render: (url) => url ? ( // The 'url' variable holds the data from product_image (the URL string)
//         <img 
//             src={url} // The image's source is set to the URL string
//             alt="Product Thumbnail" 
//             style={{ width: '60px', height: '80px', objectFit: 'contain' }}
//         />
//     ) : '-'
// },
//     {
//       title: 'Action',
//       dataIndex: 'operation',
//       width: 100,
//       fixed: 'right',
//       align: 'center',
//       render: (_, record) => (
//         <Space size="small">
//           <Typography.Link onClick={() => handleEdit(record)}>
//             Edit
//           </Typography.Link>
//           <Popconfirm 
//               title="Are you sure to delete this product?" 
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
// <Space style={{ marginBottom: 20, justifyContent: 'space-between', width: '100%' }}>
//         <h1>Manage Products Table</h1>
//         <Space>
//           {/* THE SEARCH BOX CODE: */}
//           <Input.Search 
//             placeholder="Search by Item or Brand" 
//             allowClear 
//             onSearch={handleSearch} 
//             onChange={(e) => setSearchTerm(e.target.value)} 
//             style={{ width: 300 }} 
//           />
//           <Link href="/">
//             <Button>Back to Home</Button>
//           </Link>
//         </Space>
//       </Space>

//       <Table
//         bordered
//         dataSource={filteredData}
//         columns={columns}
//         loading={loading}
//         rowKey="id"
//         pagination={{ pageSize: 15 }}
//         scroll={{ x: 1170 }}
//       />

//       {/* --- EDIT PRODUCT MODAL --- */}
//       <Modal
//         title="Edit Product"
//         open={isModalOpen}
//         onOk={handleSave}
//         onCancel={handleCancel}
//         okText="Save Changes"
//         confirmLoading={loading}
//         width={700}
//       >
//         <Form
//           form={editForm}
//           layout="vertical"
//           name="edit_product_form"
//         >
//           {/* SL NO FIELD: READ-ONLY, POPULATED BY ITEM SELECT */}
//           <Form.Item label="SL No (From Item List)" name="sl_no">
//             <InputNumber disabled style={{ width: '100%' }} /> 
//           </Form.Item>

//           <Form.Item 
//             label="Item" 
//             name="items" 
//             rules={[{ required: true, message: 'Please select an Item!' }]}
//           >
//             <Select 
//               showSearch 
//               placeholder="Select item"
//               onChange={handleItemChange} 
//               // --- CRITICAL ADDITION: CREATE BUTTON IN DROPDOWN ---
//               dropdownRender={menu => (
//                 <div>
//                   {menu}
//                   <Divider style={{ margin: '4px 0' }} />
//                   <Space style={{ padding: '4px 8px' }}>
//                     <Button 
//                       type="text" 
//                       icon={<PlusOutlined />} 
//                       onClick={() => setIsNewItemModalOpen(true)}
//                     >
//                       **Create New Item**
//                     </Button>
//                   </Space>
//                 </div>
//               )}
//               // --------------------------------------------------
//             >
//               {existingItems.map(item => (
//                 <Option key={item} value={item}>
//                   {item}
//                 </Option>
//               ))}
//             </Select>
//           </Form.Item>
          
//           <Form.Item label="Brand" name="brand" rules={[{ required: true, message: 'Please input brand!' }]}>
//             <Input />
//           </Form.Item>

//           <Typography.Title level={5}>Pricing</Typography.Title>
//           <Space wrap size="large">
//             <Form.Item label="Single" name="single">
//               <InputNumber min={0} />
//             </Form.Item>
//             <Form.Item label="5+" name="qty_5_plus">
//               <InputNumber min={0} />
//             </Form.Item>
//             <Form.Item label="10+" name="qty_10_plus">
//               <InputNumber min={0} />
//             </Form.Item>
//             <Form.Item label="20+" name="qty_20_plus">
//               <InputNumber min={0} />
//             </Form.Item>
//             <Form.Item label="50+" name="qty_50_plus">
//               <InputNumber min={0} />
//             </Form.Item>
//             <Form.Item label="100+" name="qty_100_plus">
//               <InputNumber min={0} />
//             </Form.Item>
//           </Space>

//           <Form.Item label="GST (%)" name="gst">
//             <InputNumber min={0} />
//           </Form.Item>

//           <Form.Item label="MRP" name="mrp">
//             <InputNumber min={0} />
//           </Form.Item>

//           <Form.Item label="Warranty" name="warranty">
//             <Input />
//           </Form.Item>

//           <Form.Item label="Product Image">
//     <Upload
//         customRequest={customUploadRequest}
//         listType="picture"
//         fileList={fileList}
//         onChange={handleFileChange}
//         onRemove={() => setFileList([])} // Clear file if removed
//         maxCount={1}
//         disabled={isUploading}
//     >
//         {fileList.length === 0 && (
//             <Button icon={<PlusOutlined />} loading={isUploading}>
//                 {isUploading ? 'Uploading...' : 'Click to Upload Image'}
//             </Button>
//         )}
//     </Upload>
// </Form.Item>

// {/* Optional: Show the current URL for debugging/reference */}
// <Form.Item label="Current Image URL (Read Only)" name="product_image">
//     <Input placeholder="Image URL will appear here after upload" disabled />
// </Form.Item>

//         </Form>
//       </Modal>

//       {/* --- CREATE NEW ITEM MODAL (POPS UP FROM SELECT DROPDOWN) --- */}
//       <NewItemModal 
//         isVisible={isNewItemModalOpen}
//         onClose={() => setIsNewItemModalOpen(false)}
//         onCreated={handleNewItemCreated}
//         existingItems={existingItems}
//       />
//     </div>
//   );
// }





















































// import { useState, useEffect, useCallback, useMemo } from 'react';
// import { Table, Input, InputNumber, Button, Form, message, Popconfirm, Typography, Space, Modal, Select, Divider, Upload } from 'antd';
// import { PlusOutlined } from '@ant-design/icons';
// import { supabase } from '../lib/supabaseClient';
// import Link from 'next/link';

// const { Option } = Select;

// // ------------------------------------------------------------------
// // --- NESTED COMPONENT: NEW ITEM CREATION MODAL ---
// // ------------------------------------------------------------------

// const NewItemModal = ({ isVisible, onClose, onCreated, existingItems }) => {
//     const [form] = Form.useForm();
//     const [loading, setLoading] = useState(false);
//     // <<< ADDED: State to hold the calculated SL No for initialValues >>>
//     const [initialSlNo, setInitialSlNo] = useState(null);

//     // Handler to close the modal and reset fields
//     const handleCloseModal = () => {
//         form.resetFields();
//         setInitialSlNo(null); // Reset the state as well
//         onClose();
//     };

//     // useEffect now calculates the SL No and stores it in state (initialSlNo)
//     useEffect(() => {
//         const fetchAndSetSlNo = async () => {
//             const { data: maxSlNoData, error: maxError } = await supabase
//                 .from('items_list')
//                 .select('sl_no_list')
//                 .order('sl_no_list', { ascending: false })
//                 .limit(1);

//             if (maxError) {
//                 console.error("Error fetching max SL No:", maxError);
//                 message.error("Failed to calculate next SL No. Check console for details.");
//                 // Set to 1 as a fallback if the table is empty/fetch fails
//                 setInitialSlNo(1); 
//                 return;
//             }

//             const newSlNo = maxSlNoData.length > 0 ? maxSlNoData[0].sl_no_list + 1 : 1;
            
//             // <<< MODIFIED: Set the value in the state instead of directly on the form >>>
//             setInitialSlNo(newSlNo); 
//         };

//         if (isVisible) {
//             fetchAndSetSlNo();  
//         }
//     }, [isVisible]); // 'form' is no longer a dependency for this effect

//     // Submission logic (No change needed here as long as we grab the SL No)
//     const handleCreateNewItem = async (values) => {
//         try {
//             setLoading(true);

//             if (existingItems.includes(values.item_name)) {
//                 message.error(`Item "${values.item_name}" already exists.`);
//                 setLoading(false);
//                 return;
//             }
            
//             // Get the list_sl_no from the form values, which was set by initialValues
//             const finalSlNo = values.list_sl_no; 
            
//             if (!finalSlNo) {
//                 message.error("SL No calculation failed. Please try again.");
//                 setLoading(false);
//                 return;
//             }

//             // Insert logic...
//             const { error } = await supabase
//                 .from('items_list')
//                 .insert({ item_name: values.item_name, sl_no_list: finalSlNo });

//             if (error) throw error;

//             message.success(`Item "${values.item_name}" created successfully with SL No ${finalSlNo}.`);
//             handleCloseModal(); // Use the close handler to reset both form and state
//             onCreated(values.item_name); 

//         } catch (error) {
//             console.error('Item creation error:', error);
//             message.error(`Creation failed: ${error.message || 'Unknown error'}`);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Prepare initial values object
//     const formInitialValues = useMemo(() => ({
//         list_sl_no: initialSlNo
//     }), [initialSlNo]);

//     return (
//         <Modal
//             title="Create New Item Name" 
//             open={isVisible}
//             onCancel={handleCloseModal} // Uses new close handler
//             width={500}
//             footer={[
//                 <Button key="back" onClick={handleCloseModal} disabled={loading}>Cancel</Button>, // Uses new close handler
//                 <Button
//                     key="submit"
//                     type="primary"
//                     loading={loading}
//                     onClick={() => form.submit()}
//                 >
//                     Create Item
//                 </Button>,
//             ]}
//         >
//             <Form
//                 form={form}
//                 layout="vertical"
//                 name="create_new_item_form"
//                 onFinish={handleCreateNewItem} 
//                 style={{ marginTop: 20 }}
//                 // <<< CRITICAL ADDITION: Use the calculated SL No for initial values >>>
//                 initialValues={formInitialValues} 
//             >
                
//                 <Form.Item
//                     name="list_sl_no"
//                     label="List SL No"
//                 >
//                     {/* InputNumber will be populated via initialValues */}
//                     <InputNumber disabled style={{ width: '100%' }} /> 
//                 </Form.Item>

//                 <Form.Item 
//                     name="item_name" 
//                     label="New Item Name" 
//                     rules={[{ required: true, message: 'Please input the new item name!' }]} 
//                 >
//                     <Input placeholder="e.g., HDMI Cable 10m" />
//                 </Form.Item>
//                 {/* <Typography.Text type="secondary">
//                     A unique SL No will be automatically assigned.
//                 </Typography.Text> */}
//             </Form>
//         </Modal>
//     );
// };

// // ------------------------------------------------------------------
// // --- MAIN COMPONENT: MANAGE PRODUCTS ---
// // ------------------------------------------------------------------

// // ...
// export default function ManageProducts() {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState(''); 
// const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);

// // NEW STATES FOR IMAGE UPLOAD
// const [isUploading, setIsUploading] = useState(false);
// const [fileList, setFileList] = useState([]); // Antd Upload's file list state
//   
//   // State for Edit Modal
// // ... (rest of component)
  
//   // State for Edit Modal
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingRecord, setEditingRecord] = useState(null);
//   const [editForm] = Form.useForm();
//   const [existingItems, setExistingItems] = useState([]);
  


//   // --- Utility Function: Fetch SL No based on Item Name ---
//   const fetchSlNoByItem = async (itemName) => {
//     if (!itemName) return null;
    
//     const { data: itemData, error } = await supabase
//         .from('items_list')
//         .select('sl_no_list')
//         .eq('item_name', itemName)
//         .single();
    
//     if (error) {
//         console.error("Error fetching SL No:", error);
//         return null;
//     }
//     return itemData ? itemData.sl_no_list : null;
//   };

//   // --- Item Change Handler (Updates SL No field in the form) ---
//   const handleItemChange = async (itemName) => {
//     const newSlNo = await fetchSlNoByItem(itemName);
//     editForm.setFieldsValue({ sl_no: newSlNo });
//   };

//   // --- Data Fetching ---
//   const fetchItemsList = useCallback(async () => {
//     const { data: items, error } = await supabase
//         .from('items_list')
//         .select('item_name')
//         .order('item_name', { ascending: true });
    
//     if (!error) {
//         setExistingItems(items.map(i => i.item_name));
//     }
//   }, []);

//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     const { data: products, error } = await supabase
//       .from('products')
//       .select('*')
//       .order('sl_no', { ascending: true })
//       .order('brand', { ascending: true });
    
//     if (error) {
//       message.error(`Error fetching products: ${error.message}`);
//     } else {
//       setData(products.map(p => ({ ...p, key: p.id })));
//     }
//     setLoading(false);
//   }, []);

//   useEffect(() => {
//     fetchData();
//     fetchItemsList();
//   }, [fetchData, fetchItemsList]);



//   const filteredData = useMemo(() => { 
//     if (!searchTerm) return data;
//     const lowerCaseSearchTerm = searchTerm.toLowerCase();
//     return data.filter(product =>
//       (product.items && product.items.toLowerCase().includes(lowerCaseSearchTerm)) ||
//       (product.brand && product.brand.toLowerCase().includes(lowerCaseSearchTerm))
//     );
//   }, [data, searchTerm]);

//   // ADD THIS FUNCTION:
//   const handleSearch = (value) => {
//     setSearchTerm(value);
//   };


//   // --- Item Creation Handlers (called by NewItemModal) ---
//   const handleNewItemCreated = (newItemName) => {
//     // 1. Refetch the items list to include the new item
//     fetchItemsList();
//     // 2. Automatically select the newly created item in the product edit form
//     editForm.setFieldsValue({ items: newItemName });
//     // 3. Trigger the SL No update for the newly selected item
//     handleItemChange(newItemName);

//   };


//   const customUploadRequest = async ({ file, onSuccess, onError }) => {
//     setIsUploading(true);
    
//     // 1. Prepare FormData to send the file to the Next.js API route
//     const formData = new FormData();
//     formData.append('image', file); 

//     try {
//         // 2. Send the file to the secure local API route
//         const response = await fetch('/api/product-image-upload', {
//             method: 'POST',
//             body: formData,
//         });

//         const result = await response.json();

//         if (!response.ok) {
//             throw new Error(result.error || 'Upload failed on the server.');
//         }

//         // The API route should return the final Cloudinary URL as 'imageUrl'
//         const fileURL = result.imageUrl; 

//         // 3. Update Antd Upload state (success)
//         onSuccess(fileURL, file); 
//         message.success(`${file.name} uploaded successfully to Cloudinary.`);
        
//         // Update the form field with the new URL
//         editForm.setFieldsValue({ product_image: fileURL }); 

//     } catch (error) {
//         console.error('Upload Error:', error);
//         onError(error);
//         message.error(`Upload failed: ${error.message || 'Unknown network error'}`);
//     } finally {
//         setIsUploading(false);
//     }
// };

// /**
//  * Handles changes to the Ant Design Upload component's file list.
//  */
// const handleFileChange = ({ fileList: newFileList }) => {
//     setFileList(newFileList);
// };


//   // --- Modal Handlers ---
//   const handleEdit = (record) => {
//     setEditingRecord(record);
//     editForm.setFieldsValue(record);
//     setIsModalOpen(true);
//     
//     // <<< MODIFIED: Initialize fileList state for existing image >>>
//     if (record.product_image) {
//         setFileList([
//             {
//                 uid: record.id, // Use record id for uid
//                 name: record.product_image.substring(record.product_image.lastIndexOf('/') + 1),
//                 status: 'done',
//                 url: record.product_image,
//             },
//         ]);
//     } else {
//         setFileList([]);
//     }
//     // <<< END MODIFIED: Image Initialization >>>

//     if (record.items) { 
//         handleItemChange(record.items); 
//     }
//   };

// const handleSave = async () => {
//     try {
//         const values = await editForm.validateFields();
//         const key = editingRecord.id;

//         // <<< MODIFIED: Logic to get the final image URL >>>
//         let finalImageUrl = null; 

//         if (fileList.length > 0 && fileList[0].status === 'done') {
//             // Use the 'response' (new upload URL) or 'url' (existing image URL)
//             finalImageUrl = fileList[0].response || fileList[0].url; 
//         } else if (fileList.length === 0) {
//             // If the user removed the image, set URL to null
//             finalImageUrl = null;
//         }
//         // <<< END MODIFIED: Logic to get the final image URL >>>

//         // Use the dynamically updated SL No from the form state
//         const finalSlNo = values.sl_no;

//         const updatePayload = {
//             ...values,
//             sl_no: finalSlNo,
//             product_image: finalImageUrl, // <<< MODIFIED: Use the final image URL >>>
//         };

//         // Remove temporary fields
//         delete updatePayload.product_image_temp; 

//         setLoading(true);
//         const { error } = await supabase
//             .from('products')
//             .update(updatePayload)
//             .eq('id', key);

//         if (error) throw error;

//         message.success('Product updated successfully.');
//         setIsModalOpen(false);
//         setEditingRecord(null);
//         setFileList([]); // <<< MODIFIED: Clear file state on successful save >>>
//         await fetchData();

//     } catch (errInfo) {
//         console.log('Validate Failed:', errInfo);
//         if (errInfo.message) message.error(`Save failed: ${errInfo.message}`);
//     } finally {
//         setLoading(false);
//     }
// };

//   const handleCancel = () => {
//     setIsModalOpen(false);
//     setEditingRecord(null);
//     editForm.resetFields();
//     setFileList([]); // <<< MODIFIED: Clear file state on cancel >>>
//   };

//   // --- Delete Handler (Unchanged) ---
//   const handleDelete = async (key) => {
//     setLoading(true);
//     const { error } = await supabase
//       .from('products')
//       .delete()
//       .eq('id', key);

//     if (error) {
//       message.error(`Deletion failed: ${error.message}`);
//     } else {
//       message.success('Product deleted successfully.');
//       await fetchData(); 
//     }
//     setLoading(false);
//   };

//   // --- Table Columns Definition (Unchanged) ---
//   const columns = [
//     { title: 'SL No', dataIndex: 'sl_no', width: 60, align: 'center' }, 
//     { title: 'Item', dataIndex: 'items', width: 130 },
//     { title: 'Brand', dataIndex: 'brand', width: 130 },
//     { title: 'Single', dataIndex: 'single', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: '5+', dataIndex: 'qty_5_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: '10+', dataIndex: 'qty_10_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: '20+', dataIndex: 'qty_20_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: '50+', dataIndex: 'qty_50_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: '100+', dataIndex: 'qty_100_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: 'GST (%)', dataIndex: 'gst', width: 70, align: 'center', render: (val) => val > 0 ? `${val}%` : '-' },
//     { title: 'MRP', dataIndex: 'mrp', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: 'Warranty', dataIndex: 'warranty', width: 80, align: 'center', render: (warranty) => warranty || '-' },
//    {
//     title: 'Image',
//     dataIndex: 'product_image', // This maps the data from the 'product_image' column
//     width: 80,
//     render: (url) => url ? ( // The 'url' variable holds the data from product_image (the URL string)
//         <img 
//             src={url} // The image's source is set to the URL string
//             alt="Product Thumbnail" 
//             style={{ width: '60px', height: '80px', objectFit: 'contain' }}
//         />
//     ) : '-'
// },
//     {
//       title: 'Action',
//       dataIndex: 'operation',
//       width: 100,
//       fixed: 'right',
//       align: 'center',
//       render: (_, record) => (
//         <Space size="small">
//           <Typography.Link onClick={() => handleEdit(record)}>
//             Edit
//           </Typography.Link>
//           <Popconfirm 
//               title="Are you sure to delete this product?" 
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
// <Space style={{ marginBottom: 20, justifyContent: 'space-between', width: '100%' }}>
//         <h1>Manage Products Table</h1>
//         <Space>
//           {/* THE SEARCH BOX CODE: */}
//           <Input.Search 
//             placeholder="Search by Item or Brand" 
//             allowClear 
//             onSearch={handleSearch} 
//             onChange={(e) => setSearchTerm(e.target.value)} 
//             style={{ width: 300 }} 
//           />
//           <Link href="/">
//             <Button>Back to Home</Button>
//           </Link>
//         </Space>
//       </Space>

//       <Table
//         bordered
//         dataSource={filteredData}
//         columns={columns}
//         loading={loading}
//         rowKey="id"
//         pagination={{ pageSize: 15 }}
//         scroll={{ x: 1170 }}
//       />

//       {/* --- EDIT PRODUCT MODAL --- */}
//       <Modal
//         title="Edit Product"
//         open={isModalOpen}
//         onOk={handleSave}
//         onCancel={handleCancel}
//         okText="Save Changes"
//         confirmLoading={loading}
//         width={700}
//       >
//         <Form
//           form={editForm}
//           layout="vertical"
//           name="edit_product_form"
//         >
//           {/* SL NO FIELD: READ-ONLY, POPULATED BY ITEM SELECT */}
//           <Form.Item label="SL No (From Item List)" name="sl_no">
//             <InputNumber disabled style={{ width: '100%' }} /> 
//           </Form.Item>

//           <Form.Item 
//             label="Item" 
//             name="items" 
//             rules={[{ required: true, message: 'Please select an Item!' }]}
//           >
//             <Select 
//               showSearch 
//               placeholder="Select item"
//               onChange={handleItemChange} 
//               // --- CRITICAL ADDITION: CREATE BUTTON IN DROPDOWN ---
//               dropdownRender={menu => (
//                 <div>
//                   {menu}
//                   <Divider style={{ margin: '4px 0' }} />
//                   <Space style={{ padding: '4px 8px' }}>
//                     <Button 
//                       type="text" 
//                       icon={<PlusOutlined />} 
//                       onClick={() => setIsNewItemModalOpen(true)}
//                     >
//                       **Create New Item**
//                     </Button>
//                   </Space>
//                 </div>
//               )}
//               // --------------------------------------------------
//             >
//               {existingItems.map(item => (
//                 <Option key={item} value={item}>
//                   {item}
//                 </Option>
//               ))}
//             </Select>
//           </Form.Item>
          
//           <Form.Item label="Brand" name="brand" rules={[{ required: true, message: 'Please input brand!' }]}>
//             <Input />
//           </Form.Item>

//           <Typography.Title level={5}>Pricing</Typography.Title>
//           <Space wrap size="large">
//             <Form.Item label="Single" name="single">
//               <InputNumber min={0} />
//             </Form.Item>
//             <Form.Item label="5+" name="qty_5_plus">
//               <InputNumber min={0} />
//             </Form.Item>
//             <Form.Item label="10+" name="qty_10_plus">
//               <InputNumber min={0} />
//             </Form.Item>
//             <Form.Item label="20+" name="qty_20_plus">
//               <InputNumber min={0} />
//             </Form.Item>
//             <Form.Item label="50+" name="qty_50_plus">
//               <InputNumber min={0} />
//             </Form.Item>
//             <Form.Item label="100+" name="qty_100_plus">
//               <InputNumber min={0} />
//             </Form.Item>
//           </Space>

//           <Form.Item label="GST (%)" name="gst">
//             <InputNumber min={0} />
//           </Form.Item>

//           <Form.Item label="MRP" name="mrp">
//             <InputNumber min={0} />
//           </Form.Item>

//           <Form.Item label="Warranty" name="warranty">
//             <Input />
//           </Form.Item>

//           <Form.Item label="Product Image">
//     <Upload
//         customRequest={customUploadRequest}
//         listType="picture"
//         fileList={fileList}
//         onChange={handleFileChange}
//         onRemove={() => setFileList([])} // Clear file if removed
//         maxCount={1}
//         disabled={isUploading}
//     >
//         {fileList.length === 0 && (
//             <Button icon={<PlusOutlined />} loading={isUploading}>
//                 {isUploading ? 'Uploading...' : 'Click to Upload Image'}
//             </Button>
//         )}
//     </Upload>
// </Form.Item>

// {/* Optional: Show the current URL for debugging/reference */}
// <Form.Item label="Current Image URL (Read Only)" name="product_image">
//     <Input placeholder="Image URL will appear here after upload" disabled />
// </Form.Item>

//         </Form>
//       </Modal>

//       {/* --- CREATE NEW ITEM MODAL (POPS UP FROM SELECT DROPDOWN) --- */}
//       <NewItemModal 
//         isVisible={isNewItemModalOpen}
//         onClose={() => setIsNewItemModalOpen(false)}
//         onCreated={handleNewItemCreated}
//         existingItems={existingItems}
//       />
//     </div>
//   );
// }






















































// import { useState, useEffect, useCallback, useMemo } from 'react';
// import { Table, Input, InputNumber, Button, Form, message, Popconfirm, Typography, Space, Modal, Select, Divider, Upload } from 'antd';
// import { PlusOutlined } from '@ant-design/icons';
// import { supabase } from '../lib/supabaseClient';
// import Link from 'next/link';

// const { Option } = Select;

// // ------------------------------------------------------------------
// // --- NESTED COMPONENT: NEW ITEM CREATION MODAL ---
// // ------------------------------------------------------------------

// const NewItemModal = ({ isVisible, onClose, onCreated, existingItems }) => {
//     const [form] = Form.useForm();
//     const [loading, setLoading] = useState(false);
//     // <<< ADDED: State to hold the calculated SL No for initialValues >>>
//     const [initialSlNo, setInitialSlNo] = useState(null);

//     // Handler to close the modal and reset fields
//     const handleCloseModal = () => {
//         form.resetFields();
//         setInitialSlNo(null); // Reset the state as well
//         onClose();
//     };

//     // useEffect now calculates the SL No and stores it in state (initialSlNo)
//     useEffect(() => {
//         const fetchAndSetSlNo = async () => {
//             const { data: maxSlNoData, error: maxError } = await supabase
//                 .from('items_list')
//                 .select('sl_no_list')
//                 .order('sl_no_list', { ascending: false })
//                 .limit(1);

//             if (maxError) {
//                 console.error("Error fetching max SL No:", maxError);
//                 message.error("Failed to calculate next SL No. Check console for details.");
//                 // Set to 1 as a fallback if the table is empty/fetch fails
//                 setInitialSlNo(1); 
//                 return;
//             }

//             const newSlNo = maxSlNoData.length > 0 ? maxSlNoData[0].sl_no_list + 1 : 1;
            
//             // <<< MODIFIED: Set the value in the state instead of directly on the form >>>
//             setInitialSlNo(newSlNo); 
//         };

//         if (isVisible) {
//             fetchAndSetSlNo();  
//         }
//     }, [isVisible]); // 'form' is no longer a dependency for this effect

//     // Submission logic (No change needed here as long as we grab the SL No)
//     const handleCreateNewItem = async (values) => {
//         try {
//             setLoading(true);

//             if (existingItems.includes(values.item_name)) {
//                 message.error(`Item "${values.item_name}" already exists.`);
//                 setLoading(false);
//                 return;
//             }
            
//             // Get the list_sl_no from the form values, which was set by initialValues
//             const finalSlNo = values.list_sl_no; 
            
//             if (!finalSlNo) {
//                 message.error("SL No calculation failed. Please try again.");
//                 setLoading(false);
//                 return;
//             }

//             // Insert logic...
//             const { error } = await supabase
//                 .from('items_list')
//                 .insert({ item_name: values.item_name, sl_no_list: finalSlNo });

//             if (error) throw error;

//             message.success(`Item "${values.item_name}" created successfully with SL No ${finalSlNo}.`);
//             handleCloseModal(); // Use the close handler to reset both form and state
//             onCreated(values.item_name); 

//         } catch (error) {
//             console.error('Item creation error:', error);
//             message.error(`Creation failed: ${error.message || 'Unknown error'}`);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Prepare initial values object
//     const formInitialValues = useMemo(() => ({
//         list_sl_no: initialSlNo
//     }), [initialSlNo]);

//     return (
//         <Modal
//             title="Create New Item Name" 
//             open={isVisible}
//             onCancel={handleCloseModal} // Uses new close handler
//             width={500}
//             footer={[
//                 <Button key="back" onClick={handleCloseModal} disabled={loading}>Cancel</Button>, // Uses new close handler
//                 <Button
//                     key="submit"
//                     type="primary"
//                     loading={loading}
//                     onClick={() => form.submit()}
//                 >
//                     Create Item
//                 </Button>,
//             ]}
//         >
//             <Form
//                 form={form}
//                 layout="vertical"
//                 name="create_new_item_form"
//                 onFinish={handleCreateNewItem} 
//                 style={{ marginTop: 20 }}
//                 // <<< CRITICAL ADDITION: Use the calculated SL No for initial values >>>
//                 initialValues={formInitialValues} 
//             >
                
//                 <Form.Item
//                     name="list_sl_no"
//                     label="List SL No"
//                 >
//                     {/* InputNumber will be populated via initialValues */}
//                     <InputNumber disabled style={{ width: '100%' }} /> 
//                 </Form.Item>

//                 <Form.Item 
//                     name="item_name" 
//                     label="New Item Name" 
//                     rules={[{ required: true, message: 'Please input the new item name!' }]} 
//                 >
//                     <Input placeholder="e.g., HDMI Cable 10m" />
//                 </Form.Item>
//                 {/* <Typography.Text type="secondary">
//                     A unique SL No will be automatically assigned.
//                 </Typography.Text> */}
//             </Form>
//         </Modal>
//     );
// };

// // ------------------------------------------------------------------
// // --- MAIN COMPONENT: MANAGE PRODUCTS ---
// // ------------------------------------------------------------------

// // ...
// export default function ManageProducts() {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState(''); 
// const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);

// // NEW STATES FOR IMAGE UPLOAD
// const [isUploading, setIsUploading] = useState(false);
// const [fileList, setFileList] = useState([]); // Antd Upload's file list state
//   
//   // State for Edit Modal
// // ... (rest of component)
  
//   // State for Edit Modal
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingRecord, setEditingRecord] = useState(null);
//   const [editForm] = Form.useForm();
//   const [existingItems, setExistingItems] = useState([]);
  


//   // --- Utility Function: Fetch SL No based on Item Name ---
//   const fetchSlNoByItem = async (itemName) => {
//     if (!itemName) return null;
    
//     const { data: itemData, error } = await supabase
//         .from('items_list')
//         .select('sl_no_list')
//         .eq('item_name', itemName)
//         .single();
    
//     if (error) {
//         console.error("Error fetching SL No:", error);
//         return null;
//     }
//     return itemData ? itemData.sl_no_list : null;
//   };

//   // --- Item Change Handler (Updates SL No field in the form) ---
//   const handleItemChange = async (itemName) => {
//     const newSlNo = await fetchSlNoByItem(itemName);
//     editForm.setFieldsValue({ sl_no: newSlNo });
//   };

//   // --- Data Fetching ---
//   const fetchItemsList = useCallback(async () => {
//     const { data: items, error } = await supabase
//         .from('items_list')
//         .select('item_name')
//         .order('item_name', { ascending: true });
    
//     if (!error) {
//         setExistingItems(items.map(i => i.item_name));
//     }
//   }, []);

//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     const { data: products, error } = await supabase
//       .from('products')
//       .select('*')
//       .order('sl_no', { ascending: true })
//       .order('brand', { ascending: true });
    
//     if (error) {
//       message.error(`Error fetching products: ${error.message}`);
//     } else {
//       setData(products.map(p => ({ ...p, key: p.id })));
//     }
//     setLoading(false);
//   }, []);

//   useEffect(() => {
//     fetchData();
//     fetchItemsList();
//   }, [fetchData, fetchItemsList]);



//   const filteredData = useMemo(() => { 
//     if (!searchTerm) return data;
//     const lowerCaseSearchTerm = searchTerm.toLowerCase();
//     return data.filter(product =>
//       (product.items && product.items.toLowerCase().includes(lowerCaseSearchTerm)) ||
//       (product.brand && product.brand.toLowerCase().includes(lowerCaseSearchTerm))
//     );
//   }, [data, searchTerm]);

//   // ADD THIS FUNCTION:
//   const handleSearch = (value) => {
//     setSearchTerm(value);
//   };


//   // --- Item Creation Handlers (called by NewItemModal) ---
//   const handleNewItemCreated = (newItemName) => {
//     // 1. Refetch the items list to include the new item
//     fetchItemsList();
//     // 2. Automatically select the newly created item in the product edit form
//     editForm.setFieldsValue({ items: newItemName });
//     // 3. Trigger the SL No update for the newly selected item
//     handleItemChange(newItemName);

//   };


//   const customUploadRequest = async ({ file, onSuccess, onError }) => {
//     setIsUploading(true);
    
//     // 1. Prepare FormData to send the file to the Next.js API route
//     const formData = new FormData();
//     formData.append('image', file); 

//     try {
//         // 2. Send the file to the secure local API route
//         const response = await fetch('/api/product-image-upload', {
//             method: 'POST',
//             body: formData,
//         });

//         const result = await response.json();

//         if (!response.ok) {
//             throw new Error(result.error || 'Upload failed on the server.');
//         }

//         // The API route should return the final Cloudinary URL as 'imageUrl'
//         const fileURL = result.imageUrl; 

//         // 3. Update Antd Upload state (success)
//         onSuccess(fileURL, file); 
//         message.success(`${file.name} uploaded successfully to Cloudinary.`);
        
//         // Update the form field with the new URL
//         editForm.setFieldsValue({ product_image: fileURL }); 

//     } catch (error) {
//         console.error('Upload Error:', error);
//         onError(error);
//         message.error(`Upload failed: ${error.message || 'Unknown network error'}`);
//     } finally {
//         setIsUploading(false);
//     }
// };

// /**
//  * Handles changes to the Ant Design Upload component's file list.
//  */
// const handleFileChange = ({ fileList: newFileList }) => {
//     setFileList(newFileList);
// };


//   // --- Modal Handlers ---
//   const handleEdit = (record) => {
//     setEditingRecord(record);
//     editForm.setFieldsValue(record);
//     setIsModalOpen(true);
//     
//     // <<< MODIFIED: Initialize fileList state for existing image >>>
//     if (record.product_image) {
//         setFileList([
//             {
//                 uid: record.id, // Use record id for uid
//                 name: record.product_image.substring(record.product_image.lastIndexOf('/') + 1),
//                 status: 'done',
//                 url: record.product_image,
//             },
//         ]);
//     } else {
//         setFileList([]);
//     }
//     // <<< END MODIFIED: Image Initialization >>>

//     if (record.items) { 
//         handleItemChange(record.items); 
//     }
//   };

// const handleSave = async () => {
//     try {
//         const values = await editForm.validateFields();
//         const key = editingRecord.id;

//         // <<< MODIFIED: Logic to get the final image URL >>>
//         let finalImageUrl = null; 

//         if (fileList.length > 0 && fileList[0].status === 'done') {
//             // Use the 'response' (new upload URL) or 'url' (existing image URL)
//             finalImageUrl = fileList[0].response || fileList[0].url; 
//         } else if (fileList.length === 0) {
//             // If the user removed the image, set URL to null
//             finalImageUrl = null;
//         }
//         // <<< END MODIFIED: Logic to get the final image URL >>>

//         // Use the dynamically updated SL No from the form state
//         const finalSlNo = values.sl_no;

//         const updatePayload = {
//             ...values,
//             sl_no: finalSlNo,
//             product_image: finalImageUrl, // <<< MODIFIED: Use the final image URL >>>
//         };

//         // Remove temporary fields
//         delete updatePayload.product_image_temp; 

//         setLoading(true);
//         const { error } = await supabase
//             .from('products')
//             .update(updatePayload)
//             .eq('id', key);

//         if (error) throw error;

//         message.success('Product updated successfully.');
//         setIsModalOpen(false);
//         setEditingRecord(null);
//         setFileList([]); // <<< MODIFIED: Clear file state on successful save >>>
//         await fetchData();

//     } catch (errInfo) {
//         console.log('Validate Failed:', errInfo);
//         if (errInfo.message) message.error(`Save failed: ${errInfo.message}`);
//     } finally {
//         setLoading(false);
//     }
// };

//   const handleCancel = () => {
//     setIsModalOpen(false);
//     setEditingRecord(null);
//     editForm.resetFields();
//     setFileList([]); // <<< MODIFIED: Clear file state on cancel >>>
//   };

//   // --- Delete Handler (Unchanged) ---
//   const handleDelete = async (key) => {
//     setLoading(true);
//     const { error } = await supabase
//       .from('products')
//       .delete()
//       .eq('id', key);

//     if (error) {
//       message.error(`Deletion failed: ${error.message}`);
//     } else {
//       message.success('Product deleted successfully.');
//       await fetchData(); 
//     }
//     setLoading(false);
//   };

//   // --- Table Columns Definition (Unchanged) ---
//   const columns = [
//     { title: 'SL No', dataIndex: 'sl_no', width: 60, align: 'center' }, 
//     { title: 'Item', dataIndex: 'items', width: 130 },
//     { title: 'Brand', dataIndex: 'brand', width: 130 },
//     { title: 'Single', dataIndex: 'single', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: '5+', dataIndex: 'qty_5_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: '10+', dataIndex: 'qty_10_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: '20+', dataIndex: 'qty_20_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: '50+', dataIndex: 'qty_50_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: '100+', dataIndex: 'qty_100_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: 'GST (%)', dataIndex: 'gst', width: 70, align: 'center', render: (val) => val > 0 ? `${val}%` : '-' },
//     { title: 'MRP', dataIndex: 'mrp', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//     { title: 'Warranty', dataIndex: 'warranty', width: 80, align: 'center', render: (warranty) => warranty || '-' },
//    {
//     title: 'Image',
//     dataIndex: 'product_image', // This maps the data from the 'product_image' column
//     width: 80,
//     render: (url) => url ? ( // The 'url' variable holds the data from product_image (the URL string)
//         <img 
//             src={url} // The image's source is set to the URL string
//             alt="Product Thumbnail" 
//             style={{ width: '60px', height: '80px', objectFit: 'contain' }}
//         />
//     ) : '-'
// },
//     {
//       title: 'Action',
//       dataIndex: 'operation',
//       width: 100,
//       fixed: 'right',
//       align: 'center',
//       render: (_, record) => (
//         <Space size="small">
//           <Typography.Link onClick={() => handleEdit(record)}>
//             Edit
//           </Typography.Link>
//           <Popconfirm 
//               title="Are you sure to delete this product?" 
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
// <Space style={{ marginBottom: 20, justifyContent: 'space-between', width: '100%' }}>
//         <h1>Manage Products Table</h1>
//         <Space>
//           {/* THE SEARCH BOX CODE: */}
//           <Input.Search 
//             placeholder="Search by Item or Brand" 
//             allowClear 
//             onSearch={handleSearch} 
//             onChange={(e) => setSearchTerm(e.target.value)} 
//             style={{ width: 300 }} 
//           />
//           <Link href="/">
//             <Button>Back to Home</Button>
//           </Link>
//         </Space>
//       </Space>

//       <Table
//         bordered
//         dataSource={filteredData}
//         columns={columns}
//         loading={loading}
//         rowKey="id"
//         pagination={{ pageSize: 15 }}
//         scroll={{ x: 1170 }}
//       />

//       {/* --- EDIT PRODUCT MODAL --- */}
//       <Modal
//         title="Edit Product"
//         open={isModalOpen}
//         onOk={handleSave}
//         onCancel={handleCancel}
//         okText="Save Changes"
//         confirmLoading={loading}
//         width={700}
//       >
//         <Form
//           form={editForm}
//           layout="vertical"
//           name="edit_product_form"
//         >
//           {/* SL NO FIELD: READ-ONLY, POPULATED BY ITEM SELECT */}
//           <Form.Item label="SL No (From Item List)" name="sl_no">
//             <InputNumber disabled style={{ width: '100%' }} /> 
//           </Form.Item>

//           <Form.Item 
//             label="Item" 
//             name="items" 
//             rules={[{ required: true, message: 'Please select an Item!' }]}
//           >
//             <Select 
//               showSearch 
//               placeholder="Select item"
//               onChange={handleItemChange} 
//               // --- CRITICAL ADDITION: CREATE BUTTON IN DROPDOWN ---
//               dropdownRender={menu => (
//                 <div>
//                   {menu}
//                   <Divider style={{ margin: '4px 0' }} />
//                   <Space style={{ padding: '4px 8px' }}>
//                     <Button 
//                       type="text" 
//                       icon={<PlusOutlined />} 
//                       onClick={() => setIsNewItemModalOpen(true)}
//                     >
//                       **Create New Item**
//                     </Button>
//                   </Space>
//                 </div>
//               )}
//               // --------------------------------------------------
//             >
//               {existingItems.map(item => (
//                 <Option key={item} value={item}>
//                   {item}
//                 </Option>
//               ))}
//             </Select>
//           </Form.Item>
          
//           <Form.Item label="Brand" name="brand" rules={[{ required: true, message: 'Please input brand!' }]}>
//             <Input />
//           </Form.Item>

//           <Typography.Title level={5}>Pricing</Typography.Title>
//           <Space wrap size="large">
//             <Form.Item label="Single" name="single">
//               <InputNumber min={0} />
//             </Form.Item>
//             <Form.Item label="5+" name="qty_5_plus">
//               <InputNumber min={0} />
//             </Form.Item>
//             <Form.Item label="10+" name="qty_10_plus">
//               <InputNumber min={0} />
//             </Form.Item>
//             <Form.Item label="20+" name="qty_20_plus">
//               <InputNumber min={0} />
//             </Form.Item>
//             <Form.Item label="50+" name="qty_50_plus">
//               <InputNumber min={0} />
//             </Form.Item>
//             <Form.Item label="100+" name="qty_100_plus">
//               <InputNumber min={0} />
//             </Form.Item>
//           </Space>

//           <Form.Item label="GST (%)" name="gst">
//             <InputNumber min={0} />
//           </Form.Item>

//           <Form.Item label="MRP" name="mrp">
//             <InputNumber min={0} />
//           </Form.Item>

//           <Form.Item label="Warranty" name="warranty">
//             <Input />
//           </Form.Item>

//           <Form.Item label="Product Image">
//     <Upload
//         customRequest={customUploadRequest}
//         listType="picture"
//         fileList={fileList}
//         onChange={handleFileChange}
//         onRemove={() => setFileList([])} // Clear file if removed
//         maxCount={1}
//         disabled={isUploading}
//     >
//         {fileList.length === 0 && (
//             <Button icon={<PlusOutlined />} loading={isUploading}>
//                 {isUploading ? 'Uploading...' : 'Click to Upload Image'}
//             </Button>
//         )}
//     </Upload>
// </Form.Item>

// {/* Optional: Show the current URL for debugging/reference */}
// <Form.Item label="Current Image URL (Read Only)" name="product_image">
//     <Input placeholder="Image URL will appear here after upload" disabled />
// </Form.Item>

//         </Form>
//       </Modal>

//       {/* --- CREATE NEW ITEM MODAL (POPS UP FROM SELECT DROPDOWN) --- */}
//       <NewItemModal 
//         isVisible={isNewItemModalOpen}
//         onClose={() => setIsNewItemModalOpen(false)}
//         onCreated={handleNewItemCreated}
//         existingItems={existingItems}
//       />
//     </div>
//   );
// }


































import { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Input, InputNumber, Button, Form, message, Popconfirm, Typography, Space, Modal, Select, Divider, Upload, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

const { Option } = Select;

// ------------------------------------------------------------------
// --- NESTED COMPONENT: NEW ITEM CREATION MODAL (Updated) ---
// ------------------------------------------------------------------

const NewItemModal = ({ isVisible, onClose, onCreated, existingItems }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    // State to hold the calculated SL No for initialValues
    const [initialSlNo, setInitialSlNo] = useState(null);

    // Handler to close the modal and reset fields
    const handleCloseModal = () => {
        form.resetFields();
        setInitialSlNo(null); // Reset the state as well
        onClose();
    };

    // useEffect now calculates the SL No and stores it in state (initialSlNo)
    useEffect(() => {
        const fetchAndSetSlNo = async () => {
            const { data: maxSlNoData, error: maxError } = await supabase
                .from('items_list')
                .select('sl_no_list')
                .order('sl_no_list', { ascending: false })
                .limit(1);

            if (maxError) {
                console.error("Error fetching max SL No:", maxError);
                message.error("Failed to calculate next SL No. Check console for details.");
                // Set to 1 as a fallback if the table is empty/fetch fails
                setInitialSlNo(1); 
                return;
            }

            const newSlNo = maxSlNoData.length > 0 ? maxSlNoData[0].sl_no_list + 1 : 1;
            setInitialSlNo(newSlNo); 
        };

        if (isVisible) {
            fetchAndSetSlNo();  
        }
    }, [isVisible]);

    // Submission logic
    const handleCreateNewItem = async (values) => {
        try {
            setLoading(true);

            if (existingItems.includes(values.item_name)) {
                message.error(`Item "${values.item_name}" already exists.`);
                setLoading(false);
                return;
            }
            
            // Get the list_sl_no from the form values, which was set by initialValues
            const finalSlNo = values.list_sl_no; 
            
            if (!finalSlNo) {
                message.error("SL No calculation failed. Please try again.");
                setLoading(false);
                return;
            }

            // Insert logic...
            const { error } = await supabase
                .from('items_list')
                .insert({ item_name: values.item_name, sl_no_list: finalSlNo });

            if (error) throw error;

            message.success(`Item "${values.item_name}" created successfully with SL No ${finalSlNo}.`);
            handleCloseModal(); // Use the close handler to reset both form and state
            onCreated(values.item_name); 

        } catch (error) {
            console.error('Item creation error:', error);
            message.error(`Creation failed: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    // Prepare initial values object (Required for dynamic initialValues)
    const formInitialValues = useMemo(() => ({
        list_sl_no: initialSlNo
    }), [initialSlNo]);

    return (
        <Modal
            title="Create New Item Name" 
            open={isVisible}
            onCancel={handleCloseModal} 
            width={500}
            footer={[
                <Button key="back" onClick={handleCloseModal} disabled={loading}>Cancel</Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={() => form.submit()}
                >
                    Create Item
                </Button>,
            ]}
        >
            <Form
                form={form}
                layout="vertical"
                name="create_new_item_form"
                onFinish={handleCreateNewItem} 
                style={{ marginTop: 20 }}
                // CRITICAL ADDITION: Use the calculated SL No for initial values
                initialValues={formInitialValues} 
            >
                
                <Form.Item
                    name="list_sl_no"
                    label="List SL No"
                >
                    {/* InputNumber will be populated via initialValues */}
                    <InputNumber disabled style={{ width: '100%' }} /> 
                </Form.Item>

                <Form.Item 
                    name="item_name" 
                    label="New Item Name" 
                    rules={[{ required: true, message: 'Please input the new item name!' }]} 
                >
                    <Input placeholder="e.g., HDMI Cable 10m" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

// ------------------------------------------------------------------
// --- MAIN COMPONENT: MANAGE PRODUCTS (Layout Updated) ---
// ------------------------------------------------------------------
export default function ManageProducts() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(''); 
    const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);

    // NEW STATES FOR IMAGE UPLOAD
    const [isUploading, setIsUploading] = useState(false);
    const [fileList, setFileList] = useState([]); // Antd Upload's file list state
    
    // State for Edit Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [editForm] = Form.useForm();
    const [existingItems, setExistingItems] = useState([]);
    
    // ... (Utility Function: fetchSlNoByItem, handleItemChange - UNCHANGED) ...
    // --- Utility Function: Fetch SL No based on Item Name ---
    const fetchSlNoByItem = async (itemName) => {
        if (!itemName) return null;
        
        const { data: itemData, error } = await supabase
            .from('items_list')
            .select('sl_no_list')
            .eq('item_name', itemName)
            .single();
        
        if (error) {
            console.error("Error fetching SL No:", error);
            return null;
        }
        return itemData ? itemData.sl_no_list : null;
    };

    // --- Item Change Handler (Updates SL No field in the form) ---
    const handleItemChange = async (itemName) => {
        const newSlNo = await fetchSlNoByItem(itemName);
        editForm.setFieldsValue({ sl_no: newSlNo });
    };

    // --- Data Fetching (UNCHANGED) ---
    const fetchItemsList = useCallback(async () => {
        const { data: items, error } = await supabase
            .from('items_list')
            .select('item_name')
            .order('item_name', { ascending: true });
        
        if (!error) {
            setExistingItems(items.map(i => i.item_name));
        }
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('sl_no', { ascending: true })
            .order('brand', { ascending: true });
        
        if (error) {
            message.error(`Error fetching products: ${error.message}`);
        } else {
            setData(products.map(p => ({ ...p, key: p.id })));
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
        fetchItemsList();
    }, [fetchData, fetchItemsList]);



    const filteredData = useMemo(() => { 
        if (!searchTerm) return data;
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return data.filter(product =>
            (product.items && product.items.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (product.brand && product.brand.toLowerCase().includes(lowerCaseSearchTerm))
        );
    }, [data, searchTerm]);

    const handleSearch = (value) => {
        setSearchTerm(value);
    };


    // --- Item Creation Handlers (UNCHANGED) ---
    const handleNewItemCreated = (newItemName) => {
        // 1. Refetch the items list to include the new item
        fetchItemsList();
        // 2. Automatically select the newly created item in the product edit form
        editForm.setFieldsValue({ items: newItemName });
        // 3. Trigger the SL No update for the newly selected item
        handleItemChange(newItemName);
    };


    // --- Custom Upload Request (UNCHANGED) ---
    const customUploadRequest = async ({ file, onSuccess, onError }) => {
        setIsUploading(true);
        
        // 1. Prepare FormData to send the file to the Next.js API route
        const formData = new FormData();
        formData.append('image', file); 

        try {
            // 2. Send the file to the secure local API route
            const response = await fetch('/api/product-image-upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed on the server.');
            }

            // The API route should return the final Cloudinary URL as 'imageUrl'
            const fileURL = result.imageUrl; 

            // 3. Update Antd Upload state (success)
            onSuccess(fileURL, file); 
            message.success(`${file.name} uploaded successfully to Cloudinary.`);
            
            // Update the form field with the new URL
            editForm.setFieldsValue({ product_image: fileURL }); 

        } catch (error) {
            console.error('Upload Error:', error);
            onError(error);
            message.error(`Upload failed: ${error.message || 'Unknown network error'}`);
        } finally {
            setIsUploading(false);
        }
    };

    /**
    * Handles changes to the Ant Design Upload component's file list.
    */
    const handleFileChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };


    // --- Modal Handlers (UNCHANGED logic, but integrated new fileList state) ---
    const handleEdit = (record) => {
        setEditingRecord(record);
        editForm.setFieldsValue(record);
        setIsModalOpen(true);
        
        // Initialize fileList state for existing image
        if (record.product_image) {
            setFileList([
                {
                    uid: record.id, // Use record id for uid
                    name: record.product_image.substring(record.product_image.lastIndexOf('/') + 1),
                    status: 'done',
                    url: record.product_image,
                },
            ]);
        } else {
            setFileList([]);
        }

        if (record.items) { 
            handleItemChange(record.items); 
        }
    };

    const handleSave = async () => {
        try {
            const values = await editForm.validateFields();
            const key = editingRecord.id;

            // Logic to get the final image URL
            let finalImageUrl = null; 

            if (fileList.length > 0 && fileList[0].status === 'done') {
                // Use the 'response' (new upload URL) or 'url' (existing image URL)
                finalImageUrl = fileList[0].response || fileList[0].url; 
            } else if (fileList.length === 0) {
                // If the user removed the image, set URL to null
                finalImageUrl = null;
            }

            // Use the dynamically updated SL No from the form state
            const finalSlNo = values.sl_no;

            const updatePayload = {
                ...values,
                sl_no: finalSlNo,
                product_image: finalImageUrl,
            };

            // Remove temporary fields
            delete updatePayload.product_image_temp; 

            setLoading(true);
            const { error } = await supabase
                .from('products')
                .update(updatePayload)
                .eq('id', key);

            if (error) throw error;

            message.success('Product updated successfully.');
            setIsModalOpen(false);
            setEditingRecord(null);
            setFileList([]); // Clear file state on successful save
            await fetchData();

        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
            if (errInfo.message) message.error(`Save failed: ${errInfo.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingRecord(null);
        editForm.resetFields();
        setFileList([]); // Clear file state on cancel
    };

    // --- Delete Handler (UNCHANGED) ---
    const handleDelete = async (key) => {
        setLoading(true);
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', key);

        if (error) {
            message.error(`Deletion failed: ${error.message}`);
        } else {
            message.success('Product deleted successfully.');
            await fetchData(); 
        }
        setLoading(false);
    };

    // --- Table Columns Definition (UNCHANGED) ---
    const columns = [
        { title: 'SL No', dataIndex: 'sl_no', width: 60, align: 'center' }, 
        { title: 'Item', dataIndex: 'items', width: 130 },
        { title: 'Brand', dataIndex: 'brand', width: 130 },
        { title: 'Single', dataIndex: 'single', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
        { title: '5+', dataIndex: 'qty_5_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
        { title: '10+', dataIndex: 'qty_10_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
        { title: '20+', dataIndex: 'qty_20_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
        { title: '50+', dataIndex: 'qty_50_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
        { title: '100+', dataIndex: 'qty_100_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
        { title: 'GST (%)', dataIndex: 'gst', width: 70, align: 'center', render: (val) => val > 0 ? `${val}%` : '-' },
        { title: 'MRP', dataIndex: 'mrp', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
        { title: 'Warranty', dataIndex: 'warranty', width: 80, align: 'center', render: (warranty) => warranty || '-' },
        {
            title: 'Image',
            dataIndex: 'product_image',
            width: 80,
            render: (url) => url ? (
                <img 
                    src={url}
                    alt="Product Thumbnail" 
                    style={{ width: '60px', height: '80px', objectFit: 'contain' }}
                />
            ) : '-'
        },
        {
            title: 'Action',
            dataIndex: 'operation',
            width: 100,
            fixed: 'right',
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Typography.Link onClick={() => handleEdit(record)}>
                        Edit
                    </Typography.Link>
                    <Popconfirm 
                        title="Are you sure to delete this product?" 
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
                <h1>Manage Products Table</h1>
                <Space>
                    {/* THE SEARCH BOX CODE: */}
                    <Input.Search 
                        placeholder="Search by Item or Brand" 
                        allowClear 
                        onSearch={handleSearch} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        style={{ width: 300 }} 
                    />
                    <Link href="/">
                        <Button>Back to Home</Button>
                    </Link>
                </Space>
            </Space>

            <Table
                bordered
                dataSource={filteredData}
                columns={columns}
                loading={loading}
                rowKey="id"
                pagination={{ pageSize: 15 }}
                scroll={{ x: 1300 }}
            />

            {/* --- EDIT PRODUCT MODAL (Updated Layout) --- */}
            <Modal
                title="Edit Product"
                open={isModalOpen}
                onOk={handleSave}
                onCancel={handleCancel}
                okText="Save Changes"
                confirmLoading={loading}
                width={700}
                style={{ maxWidth: 800 }} // Max width to match add-product.js layout feel
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    name="edit_product_form"
                >
                    {/* ROW 1: Identifiers (SL No, Item Name, Brand) */}
                    <Row gutter={16}>
                        {/* SL No: Takes 4 columns (disabled) */}
                        <Col span={4}>
                            <Form.Item label="SL No" name="sl_no">
                                <InputNumber disabled style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        {/* Item Name + Create Button: Takes 12 columns */}
                        <Col span={12}>
                            <Form.Item 
                                label="Item Name" 
                                name="items" 
                                rules={[{ required: true, message: 'Item Name is required' }]}
                            >
                                <Select 
                                    showSearch 
                                    placeholder="Select item"
                                    onChange={handleItemChange} 
                                    // --- CREATE BUTTON IN DROPDOWN ---
                                    dropdownRender={menu => (
                                        <div>
                                            {menu}
                                            <Divider style={{ margin: '4px 0' }} />
                                            <Space style={{ padding: '4px 8px' }}>
                                                <Button 
                                                    type="text" 
                                                    icon={<PlusOutlined />} 
                                                    onClick={() => setIsNewItemModalOpen(true)}
                                                >
                                                    **Create New Item**
                                                </Button>
                                            </Space>
                                        </div>
                                    )}
                                >
                                    {existingItems.map(item => (
                                        <Option key={item} value={item}>
                                            {item}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        {/* Brand: Takes 8 columns */}
                        <Col span={8}>
                            <Form.Item label="Brand" name="brand" rules={[{ required: true, message: 'Brand is required' }]}>
                                <Input placeholder="Brand Name" />
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    <Divider orientation="left" style={{ margin: '10px 0 20px 0', fontSize: '14px', color: '#888' }}>Price List</Divider>

                    {/* ROW 2: Base Prices (Single, 5+, 10+) */}
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item label="Single Price" name="single">
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="5+ Qty" name="qty_5_plus">
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="10+ Qty" name="qty_10_plus">
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* ROW 3: Bulk Prices (20+, 50+, 100+) */}
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item label="20+ Qty" name="qty_20_plus">
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="50+ Qty" name="qty_50_plus">
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="100+ Qty" name="qty_100_plus">
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left" style={{ margin: '10px 0 20px 0', fontSize: '14px', color: '#888' }}>Product Details</Divider>

                    {/* ROW 4: Details (GST, MRP, Warranty) */}
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item label="GST (%)" name="gst">
                                <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="%" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="MRP" name="mrp">
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Warranty" name="warranty">
                                <Input placeholder="e.g., 1 Year" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* ROW 5: Image Upload (Full width) */}
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label="Product Image">
                                <Upload
                                    customRequest={customUploadRequest}
                                    listType="picture"
                                    fileList={fileList}
                                    onChange={handleFileChange}
                                    onRemove={() => setFileList([])}
                                    maxCount={1}
                                    disabled={isUploading}
                                    showUploadList={false}
                                >

                                    {/* MANUAL UI LOGIC:
                1. If file is NOT present, show the Upload Button.
                2. If file IS present, show the Image Preview and a Remove button.
                */}
                {fileList.length === 0 ? (
                    <Button icon={<PlusOutlined />} loading={isUploading}>
                        {isUploading ? 'Uploading...' : 'Click to Upload Image'}
                    </Button>
                ) : (
                    // Show a styled preview area when a file is present
                    <div style={{ position: 'relative', width: 104, height: 104, border: '1px solid #d9d9d9', borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        
                        {/* Image Preview */}
                        <img 
                            src={fileList[0].url || fileList[0].response} 
                            alt="Product Preview" 
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                        />

                        {/* Remove Button Overlay */}
                        <Button
                            type="primary"
                            danger
                            icon={<PlusOutlined rotate={45} />} // Using PlusOutlined rotated 45 deg for 'X'
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent upload dialog from opening
                                setFileList([]); // Manually clear file list on remove
                                message.info('Image removed. Click "Save Changes" to confirm.');
                                editForm.setFieldsValue({ product_image: null }); // Clear form value
                            }}
                            style={{ position: 'absolute', top: 2, right: 2, opacity: 0.8 }}
                        />
                    </div>
                )}

                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Optional: Current Image URL (Removed from the structured layout for cleanliness) */}
                    {/* <Form.Item label="Current Image URL (Read Only)" name="product_image">
                        <Input placeholder="Image URL will appear here after upload" disabled />
                    </Form.Item> */}
                </Form>
            </Modal>

            {/* --- CREATE NEW ITEM MODAL (POPS UP FROM SELECT DROPDOWN) --- */}
            <NewItemModal 
                isVisible={isNewItemModalOpen}
                onClose={() => setIsNewItemModalOpen(false)}
                onCreated={handleNewItemCreated}
                existingItems={existingItems}
            />
        </div>
    );
}