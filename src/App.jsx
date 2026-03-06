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
import ManageCustomers from './pages/ManageCustomers'
import ManageBills from './pages/CreateBill'
import Notifications from './pages/Notifications'
import Services from './pages/Services'
import Reports from './pages/Reports'
import Pages from './pages/Pages'
import BranchManagement from './pages/BranchManagement'
import BranchDashboard from './pages/BranchDashboard'
import UserManagement from './pages/UserManagement'
import ManageCoupons from './pages/ManageCoupons'





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
      path: '/',
      element: <Layout />,
      children: [

        {
          path: '/login',
          element: <Login />
        },
        {
          path: '/register',
          element: <Register />
        },
        {
          path: '/',
          element: <Home />
        },
        {
          path: '/services',
          element: <Services />
        },
        {
          path: '/manage-customers',
          element: <ManageCustomers />
        },
        {
          path: '/manage-bill',
          element: <ManageBills />
        },
        {
          path: '/notifications',
          element: <Notifications />
        },
        {
          path: '/reports',
          element: <Reports />
        },
        {
          path: '/pages',
          element: <Pages />
        },
        {
          path: '/branches',
          element: <BranchManagement />
        },
        {
          path: '/branch-dashboard',
          element: <BranchDashboard />
        },
        {
          path: '/user-management',
          element: <UserManagement />
        },
        {
          path: '/manage-coupons',
          element: <ManageCoupons />
        },
      ]
    }
  ])
  return (
    <>

      <RouterProvider router={router} />
      <ToastContainer position='bottom-right' autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

    </>
  )
}

export default App