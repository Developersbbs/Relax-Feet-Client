import React, { useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './auth/Login'
import Register from './auth/Register'
import Home from './pages/Home'
import Navbar from './layout/Navbar'
import { useDispatch } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import Sidebar from './components/Sidebar'
import Layout from './layout/Layout'
import { setUser } from './redux/features/auth/loginSlice'
import ProductManagement from './pages/ProductManagement'
import ManageCustomers from './pages/ManageCustomers'
import ManageBills from './pages/CreateBill'
import Notifications from './pages/Notifications'
import StockReport from './pages/StockReport'
import Services from './pages/Services'
import Reports from './pages/Reports'
import CategoryManagement from './pages/CategoryManagement'
import Pages from './pages/Pages'





const App = () => {
  const dispatch = useDispatch();


   useEffect(() => {
    const savedUser = localStorage.getItem("user")
    const savedToken = localStorage.getItem("token")

    if (savedUser && savedToken) {
      dispatch(setUser({ user: JSON.parse(savedUser), token: savedToken }))
    }
  }, [dispatch])
   
    const router = createBrowserRouter([
      {
        path:'/',
        element:<Layout/>,
        children:[

          {
            path:'/login',
            element:<Login/>
          },
          {
            path:'/register',
            element:<Register/>
          },
          {
            path:'/',
            element:<Home/>
          },
          {
            path:'/services',
            element:<Services/>
          },
          {
            path:'/products',
            element:<ProductManagement/>
          },
          {
            path:'/manage-customers',
            element:<ManageCustomers/>
          },
          {
            path:'/manage-bill',
            element:<ManageBills/>
          },
          {
            path:'/notifications',
            element:<Notifications/>
          },
          {
            path:'/reports',
            element:<Reports/>
          },
          {
            path:'/stock-report',
            element:<StockReport/>
          },
          {
            path:'/categories',
            element:<CategoryManagement/>
          },
          {
            path:'/pages',
            element:<Pages/>
          },
        ]
      }
    ])
  return (
    <>
    
    <RouterProvider router={router}/>
    <ToastContainer position='bottom-right' autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover/>
   
    </>
  )
}

export default App