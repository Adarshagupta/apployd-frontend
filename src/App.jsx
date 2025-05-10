import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { 
  TbLayoutDashboard, 
  TbDatabase, 
  TbActivity, 
  TbSettings,
  TbFlask,
  TbUser,
  TbSql,
  TbHelp
} from "react-icons/tb";
import { useAuth } from './context/AuthContext';

// Pages
import Dashboard from "./pages/Dashboard";
import Databases from "./pages/Databases";
import Monitoring from "./pages/Monitoring";
import Settings from "./pages/Settings";
import Support from "./pages/Support";
import Experiments from "./pages/Experiments";
import CreateDatabase from "./pages/CreateDatabase";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Profile from "./pages/auth/Profile";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import QueryPage from "./pages/QueryPage";
import SqlEditor from "./pages/SqlEditor";
import Home from "./pages/Home";

// Components
import Layout from "./components/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Context
import { AuthProvider } from './context/AuthContext';

// Navigation items configuration
const navItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: TbLayoutDashboard,
  },
  {
    name: "Databases",
    path: "/databases",
    icon: TbDatabase,
  },
  {
    name: "SQL Editor",
    path: "/query",
    icon: TbSql,
    hideFromNav: true, // Hide from sidebar but keep in routes
  },
  {
    name: "Monitoring",
    path: "/monitoring",
    icon: TbActivity,
  },
  {
    name: "Experiments",
    path: "/experiments",
    icon: TbFlask,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: TbSettings,
  },
  {
    name: "Support",
    path: "/support",
    icon: TbHelp,
  },
  {
    name: "Profile",
    path: "/profile",
    icon: TbUser,
  }
];

// Create main routes layout that will be used with RouterProvider
function AppRoutes() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

// A component to conditionally render based on auth state
function RootRedirect() {
  const { currentUser } = useAuth();
  return currentUser ? <Navigate to="/dashboard" replace /> : <Home />;
}

// This export is used to define the routes for the RouterProvider
export const routes = [
  {
    element: <AppRoutes />,
    children: [
      // Public routes
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/unauthorized", element: <Unauthorized /> },
      
      // Home page at root path
      { 
        path: "/", 
        element: <RootRedirect /> 
      },
      
      // Protected routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <Layout navItems={navItems.filter(item => !item.hideFromNav)} />,
            children: [
              { path: "/dashboard", element: <Dashboard /> },
              { path: "/databases", element: <Databases /> },
              { path: "/query", element: <QueryPage /> },
              { path: "/sql-editor", element: <SqlEditor /> },
              { path: "/monitoring", element: <Monitoring /> },
              { path: "/support", element: <Support /> },
              { path: "/settings", element: <Settings /> },
              { path: "/create-database", element: <CreateDatabase /> },
              { path: "/profile", element: <Profile /> },
              
              // Developer-only routes
              {
                element: <ProtectedRoute requiredRoles={['admin', 'developer']} />,
                children: [
                  { path: "/experiments", element: <Experiments /> }
                ]
              }
            ]
          }
        ]
      },
      
      // 404 Not Found
      { path: "*", element: <NotFound /> }
    ]
  }
];

// App component is now just a shell for RouterProvider to use
function App() {
  return <Outlet />;
}

export default App; 