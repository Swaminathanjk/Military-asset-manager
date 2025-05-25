import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Purchases = () => {
  const { user } = useAuth();

  const normalizeId = (id) => (id ? id.toString() : "");

  const LogisticsCard = ({ user, baseName }) => {
    if (!user || user.role !== "logistics officer") return null;

    return (
      <div className="mb-6 bg-green-50 border-green-400 border p-4 rounded shadow text-green-700">
        <h3 className="text-xl font-semibold mb-2">
          Base Logistics Officer Details
        </h3>
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

  const [formData, setFormData] = useState({
    base: "",
    assetType: "",
    quantity: 1,
  });

  const [bases, setBases] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const canPurchase =
    user?.role === "admin" || user?.role === "logistics officer";

  useEffect(() => {
    if (!user) return;

    const fetchBases = async () => {
      try {
        const basesRes = await api.get("/bases");
        const baseList = Array.isArray(basesRes.data.data)
          ? basesRes.data.data
          : [];
        setBases(baseList);

        // Only auto-fill base in form if role is logistics officer or base commander
        if (
          (user.role === "base commander" ||
            user.role === "logistics officer") &&
          user.baseId
        ) {
          setFormData((prev) => ({
            ...prev,
            base: normalizeId(user.baseId._id || user.baseId),
          }));
        }
      } catch (err) {
        console.error("Fetch bases error:", err);
        toast.error("Failed to load bases");
      }
    };

    fetchBases();
  }, [user]);

  useEffect(() => {
    if (!formData.base) {
      setAssetTypes([]);
      setFormData((prev) => ({ ...prev, assetType: "" }));
      return;
    }

    const fetchAssetTypes = async () => {
      try {
        const res = await api.get(`/asset-types`);
        setAssetTypes(Array.isArray(res.data) ? res.data : []);
        setFormData((prev) => ({ ...prev, assetType: "" }));
      } catch (err) {
        console.error("Fetch asset types error:", err);
        toast.error("Failed to load equipment types for selected base");
        setAssetTypes([]);
        setFormData((prev) => ({ ...prev, assetType: "" }));
      }
    };

    fetchAssetTypes();
  }, [formData.base]);

  useEffect(() => {
    if (!user) return;

    const fetchPurchases = async () => {
      setLoading(true);
      try {
        const res = await api.get("/purchases");
        const allPurchases = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
          ? res.data.data
          : [];

        setPurchases(allPurchases);

        if (
          (user.role === "base commander" ||
            user.role === "logistics officer") &&
          user.baseId
        ) {
          const filtered = allPurchases.filter(
            (p) =>
              normalizeId(p.base?._id || p.base) ===
              normalizeId(user.baseId._id || user.baseId)
          );
          setFilteredPurchases(filtered);
        } else {
          setFilteredPurchases(allPurchases);
        }
      } catch (err) {
        console.error("Fetch purchases error:", err);
        toast.error("Failed to load purchases");
        setPurchases([]);
        setFilteredPurchases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "base" && user.role === "base commander") return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.base || !formData.assetType || !formData.quantity) {
      toast.error("Please fill all fields");
      return;
    }

    setPurchasing(true);
    try {
      await api.post("/purchases", {
        base: normalizeId(formData.base),
        assetType: formData.assetType,
        quantity: Number(formData.quantity),
        purchasedBy: user._id,
      });

      toast.success("Purchase recorded");

      setFormData({
        base:
          user.role === "base commander"
            ? normalizeId(user.baseId._id || user.baseId)
            : "",
        assetType: "",
        quantity: 1,
      });

      const res = await api.get("/purchases");
      const allPurchases = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.data)
        ? res.data.data
        : [];

      setPurchases(allPurchases);

      if (
        (user.role === "base commander" || user.role === "logistics officer") &&
        user.baseId
      ) {
        const filtered = allPurchases.filter(
          (p) =>
            normalizeId(p.base?._id || p.base) ===
            normalizeId(user.baseId._id || user.baseId)
        );
        setFilteredPurchases(filtered);
      } else {
        setFilteredPurchases(allPurchases);
      }
    } catch (err) {
      console.error("Create purchase error:", err);
      toast.error(err.response?.data?.message || "Purchase failed");
    } finally {
      setPurchasing(false);
    }
  };

  const baseName =
    Array.isArray(bases) &&
    bases.find((b) => normalizeId(b._id) === normalizeId(formData.base))?.name;

  return (
    <div className="min-h-screen bg-[#1f2d1f] text-white px-4 py-8 font-[Rajdhani]">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-extrabold tracking-widest uppercase text-center mb-8 border-b pb-2 border-green-500">
          Equipment Acquisitions
        </h2>

        {canPurchase && (
          <form
            onSubmit={handleSubmit}
            className="mb-10 max-w-lg mx-auto space-y-6 bg-[#2e3d2e] p-6 rounded-xl border border-green-700 shadow-lg"
          >
            <LogisticsCard user={user} baseName={user.baseId?.name} />

            <h3 className="text-xl font-bold tracking-wide border-b border-green-500 pb-2 uppercase">
              New Purchase Entry
            </h3>

            <div>
              <label className="block text-sm font-semibold mb-1">Base</label>
              {user.role === "admin" ? (
                <select
                  name="base"
                  value={formData.base}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#1b2a1b] border border-green-700 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      (b) => b._id === (user.baseId._id || user.baseId)
                    )?.name || "Unknown Base"
                  }
                  readOnly
                  className="w-full px-3 py-2 bg-gray-700 border border-green-700 rounded-md cursor-not-allowed"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Equipment Type
              </label>
              <select
                name="assetType"
                value={formData.assetType}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#1b2a1b] border border-green-700 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
                disabled={assetTypes.length === 0 || !formData.base}
              >
                <option value="">
                  {!formData.base
                    ? "Select base first"
                    : assetTypes.length === 0
                    ? "No types available"
                    : "Select equipment type"}
                </option>
                {assetTypes.map((type) => (
                  <option key={type._id || type.id} value={type._id || type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#1b2a1b] border border-green-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={purchasing}
              className={`w-full bg-green-700 hover:bg-green-800 transition-colors text-white py-2 rounded-md uppercase font-bold tracking-wide disabled:opacity-50`}
            >
              {purchasing ? "Saving..." : "Add Purchase"}
            </button>
          </form>
        )}

        <h3 className="text-2xl font-bold tracking-wider uppercase mb-4 border-b border-green-500 pb-2">
          Purchase Logs
        </h3>

        {loading ? (
          <p className="text-green-400">Loading purchases...</p>
        ) : filteredPurchases.length === 0 ? (
          <p className="text-gray-400 italic">No purchase records found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-green-800 shadow">
            <table className="table-auto w-full text-sm">
              <thead className="bg-[#2e3d2e] border-b border-green-700 text-green-400 uppercase">
                <tr>
                  <th className="px-4 py-2 text-left">Base</th>
                  <th className="px-4 py-2 text-left">Equipment</th>
                  <th className="px-4 py-2 text-left">Quantity</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Purchased By</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map((purchase) => {
                  const isAdminPurchase = !purchase.base;

                  const purchaseBase = isAdminPurchase
                    ? "Admin"
                    : bases.find(
                        (b) =>
                          normalizeId(b._id) ===
                          normalizeId(purchase.base?._id || purchase.base)
                      )?.name || "Unknown Base";

                  const purchaseAssetType =
                    typeof purchase.assetType === "object"
                      ? purchase.assetType.name
                      : assetTypes.find(
                          (a) =>
                            normalizeId(a._id) ===
                            normalizeId(purchase.assetType)
                        )?.name || purchase.assetType;

                  const purchasedByDisplay =
                    purchase.purchasedBy?.role === "admin"
                      ? "Admin"
                      : typeof purchase.purchasedBy === "object"
                      ? purchase.purchasedBy.name ||
                        purchase.purchasedBy._id ||
                        "Unknown"
                      : purchase.purchasedBy || "Unknown";

                  return (
                    <tr
                      key={purchase._id || purchase.id}
                      className="even:bg-[#1b2a1b] odd:bg-[#253425]"
                    >
                      <td className="px-4 py-2 border-t border-green-800">
                        {purchaseBase}
                      </td>
                      <td className="px-4 py-2 border-t border-green-800">
                        {purchaseAssetType}
                      </td>
                      <td className="px-4 py-2 border-t border-green-800">
                        {purchase.quantity}
                      </td>
                      <td className="px-4 py-2 border-t border-green-800">
                        {purchase.createdAt
                          ? new Date(purchase.createdAt).toLocaleString()
                          : "No date/time"}
                      </td>
                      <td className="px-4 py-2 border-t border-green-800">
                        {purchasedByDisplay}
                        {purchase.purchasedBy?.serviceId
                          ? ` (${purchase.purchasedBy.serviceId})`
                          : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Purchases;
