import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#1f2d1f] p-6 font-[Rajdhani] text-white">
      <h1 className="text-9xl font-extrabold mb-6 tracking-widest border-b border-green-600 pb-4 w-fit">
        404
      </h1>
      <p className="text-2xl mb-8 uppercase font-semibold tracking-wider">
        Mission Failed: Page Not Found
      </p>
      <Link
        to="/dashboard"
        className="bg-green-700 hover:bg-green-800 transition-colors px-6 py-3 rounded-md uppercase font-bold tracking-wide shadow-lg"
      >
        Return to Command Center
      </Link>
    </div>
  );
};

export default NotFound;
