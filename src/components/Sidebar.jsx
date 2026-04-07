import React from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { logout, selectUser } from "../redux/features/auth/loginSlice"

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
    `flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 md:py-3 mx-1 md:mx-2 rounded-lg transition-all duration-200 font-medium ${
      isActive
        ? "bg-[#720000] text-white shadow-lg transform scale-105"
        : "text-[#720000] dark:text-slate-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-[#8a1a1a] dark:hover:text-white hover:shadow-md"
    }`

  // Get navigation items based on user role
  const getNavigationItems = (userRole) => {
    const allItems = [
      { to: "/services", icon: "🔧", label: "Services" },
      { to: "/products", icon: "📦", label: "Products" },
      { to: "/categories", icon: "🏷️", label: "Categories" },
      { to: "/manage-customers", icon: "🧑‍🤝‍🧑", label: "Customers" },
      { to: "/manage-bill", icon: "🧾", label: "Bills" },
      { to: "/notifications", icon: "🔔", label: "Notifications" },
      { to: "/reports", icon: "📊", label: "Reports" },
      // { to: "/pages", icon: "📄", label: "Pages" },
    ]

    // Superadmin sees all items
    if (userRole === 'superadmin') {
      return allItems
    }

    // Admin sees only specific items
    if (userRole === 'admin') {
      return allItems.filter(item => 
        ['/services', '/manage-customers', '/manage-bill', '/reports'].includes(item.to)
      )
    }

    // Default to admin permissions if role is not recognized
    return allItems.filter(item => 
      ['/services', '/manage-customers', '/manage-bill', '/reports', '/pages'].includes(item.to)
    )
  }

  const navigationItems = getNavigationItems(user?.role)

  // Role info based on actual user role
  const getRoleInfo = (userRole) => {
    switch (userRole) {
      case 'superadmin':
        return { name: 'Super Admin', color: 'bg-[#8a1a1a]', textColor: 'text-[#720000] dark:text-red-300' }
      case 'admin':
        return { name: 'Admin', color: 'bg-blue-600', textColor: 'text-blue-600 dark:text-blue-300' }
      default:
        return { name: 'Admin', color: 'bg-blue-600', textColor: 'text-blue-600 dark:text-blue-300' }
    }
  }

  const roleInfo = getRoleInfo(user?.role)

  return (
    <>
      {user && (
        <div className="w-full md:w-64 h-full bg-white dark:bg-slate-800 border-r-2 md:border-r-2 border-red-100 dark:border-slate-700 shadow-lg flex flex-col transition-colors duration-300">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#720000] via-[#5c0000] to-[#450000] dark:from-gray-700 dark:to-gray-600 p-6 md:p-8 transition-all duration-300 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-amber-900/30 dark:bg-gray-800/20"></div>

            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/20 rounded-full blur-xl transform translate-x-8 -translate-y-8"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-amber-500/20 rounded-full blur-lg transform -translate-x-6 translate-y-6"></div>
            <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-amber-300/40 rounded-full animate-pulse"></div>
            <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-amber-300/60 rounded-full animate-pulse delay-1000"></div>

            <div className="relative z-10 flex items-center justify-center py-2">
              <div className="relative group">
                {/* Logo Glow Effect */}
                <div className="absolute inset-0 "></div>

                {/* Fallback for logo */}
                <div className="relative flex items-center justify-center">
                  <img
                    src="/RelaxFeet.png"
                    alt="RelaxFeet Logo"
                    className="h-16 md:h-24 lg:h-32 w-[150px] max-w-full transform group-hover:scale-105 transition-all duration-300 drop-shadow-xl"
                    style={{
                      filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15)) brightness(1.1) contrast(1.05)',
                      maxWidth: '100%'
                    }}
                    onError={(e) => {
                      console.warn('Frame 3.svg failed to load, trying alternative logo');
                      e.target.src = '/shree-sai-enginerrring-logo.svg';
                    }}
                    onLoad={(e) => {
                      console.log('Frame 3.svg logo loaded successfully');
                    }}
                  />

                  {/* Backup: Show text if image fails */}
                  <div className="logo-fallback absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 pointer-events-none">
                    <span className="text-amber-100 text-xs md:text-sm font-bold tracking-wider drop-shadow-lg">
                      RELAXFEET
                    </span>
                  </div>
                </div>

                {/* Subtle border effect */}
                <div className="absolute inset-0 rounded-lg border border-amber-300/20 group-hover:border-amber-200/40 transition-all duration-300"></div>
              </div>
            </div>

            {/* Enhanced Decorative elements */}
            <div className="absolute top-3 right-3 w-6 h-6 bg-amber-400/25 rounded-full blur-sm animate-pulse delay-500"></div>
            <div className="absolute bottom-3 left-3 w-4 h-4 bg-amber-500/25 rounded-full blur-sm animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 right-6 w-3 h-3 bg-amber-300/30 rounded-full blur-sm animate-pulse delay-2000"></div>
          </div>

          {/* User Info */}
          <div className="p-3 md:p-4 bg-red-50 dark:bg-slate-700 border-b border-red-100 dark:border-gray-600 transition-colors duration-300">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 md:w-10 md:h-10 ${roleInfo.color} rounded-full flex items-center justify-center text-white font-bold`}>
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <p className="text-sm md:text-base font-semibold text-[#720000] dark:text-slate-100">{user.username}</p>
                <p className={`text-xs font-medium ${roleInfo.textColor} bg-white dark:bg-gray-600 px-2 py-1 md:px-2 md:py-1 rounded-full inline-block transition-colors duration-300`}>
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
                  <span className="text-lg md:text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </div>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-3 md:p-4 border-t border-red-100 dark:border-gray-600 transition-colors duration-300">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 md:gap-3 px-3 md:px-4 py-3 md:py-3 rounded-lg transition-all duration-200 font-medium bg-[#720000] dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-[#720000] dark:hover:bg-red-900/40 hover:text-white dark:hover:text-white hover:shadow-lg transform hover:scale-105"
            >
              <span className="text-lg md:text-xl">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar
