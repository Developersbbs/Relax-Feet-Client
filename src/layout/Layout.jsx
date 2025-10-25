import React, { useState } from "react"
import Sidebar from "../components/Sidebar"
import { useSelector } from "react-redux"
import { selectUser } from "../redux/features/auth/loginSlice"
import { Outlet } from "react-router-dom"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import Navbar from "./Navbar"

const Layout = () => {
  const user = useSelector(selectUser)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const handleCloseSidebar = () => {
    setMobileSidebarOpen(false)
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* 🔹 Desktop Sidebar (only for authenticated users) */}
      {user && (
        <div className="hidden md:block">
        <Sidebar onNavigate={handleCloseSidebar} />
        </div>
      )}

      {/* 🔹 Main Section */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-amber-100 dark:border-slate-700 sticky top-0 z-10 transition-colors duration-300">
          <div className="flex items-center px-6 py-4">
            {/* Mobile Menu Button - only for authenticated users */}
            {user && (
              <div className="md:hidden mr-4">
              <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-amber-200 dark:border-gray-600 text-amber-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-gray-700 hover:text-amber-800 dark:hover:text-white hover:border-amber-300 dark:hover:border-gray-500 transition-colors duration-300"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 bg-white dark:bg-slate-800">
                  <Sidebar onNavigate={handleCloseSidebar} />
                </SheetContent>
              </Sheet>
              </div>
            )}

            {/* Navbar */}
            <Navbar />
          </div>
        </header>

        {/* 🔹 Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
          <div className="">
            {/* Content Container with subtle styling */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-blue-100 dark:border-slate-700 min-h-full transition-colors duration-300">
              <div className="">
                <Outlet />
              </div>
            </div>
          </div>
        </main>

        {/* 🔹 Footer (optional) */}
        <footer className="bg-white dark:bg-slate-800 border-t border-blue-100 dark:border-slate-700 px-6 py-4 transition-colors duration-300">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-600 dark:text-slate-400">© 2025 Relax Feet. All rights reserved.</span>
            <div className="flex items-center gap-4 text-blue-500 dark:text-slate-400">
              
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Layout
