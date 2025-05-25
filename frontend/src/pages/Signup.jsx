import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [bases, setBases] = useState([]);
  // console.log("bases:", bases);

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

  // Fetch bases to show in dropdown
  useEffect(() => {
    const fetchBases = async () => {
      try {
        const res = await api.get("/bases"); // Adjust endpoint as needed
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Prepare data to send
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      if (formData.role !== "admin") {
        payload.baseId = formData.baseId;
        payload.serviceId = formData.serviceId;
      }

      const response = await api.post("/auth/register", payload);

      const { token, user } = response.data;

      login(token, user);

      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-md p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-4">
          Military Asset Signup
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              name="name"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Role</label>
            <select
              name="role"
              className="w-full px-3 py-2 border rounded-md"
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

          {/* Show Base dropdown if role is not admin and role is selected */}
          {formData.role && formData.role !== "admin" && (
            <div>
              <label className="block text-sm font-medium">Base</label>
              <select
                name="baseId"
                className="w-full px-3 py-2 border rounded-md"
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
          )}

          {/* Show Service ID only if role is not admin */}
          {formData.role && formData.role !== "admin" && (
            <div>
              <label className="block text-sm font-medium">
                Service ID (without prefix)
              </label>
              <input
                type="text"
                name="serviceId"
                className="w-full px-3 py-2 border rounded-md"
                value={formData.serviceId}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Signup"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
