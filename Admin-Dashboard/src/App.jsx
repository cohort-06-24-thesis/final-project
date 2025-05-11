import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ThemeProvider } from "@/contexts/theme-context";

import Layout from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
import Users from "./routes/users/page"
import Donations from "./routes/donations/page"
import InNeed from "./routes/inNeed/page"
import Campaigns from "./routes/campaigns/page"
import Events from "./routes/events/page"
import Reports from "./routes/reports/page"
import Inventory from "./routes/inventory/page"
import Payments from "./routes/payments/page"

function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Layout />,
            children: [
                { index: true, element: <DashboardPage /> },
                { path: "manage-users", element: <Users/> },
                { path: "payments", element: <Payments/> },
                { path: "manage-donation-items", element: <Donations/> },
                { path: "manage-inneed", element: <InNeed/>},
                { path: "manage-campaigns", element: <Campaigns/>},
                { path: "manage-events", element: <Events/>},
                { path: "reports", element: <Reports/> },
                { path: "inventory", element: <Inventory/> },
            ],
        },
    ]);

    return (
        <ThemeProvider storageKey="theme">
            <RouterProvider router={router} />
        </ThemeProvider>
    );
}

export default App;

