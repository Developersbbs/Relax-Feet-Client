// import React, { useState, useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import {
//   createPurchase,
//   getPurchases,
//   getPurchase,
//   updatePurchase,
//   deletePurchase,
//   approvePurchase,
//   rejectPurchase,
//   receivePurchase,
//   reset,
//   clearPurchase
// } from '../redux/features/purchaseSlice/purchaseSlice';
// import { getSuppliers } from '../services/supplierService';
// import { getProducts } from '../redux/features/products/productSlice';
// import { toast } from 'react-toastify';


// const Purchase = () => {
//   const [currentView, setCurrentView] = useState('list');
//   const [selectedPurchase, setSelectedPurchase] = useState(null);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [showReceiveModal, setShowReceiveModal] = useState(false);
//   const [filters, setFilters] = useState({
//     status: '',
//     page: 1,
//     limit: 10
//   });

//   const dispatch = useDispatch();
//   const { purchases, purchase, isLoading, isError, message } = useSelector(
//     (state) => state.purchases
//   );
//   const { suppliers } = useSelector((state) => state.suppliers);
//   const { products } = useSelector((state) => state.products);
//   const { user } = useSelector((state) => state.auth);

//   useEffect(() => {
//     dispatch(getPurchases(filters));
//     dispatch(getSuppliers());
//     dispatch(getProducts());
//   }, [dispatch, filters]);

//   useEffect(() => {
//     if (isError) {
//       toast.error(message);
//     }

//     dispatch(reset());
//   }, [isError, message, dispatch]);

//   const handleCreateNew = () => {
//     dispatch(clearPurchase());
//     setIsEditMode(false);
//     setCurrentView('form');
//   };

//   const handleViewDetails = (purchaseId) => {
//     dispatch(getPurchase(purchaseId));
//     setSelectedPurchase(purchaseId);
//     setCurrentView('detail');
//   };

//   const handleEdit = (purchaseId) => {
//     dispatch(getPurchase(purchaseId));
//     setSelectedPurchase(purchaseId);
//     setIsEditMode(true);
//     setCurrentView('form');
//   };

//   const handleBackToList = () => {
//     setCurrentView('list');
//     setSelectedPurchase(null);
//     setIsEditMode(false);
//   };

//   const handleSubmitForm = (purchaseData) => {
//     if (isEditMode && selectedPurchase) {
//       dispatch(updatePurchase({ purchaseId: selectedPurchase, purchaseData }))
//         .unwrap()
//         .then(() => {
//           toast.success('Purchase order updated successfully');
//           setCurrentView('list');
//         })
//         .catch((error) => {
//           toast.error(error);
//         });
//     } else {
//       dispatch(createPurchase(purchaseData))
//         .unwrap()
//         .then(() => {
//           toast.success('Purchase order created successfully');
//           setCurrentView('list');
//         })
//         .catch((error) => {
//           toast.error(error);
//         });
//     }
//   };

//   const handleDelete = (purchaseId) => {
//     if (window.confirm('Are you sure you want to delete this purchase order?')) {
//       dispatch(deletePurchase(purchaseId))
//         .unwrap()
//         .then(() => {
//           toast.success('Purchase order deleted successfully');
//         })
//         .catch((error) => {
//           toast.error(error);
//         });
//     }
//   };

//   const handleApprove = (purchaseId) => {
//     dispatch(approvePurchase(purchaseId))
//       .unwrap()
//       .then(() => {
//         toast.success('Purchase order approved successfully');
//       })
//       .catch((error) => {
//         toast.error(error);
//       });
//   };

//   const handleReject = (purchaseId) => {
//     dispatch(rejectPurchase(purchaseId))
//       .unwrap()
//       .then(() => {
//         toast.success('Purchase order rejected');
//       })
//       .catch((error) => {
//         toast.error(error);
//       });
//   };

//   const handleReceive = (purchaseId) => {
//     setSelectedPurchase(purchaseId);
//     setShowReceiveModal(true);
//   };

//   const handleSubmitReceive = (receivedItems) => {
//     dispatch(receivePurchase({ purchaseId: selectedPurchase, receivedItems }))
//       .unwrap()
//       .then(() => {
//         toast.success('Items received successfully');
//         setShowReceiveModal(false);
//         if (currentView === 'detail') {
//           dispatch(getPurchase(selectedPurchase));
//         }
//       })
//       .catch((error) => {
//         toast.error(error);
//       });
//   };

//   const handleFilterChange = (newFilters) => {
//     setFilters({ ...filters, ...newFilters });
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">Purchase Orders</h1>
//         {currentView === 'list' && (
//           <button
//             onClick={handleCreateNew}
//             className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
//           >
//             Create New Purchase Order
//           </button>
//         )}
//         {currentView !== 'list' && (
//           <button
//             onClick={handleBackToList}
//             className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
//           >
//             Back to List
//           </button>
//         )}
//       </div>

//       {currentView === 'list' && (
//         <PurchaseList
//           purchases={purchases}
//           isLoading={isLoading}
//           onViewDetails={handleViewDetails}
//           onEdit={handleEdit}
//           onDelete={handleDelete}
//           onApprove={handleApprove}
//           onReject={handleReject}
//           onReceive={handleReceive}
//           filters={filters}
//           onFilterChange={handleFilterChange}
//           user={user}
//         />
//       )}

//       {currentView === 'form' && (
//         <PurchaseForm
//           purchase={purchase}
//           suppliers={suppliers}
//           products={products}
//           onSubmit={handleSubmitForm}
//           onCancel={handleBackToList}
//           isEditMode={isEditMode}
//           isLoading={isLoading}
//         />
//       )}

//       {currentView === 'detail' && purchase && (
//         <PurchaseDetail
//           purchase={purchase}
//           onEdit={() => handleEdit(purchase._id)}
//           onDelete={handleDelete}
//           onApprove={handleApprove}
//           onReject={handleReject}
//           onReceive={handleReceive}
//           user={user}
//         />
//       )}

//       {showReceiveModal && selectedPurchase && (
//         <ReceiveItemsModal
//           purchase={purchases.find(p => p._id === selectedPurchase) || purchase}
//           onClose={() => setShowReceiveModal(false)}
//           onSubmit={handleSubmitReceive}
//           isLoading={isLoading}
//         />
//       )}
//     </div>
//   );
// };

// export default Purchase;