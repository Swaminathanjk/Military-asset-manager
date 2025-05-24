import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-6">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">Oops! Page not found.</p>
      <Link
        to="/dashboard"
        className="text-blue-600 hover:underline font-semibold"
      >
        Go back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
