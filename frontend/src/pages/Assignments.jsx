import { useState, useEffect } from "react";
import api from "../services/api";
import Card from "../UI/Card";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Assignments = () => {
  const { user } = useAuth();

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

  // Fetch form data: bases, asset types, users
  useEffect(() => {
    if (!canAssign || !user) return;

    const fetchFormData = async () => {
      try {
        const [basesRes, assetTypesRes, usersRes] = await Promise.all([
          api.get("/bases"),
          api.get("/asset-types"),
          api.get("/users"),
        ]);

        // Defensive: ensure data arrays
        const basesData = Array.isArray(basesRes.data.data)
          ? basesRes.data.data
          : [];
        const assetTypesData = Array.isArray(assetTypesRes.data)
          ? assetTypesRes.data
          : [];
        const usersData = Array.isArray(usersRes.data.data)
          ? usersRes.data.data
          : [];

        setBases(basesData);
        setAssetTypes(assetTypesData);
        setUsers(usersData);

        if (user.role === "base commander" && user.baseId) {
          setFormData((prev) => ({
            ...prev,
            base: normalizeId(user.baseId._id || user.baseId),
          }));
        }
      } catch (err) {
        console.error("Form data fetch error:", err);
        toast.error("Failed to load form options");
      }
    };

    fetchFormData();
  }, [user, canAssign]);

  // Fetch assignments based on role
  useEffect(() => {
    if (!user) return;

    const fetchAssignments = async () => {
      setLoading(true);
      try {
        let url = "/assignments";
        if (user.role === "personnel") {
          url = `/assignments/personnel/${user.serviceId}`;
        } else if (user.role === "base commander") {
          // NOTE: since you said no API for /assignments/base/:id, fallback to /assignments and filter client side
          url = "/assignments";
        }

        const res = await api.get(url);

        // Defensive: check response is array
        const allAssignments = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
          ? res.data.data
          : [];

        setAssignments(allAssignments);

        // Filter assignments by base for base commander or personnel
        if (user.role === "base commander" && user.baseId) {
          const filtered = allAssignments.filter(
            (a) =>
              normalizeId(a.base?._id || a.base) ===
              normalizeId(user.baseId._id || user.baseId)
          );
          setFilteredAssignments(filtered);
        } else if (user.role === "personnel") {
          // Filter by assignedTo serviceId (if API doesn't do it)
          const filtered = allAssignments.filter(
            (a) =>
              a.assignedTo === user.serviceId ||
              a.assignedTo?.serviceId === user.serviceId
          );
          setFilteredAssignments(filtered);
        } else {
          // admin or others: show all
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

      // Re-apply filter based on role
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
            >
              <option value="">Select equipment</option>
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

      <div className="p-4">
        {loading ? (
          <p>Loading assignments...</p>
        ) : filteredAssignments.length === 0 ? (
          <p>No assignments found.</p>
        ) : (
          filteredAssignments.map((assignment) => (
            <div
              key={assignment._id}
              className="bg-white border rounded-lg p-4 mb-4 shadow-md"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold text-lg">
                    {assignment.assetType?.name || "Unknown Equipment"}
                  </p>
                  <p>Quantity: {assignment.quantity ?? "N/A"}</p>
                  <p>
                    Assigned To:{" "}
                    {typeof assignment.assignedTo === "string"
                      ? assignment.assignedTo
                      : assignment.assignedTo?.serviceId || "Unknown"}
                  </p>
                  <p>Base: {assignment.base?.name || "Unknown Base"}</p>
                  <p>
                    Assigned By:{" "}
                    {typeof assignment.assignedBy === "string"
                      ? assignment.assignedBy
                      : assignment.assignedBy?.serviceId || "Unknown"}
                  </p>
                  <p>
                    Date:{" "}
                    {new Date(
                      assignment.date || assignment.createdAt
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Assignments;
