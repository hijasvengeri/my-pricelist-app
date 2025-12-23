

// // pages/add-product.js

// import { useState, useEffect, useCallback } from "react";
// import { Form, Input, InputNumber, Button, Select, message, Modal, Space } from "antd";
// import { PlusOutlined } from "@ant-design/icons";
// import { useRouter } from "next/router";
// import { Row, Col } from 'antd';

// const { Option } = Select;

// export default function AddProduct() {
//   const [form] = Form.useForm();
//   const [createItemForm] = Form.useForm(); 
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [creatingItem, setCreatingItem] = useState(false);

//   const [existingItems, setExistingItems] = useState([]); 
//   const [itemDetails, setItemDetails] = useState([]);       
//   const [allProducts, setAllProducts] = useState([]);       
//   const [nextListSlNo, setNextListSlNo] = useState(1); 
  
//   const [selectedFile, setSelectedFile] = useState(null); // State for File
  
//   // --- File Change Handler ---
//   const handleFileChange = (e) => {
//       // Capture the first file selected by the user
//       if (e.target.files && e.target.files.length > 0) {
//           setSelectedFile(e.target.files[0]);
//       } else {
//           setSelectedFile(null);
//       }
//   };

//   // --- SL No Calculation Logic ---
//   const calculateNextSlNo = useCallback((selectedItem) => {
//     if (!selectedItem) {
//         form.setFieldsValue({ sl_no: 1 });
//         return;
//     }

//     const selectedItemDetail = itemDetails.find(detail => detail.item_name === selectedItem);
    
//     let targetSlNo = 1;

//     if (selectedItemDetail && selectedItemDetail.sl_no_list) {
//         targetSlNo = selectedItemDetail.sl_no_list; 
//     }
    
//     form.setFieldsValue({ sl_no: targetSlNo });

//   }, [form, itemDetails]); 


//   // --- Data Fetching Functions ---
//   const fetchUniqueItems = useCallback(async () => {
//     try {
//         const response = await fetch("/api/items-management");
//         const data = await response.json();
        
//         if (response.ok) {
//             setExistingItems(data.uniqueItemNames || []); 
//             setItemDetails(data.itemDetails || []);       
            
//             const currentMaxSlNo = data.maxListSlNo || 0;
//             setNextListSlNo(currentMaxSlNo + 1);
            
//         } else {
//             message.error("Failed to fetch unique item list.");
//             console.error("API Error fetching unique items:", data.error);
//         }
//     } catch (error) {
//         message.error("Network error fetching item list.");
//         console.error("Network Error:", error);
//     }
//   }, []); 

//   const fetchMetadata = useCallback(async () => {
//     try {
//         await fetchUniqueItems(); 
        
//         const productResponse = await fetch("/api/products?action=metadata");
//         const productData = await productResponse.json();

//         if (productResponse.ok) {
//             const products = productData.allProducts || [];
//             setAllProducts(products);
//             calculateNextSlNo(null, products);
//         } else {
//             message.error("Failed to fetch product metadata.");
//             console.error("API Error fetching product metadata:", productData.error);
//         }
        
//     } catch (error) {
//         message.error("Network error fetching initial data.");
//         console.error("Network Error:", error);
//     }
//   }, [calculateNextSlNo, fetchUniqueItems]);

//   useEffect(() => {
//     fetchMetadata();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []); 

//   // --- Item Selection/Validation Fix Handler ---
//   const handleItemSelect = (value) => {
//     // Explicitly set the 'items' field value to clear validation immediately
//     form.setFieldsValue({ items: value }); 
//     calculateNextSlNo(value); 
//   };
  
//   // --- Modal Management and Item Creation Handlers ---
//   const handleOpenModal = () => {
//     setIsModalOpen(true); 
//     setTimeout(() => {
//         createItemForm.setFieldsValue({
//             list_sl_no: nextListSlNo
//         });
//         // Use createItemForm.getFieldInstance('item_name')?.focus(); if this line causes an issue
//         const itemNameInstance = createItemForm.getFieldInstance('item_name');
//         if (itemNameInstance && itemNameInstance.focus) {
//           itemNameInstance.focus();
//         }
//     }, 50); 
//   };
  
//   const handleCloseModal = () => {
//     createItemForm.resetFields(); 
//     setIsModalOpen(false);
//   };
  
//   const handleCreateNewItem = async (values) => {
//     setCreatingItem(true);
//     const { item_name } = values;

//     try {
//         const payload = { 
//             item_name,
//             sl_no_list: nextListSlNo 
//         };

//         const response = await fetch("/api/items-management", {
//             method: "POST",
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(payload),
//         });

//         const data = await response.json();

//         if (response.ok) {
//             message.success(`Item '${item_name}' created successfully.`);
            
//             const newItemDetails = [
//                 ...itemDetails, 
//                 { item_name: item_name, sl_no_list: nextListSlNo }
//             ];
//             setItemDetails(newItemDetails);
//             setExistingItems(prev => [...prev, item_name]);
            
//             setNextListSlNo(prev => prev + 1); 

//             form.setFieldsValue({ items: item_name });
//             calculateNextSlNo(item_name); 

//             handleCloseModal(); 

//         } else {
//             console.error("Error creating item:", data);
//             message.error(data.error || "Failed to create new item. Check console for details.");
//         }
//     } catch (error) {
//         message.error("Network error during item creation.");
//         console.error("Network Error:", error);
//     } finally {
//         setCreatingItem(false);
//     }
//   };

//   // --- Main Product Submission ---
//   const handleSubmit = async (values) => {
//     setLoading(true);
//     const formData = new FormData();

//     // 1. Append text/number fields
//     for (const key in values) {
//       if (key !== 'product_image') { // Exclude product_image if it were a Form.Item name
//         formData.append(key, values[key] === undefined || values[key] === null ? '' : values[key]);
//       }
//     }

//     // 2. Append file from state
//     if (selectedFile) {
//         // Key must be "image" to match pages/api/products.js
//         formData.append("image", selectedFile); 
//     }
    
//     try {
//       const response = await fetch("/api/products", {
//         method: "POST",
//         body: formData,
//       });

//       if (response.ok) {
//         message.success("Product added successfully!");
//         router.push("/");
//       } else {
//         const errorData = await response.json();
//         console.error("Product Submission API Error:", errorData);
//         message.error(`Failed to add product: ${errorData.error}`);
//       }
//     } catch (error) {
//       message.error("Network error submitting form.");
//       console.error("Network Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

// return (
//     // Removed maxWidth: 800 style to allow the form to spread out more horizontally
//     <div style={{ padding: 20, margin: '0 auto' }}> 
//         <h1>Add New Product</h1>
//         <Form
//             form={form}
//             layout="vertical"
//             onFinish={handleSubmit}
//             initialValues={{ sl_no: 1, single: 0, qty_5_plus: 0, qty_10_plus: 0, qty_20_plus: 0, qty_50_plus: 0, qty_100_plus: 0, mrp: 0, gst: 0 }}
//         >
//             <Row gutter={32}> {/* Use Ant Design Row with gutter for spacing */}
                
//                 {/* === LEFT COLUMN (Basic Info) === */}
//                 <Col span={12}> {/* Takes up 12 columns (half the space) */}

//                     {/* SL No Field */}
//                     <Form.Item label="SL No (Product Sequence)" name="sl_no" rules={[{ required: true, message: 'SL No is required' }]}>
//                         <InputNumber disabled style={{ width: '100%' }} min={1} />
//                     </Form.Item>

//                     {/* Item Selection/Creation */}
//                     <Form.Item label="Item Name" name="items" rules={[{ required: true, message: 'Item name is required' }]}>
//                         <Space.Compact style={{ width: '100%' }}>
//                             <Select
//                                 showSearch
//                                 placeholder="Select existing item"
//                                 allowClear
//                                 onChange={handleItemSelect}
//                                 filterOption={(input, option) =>
//                                     (typeof option.children === 'string' ? option.children : option.value)
//                                         ?.toLowerCase().indexOf(input.toLowerCase()) >= 0
//                                 }
//                                 style={{ flexGrow: 1 }}
//                             >
//                                 {existingItems.map((item) => (
//                                     <Option key={item} value={item}>
//                                         {item}
//                                     </Option>
//                                 ))}
//                             </Select>
//                             <Button icon={<PlusOutlined />} onClick={handleOpenModal} type="dashed">
//                                 Create
//                             </Button>
//                         </Space.Compact>
//                     </Form.Item>

//                     {/* Brand, Warranty, GST fields */}
//                     <Form.Item label="Brand" name="brand" rules={[{ required: true, message: 'Brand is required' }]}>
//                         <Input />
//                     </Form.Item>
//                     <Form.Item label="Warranty" name="warranty">
//                         <Input />
//                     </Form.Item>
//                     <Form.Item label="GST (%)" name="gst">
//                         <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="e.g., 18" />
//                     </Form.Item>
//                 </Col>

//                 {/* === RIGHT COLUMN (Pricing & Image) === */}
//                 <Col span={12}> {/* Takes up the other 12 columns */}
                    
//                     {/* Pricing Fields */}
//                     <h3 style={{ marginTop: 0 }}>Pricing</h3> {/* Removed top margin as it's the first element */}
//                     <Form.Item label="Single Price" name="single">
//                         <InputNumber min={0} style={{ width: '100%' }} />
//                     </Form.Item>
//                     <Form.Item label="MRP" name="mrp">
//                         <InputNumber min={0} style={{ width: '100%' }} />
//                     </Form.Item>

//                     {/* Bulk Pricing Fields */}
//                     <h3 style={{ marginTop: 20 }}>Bulk Pricing</h3>
//                     <Row gutter={16}> {/* Nested Row for even distribution of bulk prices */}
//                         <Col span={8}>
//                             <Form.Item label="5+ Qty Price" name="qty_5_plus">
//                                 <InputNumber min={0} style={{ width: '100%' }} />
//                             </Form.Item>
//                         </Col>
//                         <Col span={8}>
//                             <Form.Item label="10+ Qty Price" name="qty_10_plus">
//                                 <InputNumber min={0} style={{ width: '100%' }} />
//                             </Form.Item>
//                         </Col>
//                         <Col span={8}>
//                             <Form.Item label="20+ Qty Price" name="qty_20_plus">
//                                 <InputNumber min={0} style={{ width: '100%' }} />
//                             </Form.Item>
//                         </Col>
//                         <Col span={12}>
//                             <Form.Item label="50+ Qty Price" name="qty_50_plus">
//                                 <InputNumber min={0} style={{ width: '100%' }} />
//                             </Form.Item>
//                         </Col>
//                         <Col span={12}>
//                             <Form.Item label="100+ Qty Price" name="qty_100_plus">
//                                 <InputNumber min={0} style={{ width: '100%' }} />
//                             </Form.Item>
//                         </Col>
//                     </Row>
                    
//                     {/* Image Upload Field using State Handler */}
//                     <h3 style={{ marginTop: 20 }}>Product Image</h3>
//                     <Form.Item 
//                         label="Upload Product Image (Max 5MB)"
//                     >
//                         <Input type="file" onChange={handleFileChange} /> 
//                     </Form.Item>
//                 </Col>
//             </Row>
            
//             {/* Submit Button (Full Width, below the columns) */}
//             <Row gutter={32}>
//                 <Col span={24}>
//                     <Form.Item>
//                         <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%', marginTop: 20 }}>
//                             Add Product
//                         </Button>
//                     </Form.Item>
//                 </Col>
//             </Row>

//         </Form>
        
//         {/* Modal for Creating New Item (Unchanged) */}
//         <Modal
//             title="Create New Item Name"
//             open={isModalOpen}
//             onCancel={handleCloseModal}
//             footer={[
//                 <Button key="back" onClick={handleCloseModal} disabled={creatingItem}>Cancel</Button>,
//                 <Button 
//                     key="submit" 
//                     type="primary" 
//                     loading={creatingItem} 
//                     onClick={() => createItemForm.submit()}
//                 >
//                     Create Item
//                 </Button>,
//             ]}
//         >
//             <Form 
//                 form={createItemForm} 
//                 layout="vertical" 
//                 onFinish={handleCreateNewItem} 
//                 style={{ marginTop: 20 }}
//             >
//                 <Form.Item 
//                     name="list_sl_no" 
//                     label="List SL No"
//                 >
//                     <InputNumber disabled style={{ width: '100%' }} />
//                 </Form.Item>

//                 <Form.Item 
//                     name="item_name" 
//                     label="New Item Name"
//                     rules={[{ required: true, message: 'Please input the new item name!' }]}
//                 >
//                     <Input placeholder="e.g., Laptop Model X" />
//                 </Form.Item>
//             </Form>
//         </Modal>
//     </div>
// );
// }

























// import { useState, useEffect, useCallback } from "react";
// import { Form, Input, InputNumber, Button, Select, message, Modal, Space, Row, Col, Divider } from "antd";
// import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
// import { useRouter } from "next/router";
// import Link from "next/link"; //

// const { Option } = Select;

// export default function AddProduct() {
//   const [form] = Form.useForm();
//   const [createItemForm] = Form.useForm();
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [creatingItem, setCreatingItem] = useState(false);

//   const [existingItems, setExistingItems] = useState([]);
//   const [itemDetails, setItemDetails] = useState([]);
//   const [allProducts, setAllProducts] = useState([]);
//   const [nextListSlNo, setNextListSlNo] = useState(1);

//   const [selectedFile, setSelectedFile] = useState(null); // State for File

//   // --- File Change Handler ---
//   const handleFileChange = (e) => {
//     if (e.target.files && e.target.files.length > 0) {
//       setSelectedFile(e.target.files[0]);
//     } else {
//       setSelectedFile(null);
//     }
//   };

//   // --- SL No Calculation Logic ---
//   const calculateNextSlNo = useCallback((selectedItem) => {
//     if (!selectedItem) {
//       form.setFieldsValue({ sl_no: 1 });
//       return;
//     }

//     const selectedItemDetail = itemDetails.find(detail => detail.item_name === selectedItem);

//     let targetSlNo = 1;

//     if (selectedItemDetail && selectedItemDetail.sl_no_list) {
//       targetSlNo = selectedItemDetail.sl_no_list;
//     }

//     form.setFieldsValue({ sl_no: targetSlNo });

//   }, [form, itemDetails]);


//   // --- Data Fetching Functions ---
//   const fetchUniqueItems = useCallback(async () => {
//     try {
//       const response = await fetch("/api/items-management");
//       const data = await response.json();

//       if (response.ok) {
//         setExistingItems(data.uniqueItemNames || []);
//         setItemDetails(data.itemDetails || []);

//         const currentMaxSlNo = data.maxListSlNo || 0;
//         setNextListSlNo(currentMaxSlNo + 1);

//       } else {
//         message.error("Failed to fetch unique item list.");
//         console.error("API Error fetching unique items:", data.error);
//       }
//     } catch (error) {
//       message.error("Network error fetching item list.");
//       console.error("Network Error:", error);
//     }
//   }, []);

//   const fetchMetadata = useCallback(async () => {
//     try {
//       await fetchUniqueItems();

//       const productResponse = await fetch("/api/products?action=metadata");
//       const productData = await productResponse.json();

//       if (productResponse.ok) {
//         const products = productData.allProducts || [];
//         setAllProducts(products);
//         calculateNextSlNo(null, products);
//       } else {
//         message.error("Failed to fetch product metadata.");
//         console.error("API Error fetching product metadata:", productData.error);
//       }

//     } catch (error) {
//       message.error("Network error fetching initial data.");
//       console.error("Network Error:", error);
//     }
//   }, [calculateNextSlNo, fetchUniqueItems]);

//   useEffect(() => {
//     fetchMetadata();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // --- Handlers ---
//   const handleItemSelect = (value) => {
//     form.setFieldsValue({ items: value });
//     calculateNextSlNo(value);
//   };

//   const handleOpenModal = () => {
//     setIsModalOpen(true);
//     setTimeout(() => {
//       createItemForm.setFieldsValue({
//         list_sl_no: nextListSlNo
//       });
//       const itemNameInstance = createItemForm.getFieldInstance('item_name');
//       if (itemNameInstance && itemNameInstance.focus) {
//         itemNameInstance.focus();
//       }
//     }, 50);
//   };

//   const handleCloseModal = () => {
//     createItemForm.resetFields();
//     setIsModalOpen(false);
//   };

//   const handleCreateNewItem = async (values) => {
//     setCreatingItem(true);
//     const { item_name } = values;

//     try {
//       const payload = {
//         item_name,
//         sl_no_list: nextListSlNo
//       };

//       const response = await fetch("/api/items-management", {
//         method: "POST",
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         message.success(`Item '${item_name}' created successfully.`);

//         const newItemDetails = [
//           ...itemDetails,
//           { item_name: item_name, sl_no_list: nextListSlNo }
//         ];
//         setItemDetails(newItemDetails);
//         setExistingItems(prev => [...prev, item_name]);

//         setNextListSlNo(prev => prev + 1);

//         form.setFieldsValue({ items: item_name });
//         calculateNextSlNo(item_name);

//         handleCloseModal();

//       } else {
//         console.error("Error creating item:", data);
//         message.error(data.error || "Failed to create new item. Check console for details.");
//       }
//     } catch (error) {
//       message.error("Network error during item creation.");
//       console.error("Network Error:", error);
//     } finally {
//       setCreatingItem(false);
//     }
//   };

//   // --- Main Product Submission ---
//   const handleSubmit = async (values) => {
//     setLoading(true);
//     const formData = new FormData();

//     for (const key in values) {
//       if (key !== 'product_image') {
//         formData.append(key, values[key] === undefined || values[key] === null ? '' : values[key]);
//       }
//     }

//     if (selectedFile) {
//       formData.append("image", selectedFile);
//     }

//     try {
//       const response = await fetch("/api/products", {
//         method: "POST",
//         body: formData,
//       });

//       if (response.ok) {
//         message.success("Product added successfully!");
//         router.push("/");
//       } else {
//         const errorData = await response.json();
//         console.error("Product Submission API Error:", errorData);
//         message.error(`Failed to add product: ${errorData.error}`);
//       }
//     } catch (error) {
//       message.error("Network error submitting form.");
//       console.error("Network Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

// return (
//     <div style={{ padding: 20, margin: '0 auto', position: 'relative' }}>
        
//         {/* --- HOMEPAGE BUTTON (Top Right Corner) --- */}
//         <Link href="/">
//             <Button 
//                 type="default" 
//                 style={{ 
//                     position: 'absolute', 
//                     top: 20, 
//                     right: 20,
//                     zIndex: 10, // Ensure it sits above other elements
//                     color: "blueviolet",
//                 }}
//             >
//                 Homepage
//             </Button>
//         </Link>
        
//         <h1 style={{ marginBottom: 20 }}>Add New Product</h1>
//         <Form
//             form={form}
//             layout="vertical"
//             onFinish={handleSubmit}
//             initialValues={{ sl_no: 1, single: 0, qty_5_plus: 0, qty_10_plus: 0, qty_20_plus: 0, qty_50_plus: 0, qty_100_plus: 0, mrp: 0, gst: 0 }}
//         >
//             {/* ROW 1: Identifiers */}
//             <Row gutter={16}>
//                 <Col span={4}>
//                     <Form.Item label="SL No" name="sl_no" rules={[{ required: true, message: 'Required' }]}>
//                         <InputNumber disabled style={{ width: '100%' }} min={1} />
//                     </Form.Item>
//                 </Col>
//                 <Col span={12}>
//                     <Form.Item label="Item Name" name="items" rules={[{ required: true, message: 'Item Name is required' }]}>
//                         <Space.Compact style={{ width: '100%' }}>
//                             <Select
//                                 showSearch
//                                 placeholder="Select Item"
//                                 allowClear
//                                 onChange={handleItemSelect}
//                                 filterOption={(input, option) =>
//                                     (typeof option.children === 'string' ? option.children : option.value)
//                                         ?.toLowerCase().indexOf(input.toLowerCase()) >= 0
//                                 }
//                                 style={{ flexGrow: 1 }}
//                             >
//                                 {existingItems.map((item) => (
//                                     <Option key={item} value={item}>
//                                         {item}
//                                     </Option>
//                                 ))}
//                             </Select>
//                             <Button icon={<PlusOutlined />} onClick={handleOpenModal} type="dashed">
//                                 Create
//                             </Button>
//                         </Space.Compact>
//                     </Form.Item>
//                 </Col>
//                 <Col span={8}>
//                     <Form.Item label="Brand" name="brand" rules={[{ required: true, message: 'Brand is required' }]}>
//                         <Input placeholder="Brand Name" />
//                     </Form.Item>
//                 </Col>
//             </Row>

//             <Divider orientation="left" style={{ margin: '10px 0 20px 0', fontSize: '14px', color: '#888' }}>Price List</Divider>

//             {/* ROW 2: Base Prices */}
//             <Row gutter={16}>
//                 <Col span={8}>
//                     <Form.Item label="Single Price" name="single">
//                         <InputNumber min={0} style={{ width: '100%' }} />
//                     </Form.Item>
//                 </Col>
//                 <Col span={8}>
//                     <Form.Item label="5+ Qty" name="qty_5_plus">
//                         <InputNumber min={0} style={{ width: '100%' }} />
//                     </Form.Item>
//                 </Col>
//                 <Col span={8}>
//                     <Form.Item label="10+ Qty" name="qty_10_plus">
//                         <InputNumber min={0} style={{ width: '100%' }} />
//                     </Form.Item>
//                 </Col>
//             </Row>

//             {/* ROW 3: Bulk Prices */}
//             <Row gutter={16}>
//                 <Col span={8}>
//                     <Form.Item label="20+ Qty" name="qty_20_plus">
//                         <InputNumber min={0} style={{ width: '100%' }} />
//                     </Form.Item>
//                 </Col>
//                 <Col span={8}>
//                     <Form.Item label="50+ Qty" name="qty_50_plus">
//                         <InputNumber min={0} style={{ width: '100%' }} />
//                     </Form.Item>
//                 </Col>
//                 <Col span={8}>
//                     <Form.Item label="100+ Qty" name="qty_100_plus">
//                         <InputNumber min={0} style={{ width: '100%' }} />
//                     </Form.Item>
//                 </Col>
//             </Row>

//             <Divider orientation="left" style={{ margin: '10px 0 20px 0', fontSize: '14px', color: '#888' }}>Product Details</Divider>

//             {/* ROW 4: Details */}
//             <Row gutter={16}>
//                 <Col span={8}>
//                     <Form.Item label="GST (%)" name="gst">
//                         <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="%" />
//                     </Form.Item>
//                 </Col>
//                 <Col span={8}>
//                     <Form.Item label="MRP" name="mrp">
//                         <InputNumber min={0} style={{ width: '100%' }} />
//                     </Form.Item>
//                 </Col>
//                 <Col span={8}>
//                     <Form.Item label="Warranty" name="warranty">
//                         <Input placeholder="e.g., 1 Year" />
//                     </Form.Item>
//                 </Col>
//             </Row>

//             {/* ROW 5: Image */}
//             <Row gutter={16}>
//                 <Col span={24}>
//                     <Form.Item label="Product Image (Max 5MB)">
//                         <Input type="file" onChange={handleFileChange} style={{ paddingTop: 6 }} />
//                     </Form.Item>
//                 </Col>
//             </Row>

//             <Form.Item style={{ marginTop: 20 }}>
//                 <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%', height: '40px' }}>
//                     Add Product
//                 </Button>
//             </Form.Item>
//         </Form>

//         {/* Modal for Creating New Item (Unchanged) */}
//         {/* ... */}
//         <Modal
//             title="Create New Item Name"
//             open={isModalOpen}
//             onCancel={handleCloseModal}
//             footer={[
//                 <Button key="back" onClick={handleCloseModal} disabled={creatingItem}>Cancel</Button>,
//                 <Button
//                     key="submit"
//                     type="primary"
//                     loading={creatingItem}
//                     onClick={() => createItemForm.submit()}
//                 >
//                     Create Item
//                 </Button>,
//             ]}
//         >
//             <Form
//                 form={createItemForm}
//                 layout="vertical"
//                 onFinish={handleCreateNewItem}
//                 style={{ marginTop: 20 }}
//             >
//                 <Form.Item
//                     name="list_sl_no"
//                     label="List SL No"
//                 >
//                     <InputNumber disabled style={{ width: '100%' }} />
//                 </Form.Item>

//                 <Form.Item
//                     name="item_name"
//                     label="New Item Name"
//                     rules={[{ required: true, message: 'Please input the new item name!' }]}
//                 >
//                     <Input placeholder="e.g., Laptop Model X" />
//                 </Form.Item>
//             </Form>
//         </Modal>
//     </div>
// );
// }





















// import { useState, useEffect, useCallback, useMemo } from 'react';
// import { Form, Input, InputNumber, Button, Select, Row, Col, Divider, message, Space, Modal, Typography, Upload } from 'antd';
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
//     const [initialSlNo, setInitialSlNo] = useState(null);

//     const handleCloseModal = () => {
//         form.resetFields();
//         setInitialSlNo(null);
//         onClose();
//     };

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

//     const handleCreateNewItem = async (values) => {
//         try {
//             setLoading(true);

//             if (existingItems.includes(values.item_name)) {
//                 message.error(`Item "${values.item_name}" already exists.`);
//                 setLoading(false);
//                 return;
//             }
            
//             const finalSlNo = values.list_sl_no; 
            
//             if (!finalSlNo) {
//                 message.error("SL No calculation failed. Please try again.");
//                 setLoading(false);
//                 return;
//             }

//             const { error } = await supabase
//                 .from('items_list')
//                 .insert({ item_name: values.item_name, sl_no_list: finalSlNo });

//             if (error) throw error;

//             message.success(`Item "${values.item_name}" created successfully with SL No ${finalSlNo}.`);
//             handleCloseModal();
//             onCreated(values.item_name); 

//         } catch (error) {
//             console.error('Item creation error:', error);
//             message.error(`Creation failed: ${error.message || 'Unknown error'}`);
//         } finally {
//             setLoading(false);
//         }
//     };

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
//                 initialValues={formInitialValues} 
//             >
                
//                 <Form.Item
//                     name="list_sl_no"
//                     label="List SL No"
//                 >
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
// // --- MAIN COMPONENT: ADD PRODUCT ---
// // ------------------------------------------------------------------

// export default function AddProduct() {
//     const [form] = Form.useForm();
//     const [loading, setLoading] = useState(false);
//     const [existingItems, setExistingItems] = useState([]);
//     const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);

//     // --- NEW IMAGE UPLOAD STATES ---
//     const [isUploading, setIsUploading] = useState(false);
//     const [fileList, setFileList] = useState([]); // Holds Antd file object
//     const [imageUrl, setImageUrl] = useState(null); // Holds the final Cloudinary URL
//     // ---------------------------------

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
//         form.setFieldsValue({ sl_no: newSlNo });
//     };

//     // --- Item List Fetching ---
//     const fetchItemsList = useCallback(async () => {
//         const { data: items, error } = await supabase
//             .from('items_list')
//             .select('item_name')
//             .order('item_name', { ascending: true });
        
//         if (!error) {
//             setExistingItems(items.map(i => i.item_name));
//         }
//     }, []);

//     useEffect(() => {
//         fetchItemsList();
//     }, [fetchItemsList]);

//     // --- Item Creation Handlers (called by NewItemModal) ---
//     const handleNewItemCreated = (newItemName) => {
//         // 1. Refetch the items list to include the new item
//         fetchItemsList();
//         // 2. Automatically select the newly created item in the product edit form
//         form.setFieldsValue({ items: newItemName });
//         // 3. Trigger the SL No update for the newly selected item
//         handleItemChange(newItemName);
//     };

//     // --- Custom Upload Request for Cloudinary (Handles API call) ---
//     const customUploadRequest = async ({ file, onSuccess, onError }) => {
//         setIsUploading(true);
        
//         const formData = new FormData();
//         formData.append('image', file); 

//         try {
//             const response = await fetch('/api/product-image-upload', {
//                 method: 'POST',
//                 body: formData,
//             });

//             const result = await response.json();

//             if (!response.ok) {
//                 throw new Error(result.error || 'Upload failed on the server.');
//             }

//             const fileURL = result.imageUrl; 
            
//             // Update local states
//             onSuccess(fileURL, file); 
//             setImageUrl(fileURL); // Store the final URL
//             message.success(`${file.name} uploaded successfully.`);
            
//         } catch (error) {
//             console.error('Upload Error:', error);
//             onError(error);
//             message.error(`Upload failed: ${error.message || 'Unknown network error'}`);
//         } finally {
//             setIsUploading(false);
//         }
//     };

//     // --- Handle file list state changes (Manages preview and removal) ---
//     const handleFileChange = ({ fileList: newFileList }) => {
//         setFileList(newFileList);
        
//         // If the list becomes empty (file removed), clear the URL state
//         if (newFileList.length === 0) {
//             setImageUrl(null);
//         } else if (newFileList[0] && newFileList[0].status === 'done') {
//              // If a file is successfully uploaded/retained, update URL state
//              setImageUrl(newFileList[0].response || newFileList[0].url);
//         }
//     };

//     // --- Form Submission Handler ---
//     const onFinish = async (values) => {
//         try {
//             setLoading(true);

//             const finalSlNo = values.sl_no;
//             if (!finalSlNo) {
//                 message.error("Please select an item to assign the SL No.");
//                 setLoading(false);
//                 return;
//             }

//             const payload = {
//                 ...values,
//                 sl_no: finalSlNo,
//                 // Use the final URL from the state
//                 product_image: imageUrl, 
//             };

//             const { error } = await supabase
//                 .from('products')
//                 .insert([payload]);

//             if (error) throw error;

//             message.success(`Product added successfully! SL No: ${finalSlNo}`);
//             form.resetFields();
//             setFileList([]); // Clear file list on success
//             setImageUrl(null); // Clear image URL state
//             await fetchItemsList(); // Refetch item list just in case
//         } catch (error) {
//             console.error('Product insertion error:', error);
//             message.error(`Insertion failed: ${error.message || 'Unknown error'}`);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div style={{ padding: 20, margin: '0 auto', maxWidth: 800 }}>
//             <div style={{ position: 'relative' }}>
//                 <Link href="/">
//                     <Button 
//                         type="default" 
//                         style={{ 
//                             position: 'absolute', 
//                             top: 0, 
//                             right: 0,
//                             zIndex: 10,
//                             color: "blueviolet",
//                         }}
//                     >
//                         Back to Homepage
//                     </Button>
//                 </Link>
//                 <h1 style={{ marginBottom: 20 }}>Add New Product</h1>
//             </div>
            
//             <Form
//                 form={form}
//                 layout="vertical"
//                 onFinish={onFinish}
//             >
                
//                 {/* 1. ROW: Identifiers (SL No, Item Name, Brand) */}
//                 <Row gutter={16}>
//                     <Col span={4}>
//                         <Form.Item label="SL No" name="sl_no">
//                             <InputNumber disabled style={{ width: '100%' }} min={1} />
//                         </Form.Item>
//                     </Col>
//                     <Col span={12}>
//                         <Form.Item 
//                             label="Item Name" 
//                             name="items" 
//                             rules={[{ required: true, message: 'Item Name is required' }]}
//                         >
//                             <Select 
//                                 showSearch
//                                 placeholder="Select Item"
//                                 allowClear
//                                 onChange={handleItemChange}
//                                 style={{ width: '100%' }}
//                                 // --- CREATE BUTTON IN DROPDOWN ---
//                                 dropdownRender={menu => (
//                                     <div>
//                                         {menu}
//                                         <Divider style={{ margin: '4px 0' }} />
//                                         <Space style={{ padding: '4px 8px' }}>
//                                             <Button 
//                                                 type="text" 
//                                                 icon={<PlusOutlined />} 
//                                                 onClick={() => setIsNewItemModalOpen(true)}
//                                             >
//                                                 **Create New Item**
//                                             </Button>
//                                         </Space>
//                                     </div>
//                                 )}
//                                 // --------------------------------
//                             >
//                                 {existingItems.map(item => (
//                                     <Option key={item} value={item}>
//                                         {item}
//                                     </Option>
//                                 ))}
//                             </Select>
//                         </Form.Item>
//                     </Col>
//                     <Col span={8}>
//                         <Form.Item label="Brand" name="brand" rules={[{ required: true, message: 'Brand is required' }]}>
//                             <Input placeholder="Brand Name" />
//                         </Form.Item>
//                     </Col>
//                 </Row>

//                 <Divider orientation="left" style={{ margin: '10px 0 20px 0', fontSize: '14px', color: '#888' }}>Price List</Divider>

//                 {/* 2. ROW: Base Prices (Single, 5+, 10+) */}
//                 <Row gutter={16}>
//                     <Col span={8}>
//                         <Form.Item label="Single Price" name="single">
//                             <InputNumber min={0} style={{ width: '100%' }} />
//                         </Form.Item>
//                     </Col>
//                     <Col span={8}>
//                         <Form.Item label="5+ Qty" name="qty_5_plus">
//                             <InputNumber min={0} style={{ width: '100%' }} />
//                         </Form.Item>
//                     </Col>
//                     <Col span={8}>
//                         <Form.Item label="10+ Qty" name="qty_10_plus">
//                             <InputNumber min={0} style={{ width: '100%' }} />
//                         </Form.Item>
//                     </Col>
//                 </Row>

//                 {/* 3. ROW: Bulk Prices (20+, 50+, 100+) */}
//                 <Row gutter={16}>
//                     <Col span={8}>
//                         <Form.Item label="20+ Qty" name="qty_20_plus">
//                             <InputNumber min={0} style={{ width: '100%' }} />
//                         </Form.Item>
//                     </Col>
//                     <Col span={8}>
//                         <Form.Item label="50+ Qty" name="qty_50_plus">
//                             <InputNumber min={0} style={{ width: '100%' }} />
//                         </Form.Item>
//                     </Col>
//                     <Col span={8}>
//                         <Form.Item label="100+ Qty" name="qty_100_plus">
//                             <InputNumber min={0} style={{ width: '100%' }} />
//                         </Form.Item>
//                     </Col>
//                 </Row>

//                 <Divider orientation="left" style={{ margin: '10px 0 20px 0', fontSize: '14px', color: '#888' }}>Product Details</Divider>

//                 {/* 4. ROW: Details (GST, MRP, Warranty) */}
//                 <Row gutter={16}>
//                     <Col span={8}>
//                         <Form.Item label="GST (%)" name="gst">
//                             <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="%" />
//                         </Form.Item>
//                     </Col>
//                     <Col span={8}>
//                         <Form.Item label="MRP" name="mrp">
//                             <InputNumber min={0} style={{ width: '100%' }} />
//                         </Form.Item>
//                     </Col>
//                     <Col span={8}>
//                         <Form.Item label="Warranty" name="warranty">
//                             <Input placeholder="e.g., 1 Year" />
//                         </Form.Item>
//                     </Col>
//                 </Row>

//                 {/* 5. ROW: Image Upload (Updated with Preview) */}
//                 <Row gutter={16}>
//                     <Col span={24}>
//                         <Form.Item label="Product Image (Max 5MB)" help="Upload an image for the product.">
//                             <Upload
//                                 customRequest={customUploadRequest}
//                                 fileList={fileList}
//                                 onChange={handleFileChange}
//                                 onRemove={() => { setFileList([]); setImageUrl(null); }}
//                                 maxCount={1}
//                                 disabled={isUploading}
//                                 showUploadList={false} // Hides the default list item with the file name
//                             >
//                                 {/* Conditional rendering for button or preview */}
//                                 {fileList.length === 0 ? (
//                                     <Button icon={<PlusOutlined />} loading={isUploading}>
//                                         {isUploading ? 'Uploading...' : 'Click to Upload Image'}
//                                     </Button>
//                                 ) : (
//                                     // Show the preview area
//                                     <div style={{ position: 'relative', width: 104, height: 104, border: '1px solid #d9d9d9', borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                        
//                                         {/* Image Preview (uses url or response) */}
//                                         <img 
//                                             src={fileList[0].url || fileList[0].response || imageUrl} 
//                                             alt="Product Preview" 
//                                             style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
//                                         />

//                                         {/* Remove Button Overlay */}
//                                         <Button
//                                             type="primary"
//                                             danger
//                                             icon={<PlusOutlined rotate={45} />} // Cross icon
//                                             size="small"
//                                             onClick={(e) => {
//                                                 e.stopPropagation(); // Prevents opening upload dialog
//                                                 setFileList([]); // Clear file list
//                                                 setImageUrl(null); // Clear URL state
//                                             }}
//                                             style={{ position: 'absolute', top: 2, right: 2, opacity: 0.8 }}
//                                         />
//                                     </div>
//                                 )}
//                             </Upload>
//                         </Form.Item>
//                     </Col>
//                 </Row>

//                 <Form.Item style={{ marginTop: 20 }}>
//                     <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%', height: '40px' }}>
//                         Add Product
//                     </Button>
//                 </Form.Item>
//             </Form>

//             {/* --- CREATE NEW ITEM MODAL --- */}
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
import { Form, Input, InputNumber, Button, Select, Row, Col, Divider, message, Space, Modal, Typography, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

const { Option } = Select;

// ------------------------------------------------------------------
// --- NESTED COMPONENT: NEW ITEM CREATION MODAL ---
// ------------------------------------------------------------------

const NewItemModal = ({ isVisible, onClose, onCreated, existingItems }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // --- FIX: Use useEffect to set form values directly ---
    useEffect(() => {
        const fetchAndSetSlNo = async () => {
            const { data: maxSlNoData, error: maxError } = await supabase
                .from('items_list')
                .select('sl_no_list')
                .order('sl_no_list', { ascending: false })
                .limit(1);

            if (maxError) {
                console.error("Error fetching max SL No:", maxError);
                form.setFieldsValue({ list_sl_no: 1 }); // Default to 1 on error
                return;
            }

            const nextSlNo = (maxSlNoData && maxSlNoData.length > 0) 
                ? (maxSlNoData[0].sl_no_list || 0) + 1 
                : 1;

            // This line fixes the "Calculation Failed" error by updating the form state
            form.setFieldsValue({ list_sl_no: nextSlNo }); 
        };

        if (isVisible) {
            fetchAndSetSlNo();
        } else {
            form.resetFields();
        }
    }, [isVisible, form]);

    const handleCreateNewItem = async (values) => {
        try {
            setLoading(true);

            // Validation: Prevent duplicates
            if (existingItems.includes(values.item_name)) {
                message.error(`Item "${values.item_name}" already exists.`);
                setLoading(false);
                return;
            }
            
            // Check if SL No exists in form values
            const finalSlNo = values.list_sl_no; 
            if (!finalSlNo) {
                message.error("SL No calculation failed. Please try again.");
                setLoading(false);
                return;
            }

            // Insert into Supabase
            const { error } = await supabase
                .from('items_list')
                .insert({ item_name: values.item_name, sl_no_list: finalSlNo });

            if (error) throw error;

            message.success(`Item created successfully.`);
            onCreated(values.item_name); 
            onClose();

        } catch (error) {
            console.error('Item creation error:', error);
            message.error(`Creation failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Create New Item Name" 
            open={isVisible}
            onCancel={onClose} 
            width={500}
            footer={[
                <Button key="back" onClick={onClose} disabled={loading}>Cancel</Button>,
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
            >
                <Form.Item
                    name="list_sl_no"
                    label="List SL No (Auto-calculated)"
                >
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
// --- MAIN COMPONENT: ADD PRODUCT ---
// ------------------------------------------------------------------

export default function AddProduct() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [existingItems, setExistingItems] = useState([]);
    const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [fileList, setFileList] = useState([]); 
    const [imageUrl, setImageUrl] = useState(null);

    const fetchItemsList = useCallback(async () => {
        const { data: items, error } = await supabase
            .from('items_list')
            .select('item_name')
            .order('item_name', { ascending: true });
        
        if (!error) {
            setExistingItems(items.map(i => i.item_name));
        }
    }, []);

    useEffect(() => {
        fetchItemsList();
    }, [fetchItemsList]);

    const fetchSlNoByItem = async (itemName) => {
        if (!itemName) return null;
        const { data, error } = await supabase
            .from('items_list')
            .select('sl_no_list')
            .eq('item_name', itemName)
            .single();
        return error ? null : data?.sl_no_list;
    };

    const handleItemChange = async (itemName) => {
        const newSlNo = await fetchSlNoByItem(itemName);
        form.setFieldsValue({ sl_no: newSlNo });
    };

    const handleNewItemCreated = (newItemName) => {
        fetchItemsList();
        form.setFieldsValue({ items: newItemName });
        handleItemChange(newItemName);
    };

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
            if (!response.ok) throw new Error(result.error);
            
            onSuccess(result.imageUrl, file); 
            setImageUrl(result.imageUrl);
            message.success(`Image uploaded.`);
        } catch (error) {
            onError(error);
            message.error(`Upload failed.`);
        } finally {
            setIsUploading(false);
        }
    };

    const onFinish = async (values) => {
        try {
            setLoading(true);
            if (!values.sl_no) {
                message.error("Please select an item to assign the SL No.");
                return;
            }

            const payload = {
                ...values,
                product_image: imageUrl, 
            };

            const { error } = await supabase.from('products').insert([payload]);
            if (error) throw error;

            message.success(`Product added successfully!`);
            form.resetFields();
            setFileList([]);
            setImageUrl(null);
        } catch (error) {
            message.error(`Insertion failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 20, margin: '0 auto', maxWidth: 800 }}>
            <div style={{ position: 'relative' }}>
                <Link href="/">
                    <Button type="default" style={{ position: 'absolute', top: 0, right: 0, color: "blueviolet" }}>
                        Back to Homepage
                    </Button>
                </Link>
                <h1 style={{ marginBottom: 20 }}>Add New Product</h1>
            </div>
            
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={16}>
                    <Col span={4}>
                        <Form.Item label="SL No" name="sl_no">
                            <InputNumber disabled style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item 
                            label="Item Name" 
                            name="items" 
                            rules={[{ required: true, message: 'Item Name is required' }]}
                        >
                            <Select 
                                showSearch
                                placeholder="Select Item"
                                onChange={handleItemChange}
                                dropdownRender={menu => (
                                    <div>
                                        {menu}
                                        <Divider style={{ margin: '4px 0' }} />
                                        <Space style={{ padding: '4px 8px' }}>
                                            <Button type="text" icon={<PlusOutlined />} onClick={() => setIsNewItemModalOpen(true)}>
                                                Create New Item
                                            </Button>
                                        </Space>
                                    </div>
                                )}
                            >
                                {existingItems.map(item => (
                                    <Option key={item} value={item}>{item}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Brand" name="brand" rules={[{ required: true, message: 'Brand is required' }]}>
                            <Input placeholder="Brand Name" />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider orientation="left">Price List</Divider>
                <Row gutter={16}>
                    <Col span={8}><Form.Item label="Single Price" name="single"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                    <Col span={8}><Form.Item label="5+ Qty" name="qty_5_plus"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                    <Col span={8}><Form.Item label="10+ Qty" name="qty_10_plus"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                </Row>

                <Divider orientation="left">Product Details</Divider>
                <Row gutter={16}>
                    <Col span={8}><Form.Item label="GST (%)" name="gst"><InputNumber min={0} max={100} style={{ width: '100%' }} /></Form.Item></Col>
                    <Col span={8}><Form.Item label="MRP" name="mrp"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                    <Col span={8}><Form.Item label="Warranty" name="warranty"><Input placeholder="e.g., 1 Year" /></Form.Item></Col>
                </Row>

                <Form.Item label="Product Image">
                    <Upload
                        customRequest={customUploadRequest}
                        fileList={fileList}
                        onChange={({ fileList }) => setFileList(fileList)}
                        maxCount={1}
                        showUploadList={true}
                    >
                        {fileList.length < 1 && <Button icon={<PlusOutlined />}>Upload Image</Button>}
                    </Upload>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%', height: '40px' }}>
                        Add Product
                    </Button>
                </Form.Item>
            </Form>

            <NewItemModal 
                isVisible={isNewItemModalOpen}
                onClose={() => setIsNewItemModalOpen(false)}
                onCreated={handleNewItemCreated}
                existingItems={existingItems}
            />
        </div>
    );
}