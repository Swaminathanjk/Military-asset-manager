import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [bases, setBases] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    baseId: "",
    serviceId: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBases = async () => {
      try {
        const res = await api.get("/bases");
        setBases(res.data.data || []);
      } catch (err) {
        console.error("Error fetching bases:", err);
      }
    };
    fetchBases();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getServicePrefix = (role) => {
    switch (role) {
      case "base commander":
        return "CM";
      case "logistics officer":
        return "LG";
      case "personnel":
        return "PS";
      default:
        return "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      if (formData.role !== "admin") {
        payload.baseId = formData.baseId;
        payload.serviceId =
          getServicePrefix(formData.role) + formData.serviceId;
      }

      const response = await api.post("/auth/register", payload);
      const { token, user } = response.data;

      login(token, user);
      toast.success("Signup successful! Redirecting to login...", {
        position: "top-right",
      });

      navigate("/login");
    } catch (err) {
      const message =
        err.response?.data?.message || "Signup failed. Try again.";
      setError(message);
      toast.error(message, {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const prefix = getServicePrefix(formData.role);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1f2d1f] px-4 font-[Rajdhani]">
      <div className="bg-[#2e3d2e] shadow-lg border border-green-700 p-8 rounded-xl w-full max-w-md text-white">
        <h2 className="text-3xl font-extrabold text-center mb-6 tracking-widest uppercase border-b pb-2 border-green-500">
          Signup Registry
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1">Name</label>
            <input
              type="text"
              name="name"
              className="w-full px-3 py-2 bg-[#1b2a1b] border border-green-700 rounded-md text-white"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              name="email"
              className="w-full px-3 py-2 bg-[#1b2a1b] border border-green-700 rounded-md text-white"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Password</label>
            <input
              type="password"
              name="password"
              className="w-full px-3 py-2 bg-[#1b2a1b] border border-green-700 rounded-md text-white"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Role</label>
            <select
              name="role"
              className="w-full px-3 py-2 bg-[#1b2a1b] border border-green-700 rounded-md text-white"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="base commander">Commander</option>
              <option value="logistics officer">Logistics</option>
              <option value="personnel">Personnel</option>
            </select>
          </div>

          {formData.role && formData.role !== "admin" && (
            <>
              <div>
                <label className="block text-sm font-semibold mb-1">Base</label>
                <select
                  name="baseId"
                  className="w-full px-3 py-2 bg-[#1b2a1b] border border-green-700 rounded-md text-white"
                  value={formData.baseId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Base</option>
                  {bases.map((base) => (
                    <option key={base._id} value={base._id}>
                      {base.name} - {base.location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Service ID
                </label>
                <div className="flex items-center space-x-2">
                  {prefix && (
                    <span className="bg-green-800 text-white px-3 py-2 rounded-md text-sm font-bold">
                      {prefix}
                    </span>
                  )}
                  <input
                    type="text"
                    name="serviceId"
                    className="flex-1 px-3 py-2 bg-[#1b2a1b] border border-green-700 rounded-md text-white"
                    value={formData.serviceId}
                    onChange={handleChange}
                    required
                    placeholder="Enter ID"
                  />
                </div>
              </div>
            </>
          )}

          {error && (
            <p className="text-red-400 text-sm font-semibold">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-green-700 hover:bg-green-800 transition-colors text-white py-2 rounded-md uppercase font-bold tracking-wide disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
