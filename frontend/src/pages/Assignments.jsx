import { useState, useEffect } from "react";
import api from "../services/api";
import Card from "../UI/Card";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Assignments = () => {
  const { user } = useAuth();

  // Define CommanderCard outside or inside Assignments, but pass proper props
  const CommanderCard = ({ user, baseName }) => {
    if (!user || user.role !== "base commander") return null;

    return (
      <div className="mb-6 bg-green-50 border-green-400 border p-4 rounded shadow text-green-700">
        <h3 className="text-xl font-semibold mb-2">Base Commander Details</h3>
        <p>
          <strong>Name:</strong> {user.name || "N/A"}
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
        // Fetch net quantity asset types for the selected base
        const res = await api.get(`/asset-types/base/${formData.base}`);

        // Make sure data is an array
        const data = Array.isArray(res.data) ? res.data : [];

        // Set asset types (with net quantities)
        setAssetTypes(data);

        // Reset asset type selection
        setFormData((prev) => ({
          ...prev,
          assetType: "",
        }));
      } catch (err) {
        console.error("Failed to fetch asset types for base:", err);
        toast.error("Failed to load available asset types for selected base");
        setAssetTypes([]);
        setFormData((prev) => ({ ...prev, assetType: "" }));
      }
    };

    fetchAssetTypesForBase();
  }, [formData.base, filteredAssignments]);

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
          // No need to filter again, already filtered at the API level
          setFilteredAssignments(allAssignments);
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
        assignedTo: formData.assignedTo, // personnel serviceId (from select)
        base: normalizeId(formData.base),
        assetType: formData.assetType,
        quantity: Number(formData.quantity),
        assignedBy: user.serviceId || user._id, // fallback to _id if serviceId missing
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
    <div className="min-h-screen bg-[#1f2d1f] px-4 py-8 font-[Rajdhani] text-white max-w-5xl mx-auto">
      <h2 className="text-3xl font-extrabold mb-6 tracking-widest uppercase border-b border-green-500 pb-2">
        Assignments
      </h2>

      {canAssign && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 bg-[#2e3d2e] border border-green-700 rounded-xl p-6 shadow-lg max-w-md"
        >
          <div className="mb-4">
            <CommanderCard user={user} baseName={user.baseId?.name} />
            <label className="block mb-1 font-bold uppercase text-green-400 tracking-wide">
              Base
            </label>
            {user.role === "admin" ? (
              <select
                name="base"
                value={formData.base}
                onChange={handleChange}
                className="w-full bg-[#1b2a1b] border border-green-700 rounded-md px-3 py-2 text-white placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="w-full bg-[#1b2a1b] border border-green-700 rounded-md px-3 py-2 text-green-300 cursor-not-allowed"
              />
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-bold uppercase text-green-400 tracking-wide">
              Personnel Service ID
            </label>
            <select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className="w-full bg-[#1b2a1b] border border-green-700 rounded-md px-3 py-2 text-white placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
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

          <div className="mb-4">
            <label className="block mb-1 font-bold uppercase text-green-400 tracking-wide">
              Equipment Type
            </label>
            <select
              name="assetType"
              value={formData.assetType}
              onChange={handleChange}
              className="w-full bg-[#1b2a1b] border border-green-700 rounded-md px-3 py-2 text-white placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  {a.name} - {a.netQuantity}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block mb-1 font-bold uppercase text-green-400 tracking-wide">
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              min="1"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full bg-[#1b2a1b] border border-green-700 rounded-md px-3 py-2 text-white placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={assigning}
            className="w-full bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-bold uppercase py-2 rounded tracking-wider transition-colors"
          >
            {assigning ? "Assigning..." : "Assign"}
          </button>
        </form>
      )}

      <h3 className="text-2xl font-bold mb-4 tracking-wide uppercase border-b border-green-600 pb-1">
        Current Assignments
      </h3>

      {loading ? (
        <p className="text-green-300 italic">Loading assignments...</p>
      ) : filteredAssignments.length === 0 ? (
        <p className="text-green-300 italic">No assignments found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg border border-green-700">
          <table className="min-w-full border-collapse text-white">
            <thead className="bg-green-800 uppercase text-green-200 tracking-wide">
              <tr>
                <th className="border border-green-600 px-3 py-2 text-left">
                  Personnel
                </th>
                <th className="border border-green-600 px-3 py-2 text-left">
                  Base
                </th>
                <th className="border border-green-600 px-3 py-2 text-left">
                  Asset Type
                </th>
                <th className="border border-green-600 px-3 py-2 text-center">
                  Quantity
                </th>
                <th className="border border-green-600 px-3 py-2 text-left">
                  Date
                </th>
                <th className="border border-green-600 px-3 py-2 text-left">
                  Assigned By
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((a) => {
                const resolveUser = (ref) => {
                  if (typeof ref === "object") return ref;
                  return users.find(
                    (u) => u._id === ref || u.serviceId === ref
                  );
                };

                const assignedToObj = resolveUser(a.assignedTo);
                const assignedByObj = resolveUser(a.assignedBy);

                const assignedToId =
                  assignedToObj?.serviceId ||
                  assignedToObj?._id ||
                  a.assignedTo;
                const assignedToName =
                  assignedToObj?.name || assignedToId || "Unknown";

                const assignedById = assignedByObj?.serviceId
                  ? typeof assignedByObj.serviceId === "object"
                    ? assignedByObj.serviceId.id ||
                      JSON.stringify(assignedByObj.serviceId)
                    : String(assignedByObj.serviceId)
                  : typeof a.assignedBy === "string"
                  ? a.assignedBy
                  : "";

                const assignedByName = assignedByObj?.name || "Unknown";

                return (
                  <tr
                    key={a._id}
                    className="hover:bg-green-900 transition-colors duration-150"
                  >
                    <td className="border border-green-700 px-3 py-2">
                      {assignedToId} - {assignedToName}
                    </td>
                    <td className="border border-green-700 px-3 py-2">
                      {a.base?.name || a.base}
                    </td>
                    <td className="border border-green-700 px-3 py-2">
                      {a.assetType?.name || a.assetType}
                    </td>
                    <td className="border border-green-700 px-3 py-2 text-center">
                      {a.quantity}
                    </td>
                    <td className="border border-green-700 px-3 py-2">
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
                    <td className="border border-green-700 px-3 py-2">
                      {assignedById
                        ? `${assignedById} - ${assignedByName}`
                        : assignedByName}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Assignments;
