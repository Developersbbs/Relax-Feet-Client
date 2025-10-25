// import axios from 'axios';

// const API_URL = '/api/purchases';

// // Create new purchase
// const createPurchase = async (purchaseData, token) => {
//   const config = {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   };

//   const response = await axios.post(API_URL, purchaseData, config);
//   return response.data;
// };

// // Get all purchases
// const getPurchases = async (filters, token) => {
//   const config = {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     params: filters,
//   };

//   const response = await axios.get(API_URL, config);
//   return response.data;
// };

// // Get single purchase
// const getPurchase = async (purchaseId, token) => {
//   const config = {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   };

//   const response = await axios.get(`${API_URL}/${purchaseId}`, config);
//   return response.data;
// };

// // Update purchase
// const updatePurchase = async (purchaseId, purchaseData, token) => {
//   const config = {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   };

//   const response = await axios.put(`${API_URL}/${purchaseId}`, purchaseData, config);
//   return response.data;
// };

// // Delete purchase
// const deletePurchase = async (purchaseId, token) => {
//   const config = {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   };

//   const response = await axios.delete(`${API_URL}/${purchaseId}`, config);
//   return response.data;
// };

// // Approve purchase
// const approvePurchase = async (purchaseId, token) => {
//   const config = {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   };

//   const response = await axios.put(`${API_URL}/${purchaseId}/approve`, {}, config);
//   return response.data;
// };

// // Reject purchase
// const rejectPurchase = async (purchaseId, token) => {
//   const config = {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   };

//   const response = await axios.put(`${API_URL}/${purchaseId}/reject`, {}, config);
//   return response.data;
// };

// // Receive purchase items
// const receivePurchase = async (purchaseId, receivedItems, token) => {
//   const config = {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   };

//   const response = await axios.put(`${API_URL}/${purchaseId}/receive`, { receivedItems }, config);
//   return response.data;
// };

// const purchaseService = {
//   createPurchase,
//   getPurchases,
//   getPurchase,
//   updatePurchase,
//   deletePurchase,
//   approvePurchase,
//   rejectPurchase,
//   receivePurchase,
// };

// export default purchaseService;