import { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import { useSelector } from "react-redux"
import { selectUser } from "../redux/features/auth/loginSlice"
import NotificationBell from "../components/NotificationBell"
import { Moon, Sun } from "lucide-react"

const Navbar = () => {
  const user = useSelector(selectUser);
  const [darkMode, setDarkMode] = useState(false);

  // Load dark mode preference from localStorage on component mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    // const newDarkMode = !darkMode;
    // setDarkMode(newDarkMode);
    // localStorage.setItem('darkMode', newDarkMode.toString());
    
    // if (newDarkMode) {
    //   document.documentElement.classList.add('dark');
    // } else {
    //   document.documentElement.classList.remove('dark');
    // }
  };

  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
      isActive 
        ? "bg-amber-700 text-white shadow-lg transform scale-105" 
        : darkMode 
          ? "text-gray-300 hover:text-white hover:bg-gray-700 hover:shadow-md"
          : "text-blue-700 hover:text-white hover:bg-blue-600 hover:shadow-md"
    }`

  return (
    <nav className={`flex-1 flex items-center justify-between transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>
      <div className="flex items-center gap-2">
       
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Dark Mode Toggle */}
        {/* <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-lg transition-all duration-200 ${
            darkMode 
              ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button> */}

        {!user ? (
          <>
            {/* <NavLink to="/home" className={linkClass}>
              🏠 Home
            </NavLink> */}

            <NavLink to="/login" className={linkClass}>
              🔑 Login
            </NavLink>


          </>
        ) : (
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notifications */}
            <NotificationBell />

            {/* User Profile */}
            <div className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 rounded-lg border transition-colors duration-300 ${
              darkMode
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-blue-50 border-blue-200 text-gray-900'
            }`}>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#720000] rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col hidden sm:block">
                <span className={`font-semibold text-xs sm:text-sm transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-blue-900'
                }`}>
                  {user.username}
                </span>
                <span className={`text-xs transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-blue-600'
                }`}>

                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
