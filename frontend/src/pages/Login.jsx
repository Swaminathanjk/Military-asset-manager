import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;

      login(token, user);
      toast.success("Welcome back, soldier!", {
        position: "top-right",
      });

      navigate("/dashboard");
    } catch (err) {
      const message =
        err.response?.data?.message || "Invalid credentials. Please try again.";
      setError(message);
      toast.error(message, {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1f2d1f] px-4 font-[Rajdhani]">
      <div className="bg-[#2e3d2e] shadow-lg border border-green-700 p-8 rounded-xl w-full max-w-md text-white">
        <h2 className="text-3xl font-extrabold text-center mb-6 tracking-widest uppercase border-b pb-2 border-green-500">
          Login Ops Center
        </h2>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 bg-[#1b2a1b] border border-green-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="e.g. soldier@army.mil"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 bg-[#1b2a1b] border border-green-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm font-semibold">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-green-700 hover:bg-green-800 transition-colors text-white py-2 rounded-md uppercase font-bold tracking-wide disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Enter Base"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p>
            New recruit?{" "}
            <a
              href="/signup"
              className="text-green-400 hover:underline font-semibold"
            >
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
