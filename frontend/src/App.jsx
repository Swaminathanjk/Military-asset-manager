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

function App() {
  return (
    <Router>
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
          {/* Layout wrapper */}
          <Route path="/" element={<AppLayout />}>
            {/* Dashboard accessible to all logged in roles */}
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Purchases and Transfers only for admin & logistics-officer */}
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

            {/* Assignments only for admin & base-commander */}
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

        {/* Catch all for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
