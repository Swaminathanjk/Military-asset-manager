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
        bg-[#283618] text-[#d9d9d9] w-64 h-screen fixed top-0 left-0 z-40 flex flex-col justify-between
        transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        border-r-2 border-green-700
        font-[Rajdhani]
      `}
    >
      <div>
        <h2 className="mt-6 mb-8 text-3xl font-extrabold tracking-widest text-center uppercase text-[#ffe8d6] drop-shadow-lg">
          Asset Manager
        </h2>
        <nav className="space-y-3 px-4">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-md font-semibold tracking-wide transition-colors
                ${
                  isActive
                    ? "bg-[#606c38] text-[#fefae0] shadow-md shadow-black"
                    : "text-[#cfcfcf] hover:bg-[#3a4a14] hover:text-[#fefae0]"
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
        className="m-4 px-4 py-2 rounded-md font-bold tracking-wide text-[#b22222] bg-[#3a0e0e] hover:bg-[#8b0000] hover:text-white transition-shadow shadow-md"
      >
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
