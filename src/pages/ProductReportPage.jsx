// import React, { useState, useEffect } from 'react';
// import axios from '../services/instance';

// const ProductReportPage = () => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchProductReport = async () => {
//       try {
//         const response = await axios.get('/api/api/products/report');
//         setProducts(response.data);
//         setLoading(false);
//       } catch (err) {
//         setError(err.response?.data?.message || 'Failed to fetch product report');
//         setLoading(false);
//       }
//     };

//     fetchProductReport();
//   }, []);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <div className="product-report">
//       <h1>Product Report</h1>
//       <table>
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Category</th>
//             <th>Price</th>
//             <th>Quantity</th>
//             <th>Stock Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           {products.map(product => (
//             <tr key={product.id}>
//               <td>{product.name}</td>
//               <td>{product.category}</td>
//               <td>{product.price}</td>
//               <td>{product.quantity}</td>
//               <td>{product.stockStatus}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default ProductReportPage;
