import {
  Home,
  Users,
  Boxes,
  HandHelping,
  Flag,
  CalendarCheck,
  NotepadText,
  ShoppingBag,
  CreditCard, // Import Payments icon
} from "lucide-react";

export const navbarLinks = [
  {
    title: "Dashboard",
    links: [
      { label: "Dashboard", icon: Home, path: "/" },
      { label: "Reports", icon: NotepadText, path: "/reports" },
      { label: "Payments", icon: CreditCard, path: "/payments" }, 
    ],
  },
  {
    title: "Management",
    links: [
      { label: "Manage Users", icon: Users, path: "/manage-users" },
      { label: "Manage Donations ", icon: Boxes, path: "/manage-donation-items" },
      { label: "Manage InNeed", icon: HandHelping, path: "/manage-inneed" },
      { label: "Manage Campaigns", icon: Flag, path: "/manage-campaigns" },
      { label: "Manage Events", icon: CalendarCheck, path: "/manage-events" },
    ],
  },
];
