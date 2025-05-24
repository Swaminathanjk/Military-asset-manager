// Navbar.jsx
import { useAuth } from "../../context/authContext";

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow px-6 py-3 flex justify-between items-center">
      <button
        onClick={onToggleSidebar}
        className="lg:hidden text-2xl text-gray-700"
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-700">{user?.name}</div>
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center uppercase">
          {user?.name.charAt(0)}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
