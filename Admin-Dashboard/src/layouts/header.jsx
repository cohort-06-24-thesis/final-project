import React, { useState, useRef, useEffect } from "react";
import { Bell, ChevronsLeft } from "lucide-react";
import profileImg from "@/assets/profile-image.jpg";
import PropTypes from "prop-types";
import { useTheme } from "@/hooks/use-theme";
import { useNotification } from "@/contexts/notification-context";

export const Header = ({ collapsed, setCollapsed }) => {
  const { theme } = useTheme();
  const { unseenCount, notifications } = useNotification();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="relative z-10 flex h-[60px] items-center justify-between bg-white px-4 shadow-md transition-colors dark:bg-slate-900">
      <div className="flex items-center gap-x-3">
        <button className="btn-ghost size-10" onClick={() => setCollapsed(!collapsed)}>
          <ChevronsLeft className={collapsed && "rotate-180"} />
        </button>
      </div>
      <div className="flex items-center gap-x-3 relative">
        <div className="relative" ref={dropdownRef}>
          <button 
            className="btn-ghost size-10 relative" 
            onClick={toggleDropdown}
          >
            <Bell size={20} />
            {unseenCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  backgroundColor: "red",
                  color: "white",
                  borderRadius: "50%",
                  padding: "2px 6px",
                  fontSize: 12,
                  fontWeight: "bold",
                  lineHeight: 1,
                  transform: "translate(50%, -50%)",
                  pointerEvents: "none",
                }}
              >
                {unseenCount}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
              <div className="p-3 border-b border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No notifications
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-slate-700">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 hover:bg-gray-50 dark:hover:bg-slate-700 ${
                          !notif.isRead ? "bg-blue-50 dark:bg-slate-700" : ""
                        }`}
                      >
                        <p className="text-sm text-gray-700 dark:text-gray-200">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(notif.createdAt || notif.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <button className="size-10 overflow-hidden rounded-full">
          <img src={profileImg} alt="profile image" className="size-full object-cover" />
        </button>
      </div>
    </header>
  );
};

Header.propTypes = {
  collapsed: PropTypes.bool,
  setCollapsed: PropTypes.func,
};
