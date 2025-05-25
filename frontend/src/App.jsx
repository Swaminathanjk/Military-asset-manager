import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Purchases from "./pages/Purchases";
import Transfers from "./pages/Transfers";
import Assignments from "./pages/Assignments";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import AppLayout from "./components/Layout/AppLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Optional: Import the military-style font from Google Fonts
import "@fontsource/rajdhani"; // Make sure you have installed it

function App() {
  return (
    <Router>
      {/* Global ToastContainer for notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* All authenticated routes share the AppLayout */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
                "base commander",
                "logistics officer",
                "personnel",
              ]}
            />
          }
        >
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Purchases and Transfers for specific roles */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "admin",
                    "logistics officer",
                    "base commander",
                  ]}
                />
              }
            >
              <Route path="purchases" element={<Purchases />} />
              <Route path="transfers" element={<Transfers />} />
            </Route>

            {/* Assignments for designated roles */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "admin",
                    "base commander",
                    "logistics officer",
                    "personnel",
                  ]}
                />
              }
            >
              <Route path="assignments" element={<Assignments />} />
            </Route>
          </Route>
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
