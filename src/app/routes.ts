import { createBrowserRouter } from "react-router";
import Root from "./pages/Root";
import Login from "./pages/Login";
import DriverDashboard from "./pages/DriverDashboard";
import WarehousePickup from "./pages/WarehousePickup";
import CompleteDelivery from "./pages/CompleteDelivery";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Login },
      { path: "driver-dashboard", Component: DriverDashboard },
      { path: "warehouse-pickup", Component: WarehousePickup },
      { path: "complete-delivery", Component: CompleteDelivery },
      { path: "admin-dashboard", Component: AdminDashboard },
      { path: "*", Component: NotFound },
    ],
  },
]);
