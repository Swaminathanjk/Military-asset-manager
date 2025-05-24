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

        setBases(basesRes.data.data || []);
        setAssetTypes(assetTypesRes.data || []);
        setUsers(usersRes.data.data || []);

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
  }, [user]);

  // Fetch assignments based on role
  useEffect(() => {
    if (!user) return;

    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const res = await api.get("/assignments");
        let allAssignments = res.data;

        console.log("Fetched assignments:", allAssignments);

        if (user.role === "personnel") {
          allAssignments = allAssignments.filter(
            (a) =>
              a.assignedTo &&
              (a.assignedTo.serviceId === user.serviceId ||
                a.assignedTo === user.serviceId)
          );
        } else if (user.role === "base commander" && user.baseId) {
          allAssignments = allAssignments.filter((a) => {
            if (!a.base) return false;
            if (typeof a.base === "string") {
              return normalizeId(a.base) === normalizeId(user.baseId);
            } else if (typeof a.base === "object" && a.base._id) {
              return normalizeId(a.base._id) === normalizeId(user.baseId);
            }
            return false;
          });
        }

        setAssignments(allAssignments);
      } catch (err) {
        console.error("Assignment fetch error:", err);
        toast.error("Failed to load assignments");
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

      // Refresh assignments
      const refreshUrl =
        user.role === "personnel"
          ? `/assignments/personnel/${user.serviceId}`
          : user.role === "base commander"
          ? `/assignments/base/${normalizeId(user.baseId)}`
          : "/assignments";

      const res = await api.get(refreshUrl);
      setAssignments(res.data.data || []);
    } catch (err) {
      console.error("Create assignment error:", err);
      toast.error(err.response?.data?.message || "Assignment failed");
    } finally {
      setAssigning(false);
    }
  };

  // Filter users for current base
  const personnelForBase = users.filter(
    (u) =>
      u.role === "personnel" &&
      normalizeId(u.baseId?._id || u.baseId) === normalizeId(formData.base)
  );

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
                value={
                  bases.find(
                    (b) => normalizeId(b._id) === normalizeId(formData.base)
                  )?.name || "Unknown"
                }
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
              <option value="">Select equipment type</option>
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
              min={1}
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={assigning}
          >
            {assigning ? "Assigning..." : "Assign"}
          </button>
        </form>
      )}

      <div>
        {loading ? (
          <p>Loading assignments...</p>
        ) : allAssignments.length === 0 ? (
          <p>No assignments found.</p>
        ) : (
          <div className="space-y-4">
            {allAssignments.map((a) => (
              <Card key={a._id}>
                <p>
                  <strong>Personnel:</strong>{" "}
                  {a.assignedTo?.serviceId || a.assignedTo || "N/A"} -{" "}
                  {a.assignedTo?.name || ""}
                </p>
                <p>
                  <strong>Base:</strong> {a.base?.name || a.base}
                </p>
                <p>
                  <strong>Equipment Type:</strong>{" "}
                  {a.assetType?.name || a.assetType}
                </p>
                <p>
                  <strong>Quantity:</strong> {a.quantity}
                </p>
                <p>
                  <strong>Assigned On:</strong>{" "}
                  {new Date(a.createdAt).toLocaleDateString()}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignments;
