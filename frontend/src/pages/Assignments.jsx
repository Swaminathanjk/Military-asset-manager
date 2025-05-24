import { useState, useEffect } from "react";
import api from "../services/api";
import Card from "../UI/Card";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Assignments = () => {
  const { user } = useAuth();
  const CommanderCard = ({ user, baseName }) => {
    if (!user || user.role !== "base commander") return null;

    return (
      <div className="mb-6 bg-green-50 border-green-400 border p-4 rounded shadow">
        <h3 className="text-xl font-semibold mb-2 text-green-700">
          Base Commander Details
        </h3>
        <p>
          <strong>Name:</strong> {user.name || "N/A"}
        </p>
        <p>
          <strong>Email:</strong> {user.email || "N/A"}
        </p>
        <p>
          <strong>Service ID:</strong> {user.serviceId || "N/A"}
        </p>
        <p>
          <strong>Base:</strong> {baseName || "N/A"}
        </p>
      </div>
    );
  };

  const normalizeId = (id) => (id ? id.toString() : "");

  const [formData, setFormData] = useState({
    assignedTo: "", // personnel serviceId
    base: "",
    assetType: "",
    quantity: 1,
  });

  const [bases, setBases] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const canAssign = user?.role === "admin" || user?.role === "base commander";

  // Fetch form data: bases, users (but NOT asset types yet)
  useEffect(() => {
    if (!canAssign || !user) return;

    const fetchFormData = async () => {
      try {
        const [basesRes, usersRes] = await Promise.all([
          api.get("/bases"),
          api.get("/users"),
        ]);

        const basesData = Array.isArray(basesRes.data.data)
          ? basesRes.data.data
          : [];
        const usersData = Array.isArray(usersRes.data.data)
          ? usersRes.data.data
          : [];

        setBases(basesData);
        setUsers(usersData);

        if (user.role === "base commander" && user.baseId) {
          const baseIdNormalized = normalizeId(user.baseId._id || user.baseId);
          setFormData((prev) => ({
            ...prev,
            base: baseIdNormalized,
          }));
        }
      } catch (err) {
        console.error("Form data fetch error:", err);
        toast.error("Failed to load form options");
      }
    };

    fetchFormData();
  }, [user, canAssign]);

  // Fetch asset types when base changes and base is selected
  useEffect(() => {
    if (!formData.base) {
      setAssetTypes([]); // Clear asset types if no base selected
      setFormData((prev) => ({ ...prev, assetType: "" })); // Clear selected assetType
      return;
    }

    const fetchAssetTypesForBase = async () => {
      try {
        // Fetch asset types for the selected base only
        const res = await api.get(`/asset-types/${formData.base}`);

        // Defensive check for data array
        const data = Array.isArray(res.data) ? res.data : [];

        setAssetTypes(data);
        setFormData((prev) => ({
          ...prev,
          assetType: "", // Reset selected assetType on base change
        }));
      } catch (err) {
        console.error("Failed to fetch asset types for base:", err);
        toast.error("Failed to load equipment types for selected base");
        setAssetTypes([]);
        setFormData((prev) => ({ ...prev, assetType: "" }));
      }
    };

    fetchAssetTypesForBase();
  }, [formData.base]);

  // Fetch assignments based on role
  useEffect(() => {
    if (!user) return;

    const fetchAssignments = async () => {
      setLoading(true);
      try {
        let url = "/assignments";
        if (user.role === "personnel") {
          url = `/assignments/personnel/${user.serviceId}`;
        } else if (
          user.role === "base commander" ||
          user.role === "logistics officer"
        ) {
          url = "/assignments";
        }

        const res = await api.get(url);

        const allAssignments = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
          ? res.data.data
          : [];

        setAssignments(allAssignments);

        if (
          (user.role === "base commander" ||
            user.role === "logistics officer") &&
          user.baseId
        ) {
          const filtered = allAssignments.filter(
            (a) =>
              normalizeId(a.base?._id || a.base) ===
              normalizeId(user.baseId._id || user.baseId)
          );
          setFilteredAssignments(filtered);
        } else if (user.role === "personnel") {
          const filtered = allAssignments.filter(
            (a) =>
              a.assignedTo === user.serviceId ||
              a.assignedTo?.serviceId === user.serviceId
          );
          setFilteredAssignments(filtered);
        } else {
          setFilteredAssignments(allAssignments);
        }
      } catch (err) {
        console.error("Assignment fetch error:", err);
        toast.error("Failed to load assignments");
        setAssignments([]);
        setFilteredAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // base commander cannot change base selection
    if (name === "base" && user.role === "base commander") return;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.assignedTo ||
      !formData.base ||
      !formData.assetType ||
      !formData.quantity
    ) {
      toast.error("Please fill all fields");
      return;
    }

    setAssigning(true);
    try {
      await api.post("/assignments", {
        assignedTo: formData.assignedTo,
        base: normalizeId(formData.base),
        assetType: formData.assetType,
        quantity: Number(formData.quantity),
        assignedBy: user.serviceId,
      });

      toast.success("Assignment created");

      setFormData({
        assignedTo: "",
        base:
          user.role === "base commander"
            ? normalizeId(user.baseId._id || user.baseId)
            : "",
        assetType: "",
        quantity: 1,
      });

      // Refresh assignments after creation
      const res = await api.get("/assignments");
      const allAssignments = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.data)
        ? res.data.data
        : [];

      setAssignments(allAssignments);

      if (user.role === "base commander" && user.baseId) {
        const filtered = allAssignments.filter(
          (a) =>
            normalizeId(a.base?._id || a.base) ===
            normalizeId(user.baseId._id || user.baseId)
        );
        setFilteredAssignments(filtered);
      } else if (user.role === "personnel") {
        const filtered = allAssignments.filter(
          (a) =>
            a.assignedTo === user.serviceId ||
            a.assignedTo?.serviceId === user.serviceId
        );
        setFilteredAssignments(filtered);
      } else {
        setFilteredAssignments(allAssignments);
      }
    } catch (err) {
      console.error("Create assignment error:", err);
      toast.error(err.response?.data?.message || "Assignment failed");
    } finally {
      setAssigning(false);
    }
  };

  // Filter users for current base, defensive check if users is array
  const personnelForBase = Array.isArray(users)
    ? users.filter(
        (u) =>
          u.role === "personnel" &&
          normalizeId(u.baseId?._id || u.baseId) === normalizeId(formData.base)
      )
    : [];

  // Defensive base name lookup
  const baseName =
    Array.isArray(bases) &&
    bases.find((b) => normalizeId(b._id) === normalizeId(formData.base))?.name;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Assignments</h2>

      {canAssign && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 max-w-md space-y-4 border p-4 rounded shadow"
        >
          <div>
            <label className="block font-semibold mb-1">
              Personnel Service ID
            </label>
            <select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            >
              <option value="">Select personnel</option>
              {personnelForBase.map((p) => (
                <option key={p._id} value={p.serviceId || p._id}>
                  {p.serviceId || p._id} - {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Base</label>
            {user.role === "admin" ? (
              <select
                name="base"
                value={formData.base}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">Select base</option>
                {bases.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={baseName || "Unknown"}
                readOnly
                className="w-full border px-3 py-2 rounded bg-gray-200 cursor-not-allowed"
              />
            )}
          </div>

          <div>
            <label className="block font-semibold mb-1">Equipment Type</label>
            <select
              name="assetType"
              value={formData.assetType}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
              disabled={!formData.base || assetTypes.length === 0}
            >
              <option value="">
                {formData.base
                  ? assetTypes.length === 0
                    ? "No equipment found for base"
                    : "Select equipment"
                  : "Select base first"}
              </option>
              {assetTypes.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Quantity</label>
            <input
              type="number"
              name="quantity"
              min="1"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          <button
            type="submit"
            disabled={assigning}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {assigning ? "Assigning..." : "Assign"}
          </button>
        </form>
      )}
      <h3 className="text-xl font-semibold mb-2">Current Assignments</h3>

      {loading ? (
        <p>Loading assignments...</p>
      ) : filteredAssignments.length === 0 ? (
        <p>No assignments found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300 rounded shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2">Personnel</th>
              <th className="border border-gray-300 p-2">Base</th>
              <th className="border border-gray-300 p-2">Asset Type</th>
              <th className="border border-gray-300 p-2">Quantity</th>
              <th className="border border-gray-300 p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssignments.map((a) => {
              const personnelObj =
                typeof a.assignedTo === "object"
                  ? a.assignedTo
                  : users.find(
                      (u) =>
                        u.serviceId === a.assignedTo || u._id === a.assignedTo
                    );

              const personnelId =
                personnelObj?.serviceId || personnelObj?._id || a.assignedTo;
              const personnelName = personnelObj?.name || a.assignedTo;

              return (
                <tr key={a._id} className="hover:bg-green-50">
                  <td className="border border-gray-300 p-2">
                    {personnelId} - {personnelName}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {a.base?.name || a.base}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {a.assetType?.name || a.assetType}
                  </td>
                  <td className="border border-gray-300 p-2">{a.quantity}</td>
                  <td className="border border-gray-300 p-2">
                    {a.date
                      ? new Date(a.date).toLocaleString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Assignments;
