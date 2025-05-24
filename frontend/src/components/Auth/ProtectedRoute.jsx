import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/authContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  // console.log("User:", user);
  // if (user) {
  //   console.log("User role:", user.role);
  // }
  // console.log("Allowed roles:", allowedRoles);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role not authorized
    return <Navigate to="/unauthorized" replace />;
  }

  // Authorized, render nested routes
  return <Outlet />;
};

export default ProtectedRoute;
