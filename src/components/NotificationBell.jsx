import { useCallback, useEffect, useRef, useState } from 'react';
import { HiBell } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/features/auth/loginSlice';
import { getNotifications, markAsRead } from '../services/notificationService';

const UNREAD_LIMIT = 10;
const ALLOWED_ROLES = ['superadmin', 'stockmanager', 'billcounter'];

export default function NotificationBell() {
  const user = useSelector(selectUser);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const dropdownRef = useRef(null);

  const fetchUnreadNotifications = useCallback(async ({ silent = false } = {}) => {
    const userRole = user?.role?.toLowerCase();
    if (!user || !ALLOWED_ROLES.includes(userRole)) {
      setNotifications([]);
      setTotalUnread(0);
      if (!silent) {
        setIsLoading(false);
      }
      return;
    }

    if (!silent) {
      setIsLoading(true);
    }

    try {
      const response = await getNotifications({ status: 'unread', limit: UNREAD_LIMIT });
      setNotifications(response.data || []);
      const unreadTotal = response.meta?.total ?? response.data?.length ?? 0;
      setTotalUnread(unreadTotal);
    } catch (error) {
      console.error('Failed to fetch unread notifications:', error);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadNotifications();
    const interval = setInterval(() => {
      fetchUnreadNotifications({ silent: true });
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchUnreadNotifications]);

  useEffect(() => {
    setIsOpen(false);
    fetchUnreadNotifications();
  }, [user, fetchUnreadNotifications]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      fetchUnreadNotifications({ silent: true });
    }
  };
  const [loadingActions, setLoadingActions] = useState(new Set())

  const handleMarkAsRead = async (notificationId) => {
    if (loadingActions.has(notificationId)) return // Prevent multiple clicks

    setLoadingActions(prev => new Set(prev).add(notificationId))

    try {
      await markAsRead(notificationId)
      setNotifications((prev) => prev.filter((item) => item._id !== notificationId))
      setTotalUnread((prev) => Math.max(prev - 1, 0))
      fetchUnreadNotifications({ silent: true })
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      if (error.response?.status === 403) {
        setIsOpen(false)
      }
    } finally {
      // Show loading for minimum 5 seconds for better UX feedback
      setTimeout(() => {
        setLoadingActions(prev => {
          const newSet = new Set(prev)
          newSet.delete(notificationId)
          return newSet
        })
      }, 5000)
    }
  }

  const userRole = user?.role?.toLowerCase();

  if (!user || !ALLOWED_ROLES.includes(userRole)) {
    return null;
  }
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative inline-flex items-center justify-center rounded-full p-2 sm:p-3 text-[#720000] hover:bg-[#f0d6d6] hover:scale-105 active:scale-95 transition-all duration-200 touch-manipulation min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-[#8a1a1a] focus:ring-opacity-50"
        aria-label={`Notifications ${totalUnread > 0 ? `(${totalUnread} unread)` : '(no unread)'}`}
      >
        <HiBell className="h-5 w-5 sm:h-6 sm:w-6" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 sm:-top-0.5 sm:-right-0.5 inline-flex h-5 min-w-[20px] sm:h-4 sm:min-w-[16px] items-center justify-center rounded-full bg-[#720000] px-1 sm:px-0.5 text-[10px] sm:text-[9px] font-bold text-white animate-pulse">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-1rem)] sm:max-w-sm mx-2 sm:mx-0 overflow-hidden rounded-xl border border-[#f8e6e6] bg-white shadow-2xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-semibold text-slate-900 truncate">Unread Notifications</p>
              <p className="text-xs text-slate-500 mt-0.5">Tap to mark as read</p>
            </div>
            <Link
              to="/notifications"
              className="text-xs sm:text-sm font-medium text-[#720000] hover:text-[#8a1a1a] hover:bg-[#8a1a1a] px-2 py-1 rounded-md transition-colors ml-2 flex-shrink-0"
              onClick={() => setIsOpen(false)}
            >
              View all
            </Link>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-6 sm:py-8 px-4">
              <div className="flex flex-col items-center gap-3">
                <div className="h-6 w-6 sm:h-7 sm:w-7 animate-spin rounded-full border-2 border-[#720000] border-t-transparent"></div>
                <span className="text-xs sm:text-sm text-slate-500">Loading...</span>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-6 sm:py-8 text-center">
              <p className="text-sm text-gray-500">No unread notifications</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div key={item._id} className="border-b border-slate-50 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(item._id)}
                    disabled={loadingActions.has(item._id)}
                    className={`flex w-full flex-col items-start gap-2 px-3 sm:px-4 py-3 sm:py-4 text-left transition-all hover:bg-[#8a1a1a] hover:shadow-sm touch-manipulation min-h-[60px] sm:min-h-[56px] active:scale-95 ${
                      loadingActions.has(item._id)
                        ? 'opacity-70 cursor-not-allowed bg-gray-50'
                        : 'hover:bg-[#8a1a1a]'
                    }`}
                  >
                    <span className="text-sm sm:text-base font-medium text-slate-900 leading-tight line-clamp-2 break-words pr-2">
                      {item.message}
                    </span>
                    <div className="flex items-center justify-between w-full text-xs text-slate-500">
                      <span className="truncate">
                        {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      {loadingActions.has(item._id) ? (
                        <div className="flex items-center gap-1 text-blue-400">
                          <div className="w-3 h-3 border border-[#720000] border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs">Reading...</span>
                        </div>
                      ) : (
                        <span className="text-[#720000] font-medium ml-2 flex-shrink-0">Mark Read</span>
                      )}
                    </div>
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }
