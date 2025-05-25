import { useAuth } from "../../context/AuthContext";

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="bg-[#2c3a2c] shadow-md px-6 py-3 flex justify-between items-center border-b-2 border-green-600 select-none">
      <button
        onClick={onToggleSidebar}
        className="lg:hidden text-3xl text-green-400 hover:text-green-600 transition"
        aria-label="Toggle sidebar"
      >
        &#9776; {/* ☰ */}
      </button>

      <h1 className="text-xl font-[Rajdhani] font-extrabold uppercase text-green-300 tracking-widest">
        Dashboard
      </h1>

      <div className="flex items-center gap-4">
        <div className="text-sm text-green-200 font-semibold select-text">
          {user?.name}
        </div>
        <div className="w-9 h-9 rounded-full bg-green-700 border-2 border-green-500 text-white flex items-center justify-center uppercase font-[Rajdhani] font-bold tracking-widest shadow-md">
          {user?.name.charAt(0)}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
