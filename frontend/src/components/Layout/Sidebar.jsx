// Sidebar.jsx
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ isOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/purchases", label: "Purchases" },
    { to: "/transfers", label: "Transfers" },
    { to: "/assignments", label: "Assignments" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      className={`
        bg-gray-800 text-white w-64 h-screen fixed top-0 left-0 z-40 flex flex-col justify-between
        transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      <div>
        <h2 className="mt-4 text-2xl font-bold mb-6 text-center">
          Asset Manager
        </h2>
        <nav className="space-y-3 px-4">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md font-medium hover:bg-blue-600 transition ${
                  isActive ? "bg-blue-600 text-white" : "text-gray-300"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="text-red-400 font-semibold px-3 py-2 hover:bg-red-700 hover:text-white rounded-md transition m-4"
      >
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
