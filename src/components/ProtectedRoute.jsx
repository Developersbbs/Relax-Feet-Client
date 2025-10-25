// import React from 'react';
// import { useSelector } from 'react-redux';
// import { Navigate } from 'react-router-dom';

// const ProtectedRoute = ({ children }) => {
//   const user = useSelector((state) => state.login?.user);
//   const token = useSelector((state) => state.login?.token);

//   // Check if user is authenticated
//   if (!user || !token) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;
