

// import { useState, useEffect, useCallback, useMemo } from 'react';
// import { Table, Input, InputNumber, Button, Form, message, Popconfirm, Typography, Space, Modal, Select, Divider, Upload, Row, Col } from 'antd';
// import { PlusOutlined } from '@ant-design/icons';
// import { supabase } from '../lib/supabaseClient';
// import Link from 'next/link';

// const { Option } = Select;

// // ------------------------------------------------------------------
// // --- NESTED COMPONENT: NEW ITEM CREATION MODAL (Updated) ---
// // ------------------------------------------------------------------

// const NewItemModal = ({ isVisible, onClose, onCreated, existingItems }) => {
//     const [form] = Form.useForm();
//     const [loading, setLoading] = useState(false);
//     // State to hold the calculated SL No for initialValues
//     const [initialSlNo, setInitialSlNo] = useState(null);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [editingRecord, setEditingRecord] = useState(null);

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
//             setInitialSlNo(newSlNo); 
//         };

//         if (isVisible) {
//             fetchAndSetSlNo();  
//         }
//     }, [isVisible]);

//     // Submission logic
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

//     // Prepare initial values object (Required for dynamic initialValues)
//     const formInitialValues = useMemo(() => ({
//         list_sl_no: initialSlNo
//     }), [initialSlNo]);

//     return (
//         <Modal
//             title="Create New Item Name" 
//             open={isVisible}
//             onCancel={handleCloseModal} 
//             width={500}
//             footer={[
//                 <Button key="back" onClick={handleCloseModal} disabled={loading}>Cancel</Button>,
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
//                 // CRITICAL ADDITION: Use the calculated SL No for initial values
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
//             </Form>
//         </Modal>
//     );
// };

// // ------------------------------------------------------------------
// // --- MAIN COMPONENT: MANAGE PRODUCTS (Layout Updated) ---
// // ------------------------------------------------------------------
// export default function ManageProducts() {
//     const [data, setData] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState(''); 
//     const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);

//     // NEW STATES FOR IMAGE UPLOAD
//     const [isUploading, setIsUploading] = useState(false);
//     const [fileList, setFileList] = useState([]); // Antd Upload's file list state
    
//     // State for Edit Modal
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [editingRecord, setEditingRecord] = useState(null);
//     const [editForm] = Form.useForm();
//     const [existingItems, setExistingItems] = useState([]);
    
//     // ... (Utility Function: fetchSlNoByItem, handleItemChange - UNCHANGED) ...
//     // --- Utility Function: Fetch SL No based on Item Name ---
//     const fetchSlNoByItem = async (itemName) => {
//         if (!itemName) return null;
        
//         const { data: itemData, error } = await supabase
//             .from('items_list')
//             .select('sl_no_list')
//             .eq('item_name', itemName)
//             .single();
        
//         if (error) {
//             console.error("Error fetching SL No:", error);
//             return null;
//         }
//         return itemData ? itemData.sl_no_list : null;
//     };

//     // --- Item Change Handler (Updates SL No field in the form) ---
//     const handleItemChange = async (itemName) => {
//         const newSlNo = await fetchSlNoByItem(itemName);
//         editForm.setFieldsValue({ sl_no: newSlNo });
//     };

//     // --- Data Fetching (UNCHANGED) ---
//     const fetchItemsList = useCallback(async () => {
//         const { data: items, error } = await supabase
//             .from('items_list')
//             .select('item_name')
//             .order('item_name', { ascending: true });
        
//         if (!error) {
//             setExistingItems(items.map(i => i.item_name));
//         }
//     }, []);

//     const fetchData = useCallback(async () => {
//         setLoading(true);
//         const { data: products, error } = await supabase
//             .from('products')
//             .select('*')
//             .order('sl_no', { ascending: true })
//             .order('brand', { ascending: true });
        
//         if (error) {
//             message.error(`Error fetching products: ${error.message}`);
//         } else {
//             setData(products.map(p => ({ ...p, key: p.id })));
//         }
//         setLoading(false);
//     }, []);

//     useEffect(() => {
//         fetchData();
//         fetchItemsList();
//     }, [fetchData, fetchItemsList]);



//     const filteredData = useMemo(() => { 
//         if (!searchTerm) return data;
//         const lowerCaseSearchTerm = searchTerm.toLowerCase();
//         return data.filter(product =>
//             (product.items && product.items.toLowerCase().includes(lowerCaseSearchTerm)) ||
//             (product.brand && product.brand.toLowerCase().includes(lowerCaseSearchTerm))
//         );
//     }, [data, searchTerm]);

//     const handleSearch = (value) => {
//         setSearchTerm(value);
//     };


//     // --- Item Creation Handlers (UNCHANGED) ---
//     const handleNewItemCreated = (newItemName) => {
//         // 1. Refetch the items list to include the new item
//         fetchItemsList();
//         // 2. Automatically select the newly created item in the product edit form
//         editForm.setFieldsValue({ items: newItemName });
//         // 3. Trigger the SL No update for the newly selected item
//         handleItemChange(newItemName);
//     };


//     // --- Custom Upload Request (UNCHANGED) ---
//     const customUploadRequest = async ({ file, onSuccess, onError }) => {
//         setIsUploading(true);
        
//         // 1. Prepare FormData to send the file to the Next.js API route
//         const formData = new FormData();
//         formData.append('image', file); 

//         try {
//             // 2. Send the file to the secure local API route
//             const response = await fetch('/api/product-image-upload', {
//                 method: 'POST',
//                 body: formData,
//             });

//             const result = await response.json();

//             if (!response.ok) {
//                 throw new Error(result.error || 'Upload failed on the server.');
//             }

//             // The API route should return the final Cloudinary URL as 'imageUrl'
//             const fileURL = result.imageUrl; 

//             // 3. Update Antd Upload state (success)
//             onSuccess(fileURL, file); 
//             message.success(`${file.name} uploaded successfully to Cloudinary.`);
            
//             // Update the form field with the new URL
//             editForm.setFieldsValue({ product_image: fileURL }); 

//         } catch (error) {
//             console.error('Upload Error:', error);
//             onError(error);
//             message.error(`Upload failed: ${error.message || 'Unknown network error'}`);
//         } finally {
//             setIsUploading(false);
//         }
//     };

//     /**
//     * Handles changes to the Ant Design Upload component's file list.
//     */
//     const handleFileChange = ({ fileList: newFileList }) => {
//         setFileList(newFileList);
//     };


//     // --- Modal Handlers (UNCHANGED logic, but integrated new fileList state) ---
//     const handleEdit = (record) => {
//         setEditingRecord(record);
//         editForm.setFieldsValue(record);
//         setIsModalOpen(true);
        
//         // Initialize fileList state for existing image
//         if (record.product_image) {
//             setFileList([
//                 {
//                     uid: record.id, // Use record id for uid
//                     name: record.product_image.substring(record.product_image.lastIndexOf('/') + 1),
//                     status: 'done',
//                     url: record.product_image,
//                 },
//             ]);
//         } else {
//             setFileList([]);
//         }

//         if (record.items) { 
//             handleItemChange(record.items); 
//         }
//     };




// const handleSave = async () => {
//     try {
//         const values = await editForm.validateFields();

//         // 1. Generate diff
//         let diffArray = [];
//         const fieldsToCompare = [
//             'items', 'brand', 'single','qty_5_plus', 
//             'qty_10_plus', 'qty_20_plus', 'qty_50_plus', 'qty_100_plus',
//             'gst', 'warranty', 'mrp'
//         ];

//         fieldsToCompare.forEach(field => {
//             if (values[field] !== editingRecord[field]) {
//                 const oldVal = editingRecord[field] ?? 'None';
//                 const newVal = values[field] ?? 'None';
//                 diffArray.push(`${field.toUpperCase()}: (${oldVal} → ${newVal})`);
//             }
//         });

//         const diffString =
//             diffArray.length > 0 ? diffArray.join(' | ') : 'Only image updated';

//         // 2. Insert into staging (EXPLICIT MAPPING)
//         const { error: stageError } = await supabase
//             .from('staged_products')
//             .insert([{
//                 sl_no: editingRecord.sl_no,
//                 items: values.items,
//                 brand: values.brand,
//                 single: values.single,
//                 qty_5_plus: values.qty_5_plus,
//                 qty_10_plus: values.qty_10_plus,
//                 qty_20_plus: values.qty_20_plus,
//                 qty_50_plus: values.qty_50_plus,
//                 qty_100_plus: values.qty_100_plus,
//                 gst: values.gst,
//                 mrp: values.mrp,
//                 warranty: values.warranty,
//                 product_image:
//                     fileList?.[0]?.url ||
//                     fileList?.[0]?.response ||
//                     editingRecord.product_image,
//                 staging_type: 'EDIT_PRODUCT',
//                 original_product_id: editingRecord.id
//             }]);

//         if (stageError) throw stageError;

//         // 3. Log the request
//         await supabase.from('activity_logs').insert([{
//             action_type: 'EDIT_REQUEST',
//             product_name: editingRecord.items,
//             details: diffString
//         }]);

//         message.success('Edit request sent for admin approval');

        
//         setIsModalOpen(false);
//         editForm.resetFields();
//         setFileList([]);
//         setEditingRecord(null);

//     } catch (error) {
//         console.error(error);
//         message.error(`Save failed: ${error.message}`);
//     }
// };






//     const handleCancel = () => {
//         setIsModalOpen(false);
//         setEditingRecord(null);
//         editForm.resetFields();
//         setFileList([]); // Clear file state on cancel
//     };




// const handleDeleteRequest = async (record) => {
//     setLoading(true);

//     try {
//         console.log("Starting delete request for:", record.items);

//         const { id } = record;

//         const { error: stageError } = await supabase
//             .from('staged_products')
//             .insert([{
//                 sl_no: record.sl_no,
//                 items: record.items,
//                 brand: record.brand,
                
//                 staging_type: 'DELETE_REQUEST',
//                 original_product_id: id
//             }]);

//         if (stageError) throw stageError;

//         await supabase
//             .from('activity_logs')
//             .insert([{
//                 action_type: 'DELETE_REQUEST',
//                 product_name: record.items,
//                 details: `Delete request submitted for Product (SL: ${record.sl_no}).`
//             }]);

//         message.warning("Delete request sent for admin approval.");

//         if (typeof fetchData === 'function') await fetchData();

//     } catch (error) {
//         console.error("Error occurred:", error);
//         message.error(`Request failed: ${error.message}`);
//     } finally {
//         setLoading(false);
//     }
// };







//     // --- Table Columns Definition (UNCHANGED) ---
//     const columns = [
//         { title: 'SL No', dataIndex: 'sl_no', width: 60, align: 'center' }, 
//         { title: 'Item', dataIndex: 'items', width: 130 },
//         { title: 'Brand', dataIndex: 'brand', width: 130 },
//         { title: 'Single', dataIndex: 'single', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//         { title: '5+', dataIndex: 'qty_5_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//         { title: '10+', dataIndex: 'qty_10_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//         { title: '20+', dataIndex: 'qty_20_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//         { title: '50+', dataIndex: 'qty_50_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//         { title: '100+', dataIndex: 'qty_100_plus', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//         { title: 'GST (%)', dataIndex: 'gst', width: 70, align: 'center', render: (val) => val > 0 ? `${val}%` : '-' },
//         { title: 'MRP', dataIndex: 'mrp', width: 60, align: 'center', render: (val) => val > 0 ? `₹${val}` : '-' },
//         { title: 'Warranty', dataIndex: 'warranty', width: 80, align: 'center', render: (warranty) => warranty || '-' },
//         {
//             title: 'Image',
//             dataIndex: 'product_image',
//             width: 80,
//             render: (url) => url ? (
//                 <img 
//                     src={url}
//                     alt="Product Thumbnail" 
//                     style={{ width: '60px', height: '80px', objectFit: 'contain' }}
//                 />
//             ) : '-'
//         },
//         {
//             title: 'Action',
//             dataIndex: 'operation',
//             width: 100,
//             fixed: 'right',
//             align: 'center',
//             render: (_, record) => (
//                 <Space size="small">
//                     <Typography.Link onClick={() => handleEdit(record)}>
//                         Edit
//                     </Typography.Link>
//                     <Popconfirm 
//                         title="Are you sure to delete this product?" 
//                         onConfirm={() => handleDeleteRequest(record)}
//                         okText="Yes"
//                         cancelText="No"
//                     >
//                         <Button type="link" danger style={{ padding: 0 }}>
//                             Delete
//                         </Button>
//                     </Popconfirm>
//                 </Space>
//             ),
//         },
//     ];

//     return (
//         <div style={{ padding: 20 }}>
//             <Space style={{ marginBottom: 20, justifyContent: 'space-between', width: '100%' }}>
//                 <h1>Manage Products Table</h1>
//                 <Space>
//                     {/* THE SEARCH BOX CODE: */}
//                     <Input.Search 
//                         placeholder="Search by Item or Brand" 
//                         allowClear 
//                         onSearch={handleSearch} 
//                         onChange={(e) => setSearchTerm(e.target.value)} 
//                         style={{ width: 300 }} 
//                     />
//                     <Link href="/">
//                         <Button>Back to Home</Button>
//                     </Link>
//                 </Space>
//             </Space>

//             <Table
//                 bordered
//                 dataSource={filteredData}
//                 columns={columns}
//                 loading={loading}
//                 rowKey="id"
//                 pagination={{ pageSize: 15 }}
//                 scroll={{ x: 1300 }}
//             />

//             {/* --- EDIT PRODUCT MODAL (Updated Layout) --- */}
//             <Modal
//                 title="Edit Product"
//                 open={isModalOpen}
//                 onOk={handleSave}
//                 onCancel={handleCancel}
//                 okText="Save Changes"
//                 confirmLoading={loading}
//                 width={700}
//                 style={{ maxWidth: 800 }} // Max width to match add-product.js layout feel
//             >
//                 <Form
//                     form={editForm}
//                     layout="vertical"
//                     name="edit_product_form"
//                 >
//                     {/* ROW 1: Identifiers (SL No, Item Name, Brand) */}
//                     <Row gutter={16}>
//                         {/* SL No: Takes 4 columns (disabled) */}
//                         <Col span={4}>
//                             <Form.Item label="SL No" name="sl_no">
//                                 <InputNumber disabled style={{ width: '100%' }} />
//                             </Form.Item>
//                         </Col>
//                         {/* Item Name + Create Button: Takes 12 columns */}
//                         <Col span={12}>
//                             <Form.Item 
//                                 label="Item Name" 
//                                 name="items" 
//                                 rules={[{ required: true, message: 'Item Name is required' }]}
//                             >
//                                 <Select 
//                                     showSearch 
//                                     placeholder="Select item"
//                                     onChange={handleItemChange} 
//                                     // --- CREATE BUTTON IN DROPDOWN ---
//                                     dropdownRender={menu => (
//                                         <div>
//                                             {menu}
//                                             <Divider style={{ margin: '4px 0' }} />
//                                             <Space style={{ padding: '4px 8px' }}>
//                                                 <Button 
//                                                     type="text" 
//                                                     icon={<PlusOutlined />} 
//                                                     onClick={() => setIsNewItemModalOpen(true)}
//                                                 >
//                                                     **Create New Item**
//                                                 </Button>
//                                             </Space>
//                                         </div>
//                                     )}
//                                 >
//                                     {existingItems.map(item => (
//                                         <Option key={item} value={item}>
//                                             {item}
//                                         </Option>
//                                     ))}
//                                 </Select>
//                             </Form.Item>
//                         </Col>
//                         {/* Brand: Takes 8 columns */}
//                         <Col span={8}>
//                             <Form.Item label="Brand" name="brand" rules={[{ required: true, message: 'Brand is required' }]}>
//                                 <Input placeholder="Brand Name" />
//                             </Form.Item>
//                         </Col>
//                     </Row>
                    
//                     <Divider orientation="left" style={{ margin: '10px 0 20px 0', fontSize: '14px', color: '#888' }}>Price List</Divider>

//                     {/* ROW 2: Base Prices (Single, 5+, 10+) */}
//                     <Row gutter={16}>
//                         <Col span={8}>
//                             <Form.Item label="Single Price" name="single">
//                                 <InputNumber min={0} style={{ width: '100%' }} />
//                             </Form.Item>
//                         </Col>
//                         <Col span={8}>
//                             <Form.Item label="5+ Qty" name="qty_5_plus">
//                                 <InputNumber min={0} style={{ width: '100%' }} />
//                             </Form.Item>
//                         </Col>
//                         <Col span={8}>
//                             <Form.Item label="10+ Qty" name="qty_10_plus">
//                                 <InputNumber min={0} style={{ width: '100%' }} />
//                             </Form.Item>
//                         </Col>
//                     </Row>

//                     {/* ROW 3: Bulk Prices (20+, 50+, 100+) */}
//                     <Row gutter={16}>
//                         <Col span={8}>
//                             <Form.Item label="20+ Qty" name="qty_20_plus">
//                                 <InputNumber min={0} style={{ width: '100%' }} />
//                             </Form.Item>
//                         </Col>
//                         <Col span={8}>
//                             <Form.Item label="50+ Qty" name="qty_50_plus">
//                                 <InputNumber min={0} style={{ width: '100%' }} />
//                             </Form.Item>
//                         </Col>
//                         <Col span={8}>
//                             <Form.Item label="100+ Qty" name="qty_100_plus">
//                                 <InputNumber min={0} style={{ width: '100%' }} />
//                             </Form.Item>
//                         </Col>
//                     </Row>

//                     <Divider orientation="left" style={{ margin: '10px 0 20px 0', fontSize: '14px', color: '#888' }}>Product Details</Divider>

//                     {/* ROW 4: Details (GST, MRP, Warranty) */}
//                     <Row gutter={16}>
//                         <Col span={8}>
//                             <Form.Item label="GST (%)" name="gst">
//                                 <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="%" />
//                             </Form.Item>
//                         </Col>
//                         <Col span={8}>
//                             <Form.Item label="MRP" name="mrp">
//                                 <InputNumber min={0} style={{ width: '100%' }} />
//                             </Form.Item>
//                         </Col>
//                         <Col span={8}>
//                             <Form.Item label="Warranty" name="warranty">
//                                 <Input placeholder="e.g., 1 Year" />
//                             </Form.Item>
//                         </Col>
//                     </Row>

//                     {/* ROW 5: Image Upload (Full width) */}
//                     <Row gutter={16}>
//                         <Col span={24}>
//                             <Form.Item label="Product Image">
//                                 <Upload
//                                     customRequest={customUploadRequest}
//                                     listType="picture"
//                                     fileList={fileList}
//                                     onChange={handleFileChange}
//                                     onRemove={() => setFileList([])}
//                                     maxCount={1}
//                                     disabled={isUploading}
//                                     showUploadList={false}
//                                 >

//                                     {/* MANUAL UI LOGIC:
//                 1. If file is NOT present, show the Upload Button.
//                 2. If file IS present, show the Image Preview and a Remove button.
//                 */}
//                 {fileList.length === 0 ? (
//                     <Button icon={<PlusOutlined />} loading={isUploading}>
//                         {isUploading ? 'Uploading...' : 'Click to Upload Image'}
//                     </Button>
//                 ) : (
//                     // Show a styled preview area when a file is present
//                     <div style={{ position: 'relative', width: 104, height: 104, border: '1px solid #d9d9d9', borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        
//                         {/* Image Preview */}
//                         <img 
//                             src={fileList[0].url || fileList[0].response} 
//                             alt="Product Preview" 
//                             style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
//                         />

//                         {/* Remove Button Overlay */}
//                         <Button
//                             type="primary"
//                             danger
//                             icon={<PlusOutlined rotate={45} />} // Using PlusOutlined rotated 45 deg for 'X'
//                             size="small"
//                             onClick={(e) => {
//                                 e.stopPropagation(); // Prevent upload dialog from opening
//                                 setFileList([]); // Manually clear file list on remove
//                                 message.info('Image removed. Click "Save Changes" to confirm.');
//                                 editForm.setFieldsValue({ product_image: null }); // Clear form value
//                             }}
//                             style={{ position: 'absolute', top: 2, right: 2, opacity: 0.8 }}
//                         />
//                     </div>
//                 )}

//                                 </Upload>
//                             </Form.Item>
//                         </Col>
//                     </Row>

//                     {/* Optional: Current Image URL (Removed from the structured layout for cleanliness) */}
//                     {/* <Form.Item label="Current Image URL (Read Only)" name="product_image">
//                         <Input placeholder="Image URL will appear here after upload" disabled />
//                     </Form.Item> */}
//                 </Form>
//             </Modal>

//             {/* --- CREATE NEW ITEM MODAL (POPS UP FROM SELECT DROPDOWN) --- */}
//             <NewItemModal 
//                 isVisible={isNewItemModalOpen}
//                 onClose={() => setIsNewItemModalOpen(false)}
//                 onCreated={handleNewItemCreated}
//                 existingItems={existingItems}
//             />
//         </div>
//     );
// }






import { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Input, InputNumber, Button, Form, message, Popconfirm, Typography, Space, Modal, Select, Divider, Upload, Row, Col,AutoComplete } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

const { Option } = Select;
const { Title, Text } = Typography;

// ------------------------------------------------------------------
// --- NESTED COMPONENT: NEW ITEM CREATION MODAL ---
// ------------------------------------------------------------------
const NewItemModal = ({ isVisible, onClose, onCreated, existingItems }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [initialSlNo, setInitialSlNo] = useState(null);

    const handleCloseModal = () => {
        form.resetFields();
        setInitialSlNo(null);
        onClose();
    };

    useEffect(() => {
        const fetchAndSetSlNo = async () => {
            const { data: maxSlNoData, error: maxError } = await supabase
                .from('items_list')
                .select('sl_no_list')
                .order('sl_no_list', { ascending: false })
                .limit(1);

            if (maxError) {
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

    const handleCreateNewItem = async (values) => {
        try {
            setLoading(true);
            if (existingItems.includes(values.item_name)) {
                message.error(`Item "${values.item_name}" already exists.`);
                setLoading(false);
                return;
            }
            const finalSlNo = values.list_sl_no; 
            if (!finalSlNo) {
                message.error("SL No calculation failed.");
                setLoading(false);
                return;
            }

            const { error } = await supabase
                .from('items_list')
                .insert({ item_name: values.item_name, sl_no_list: finalSlNo });

            if (error) throw error;
            message.success(`Item "${values.item_name}" created successfully.`);
            handleCloseModal();
            onCreated(values.item_name); 
        } catch (error) {
            message.error(`Creation failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Create New Item Name" 
            open={isVisible}
            onCancel={handleCloseModal} 
            footer={[
                <Button key="back" onClick={handleCloseModal} disabled={loading}>Cancel</Button>,
                <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>Create Item</Button>,
            ]}
        >
            <Form form={form} layout="vertical" onFinish={handleCreateNewItem} initialValues={{ list_sl_no: initialSlNo }}>
                <Form.Item name="list_sl_no" label="List SL No">
                    <InputNumber disabled style={{ width: '100%' }} /> 
                </Form.Item>
                <Form.Item name="item_name" label="New Item Name" rules={[{ required: true }]}>
                    <Input placeholder="e.g., HDMI Cable 10m" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

// ------------------------------------------------------------------
// --- MAIN COMPONENT: MANAGE PRODUCTS ---
// ------------------------------------------------------------------
export default function ManageProducts() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(''); 
    const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [fileList, setFileList] = useState([]); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [editForm] = Form.useForm();
    const [existingItems, setExistingItems] = useState([]);
    const [brandOptions, setBrandOptions] = useState([]); // Brand Dropdown State

    // --- Utility: Fetch Brands for specific Item ---
const fetchBrandsForItem = async (itemName) => {
    if (!itemName) {
        setBrandOptions([]);
        return;
    }
    const { data: brandData, error } = await supabase
        .from('products')
        .select('brand')
        .eq('items', itemName);
    
    if (!error && brandData) {
        const uniqueBrands = [...new Set(brandData.map(b => b.brand))]
            .filter(Boolean)
            .map(brand => ({ value: brand })); // Formatted for AutoComplete
        setBrandOptions(uniqueBrands);
    }
};

    const fetchSlNoByItem = async (itemName) => {
        const { data: itemData, error } = await supabase
            .from('items_list')
            .select('sl_no_list')
            .eq('item_name', itemName)
            .single();
        return error ? null : itemData?.sl_no_list;
    };

    const handleItemChange = async (itemName) => {
        const newSlNo = await fetchSlNoByItem(itemName);
        editForm.setFieldsValue({ sl_no: newSlNo, brand: undefined });
        fetchBrandsForItem(itemName);
    };

    const fetchItemsList = useCallback(async () => {
        const { data: items, error } = await supabase.from('items_list').select('item_name').order('item_name', { ascending: true });
        if (!error) setExistingItems(items.map(i => i.item_name));
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const { data: products, error } = await supabase.from('products').select('*').order('sl_no', { ascending: true });
        if (!error) setData(products.map(p => ({ ...p, key: p.id })));
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
        fetchItemsList();
    }, [fetchData, fetchItemsList]);

    const filteredData = useMemo(() => { 
    let result = data;
    
    // 1. Apply Search Filter
    if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        result = data.filter(p => 
            p.items?.toLowerCase().includes(lower) || 
            p.brand?.toLowerCase().includes(lower)
        );
    }
    
    // 2. Forced Ascending Sort by SL No
    // This creates a new array and sorts it so the original 'data' state remains untouched
    return [...result].sort((a, b) => {
        const slA = Number(a.sl_no) || 0;
        const slB = Number(b.sl_no) || 0;
        return slA - slB;
    });
}, [data, searchTerm]);

    const handleSearch = (value) => setSearchTerm(value);

    const handleNewItemCreated = (newItemName) => {
        fetchItemsList();
        editForm.setFieldsValue({ items: newItemName });
        handleItemChange(newItemName);
    };

    const customUploadRequest = async ({ file, onSuccess, onError }) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file); 
        try {
            const response = await fetch('/api/product-image-upload', { method: 'POST', body: formData });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            onSuccess(result.imageUrl, file);
            editForm.setFieldsValue({ product_image: result.imageUrl }); 
        } catch (error) {
            onError(error);
            message.error(`Upload failed: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        editForm.setFieldsValue(record);
        fetchBrandsForItem(record.items); // Load brands for current item
        if (record.product_image) {
            setFileList([{ uid: record.id, name: 'image.png', status: 'done', url: record.product_image }]);
        } else {
            setFileList([]);
        }
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingRecord(null);
        editForm.resetFields();
        setFileList([]);
    };

    const handleSave = async () => {
        try {
            const values = await editForm.validateFields();
            let diffArray = [];
            const fields = ['items', 'brand', 'single','qty_5_plus', 'qty_10_plus', 'qty_20_plus', 'qty_50_plus', 'qty_100_plus', 'gst', 'warranty', 'mrp'];
            
            fields.forEach(f => {
                if (values[f] !== editingRecord[f]) {
                    diffArray.push(`${f.toUpperCase()}: (${editingRecord[f] ?? 'None'} → ${values[f] ?? 'None'})`);
                }
            });

            const { error } = await supabase.from('staged_products').insert([{
                ...values,
                sl_no: editingRecord.sl_no,
                product_image: fileList[0]?.url || fileList[0]?.response || editingRecord.product_image,
                staging_type: 'EDIT_PRODUCT',
                original_product_id: editingRecord.id
            }]);

            if (error) throw error;
            await supabase.from('activity_logs').insert([{ action_type: 'EDIT_REQUEST', product_name: editingRecord.items, details: diffArray.join(' | ') || 'Image updated' }]);
            
            message.success('Edit request sent for approval');
            handleCancel();
        } catch (error) {
            message.error(`Save failed: ${error.message}`);
        }
    };

    // const handleDeleteRequest = async (record) => {
    //     setLoading(true);
    //     try {
    //         const { error } = await supabase.from('staged_products').insert([{
    //             sl_no: record.sl_no, items: record.items, brand: record.brand,
    //             staging_type: 'DELETE_REQUEST', original_product_id: record.id
    //         }]);
    //         if (error) throw error;
    //         message.warning("Delete request sent for admin approval.");
    //         fetchData();
    //     } catch (error) {
    //         message.error(`Request failed: ${error.message}`);
    //     } finally {
    //         setLoading(false);
    //     }
    // };






const handleDeleteRequest = async (record) => {
    setLoading(true);
    try {
        // 1. Destructure to remove 'id' and UI-only 'key' 
        // This prevents the "column not found" error
        const { id, key, ...productData } = record;

        const { error } = await supabase.from('staged_products').insert([{
            ...productData,              // Sends GST, MRP, and all pricing
            staging_type: 'DELETE_REQUEST',
            original_product_id: record.id // Explicitly set the original ID
        }]);

        if (error) throw error;
        
        message.warning("Delete request sent for admin approval.");
        fetchData();
    } catch (error) {
        // This will now catch the specific error if any other columns are missing
        message.error(`Request failed: ${error.message}`);
    } finally {
        setLoading(false);
    }
};






    const columns = [
        { title: 'SL No', dataIndex: 'sl_no', width: 60, align: 'center' }, 
        { title: 'Item', dataIndex: 'items', width: 130 },
        { title: 'Brand', dataIndex: 'brand', width: 130 },
        { title: 'Single', dataIndex: 'single', width: 60, align: 'center', render: v => v > 0 ? `${v}` : '-' },
        { title: '5+', dataIndex: 'qty_5_plus', width: 60, align: 'center', render: v => v > 0 ? `${v}` : '-' },
        { title: '10+', dataIndex: 'qty_10_plus', width: 60, align: 'center', render: v => v > 0 ? `${v}` : '-' },
        { title: '20+', dataIndex: 'qty_20_plus', width: 60, align: 'center', render: v => v > 0 ? `${v}` : '-' },
        { title: '50+', dataIndex: 'qty_50_plus', width: 60, align: 'center', render: v => v > 0 ? `${v}` : '-' },
        { title: '100+', dataIndex: 'qty_100_plus', width: 60, align: 'center', render: v => v > 0 ? `${v}` : '-' },
        { title: 'GST (%)', dataIndex: 'gst', width: 70, align: 'center', render: (v) => (v !== null && v !== undefined) ? `${v}` : '-' },
        { title: 'MRP', dataIndex: 'mrp', width: 60, align: 'center', render: v => v > 0 ? `${v}` : '-' },
        { title: 'Warranty', dataIndex: 'warranty', width: 80, align: 'center', render: w => w || '-' },
        {
            title: 'Image',
            dataIndex: 'product_image',
            width: 80,
            render: (url) => url ? <img src={url} alt="Thumb" style={{ width: '60px', height: '80px', objectFit: 'contain' }} /> : '-'
        },
        {
            title: 'Action',
            fixed: 'right',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Button 
                        type="text" 
                        icon={<EditOutlined style={{ color: '#1890ff' }} />} 
                        onClick={() => handleEdit(record)}
                        title="Edit Product"
                />
                    <Popconfirm 
                        title="Are you sure to delete this product?" 
                        onConfirm={() => handleDeleteRequest(record)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />} 
                            title="Delete Product"
                        />
                </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 20 }}>
            <Space style={{ marginBottom: 20, justifyContent: 'space-between', width: '100%' }}>
                <Title level={3}>Manage Products Table</Title>
                <Space>
                    <Input.Search placeholder="Search by Item or Brand" allowClear onSearch={handleSearch} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: 300 }} />
                    <Link href="/"><Button>Back to Home</Button></Link>
                </Space>
            </Space>

            <Table  dataSource={filteredData} columns={columns} loading={loading} rowKey="id" pagination={{ pageSize: 15 }} scroll={{ x: 1300 }} size="small" style={{ border: 'none' }} onRow={() => ({
        style: { borderBottom: 'none' },})}/>

            <Modal title="Edit Product" open={isModalOpen} onOk={handleSave} onCancel={handleCancel} okText="Save Changes" confirmLoading={loading} width={700}>
                <Form form={editForm} layout="vertical">
                    <Row gutter={16}>
                        <Col span={4}><Form.Item label="SL No" name="sl_no"><InputNumber disabled style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={12}>
                            <Form.Item label="Item Name" name="items" rules={[{ required: true }]}>
                                <Select showSearch placeholder="Select item" onChange={handleItemChange} dropdownRender={menu => (
                                    <div>{menu}<Divider style={{ margin: '4px 0' }} /><Space style={{ padding: '4px 8px' }}><Button type="text" icon={<PlusOutlined />} onClick={() => setIsNewItemModalOpen(true)}>Create New Item</Button></Space></div>
                                )}>
                                    {existingItems.map(item => <Option key={item} value={item}>{item}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        {/* --- UPDATED BRAND DROP DOWN --- */}
                        <Col span={8}>
                            <Form.Item 
                                label="Brand" 
                                name="brand" 
                                rules={[{ required: true, message: 'Brand is required' }]}
                            >
                                <AutoComplete
                                    placeholder="Search or Type Brand"
                                    options={brandOptions}
                                    // Standard JS filtering (no TypeScript '!' allowed)
                                    filterOption={(inputValue, option) =>
                                        option && option.value 
                                            ? option.value.toUpperCase().includes(inputValue.toUpperCase()) 
                                            : false
                                    }
                                >
                                    <Input /> 
                                </AutoComplete>
                            </Form.Item>
                        </Col>
                    </Row>
                    {/* <Divider orientation="left"></Divider> */}
                    <Row gutter={16}>
                        <Col span={8}><Form.Item label="Single" name="single"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={8}><Form.Item label="5+" name="qty_5_plus"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={8}><Form.Item label="10+" name="qty_10_plus"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}><Form.Item label="20+" name="qty_20_plus"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={8}><Form.Item label="50+" name="qty_50_plus"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={8}><Form.Item label="100+" name="qty_100_plus"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                    </Row>
                    {/* <Divider orientation="left">Details</Divider> */}
                    <Row gutter={16}>
                        <Col span={8}><Form.Item label="GST (%)" name="gst"><InputNumber min={0} max={100} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={8}><Form.Item label="MRP" name="mrp"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={8}><Form.Item label="Warranty" name="warranty"><Input /></Form.Item></Col>
                    </Row>
                    <Form.Item label="Product Image">
                        <Upload customRequest={customUploadRequest} listType="picture" fileList={fileList} onChange={({fileList: nl}) => setFileList(nl)} onRemove={() => setFileList([])} maxCount={1} showUploadList={false}>
                            {fileList.length === 0 ? <Button icon={<PlusOutlined />} loading={isUploading}>Upload Image</Button> : (
                                <div style={{ position: 'relative', width: 104, height: 104, border: '1px solid #d9d9d9', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src={fileList[0].url || fileList[0].response} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                    <Button type="primary" danger icon={<PlusOutlined rotate={45} />} size="small" style={{ position: 'absolute', top: 2, right: 2 }} onClick={(e) => { e.stopPropagation(); setFileList([]); editForm.setFieldsValue({ product_image: null }); }} />
                                </div>
                            )}
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
            <NewItemModal isVisible={isNewItemModalOpen} onClose={() => setIsNewItemModalOpen(false)} onCreated={handleNewItemCreated} existingItems={existingItems} />
        </div>
    );
}