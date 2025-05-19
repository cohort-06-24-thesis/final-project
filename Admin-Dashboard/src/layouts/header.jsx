import React from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronsLeft } from "lucide-react";
import profileImg from "@/assets/profile-image.jpg";
import PropTypes from "prop-types";
import { useTheme } from "@/hooks/use-theme";
import { useNotification } from "@/contexts/notification-context"; // Adjust path if needed

export const Header = ({ collapsed, setCollapsed }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { unseenCount } = useNotification();  // Use context

  const goToNotifications = () => {
    navigate("/notifications");
  };

  return (
    <header className="relative z-10 flex h-[60px] items-center justify-between bg-white px-4 shadow-md transition-colors dark:bg-slate-900">
      <div className="flex items-center gap-x-3">
        <button className="btn-ghost size-10" onClick={() => setCollapsed(!collapsed)}>
          <ChevronsLeft className={collapsed && "rotate-180"} />
        </button>
      </div>
      <div className="flex items-center gap-x-3 relative">
        <button className="btn-ghost size-10 relative" onClick={goToNotifications}>
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
