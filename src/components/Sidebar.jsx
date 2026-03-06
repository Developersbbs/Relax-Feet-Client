import React from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { logout, selectUser } from "../redux/features/auth/loginSlice"
import {
  HiWrenchScrewdriver,
  HiUsers,
  HiDocumentText,
  HiUserGroup,
  HiBell,
  HiChartBar,
  HiBuildingOffice,
  HiPresentationChartLine,
  HiArrowLeftOnRectangle,
  HiTicket
} from "react-icons/hi2"

const Sidebar = ({ onNavigate }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectUser)

  const handleLogout = () => {
    // 1️⃣ Redux state clear
    dispatch(logout())

    // 2️⃣ Optionally backend logout API call
    // fetch("http://localhost:5000/api/auth/logout", {
    //   method: "POST",
    //   headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    // })

    // 3️⃣ Close sidebar if callback provided
    if (onNavigate) {
      onNavigate()
    }

    // 4️⃣ Redirect to login
    navigate("/login")
  }

  const handleNavigation = () => {
    if (onNavigate) {
      onNavigate()
    }
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 md:py-3 mx-1 md:mx-2 rounded-lg transition-all duration-200 font-medium ${isActive
      ? "bg-[#0099CC] text-white shadow-lg transform scale-105"
      : "text-[#0099CC] dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-gray-700 hover:text-[#007aa3] dark:hover:text-white hover:shadow-md"
    }`

  // Get navigation items based on user role
  const getNavigationItems = (userRole) => {
    const allItems = [
      { to: "/services", icon: <HiWrenchScrewdriver />, label: "Services" },
      { to: "/manage-customers", icon: <HiUsers />, label: "Customers" },
      { to: "/manage-bill", icon: <HiDocumentText />, label: "Bills" },
      { to: "/user-management", icon: <HiUserGroup />, label: "Users" },
      { to: "/notifications", icon: <HiBell />, label: "Notifications" },
      { to: "/reports", icon: <HiChartBar />, label: "Reports" },
      { to: "/branches", icon: <HiBuildingOffice />, label: "Branches" },
      { to: "/branch-dashboard", icon: <HiPresentationChartLine />, label: "Branch Analytics" },
      { to: "/manage-coupons", icon: <HiTicket />, label: "Coupons" },
    ]

    // Superadmin sees all items
    if (userRole === 'superadmin') {
      return allItems
    }

    // Billcounter: bills, customers, services
    if (userRole === 'billcounter') {
      return allItems.filter(item =>
        ['/manage-bill', '/manage-customers', '/services', '/notifications'].includes(item.to)
      )
    }

    // Stockmanager: repurposed maybe? but user said only service
    if (userRole === 'stockmanager') {
      return allItems.filter(item =>
        ['/notifications'].includes(item.to)
      )
    }

    // Branch Admin: full branch control (bills, customers, users, reports)
    if (userRole === 'branchadmin') {
      return allItems.filter(item =>
        ['/manage-bill', '/manage-customers', '/services', '/reports', '/notifications'].includes(item.to)
      )
    }

    // Branch Manager: similar to branchadmin
    if (userRole === 'branchmanager') {
      return allItems.filter(item =>
        ['/manage-bill', '/manage-customers', '/services', '/reports', '/notifications'].includes(item.to)
      )
    }

    // Admin sees only specific items
    if (userRole === 'admin') {
      return allItems.filter(item =>
        ['/services', '/manage-customers', '/manage-bill', '/reports'].includes(item.to)
      )
    }

    // Default fallback
    return allItems.filter(item =>
      ['/services', '/manage-customers', '/manage-bill', '/reports'].includes(item.to)
    )
  }

  const navigationItems = getNavigationItems(user?.role)

  // Role info based on actual user role
  const getRoleInfo = (userRole) => {
    switch (userRole) {
      case 'superadmin':
        return { name: 'Super Admin', color: 'bg-[#007aa3]', textColor: 'text-[#0099CC] dark:text-red-300' }
      case 'branchadmin':
        return { name: 'Branch Admin', color: 'bg-red-700', textColor: 'text-red-700 dark:text-red-300' }
      case 'branchmanager':
        return { name: 'Branch Manager', color: 'bg-[#0099CC]', textColor: 'text-orange-600 dark:text-orange-300' }
      case 'stockmanager':
        return { name: 'Stock Manager', color: 'bg-blue-600', textColor: 'text-blue-600 dark:text-blue-300' }
      case 'billcounter':
        return { name: 'Bill Counter', color: 'bg-green-600', textColor: 'text-green-600 dark:text-green-300' }
      default:
        return { name: 'User', color: 'bg-gray-600', textColor: 'text-gray-600 dark:text-gray-300' }
    }
  }

  const roleInfo = getRoleInfo(user?.role)

  return (
    <>
      {user && (
        <div className="w-full md:w-64 h-full bg-white dark:bg-slate-800 border-r-2 border-teal-100 dark:border-slate-700 shadow-lg flex flex-col transition-colors duration-300">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#0099CC] via-[#007aa3] to-[#005f7f] dark:from-gray-700 dark:to-gray-600 p-4 md:p-6 transition-all duration-300 relative overflow-hidden">
            {/* Subtle background decorations */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-teal-900/20"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl transform translate-x-8 -translate-y-8"></div>
            <div className="absolute bottom-0 left-0 w-14 h-14 bg-white/10 rounded-full blur-lg transform -translate-x-6 translate-y-6"></div>

            <div className="relative z-10 flex flex-col items-center justify-center gap-2 py-4 w-full">
              {/* Logo Container for Contrast and Size */}
              <div className="bg-white p-1.5 md:p-2.5 rounded-xl shadow-md w-[92%] max-w-[320px] flex justify-center items-center transition-transform duration-300 hover:scale-[1.03]">
                <img
                  src="/Asset 2.svg"
                  alt="Fettle Health and Heal"
                  className="w-full h-auto object-contain drop-shadow-sm min-h-[50px] md:min-h-[60px] scale-105"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-3 md:p-4 bg-teal-50 dark:bg-slate-700 border-b border-teal-100 dark:border-gray-600 transition-colors duration-300">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 md:w-10 md:h-10 ${roleInfo.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base font-semibold text-[#0099CC] dark:text-slate-100 truncate">{user.username}</p>
                <p className={`text-xs font-medium ${roleInfo.textColor} bg-white dark:bg-gray-600 px-2 py-0.5 rounded-full inline-block transition-colors duration-300`}>
                  {roleInfo.name}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 p-3 md:p-4 flex-1 overflow-y-auto">
            {navigationItems.map((item, index) => (
              <div key={index} onClick={handleNavigation}>
                <NavLink to={item.to} className={linkClass}>
                  <span className="text-lg md:text-xl flex items-center">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </div>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-3 md:p-4 border-t border-teal-100 dark:border-gray-600 transition-colors duration-300">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 md:gap-3 px-3 md:px-4 py-3 md:py-3 rounded-lg transition-all duration-200 font-medium bg-[#0099CC] dark:bg-red-900/20 text-white dark:text-red-400 hover:bg-[#007aa3] dark:hover:bg-red-900/40 hover:text-white dark:hover:text-white hover:shadow-lg transform hover:scale-105"
            >
              <HiArrowLeftOnRectangle className="text-lg md:text-xl" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar
