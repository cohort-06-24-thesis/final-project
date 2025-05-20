
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";

import Layout from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
import Users from "./routes/users/page";
import Donations from "./routes/donations/page";
import InNeed from "./routes/inNeed/page";
import Campaigns from "./routes/campaigns/page";
import Events from "./routes/events/page";
import Reports from "./routes/reports/page";
import Payments from "./routes/payments/page";
import DonationItemDetails from "./routes/donations/[id]";
import InNeedItemsDetails from "./routes/inNeed/[id]";
import SocketProvider from "./SocketProvider";
import NotificationsPage from "./routes/notifications/page";
import CampaignDeatils from "./routes/campaigns/[id]"
import EventDetails from "./routes/events/[id]"

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


import { NotificationProvider } from "@/contexts/notification-context";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { index: true, element: <DashboardPage /> },
        { path: "manage-users", element: <Users /> },
        { path: "payments", element: <Payments /> },
        { path: "manage-donation-items", element: <Donations /> },
        { path: "manage-donation-items/:id", element: <DonationItemDetails /> },
        { path: "manage-inneed", element: <InNeed /> },
        { path: "manage-inneed/:id", element: <InNeedItemsDetails /> },
        { path: "manage-campaigns", element: <Campaigns /> },
        { path: "manage-campaigns/:id", element: <CampaignDeatils /> },

        { path: "manage-events", element: <Events /> },
        { path: "manage-events/:id", element: <EventDetails /> },

        { path: "reports", element: <Reports /> },
   
        { path: "notifications", element: <NotificationsPage /> },
      ],
    },
  ]);

  return (
    <ThemeProvider storageKey="theme">
   
      <NotificationProvider>
        
        <SocketProvider>
          <ToastContainer position="top-right" autoClose={3000} />
          <RouterProvider router={router} />
        </SocketProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
